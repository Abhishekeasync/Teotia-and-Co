/**
 * Contact enquiries — service requests from potential clients.
 */

export type EnquiryRecord = {
  id: number;
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  subject: string;
  message: string;
  createdAt: Date;
  deletedAt: Date | null;
};

/** Admin list and detail view. */
export type AdminEnquiry = {
  id: number;
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  subject: string;
  message: string;
  createdAt: string;
};
