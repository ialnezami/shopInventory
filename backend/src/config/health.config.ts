import { registerAs } from '@nestjs/config';

export default registerAs('health', () => ({
  port: parseInt(process.env.HEALTH_PORT, 10) || 3001,
  path: process.env.HEALTH_PATH || '/health',
  timeout: parseInt(process.env.HEALTH_TIMEOUT, 10) || 5000,
  interval: parseInt(process.env.HEALTH_INTERVAL, 10) || 30000,
}));
