export const fileUploadConfig = {
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  uploadDest: process.env.UPLOAD_DEST || './uploads',
  allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,gif,webp').split(','),
  maxFiles: 10,
};
