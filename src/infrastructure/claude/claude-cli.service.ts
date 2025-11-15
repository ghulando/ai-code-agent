import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { spawn } from 'child_process';

/**
 * ClaudeCLIService - Infrastructure Implementation
 * Implements Claude CLI integration using NestJS Injectable
 */
@Injectable()
export class ClaudeCliService {
  constructor(private configService: ConfigService) {}

  async generateCode(prompt: string, requestConfig: any = {}) {
    const options = {
      model: this.configService.get<string>('model.default'),
      maxRetries: this.configService.get<number>('claude.maxRetries'),
      retryDelay: this.configService.get<number>('claude.retryDelay'),
      config: requestConfig,
    };

    if (!this.configService.get<boolean>('model.allowOverride')) {
      options.model = this.configService.get<string>('model.default');
    }

    return await this.executeWithRetry(prompt, options);
  }

  async analyzeRepository(repositoryPath: string, query: string, requestConfig: any = {}) {
    const options = {
      model: this.configService.get<string>('model.default'),
      maxRetries: this.configService.get<number>('claude.maxRetries'),
      retryDelay: this.configService.get<number>('claude.retryDelay'),
      workingDirectory: repositoryPath,
      config: requestConfig,
    };

    if (!this.configService.get<boolean>('model.allowOverride')) {
      options.model = this.configService.get<string>('model.default');
    }

    return await this.executeWithRetry(query, options);
  }

  async executeWithRetry(prompt: string, options: any, attemptNumber: number = 1): Promise<any> {
    try {
      if (!prompt || typeof prompt !== 'string') {
        throw new Error('Prompt must be a non-empty string');
      }

      if (!options.model || options.model.trim() === '') {
        options.model = this.configService.get<string>('model.default');
      }

      const command = 'claude';
      const args = [
        'exec',
        '--skip-git-repo-check',
        '--dangerously-bypass-approvals-and-sandbox',
        '--color',
        'never',
        '--json',
        '--model',
        options.model,
      ];

      if (options.workingDirectory) {
        args.push('-C', options.workingDirectory);
      }

      if (options.config) {
        Object.entries(options.config).forEach(([key, value]) => {
          args.push('--config', `${key}=${value}`);
        });
      }

      args.push(`"${prompt.replace(/"/g, '\\"')}"`);

      console.log(`🚀 Starting Claude CLI execution with model: ${options.model}`);
      if (options.workingDirectory) {
        console.log(`📁 Working directory: ${options.workingDirectory}`);
      }
      console.log(`💬 Prompt length: ${prompt.length} characters`);

      const result = await this.executeClaudeCommandStreaming(command, args, {
        env: {
          ...process.env,
          ANTHROPIC_AUTH_TOKEN: process.env.ANTHROPIC_AUTH_TOKEN,
          ANTHROPIC_BASE_URL: process.env.ANTHROPIC_BASE_URL || undefined,
          CI: 'true',
          FORCE_COLOR: '0',
          CLAUDE_QUIET_MODE: '1',
          NO_COLOR: '1',
        },
        cwd: options.workingDirectory,
        timeout: this.configService.get<number>('claude.timeout'),
      });

      const parsedEvents = this.parseClaudeEvents(result.stdout);
      const finalOutput = parsedEvents.finalOutput;

      if (finalOutput && finalOutput.trim()) {
        console.log(`🎯 Final response captured (${finalOutput.length} chars)`);
      }

      return {
        output: finalOutput,
        executionTime: result.executionTime,
        model: options.model,
        workingDirectory: options.workingDirectory,
        stderr: result.stderr || null,
        attemptNumber,
      };
    } catch (error) {
      const canRetry = attemptNumber <= options.maxRetries;

      if (canRetry) {
        console.log(`⚠️ Attempt ${attemptNumber} failed, retrying...`);
        await this.sleep(options.retryDelay);
        return this.executeWithRetry(prompt, options, attemptNumber + 1);
      }

      if (error.code === 'ENOENT') {
        throw new Error('Claude CLI not found. Please ensure it is installed and in PATH.');
      }

      if (error.signal === 'SIGTERM' || error.signal === 'SIGKILL') {
        throw new Error('Claude command was terminated due to timeout or system signal.');
      }

      throw error;
    }
  }

  executeClaudeCommandStreaming(command: string, args: string[], options: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const events: any[] = [];
      let stdout = '';
      let stderr = '';
      let currentLine = '';

      const child = spawn(command, args, {
        env: options.env || process.env,
        cwd: options.cwd,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      child.stdout.on('data', (data) => {
        const chunk = data.toString();
        stdout += chunk;
        currentLine += chunk;

        const lines = currentLine.split('\n');
        currentLine = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const event = JSON.parse(line);
              events.push(event);

              const noisyTypes = [
                'exec_command_output_delta',
                'exec_command_begin',
                'exec_command_end',
                'exec_command_output',
                'file_read_begin',
                'file_read_end',
                'file_write_begin',
                'file_write_end',
                'task_started',
                'task_progress',
                'background_event',
                'token_count',
              ];

              if (event.msg && !noisyTypes.includes(event.msg.type)) {
                if (event.msg.content) {
                  console.log(`Claude CLI Event: ${event.msg.content}`);
                }
                if (event.msg.message) {
                  console.log(`Claude CLI Event: ${event.msg.message}`);
                }
              }
            } catch (e) {
              console.log(`Claude CLI Event: ${line.trim()}`);
            }
          }
        }
      });

      child.stderr.on('data', (data) => {
        const chunk = data.toString();
        stderr += chunk;
      });

      child.on('close', (code) => {
        const executionTime = Date.now() - startTime;

        if (currentLine.trim()) {
          try {
            const event = JSON.parse(currentLine);
            events.push(event);

            if (event.msg && event.msg.content) {
              console.log(`Claude CLI Event: ${event.msg.content}`);
            }
          } catch (e) {
            console.log(`Claude CLI Event: ${currentLine.trim()}`);
          }
        }

        console.log(`✅ Claude CLI execution completed (${stdout.length} chars received)`);

        if (code === 0) {
          resolve({
            stdout: stdout.trim(),
            stderr: stderr.trim(),
            exitCode: code,
            executionTime,
            events,
          });
        } else {
          reject(new Error(`Claude CLI exited with code ${code}. stderr: ${stderr}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });

      if (options.timeout) {
        setTimeout(() => {
          child.kill('SIGTERM');
          reject(new Error('Claude CLI command timed out'));
        }, options.timeout);
      }
    });
  }

  parseClaudeEvents(stdout: string) {
    const lines = stdout.split('\n').filter((line) => line.trim());
    const events: any[] = [];
    let finalOutput = '';
    let allContent: string[] = [];

    for (const line of lines) {
      try {
        const event = JSON.parse(line);
        events.push(event);

        if (event.msg && event.msg.content) {
          allContent.push(event.msg.content);

          if (
            event.msg.type === 'task_completed' ||
            event.msg.type === 'response' ||
            event.msg.type === 'final_response'
          ) {
            finalOutput = event.msg.content;
          }
        }
      } catch (e) {
        if (line.trim()) {
          allContent.push(line.trim());
          if (!finalOutput) {
            finalOutput = line.trim();
          }
        }
      }
    }

    if (!finalOutput && allContent.length > 0) {
      finalOutput = allContent[allContent.length - 1];
    }

    return {
      events,
      finalOutput: finalOutput || stdout.trim(),
      hasEvents: events.length > 0,
    };
  }

  sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
