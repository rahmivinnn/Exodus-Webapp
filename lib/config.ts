/**
 * Application Configuration
 */

export const greenscreensConfig = {
  apiKey: process.env.GREENSCREENS_API_KEY || 'demo-key',
  baseUrl: process.env.GREENSCREENS_BASE_URL || 'https://api.greenscreens.ai',
  timeout: 10000,
};

export function validateConfig(): boolean {
  return !!(greenscreensConfig.apiKey && greenscreensConfig.baseUrl);
}

export const config = {
  greenscreens: greenscreensConfig,
  app: {
    name: 'Greenscreens.ai',
    description: 'AI-powered freight intelligence platform',
    version: '1.0.0',
  },
} as const;

export type Config = typeof config;