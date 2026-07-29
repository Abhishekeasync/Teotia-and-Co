import { env, requireSmtpEnv } from './env';

export const mailConfig = {
  get isConfigured(): boolean {
    return Boolean(env.SMTP_HOST && env.SMTP_EMAIL && env.SMTP_PASSWORD);
  },
  get transport() {
    return requireSmtpEnv();
  },
  get defaultFrom(): string {
    return env.SMTP_EMAIL ?? 'noreply@teotiaandco.com';
  },
};
