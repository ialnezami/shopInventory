import { registerAs } from '@nestjs/config';

export default registerAs('production', () => ({
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:4200'],
    credentials: true,
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100, // limit each IP to 100 requests per windowMs
  },
  compression: {
    enabled: process.env.COMPRESSION_ENABLED === 'true' || true,
    level: parseInt(process.env.COMPRESSION_LEVEL, 10) || 6,
  },
  security: {
    helmet: {
      enabled: process.env.HELMET_ENABLED === 'true' || true,
    },
    cors: {
      enabled: process.env.CORS_ENABLED === 'true' || true,
    },
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    timestamp: process.env.LOG_TIMESTAMP === 'true' || true,
  },
  monitoring: {
    enabled: process.env.MONITORING_ENABLED === 'true' || true,
    metrics: {
      enabled: process.env.METRICS_ENABLED === 'true' || true,
      port: parseInt(process.env.METRICS_PORT, 10) || 9090,
    },
    tracing: {
      enabled: process.env.TRACING_ENABLED === 'true' || false,
    },
  },
}));
