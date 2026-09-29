import { apiRequest } from '@/services/apiClient';

export type Practice = {
  id: string;
  title: string;
  description: string;
};

export async function getPractice(): Promise<Practice[]> {
  return apiRequest<Practice[]>('/');
}
