/**
 * Newsletter subscribers — public sign-up, unsubscribe via unique token.
 */

export type SubscriberRecord = {
  id: number;
  email: string;
  name: string | null;
  unsubscribedAt: Date | null;
  unsubscribeToken: string;
  createdAt: Date;
};

/** Admin list view. */
export type AdminSubscriber = {
  id: number;
  email: string;
  name: string | null;
  unsubscribedAt: string | null;
  createdAt: string;
};
