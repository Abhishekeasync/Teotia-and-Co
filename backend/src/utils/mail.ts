import nodemailer from 'nodemailer';
import { env, isProduction } from '../config/env';
import { mailConfig } from '../config/mail';
import { logger } from './logger';
import { SubscriberRepository } from '../repositories/subscriber.repository';

/** Singleton transporter — created once, reused with SMTP connection pooling. */
let _transport: nodemailer.Transporter | null = null;

/** Returns null when SMTP env is incomplete — callers decide dev log vs production error. */
function getTransport(): nodemailer.Transporter | null {
  if (!mailConfig.isConfigured) {
    logger.warn('[MAIL] SMTP transport not configured — SMTP_HOST, SMTP_EMAIL or SMTP_PASSWORD is missing');
    return null;
  }
  if (!_transport) {
    const { host, port, user, pass } = mailConfig.transport;
    logger.info('[MAIL] Creating SMTP transport (singleton)', { host, port, secure: port === 465, user });
    _transport = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      pool: true,
      maxConnections: 5,
    });
    logger.info('[MAIL] SMTP transport created and ready');
  }
  return _transport;
}

/** Admin login OTP. TTL in copy matches env.OTP_TTL_MINUTES. */
export async function sendOtpEmail(to: string, otpCode: string, adminName: string): Promise<void> {
  const ttlMinutes = env.OTP_TTL_MINUTES;
  const ttlLabel = ttlMinutes === 1 ? '1 minute' : `${ttlMinutes} minutes`;
  const subject = 'Your TEOTIA & CO. admin login code';

  logger.info('[OTP] Preparing OTP email', { to, adminName, ttlMinutes });

  const html = `
    <p>Hello ${adminName},</p>
    <p>Your one-time login code is:</p>
    <p style="font-size:24px;font-weight:bold;letter-spacing:4px">${otpCode}</p>
    <p>This code expires in ${ttlLabel}. If you did not request this, ignore this email.</p>
    <p>— TEOTIA &amp; CO.</p>
  `;

  const transport = getTransport();
  if (!transport) {
    if (isProduction) {
      throw new Error('SMTP is not configured');
    }
    // Never log OTP in production; dev-only fallback when SMTP_* is unset.
    logger.warn('[OTP] SMTP not configured — OTP logged for development only', {
      to,
      otp: otpCode,
    });
    return;
  }

  logger.info('[OTP] Sending OTP email via SMTP', { to });
  await transport.sendMail({
    from: mailConfig.defaultFrom,
    to,
    subject,
    html,
    text: `Your login code is ${otpCode}. It expires in ${ttlLabel}.`,
  });

  logger.info('[OTP] OTP email sent successfully', { recipientDomain: to.split('@')[1] ?? 'unknown' });
}

/** Welcome email for new newsletter subscribers. */
export async function sendWelcomeEmail(
  to: string,
  name: string,
  unsubscribeToken: string,
): Promise<void> {
  logger.info('[WELCOME] Preparing welcome email', { to, name });

  const unsubscribeUrl = `${env.FRONTEND_URL}/unsubscribe?token=${unsubscribeToken}`;
  const subject = 'Welcome to TEOTIA & CO. Newsletter';
  const html = `
    <p>Hello ${name},</p>
    <p>Thank you for subscribing to the TEOTIA &amp; CO. newsletter!</p>
    <p>You'll receive updates about our latest blog posts, insights, and services.</p>
    <p>If you wish to unsubscribe at any time, <a href="${unsubscribeUrl}">click here</a>.</p>
    <p>— TEOTIA &amp; CO.</p>
  `;

  const transport = getTransport();
  if (!transport) {
    if (isProduction) {
      throw new Error('SMTP is not configured');
    }
    logger.warn('[WELCOME] SMTP not configured — welcome email skipped (dev)', { to });
    return;
  }

  logger.info('[WELCOME] Sending welcome email via SMTP', { to });
  await transport.sendMail({
    from: mailConfig.defaultFrom,
    to,
    subject,
    html,
    text: `Welcome to TEOTIA & CO. Newsletter! Unsubscribe: ${unsubscribeUrl}`,
  });

  logger.info('[WELCOME] Welcome email sent successfully', { recipientDomain: to.split('@')[1] ?? 'unknown' });
}

