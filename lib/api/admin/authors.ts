import { ApiAuthorDetail, ApiAuthorListResponse } from '../types';
import { fetchApi } from '../client';

export interface AdminAuthorFilters {
  page?: number;
  limit?: number;
}

export async function getAdminAuthors(filters: AdminAuthorFilters = {}): Promise<ApiAuthorListResponse> {
  const query = new URLSearchParams();
  if (filters.page) query.append('page', filters.page.toString());
  if (filters.limit) query.append('limit', filters.limit.toString());
  const queryString = query.toString();
  return fetchApi<ApiAuthorListResponse>(`/admin/authors${queryString ? `?${queryString}` : ''}`);
}

export async function getAdminAuthorById(id: number): Promise<{ author: ApiAuthorDetail }> {
  return fetchApi<{ author: ApiAuthorDetail }>(`/admin/authors/${id}`);
}

export async function createAdminAuthor(data: FormData): Promise<{ author: ApiAuthorDetail }> {
  return fetchApi<{ author: ApiAuthorDetail }>('/admin/authors', {
    method: 'POST',
    body: data,
  });
}

export async function updateAdminAuthor(id: number, data: FormData): Promise<{ author: ApiAuthorDetail }> {
  return fetchApi<{ author: ApiAuthorDetail }>(`/admin/authors/${id}`, {
    method: 'PATCH',
    body: data,
  });
}

export async function deleteAdminAuthor(id: number): Promise<void> {
  return fetchApi<void>(`/admin/authors/${id}`, {
    method: 'DELETE',
  });
}
