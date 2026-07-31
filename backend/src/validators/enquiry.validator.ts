import { z } from 'zod';

/**
 * Service types offered by TEOTIA & CO.
 * These appear as dropdown options in the contact form.
 */
export const SERVICE_TYPES = [
  'Tax Planning & Filing',
  'Business Registration',
  'GST Services',
  'Accounting & Bookkeeping',
  'Audit Services',
  'Financial Consulting',
  'Compliance Management',
  'Legal Advisory',
  'Other',
] as const;

/** POST /enquiries - Submit an enquiry. */
export const createEnquiryBodySchema = z.object({
  name: z.string().trim().min(1).max(255),
  email: z.string().email().toLowerCase(),
  phone: z.string().trim().min(1).max(50),
  /** 
   * Type of service requested (dropdown selection).
   * Ensures consistent categorization of enquiries.
   */
  serviceType: z.enum(SERVICE_TYPES, {
    message: 'Please select a valid service type',
  }),
  /** 
   * Brief summary of the enquiry (like email subject).
   * Example: "Need help with GST registration for new business"
   */
  subject: z.string().trim().min(1).max(500),
  /** 
   * Detailed enquiry message.
   * Example: "I'm starting a new e-commerce business and need help with..."
   */
  message: z.string().trim().min(1).max(5000),
});

/** GET /admin/enquiries - Admin list (pagination). */
export const adminEnquiryListQuerySchema = z.object({
  page: z.unknown().optional(),
  limit: z.unknown().optional(),
});

/** :id param for enquiry operations. */
export const enquiryIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
