import nodemailer from 'nodemailer';
import { env, isProduction } from '../config/env';
import { mailConfig } from '../config/mail';
import { logger } from './logger';

/** Returns null when SMTP env is incomplete — callers decide dev log vs production error. */
function buildTransport() {
  if (!mailConfig.isConfigured) {
    return null;
  }
  const { host, port, user, pass } = mailConfig.transport;
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

/** Admin login OTP. TTL in copy matches env.OTP_TTL_MINUTES. */
export async function sendOtpEmail(to: string, otpCode: string, adminName: string): Promise<void> {
  const ttlMinutes = env.OTP_TTL_MINUTES;
  const ttlLabel = ttlMinutes === 1 ? '1 minute' : `${ttlMinutes} minutes`;
  const subject = 'Your TEOTIA & CO. admin login code';
  const html = `
    <p>Hello ${adminName},</p>
    <p>Your one-time login code is:</p>
    <p style="font-size:24px;font-weight:bold;letter-spacing:4px">${otpCode}</p>
    <p>This code expires in ${ttlLabel}. If you did not request this, ignore this email.</p>
    <p>— TEOTIA &amp; CO.</p>
  `;

  const transport = buildTransport();
  if (!transport) {
    if (isProduction) {
      throw new Error('SMTP is not configured');
    }
    // Never log OTP in production; dev-only fallback when SMTP_* is unset.
    logger.warn('SMTP not configured — OTP logged for development only', {
      to,
      otp: otpCode,
    });
    return;
  }

  await transport.sendMail({
    from: mailConfig.defaultFrom,
    to,
    subject,
    html,
    text: `Your login code is ${otpCode}. It expires in ${ttlLabel}.`,
  });

  logger.info('OTP email sent', { recipientDomain: to.split('@')[1] ?? 'unknown' });
}
