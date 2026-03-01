import type { Industry } from '@/types';
import { USE_MOCK } from './api';
import { getIndustries } from '@/mocks/data/industries.mock';
import { apiClient } from './api';

interface IndustryDTO {
  industryId?: number;
  name?: string;
}

function mapIndustryDTOToIndustry(dto: IndustryDTO): Industry {
  return {
    id: String(dto.industryId ?? ''),
    name: dto.name ?? '',
  };
}

function extractIndustryList(res: unknown): IndustryDTO[] {
  if (Array.isArray(res)) return res as IndustryDTO[];
  if (res && typeof res === 'object') {
    const obj = res as Record<string, unknown>;
    const data = obj.data ?? obj.result ?? obj.items;
    if (Array.isArray(data)) return data as IndustryDTO[];
  }
  return [];
}

export async function getIndustriesList(): Promise<Industry[]> {
  if (USE_MOCK) {
    return getIndustries();
  }

  try {
    const res = await apiClient.get('/industry/all');
    const list = extractIndustryList(res);
    return list
      .map(mapIndustryDTOToIndustry)
      .filter((i) => i.id && i.name);
  } catch (err) {
    console.error('[getIndustriesList]', err);
    return [];
  }
}

export async function createIndustry(name: string): Promise<void> {
  if (USE_MOCK) return;
  await apiClient.post('/industry/add', { name });
}

export async function updateIndustry(industryId: number, name: string): Promise<void> {
  if (USE_MOCK) return;
  await apiClient.put('/industry/update', { industryId, name });
}

export async function deleteIndustry(industryId: number): Promise<void> {
  if (USE_MOCK) return;
  await apiClient.delete(`/industry/delete/${industryId}`);
}
