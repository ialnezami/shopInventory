import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT, 10) || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  from: process.env.EMAIL_FROM || 'noreply@shopinventory.com',
  replyTo: process.env.EMAIL_REPLY_TO || 'support@shopinventory.com',
  company: {
    name: process.env.COMPANY_NAME || 'TechStore Pro',
    address: process.env.COMPANY_ADDRESS || '123 Tech Street, San Francisco, CA 94105',
    phone: process.env.COMPANY_PHONE || '+1-555-TECH',
    website: process.env.COMPANY_WEBSITE || 'www.techstorepro.com',
    logo: process.env.COMPANY_LOGO || '',
  },
}));