/** Notification to admin when a new enquiry is submitted. */
export async function sendEnquiryNotificationToAdmin(enquiry: {
  id: number;
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  subject: string;
  message: string;
}): Promise<void> {
  const adminEmail = env.ADMIN_NOTIFICATION_EMAIL || env.SEED_ADMIN_EMAIL;
  if (!adminEmail) {
    logger.warn('No admin email configured for enquiry notifications');
    return;
  }

  const subject = `New Enquiry: ${enquiry.subject}`;
  const html = `
    <h3>New Enquiry Received</h3>
    <p><strong>ID:</strong> ${enquiry.id}</p>
    <p><strong>Name:</strong> ${enquiry.name}</p>
    <p><strong>Email:</strong> <a href="mailto:${enquiry.email}">${enquiry.email}</a></p>
    <p><strong>Phone:</strong> ${enquiry.phone}</p>
    <p><strong>Service Type:</strong> ${enquiry.serviceType}</p>
    <p><strong>Subject:</strong> ${enquiry.subject}</p>
    <p><strong>Message:</strong></p>
    <p>${enquiry.message.replace(/\n/g, '<br>')}</p>
    <p>— TEOTIA &amp; CO. CMS</p>
  `;

  const transport = getTransport();
  if (!transport) {
    if (isProduction) {
      throw new Error('SMTP is not configured');
    }
    logger.warn('SMTP not configured — enquiry notification skipped (dev)', { enquiry });
    return;
  }

  await transport.sendMail({
    from: mailConfig.defaultFrom,
    to: adminEmail,
    subject,
    html,
    text: `New enquiry from ${enquiry.name} (${enquiry.email})\n\n${enquiry.message}`,
  });

  logger.info('Enquiry notification sent to admin', { enquiryId: enquiry.id });
}

/** Send new blog post notification to a subscriber. */
export async function sendNewBlogPostEmail(
  subscriberEmail: string,
  subscriberName: string | null,
  blog: {
    heading: string;
    slug: string;
    shortDescription: string;
    authorName: string;
    featuredImageUrl: string | null;
  },
  unsubscribeToken: string,
): Promise<void> {
  const blogUrl = `${env.FRONTEND_URL}/blog/${blog.slug}`;
  const unsubscribeUrl = `${env.FRONTEND_URL}/unsubscribe?token=${unsubscribeToken}`;

  const greeting = subscriberName ? `Hello ${subscriberName},` : 'Hello,';
  const subject = `New Post: ${blog.heading}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <p style="color: #333; font-size: 16px;">${greeting}</p>
      <h2>New Blog Post from TEOTIA &amp; CO.</h2>
      
      ${blog.featuredImageUrl ? `<img src="${blog.featuredImageUrl}" alt="${blog.heading}" style="max-width: 100%; height: auto; border-radius: 8px;" />` : ''}
      
      <h3 style="margin-top: 20px;">${blog.heading}</h3>
      
      <p style="color: #666; font-size: 14px;">
        By ${blog.authorName}
      </p>
      
      <p style="line-height: 1.6;">
        ${blog.shortDescription}
      </p>
      
      <a href="${blogUrl}" style="display: inline-block; background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
        Read Full Article
      </a>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
      
      <p style="color: #999; font-size: 12px;">
        You're receiving this email because you subscribed to TEOTIA &amp; CO. newsletter.
        <br />
        <a href="${unsubscribeUrl}" style="color: #999;">Unsubscribe</a>
      </p>
    </div>
  `;

  const text = `
New Blog Post from TEOTIA & CO.

${blog.heading}
By ${blog.authorName}

${blog.shortDescription}

Read the full article: ${blogUrl}

---
Unsubscribe: ${unsubscribeUrl}
  `.trim();

  const transport = getTransport();
  if (!transport) {
    if (isProduction) {
      throw new Error('SMTP is not configured');
    }
    logger.warn('[BLOG-NOTIFY] SMTP not configured — blog notification skipped (dev)', { 
      subscriberEmail,
      blogSlug: blog.slug 
    });
    return;
  }

  logger.debug('[BLOG-NOTIFY] Sending notification email to subscriber', {
    subscriberEmail,
    blogSlug: blog.slug,
    subject,
  });

  try {
    await transport.sendMail({
      from: mailConfig.defaultFrom,
      to: subscriberEmail,
      subject,
      html,
      text,
    });

    logger.info('[BLOG-NOTIFY] Email delivered to subscriber', { 
      recipientDomain: subscriberEmail.split('@')[1] ?? 'unknown',
      blogSlug: blog.slug,
    });
  } catch (error) {
    logger.error('[BLOG-NOTIFY] Failed to deliver email to subscriber', { 
      subscriberEmail,
      blogSlug: blog.slug,
      error,
    });
    // Don't throw — one failed delivery must not cancel the rest of the batch
  }
}

