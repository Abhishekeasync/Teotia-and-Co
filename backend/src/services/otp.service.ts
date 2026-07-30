import { env } from '../config/env';
import { OTP_VERIFICATION_WINDOW_DAYS } from '../constants';
import { AdminRecord } from '../interfaces/admin.interface';
import { OtpRepository } from '../repositories/otp.repository';
import { generateOtpCode, hashOtp, verifyOtp } from '../utils/otp';
import { sendOtpEmail } from '../utils/mail';

/**
 * Email OTP for admin login step-up verification.
 * Codes are bcrypt-hashed in otp_verifications; plain text exists only in email / dev logs.
 */
export class OtpService {
  constructor(private readonly otpRepository = new OtpRepository()) {}

  /** True when admin never completed OTP or last success is outside the 7-day window. */
  isVerificationRequired(admin: AdminRecord): boolean {
    if (!admin.lastVerifiedAt) {
      return true;
    }
    const windowMs = OTP_VERIFICATION_WINDOW_DAYS * 24 * 60 * 60 * 1000;
    return Date.now() - admin.lastVerifiedAt.getTime() > windowMs;
  }

  /** Seconds until resend-otp is allowed; 0 means a new code can be issued now. */
  async secondsUntilResendAllowed(adminId: number): Promise<number> {
    const latest = await this.otpRepository.findLatestIssuedAtForAdmin(adminId);
    if (!latest) {
      return 0;
    }
    const elapsedSeconds = (Date.now() - latest.getTime()) / 1000;
    const remaining = env.OTP_RESEND_COOLDOWN_SECONDS - elapsedSeconds;
    return remaining > 0 ? Math.ceil(remaining) : 0;
  }

  /** Replaces any active OTP for this admin, stores hash + expires_at, sends email. */
  async issueAndEmailOtp(admin: AdminRecord): Promise<void> {
    const code = generateOtpCode();
    const otpHash = await hashOtp(code);
    const expiresAt = new Date(Date.now() + env.OTP_TTL_MINUTES * 60 * 1000);

    await this.otpRepository.invalidateActiveForAdmin(admin.id);
    await this.otpRepository.create(admin.id, otpHash, expiresAt);
    await sendOtpEmail(admin.email, code, admin.name);
  }

  async verifyAdminOtp(adminId: number, code: string): Promise<boolean> {
    const record = await this.otpRepository.findLatestValidForAdmin(adminId);
    if (!record) {
      return false;
    }
    const valid = await verifyOtp(code, record.otpHash);
    if (!valid) {
      return false;
    }
    await this.otpRepository.markConsumed(record.id);
    return true;
  }
}
