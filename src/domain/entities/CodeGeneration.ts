/**
 * Domain Entity: CodeGeneration
 * Encapsulates business rules for code generation requests
 * No dependencies on frameworks or external services
 */
export class CodeGeneration {
  prompt: string;
  config: any;
  createdAt: Date;

  constructor(prompt: string, config: any = {}) {
    this.prompt = prompt;
    this.config = config;
    this.createdAt = new Date();
  }

  /**
   * Validates the code generation request
   * @returns { isValid: boolean, errors: string[] }
   */
  validate() {
    const errors: string[] = [];

    // Business Rule: Prompt is required
    if (!this.prompt) {
      errors.push('Prompt is required');
    }

    // Business Rule: Prompt must be a string
    if (this.prompt && typeof this.prompt !== 'string') {
      errors.push('Prompt must be a string');
    }

    // Business Rule: Prompt cannot be empty or only whitespace
    if (this.prompt && this.prompt.trim().length === 0) {
      errors.push('Prompt cannot be empty');
    }

    // Business Rule: Prompt should have reasonable length (max 50KB)
    if (this.prompt && this.prompt.length > 50000) {
      errors.push('Prompt is too long (maximum 50,000 characters)');
    }

    // Business Rule: Prompt should have minimum length
    if (this.prompt && this.prompt.trim().length < 3) {
      errors.push('Prompt is too short (minimum 3 characters)');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Gets the prompt for execution
   * @returns string
   */
  getPrompt(): string {
    return this.prompt.trim();
  }

  /**
   * Gets the configuration
   * @returns any
   */
  getConfig(): any {
    return this.config;
  }

  /**
   * Gets metadata about the request
   * @returns Object
   */
  getMetadata() {
    return {
      promptLength: this.prompt ? this.prompt.length : 0,
      createdAt: this.createdAt.toISOString(),
      hasConfig: Object.keys(this.config).length > 0,
    };
  }
}
