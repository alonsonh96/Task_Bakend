import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

// Config email
export const emailConfig = {
    from: process.env.EMAIL_FROM || 'UpTask <onboarding@resend.dev>',
    replyTo: process.env.EMAIL_REPLY_TO || 'support@uptask.com',
    maxRetries: 3,
    retryDelay: 1000,
}

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};