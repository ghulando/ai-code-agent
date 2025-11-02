const IResponseFormatter = require('../../application/ports/IResponseFormatter');

/**
 * ResponseFormatterService - Infrastructure Implementation
 * Implements IResponseFormatter for Codex output formatting
 */
class ResponseFormatterService extends IResponseFormatter {
  formatResponse(rawOutput) {
    try {
      const lines = rawOutput.split('\n').filter(line => line.trim());
      let analysisContent = '';
      let hasError = false;
      let errorMessage = '';

      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);

          if (parsed.msg && parsed.msg.type === 'agent_message') {
            if (parsed.msg.message) {
              analysisContent += parsed.msg.message + '\n\n';
            }
          }

          if (parsed.type === 'error') {
            hasError = true;
            errorMessage = parsed.message;
          }

          if (parsed.msg && parsed.msg.type === 'exec_command_end' && parsed.msg.stdout) {
            const stdout = parsed.msg.stdout;

            if (stdout.length > 100 && !stdout.includes('total ') && !stdout.includes('drwx')) {
              analysisContent += this.formatCommandOutput(stdout) + '\n\n';
            }
          }

        } catch (parseError) {
          continue;
        }
      }

      return {
        success: !hasError,
        content: this.cleanAndFormatContent(analysisContent),
        error: hasError ? errorMessage : null,
        summary: this.generateSummary(analysisContent)
      };

    } catch (error) {
      return {
        success: false,
        content: '',
        error: `Failed to parse Codex output: ${error.message}`,
        summary: 'Analysis failed due to parsing error'
      };
    }
  }

  extractEvents(rawOutput) {
    const lines = rawOutput.split('\n').filter(line => line.trim());
    const events = [];

    for (const line of lines) {
      try {
        const event = JSON.parse(line);
        events.push(event);
      } catch (e) {
        // Not a JSON line, skip
      }
    }

    return events;
  }

  cleanAndFormatContent(content) {
    if (!content.trim()) {
      return 'No analysis content was generated. This might be due to rate limiting or other issues.';
    }

    content = content.replace(/\n{3,}/g, '\n\n');
    content = content.trim();

    const sections = content.split('\n\n');
    const formattedSections = sections.map(section => {
      section = section.trim();

      if (section.includes('---') && section.includes('Demo')) {
        return `## ${section.replace(/---/g, '').trim()}`;
      }

      if (section.includes('.cs:') || section.includes('static ') || section.includes('const ')) {
        return `\`\`\`\n${section}\n\`\`\``;
      }

      return section;
    });

    return formattedSections.join('\n\n');
  }

  formatCommandOutput(output) {
    return output;
  }

  generateSummary(content) {
    if (!content.trim()) {
      return 'No analysis completed';
    }

    const lines = content.split('\n').filter(line => line.trim());
    const firstLine = lines[0];

    if (firstLine && firstLine.length > 20) {
      return firstLine.substring(0, 100) + (firstLine.length > 100 ? '...' : '');
    }

    return 'Analysis completed';
  }
}

module.exports = ResponseFormatterService;
