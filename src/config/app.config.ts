import { AppConfig } from './app.config.interface';

export default (): AppConfig => ({
  port: parseInt(process.env.PORT) || 3000,
  DATABASE_URL: process.env.DATABASE_URL || 'mysql://root:@localhost:3306/test',
  node_env: process.env.NODE_ENV || 'development',
});
