import { apiClient } from './api';

type ApiEnvelope<T> = { code?: number; data?: T };

export async function uploadImageToS3(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const res = (await apiClient.post('/aws/s3/upload', form)) as ApiEnvelope<{ url: string }>;
  const url = res.data?.url;
  if (!url) throw new Error('Upload failed');
  return url;
}
