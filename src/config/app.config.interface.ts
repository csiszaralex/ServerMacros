export interface AppConfig {
  port: number;
  DATABASE_URL: string;
  node_env: string;
  cloudflare: {
    email: string;
    api_key: string;
  };
  'cloudflare.email'?: string;
  'cloudflare.api_key'?: string;
}
