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

export async function getIndustriesList(): Promise<Industry[]> {
  if (USE_MOCK) {
    return getIndustries();
  }

  try {
    const res = (await apiClient.get('/industry/all')) as { data?: IndustryDTO[] };
    const list = (res.data ?? res) as IndustryDTO[] | IndustryDTO;
    const arr = Array.isArray(list) ? list : [list];
    return arr.map(mapIndustryDTOToIndustry);
  } catch {
    return [];
  }
}
