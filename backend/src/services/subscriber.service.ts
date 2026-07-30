import { randomUUID } from 'crypto';
import { SubscriberRepository } from '../repositories/subscriber.repository';
import { AdminSubscriber } from '../interfaces/subscriber.interface';
import { PaginationParams, buildPaginationMeta, PaginationMeta } from '../utils/pagination';
import { ApiError } from '../utils/ApiError';
import { HTTP_STATUS } from '../constants';
import { sendWelcomeEmail } from '../utils/mail';
import { logger } from '../utils/logger';

export type SubscribeInput = {
  email: string;
  name?: string;
};

/**
 * Newsletter subscription service — unique email, unsubscribe via token.
 */
export class SubscriberService {
  private subscriberRepository = new SubscriberRepository();

  /**
   * Subscribe to newsletter. If email already exists:
   * - If already subscribed → error
   * - If previously unsubscribed → re-subscribe
   */
  async subscribe(input: SubscribeInput): Promise<{ message: string }> {
    const email = input.email.trim().toLowerCase();
    const name = input.name?.trim();

    logger.info('[SUBSCRIBE] New subscription request', { email, name: name ?? null });

    const existing = await this.subscriberRepository.findByEmail(email);

    if (existing) {
      if (existing.unsubscribedAt === null) {
        logger.warn('[SUBSCRIBE] Email is already subscribed, rejecting', { email });
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'This email is already subscribed');
      }

      // Re-subscribe previously unsubscribed user
      logger.info('[SUBSCRIBE] Re-subscribing previously unsubscribed email', { email, subscriberId: existing.id });
      await this.subscriberRepository.resubscribe(existing.id);
      logger.info('[SUBSCRIBE] Re-subscribe DB update done, sending welcome email', { email });

      await sendWelcomeEmail(email, name ?? existing.name ?? 'Subscriber', existing.unsubscribeToken);
      logger.info('[SUBSCRIBE] Re-subscribe flow complete', { email });

      return {
        message: 'Successfully re-subscribed to the newsletter',
      };
    }

    // New subscriber
    logger.info('[SUBSCRIBE] Creating new subscriber record', { email, name: name ?? null });
    const token = randomUUID();
    const subscriberId = await this.subscriberRepository.create({
      email,
      name,
      token,
    });
    logger.info('[SUBSCRIBE] Subscriber record created, sending welcome email', { email, subscriberId });

    await sendWelcomeEmail(email, name ?? 'Subscriber', token);
    logger.info('[SUBSCRIBE] New subscriber flow complete', { email, subscriberId });

    return {
      message: 'Successfully subscribed to the newsletter',
    };
  }

  /**
   * Unsubscribe using the unique token from email link.
   */
  async unsubscribe(token: string): Promise<{ message: string }> {
    logger.info('[UNSUBSCRIBE] Unsubscribe request received', { token: token.slice(0, 8) + '...' });

    const subscriber = await this.subscriberRepository.findByToken(token);

    if (!subscriber) {
      logger.warn('[UNSUBSCRIBE] Invalid or unknown token', { token: token.slice(0, 8) + '...' });
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Invalid unsubscribe token');
    }

    if (subscriber.unsubscribedAt !== null) {
      logger.info('[UNSUBSCRIBE] Subscriber already unsubscribed, no-op', { subscriberId: subscriber.id });
      return {
        message: 'You have already unsubscribed',
      };
    }

    await this.subscriberRepository.markUnsubscribed(subscriber.id);
    logger.info('[UNSUBSCRIBE] Subscriber marked as unsubscribed', { subscriberId: subscriber.id, email: subscriber.email });

    return {
      message: 'Successfully unsubscribed from the newsletter',
    };
  }

  /**
   * Admin: List all subscribers (includes unsubscribed with timestamp).
   */
  async listAllSubscribers(
    pagination: PaginationParams,
  ): Promise<{ subscribers: AdminSubscriber[]; meta: PaginationMeta }> {
    const [subscribers, total] = await Promise.all([
      this.subscriberRepository.listAll(pagination),
      this.subscriberRepository.countAll(),
    ]);

    const adminSubscribers: AdminSubscriber[] = subscribers.map((s) => ({
      id: s.id,
      email: s.email,
      name: s.name,
      unsubscribedAt: s.unsubscribedAt ? s.unsubscribedAt.toISOString() : null,
      createdAt: s.createdAt.toISOString(),
    }));

    return {
      subscribers: adminSubscribers,
      meta: buildPaginationMeta(total, pagination.page, pagination.limit),
    };
  }

  /**
   * Admin: Permanently delete a subscriber.
   */
  async deleteSubscriber(id: number): Promise<void> {
    logger.info('[ADMIN] Delete subscriber request', { subscriberId: id });
    const subscriber = await this.subscriberRepository.findById(id);
    if (!subscriber) {
      logger.warn('[ADMIN] Subscriber not found for deletion', { subscriberId: id });
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Subscriber not found');
    }

    await this.subscriberRepository.delete(id);
    logger.info('[ADMIN] Subscriber deleted', { subscriberId: id, email: subscriber.email });
  }
}
