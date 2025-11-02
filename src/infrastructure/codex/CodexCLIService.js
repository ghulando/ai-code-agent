const { spawn } = require('child_process');
const config = require('../../config');
const ICodexService = require('../../application/ports/ICodexService');

/**
 * CodexCLIService - Infrastructure Implementation
 * Implements ICodexService using Codex CLI
 * Can be replaced with API implementation without affecting use cases
 */
class CodexCLIService extends ICodexService {
  constructor() {
    super();
  }

  async generateCode(prompt, requestConfig = {}) {
    const options = {
      model: config.model.default,
      maxRetries: config.codex.maxRetries,
      retryDelay: config.codex.retryDelay,
      config: requestConfig
    };

    if (!config.model.allowOverride) {
      options.model = config.model.default;
    }

    return await this.executeWithRetry(prompt, options);
  }

  async analyzeRepository(repositoryPath, query, requestConfig = {}) {
    const options = {
      model: config.model.default,
      maxRetries: config.codex.maxRetries,
      retryDelay: config.codex.retryDelay,
      workingDirectory: repositoryPath,
      config: requestConfig
    };

    if (!config.model.allowOverride) {
      options.model = config.model.default;
    }

    return await this.executeWithRetry(query, options);
  }

  async executeWithRetry(prompt, options, attemptNumber = 1) {
    try {
      if (!prompt || typeof prompt !== 'string') {
        throw new Error('Prompt must be a non-empty string');
      }

      if (!options.model || options.model.trim() === '') {
        options.model = config.model.default;
      }

      const command = 'codex';
      const args = [
        'exec',
        '--skip-git-repo-check',
        '--dangerously-bypass-approvals-and-sandbox',
        '--color', 'never',
        '--json',
        '--model', options.model
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

      console.log(`🚀 Starting Codex CLI execution with model: ${options.model}`);
      if (options.workingDirectory) {
        console.log(`📁 Working directory: ${options.workingDirectory}`);
      }
      console.log(`💬 Prompt length: ${prompt.length} characters`);

      const result = await this.executeCodexCommandStreaming(command, args, {
        env: {
          ...process.env,
          OPENAI_API_KEY: process.env.OPENAI_API_KEY,
          OPENAI_BASE_URL: process.env.OPENAI_BASE_URL || undefined,
          CI: 'true',
          FORCE_COLOR: '0',
          CODEX_QUIET_MODE: '1',
          NO_COLOR: '1'
        },
        cwd: options.workingDirectory,
        timeout: config.codex.timeout
      });

      const parsedEvents = this.parseCodexEvents(result.stdout);
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
        attemptNumber
      };

    } catch (error) {
      const canRetry = attemptNumber <= options.maxRetries;

      if (canRetry) {
        console.log(`⚠️ Attempt ${attemptNumber} failed, retrying...`);
        await this.sleep(options.retryDelay);
        return this.executeWithRetry(prompt, options, attemptNumber + 1);
      }

      if (error.code === 'ENOENT') {
        throw new Error('Codex CLI not found. Please ensure it is installed and in PATH.');
      }

      if (error.signal === 'SIGTERM' || error.signal === 'SIGKILL') {
        throw new Error('Codex command was terminated due to timeout or system signal.');
      }

      throw error;
    }
  }

  executeCodexCommandStreaming(command, args, options = {}) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const events = [];
      let stdout = '';
      let stderr = '';
      let currentLine = '';

      const child = spawn(command, args, {
        env: options.env || process.env,
        cwd: options.cwd,
        stdio: ['pipe', 'pipe', 'pipe']
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
                'token_count'
              ];

              if (event.msg && !noisyTypes.includes(event.msg.type)) {
                if (event.msg.content) {
                  console.log(`Codex CLI Event: ${event.msg.content}`);
                }
                if (event.msg.message) {
                  console.log(`Codex CLI Event: ${event.msg.message}`);
                }
              }
            } catch (e) {
              console.log(`Codex CLI Event: ${line.trim()}`);
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
              console.log(`Codex CLI Event: ${event.msg.content}`);
            }
          } catch (e) {
            console.log(`Codex CLI Event: ${currentLine.trim()}`);
          }
        }

        console.log(`✅ Codex CLI execution completed (${stdout.length} chars received)`);

        if (code === 0) {
          resolve({
            stdout: stdout.trim(),
            stderr: stderr.trim(),
            exitCode: code,
            executionTime,
            events
          });
        } else {
          reject(new Error(`Codex CLI exited with code ${code}. stderr: ${stderr}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });

      if (options.timeout) {
        setTimeout(() => {
          child.kill('SIGTERM');
          reject(new Error('Codex CLI command timed out'));
        }, options.timeout);
      }
    });
  }

  parseCodexEvents(stdout) {
    const lines = stdout.split('\n').filter(line => line.trim());
    const events = [];
    let finalOutput = '';
    let allContent = [];

    for (const line of lines) {
      try {
        const event = JSON.parse(line);
        events.push(event);

        if (event.msg && event.msg.content) {
          allContent.push(event.msg.content);

          if (event.msg.type === 'task_completed' ||
            event.msg.type === 'response' ||
            event.msg.type === 'final_response') {
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
      hasEvents: events.length > 0
    };
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = CodexCLIService;
