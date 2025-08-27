export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
  signOptions: {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};
