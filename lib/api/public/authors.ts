import { ApiAuthorDetail } from '../types';
import { fetchApi } from '../client';

export async function getPublicAuthorBySlug(slug: string): Promise<{ author: ApiAuthorDetail }> {
  return fetchApi<{ author: ApiAuthorDetail }>(`/authors/${slug}`);
}
