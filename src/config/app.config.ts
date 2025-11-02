export interface AppConfig {
  port: number;
  nodeEnv: string;
  model: {
    default: string;
    allowOverride: boolean;
  };
  codex: {
    maxRetries: number;
    retryDelay: number;
    timeout: number;
  };
}

export const appConfig = (): AppConfig => ({
  port: parseInt(process.env.PORT, 10) || 3002,
  nodeEnv: process.env.NODE_ENV || 'development',
  model: {
    default: process.env.DEFAULT_MODEL || 'azure/gpt-5-mini',
    allowOverride: false,
  },
  codex: {
    maxRetries: 3,
    retryDelay: 5000,
    timeout: 300000,
  },
});
