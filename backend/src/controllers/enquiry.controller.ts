import { Request, Response } from 'express';
import { EnquiryService, CreateEnquiryInput } from '../services/enquiry.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePaginationQuery } from '../utils/pagination';
import { SERVICE_TYPES } from '../validators/enquiry.validator';

const enquiryService = new EnquiryService();

/** Public: Get list of available service types for dropdown. */
export const getServiceTypes = asyncHandler(async (_req: Request, res: Response) => {
  return ApiResponse.success(
    res,
    { serviceTypes: SERVICE_TYPES },
    'Service types retrieved successfully',
  );
});

/** Public: Submit an enquiry. */
export const createEnquiry = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as CreateEnquiryInput;

  const result = await enquiryService.createEnquiry(body);

  return ApiResponse.success(res, {}, result.message, 201);
});

/** Admin: List all enquiries. */
export const listAdminEnquiries = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePaginationQuery(req.query);

  const result = await enquiryService.listAllEnquiries(pagination);

  return ApiResponse.success(res, result, '');
});

/** Admin: Get single enquiry details. */
export const getAdminEnquiry = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  const enquiry = await enquiryService.getEnquiryById(Number(id));

  return ApiResponse.success(res, { enquiry }, '');
});

/** Admin: Delete an enquiry. */
export const deleteEnquiry = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  await enquiryService.deleteEnquiry(Number(id));

  return ApiResponse.success(res, {}, 'Enquiry deleted');
});
