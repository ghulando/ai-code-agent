export interface AppConfig {
  port: number;
  nodeEnv: string;
  cliType: string;
  model: {
    default: string;
    allowOverride: boolean;
  };
  codex: {
    maxRetries: number;
    retryDelay: number;
    timeout: number;
  };
  gemini: {
    maxRetries: number;
    retryDelay: number;
    timeout: number;
  };
}

export const appConfig = (): AppConfig => ({
  port: (process.env.PORT !== undefined && !isNaN(parseInt(process.env.PORT, 10)) ? parseInt(process.env.PORT, 10) : 3002),
  nodeEnv: process.env.NODE_ENV || 'development',
  cliType: process.env.CLI_TYPE || 'codex',
  model: {
    default: process.env.DEFAULT_MODEL || 'azure/gpt-5-mini',
    allowOverride: false,
  },
  codex: {
    maxRetries: 3,
    retryDelay: 5000,
    timeout: 300000,
  },
  gemini: {
    maxRetries: 3,
    retryDelay: 5000,
    timeout: 300000,
  },
});
