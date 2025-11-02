/**
 * IResponseFormatter Interface (Port)
 * Defines the contract for response formatting services
 * Implementation will be in infrastructure layer
 */
class IResponseFormatter {
  /**
   * Format raw Codex output into structured response
   * @param {string} rawOutput - Raw output from Codex
   * @returns {Object} { success: boolean, content: string, error: string, summary: Object }
   */
  formatResponse(rawOutput) {
    throw new Error('Method formatResponse() must be implemented');
  }

  /**
   * Extract events from Codex output
   * @param {string} rawOutput - Raw output from Codex
   * @returns {Array<Object>} Array of parsed events
   */
  extractEvents(rawOutput) {
    throw new Error('Method extractEvents() must be implemented');
  }
}

module.exports = IResponseFormatter;