/** 
 * Notify all active subscribers about a new blog post.
 * Runs asynchronously - does not block the publish operation.
 */
export async function notifySubscribersOfNewPost(blog: {
  heading: string;
  slug: string;
  shortDescription: string;
  authorName: string;
  featuredImageUrl: string | null;
}): Promise<void> {
  const subscriberRepo = new SubscriberRepository();

  logger.info('[NOTIFY] Starting subscriber notification pipeline', { blogSlug: blog.slug, blogHeading: blog.heading });

  try {
    // Step 1: Fetch active subscribers
    logger.info('[NOTIFY] Step 1/4 — Fetching active subscribers from DB', { blogSlug: blog.slug });
    const activeSubscribers = await subscriberRepo.listActive();
    logger.info('[NOTIFY] Step 1/4 — Active subscribers fetched', {
      count: activeSubscribers.length,
      blogSlug: blog.slug,
    });

    if (activeSubscribers.length === 0) {
      logger.info('[NOTIFY] No active subscribers found — skipping email dispatch', { blogSlug: blog.slug });
      return;
    }

    // Step 2: Check SMTP transport
    logger.info('[NOTIFY] Step 2/4 — Verifying SMTP transport', { blogSlug: blog.slug });
    const transport = getTransport();
    if (!transport) {
      logger.warn('[NOTIFY] Step 2/4 — SMTP not configured, aborting notification dispatch', { blogSlug: blog.slug });
      return;
    }
    logger.info('[NOTIFY] Step 2/4 — SMTP transport OK', { blogSlug: blog.slug });

    // Step 3: Send in batches
    const batchSize = 50;
    const totalBatches = Math.ceil(activeSubscribers.length / batchSize);
    logger.info('[NOTIFY] Step 3/4 — Dispatching emails in batches', {
      totalSubscribers: activeSubscribers.length,
      batchSize,
      totalBatches,
      blogSlug: blog.slug,
    });

    let succeeded = 0;
    let failed = 0;

    for (let i = 0; i < activeSubscribers.length; i += batchSize) {
      const batchNumber = Math.floor(i / batchSize) + 1;
      const batch = activeSubscribers.slice(i, i + batchSize);

      logger.info(`[NOTIFY] Dispatching batch ${batchNumber}/${totalBatches}`, {
        batchSize: batch.length,
        blogSlug: blog.slug,
      });

      const results = await Promise.allSettled(
        batch.map((subscriber) =>
          sendNewBlogPostEmail(
            subscriber.email,
            subscriber.name,
            blog,
            subscriber.unsubscribeToken,
          ),
        ),
      );

      const batchSucceeded = results.filter((r) => r.status === 'fulfilled').length;
      const batchFailed = results.filter((r) => r.status === 'rejected').length;
      succeeded += batchSucceeded;
      failed += batchFailed;

      logger.info(`[NOTIFY] Batch ${batchNumber}/${totalBatches} complete`, {
        succeeded: batchSucceeded,
        failed: batchFailed,
        blogSlug: blog.slug,
      });

      // Log individual failures with reason
      results.forEach((result, idx) => {
        if (result.status === 'rejected') {
          logger.error('[NOTIFY] Individual email rejected in batch', {
            subscriberEmail: batch[idx]?.email,
            batchNumber,
            reason: result.reason,
            blogSlug: blog.slug,
          });
        }
      });

      // Small delay between batches to avoid overwhelming SMTP server
      if (i + batchSize < activeSubscribers.length) {
        logger.debug('[NOTIFY] Waiting 1s before next batch', { blogSlug: blog.slug });
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Step 4: Summary
    logger.info('[NOTIFY] Step 4/4 — Notification pipeline complete', {
      blogSlug: blog.slug,
      totalSubscribers: activeSubscribers.length,
      succeeded,
      failed,
      successRate: `${Math.round((succeeded / activeSubscribers.length) * 100)}%`,
    });
  } catch (error) {
    logger.error('[NOTIFY] Unhandled error in notification pipeline', {
      blogSlug: blog.slug,
      error,
    });
    // Don't throw — this is a background operation; must not crash the server
  }
}
