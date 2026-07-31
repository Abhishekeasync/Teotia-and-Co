import { EnquiryRepository } from '../repositories/enquiry.repository';
import { AdminEnquiry } from '../interfaces/enquiry.interface';
import { PaginationParams, buildPaginationMeta, PaginationMeta } from '../utils/pagination';
import { ApiError } from '../utils/ApiError';
import { HTTP_STATUS } from '../constants';
import { sendEnquiryNotificationToAdmin } from '../utils/mail';

export type CreateEnquiryInput = {
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  subject: string;
  message: string;
};

/**
 * Enquiry service — contact form submissions from potential clients.
 */
export class EnquiryService {
  private enquiryRepository = new EnquiryRepository();

  /**
   * Submit a new enquiry — sends notification email to admin.
   */
  async createEnquiry(input: CreateEnquiryInput): Promise<{ message: string }> {
    const enquiryId = await this.enquiryRepository.create({
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone.trim(),
      serviceType: input.serviceType.trim(),
      subject: input.subject.trim(),
      message: input.message.trim(),
    });

    // Send notification to admin (non-blocking, log errors but don't fail request)
    sendEnquiryNotificationToAdmin({
      id: enquiryId,
      name: input.name,
      email: input.email,
      phone: input.phone,
      serviceType: input.serviceType,
      subject: input.subject,
      message: input.message,
    }).catch((error) => {
      console.error('Failed to send enquiry notification email:', error);
    });

    return {
      message: 'Enquiry submitted successfully. We will contact you soon.',
    };
  }

  /**
   * Admin: List all enquiries.
   */
  async listAllEnquiries(
    pagination: PaginationParams,
  ): Promise<{ enquiries: AdminEnquiry[]; meta: PaginationMeta }> {
    const [enquiries, total] = await Promise.all([
      this.enquiryRepository.listAll(pagination),
      this.enquiryRepository.countAll(),
    ]);

    const adminEnquiries: AdminEnquiry[] = enquiries.map((e) => ({
      id: e.id,
      name: e.name,
      email: e.email,
      phone: e.phone,
      serviceType: e.serviceType,
      subject: e.subject,
      message: e.message,
      createdAt: e.createdAt.toISOString(),
    }));

    return {
      enquiries: adminEnquiries,
      meta: buildPaginationMeta(total, pagination.page, pagination.limit),
    };
  }

  /**
   * Admin: Get single enquiry details.
   */
  async getEnquiryById(id: number): Promise<AdminEnquiry> {
    const enquiry = await this.enquiryRepository.findById(id);
    if (!enquiry) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Enquiry not found');
    }

    return {
      id: enquiry.id,
      name: enquiry.name,
      email: enquiry.email,
      phone: enquiry.phone,
      serviceType: enquiry.serviceType,
      subject: enquiry.subject,
      message: enquiry.message,
      createdAt: enquiry.createdAt.toISOString(),
    };
  }

  /**
   * Admin: Soft-delete an enquiry.
   */
  async deleteEnquiry(id: number): Promise<void> {
    const enquiry = await this.enquiryRepository.findById(id);
    if (!enquiry) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Enquiry not found');
    }

    await this.enquiryRepository.softDelete(id);
  }
}
