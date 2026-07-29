import bcrypt from 'bcrypt';
import { Response } from 'express';
import { env, isProduction } from '../config/env';
import {
  AUTH_COOKIE_NAME,
  HTTP_STATUS,
  OTP_VERIFICATION_WINDOW_DAYS,
} from '../constants';
import { AdminPublicProfile, AdminRecord } from '../interfaces/admin.interface';
import { AdminRepository, toPublicProfile } from '../repositories/admin.repository';
import { LoginHistoryRepository } from '../repositories/loginHistory.repository';
import { ApiError } from '../utils/ApiError';
import { jwtExpireToMs, signAdminToken } from '../utils/jwt';
import { OtpService } from './otp.service';

/**
 * Admin authentication: password login, optional email OTP, JWT in httpOnly cookie.
 *
 * OTP is required on first login and again when last_verified_at is older than
 * OTP_VERIFICATION_WINDOW_DAYS. Between those checks, password-only login succeeds.
 */
export type LoginResult =
  | { otpRequired: true; message: string }
  | { otpRequired: false; admin: AdminPublicProfile };

export class AuthService {
  constructor(
    private readonly adminRepository = new AdminRepository(),
    private readonly loginHistoryRepository = new LoginHistoryRepository(),
    private readonly otpService = new OtpService(),
  ) {}

  setAuthCookie(res: Response, admin: AdminRecord): void {
    const token = signAdminToken({ sub: admin.id, email: admin.email });
    res.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: jwtExpireToMs(env.JWT_EXPIRE),
    });
  }

  clearAuthCookie(res: Response): void {
    res.clearCookie(AUTH_COOKIE_NAME, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
    });
  }

  /** Shared credential check for login and resend-otp (same generic error for unknown email vs bad password). */
  private async authenticateWithPassword(
    email: string,
    password: string,
    ip: string | null,
    userAgent: string | null,
  ): Promise<AdminRecord> {
    const admin = await this.adminRepository.findByEmail(email.trim().toLowerCase());
    if (!admin) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password');
    }

    const passwordOk = await bcrypt.compare(password, admin.passwordHash);
    if (!passwordOk) {
      await this.loginHistoryRepository.record(admin.id, false, ip, userAgent);
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password');
    }

    return admin;
  }

  async login(
    email: string,
    password: string,
    ip: string | null,
    userAgent: string | null,
    res: Response,
  ): Promise<LoginResult> {
    const admin = await this.authenticateWithPassword(email, password, ip, userAgent);

    if (this.otpService.isVerificationRequired(admin)) {
      await this.otpService.issueAndEmailOtp(admin);
      return {
        otpRequired: true,
        message: `OTP sent to your email. Required every ${OTP_VERIFICATION_WINDOW_DAYS} days or on first login.`,
      };
    }

    this.setAuthCookie(res, admin);
    await this.loginHistoryRepository.record(admin.id, true, ip, userAgent);
    return { otpRequired: false, admin: toPublicProfile(admin) };
  }

  async verifyOtpAndLogin(
    email: string,
    otp: string,
    ip: string | null,
    userAgent: string | null,
    res: Response,
  ): Promise<AdminPublicProfile> {
    const admin = await this.adminRepository.findByEmail(email.trim().toLowerCase());
    if (!admin) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid email or OTP');
    }

    const valid = await this.otpService.verifyAdminOtp(admin.id, otp.trim());
    if (!valid) {
      await this.loginHistoryRepository.record(admin.id, false, ip, userAgent);
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid or expired OTP');
    }

    // Resets the 7-day password-only window (see OtpService.isVerificationRequired).
    await this.adminRepository.updateLastVerifiedAt(admin.id, new Date());
    const refreshed = await this.adminRepository.findById(admin.id);
    if (!refreshed) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Admin account not found');
    }

    this.setAuthCookie(res, refreshed);
    await this.loginHistoryRepository.record(refreshed.id, true, ip, userAgent);
    return toPublicProfile(refreshed);
  }

  /**
   * Sends a fresh OTP after password re-check. Cooldown applies (OTP_RESEND_COOLDOWN_SECONDS).
   * Invalidates any previous unused code via issueAndEmailOtp.
   */
  async resendOtp(
    email: string,
    password: string,
    ip: string | null,
    userAgent: string | null,
  ): Promise<{ retryAfterSeconds: number }> {
    const admin = await this.authenticateWithPassword(email, password, ip, userAgent);

    if (!this.otpService.isVerificationRequired(admin)) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'OTP verification is not required. Sign in with your password.',
      );
    }

    const waitSeconds = await this.otpService.secondsUntilResendAllowed(admin.id);
    if (waitSeconds > 0) {
      throw new ApiError(
        HTTP_STATUS.TOO_MANY_REQUESTS,
        `Please wait ${waitSeconds} seconds before requesting a new code.`,
        [{ retryAfterSeconds: waitSeconds }],
      );
    }

    await this.otpService.issueAndEmailOtp(admin);
    return { retryAfterSeconds: env.OTP_RESEND_COOLDOWN_SECONDS };
  }

  async getProfile(adminId: number): Promise<AdminPublicProfile> {
    const admin = await this.adminRepository.findById(adminId);
    if (!admin) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Admin account not found');
    }
    return toPublicProfile(admin);
  }
}
