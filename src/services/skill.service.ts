import type { Skill } from '@/types';
import type { PagedList } from '@/types/paged';
import { apiClient } from './api';

interface SkillDTO {
  skillId?: number;
  skillName?: string;
  name?: string;
}

function extractSkillList(res: unknown): SkillDTO[] {
  if (Array.isArray(res)) return res as SkillDTO[];
  if (res && typeof res === 'object') {
    const obj = res as Record<string, unknown>;
    const data = obj.data ?? obj.result ?? obj.items;
    if (Array.isArray(data)) return data as SkillDTO[];
  }
  return [];
}

export async function getSkillsAdminPage(page: number, limit: number): Promise<PagedList<Skill>> {
  const res = await apiClient.get('/admin/skills', { params: { page, limit } });
  const raw = (res as { data?: { items?: SkillDTO[]; totalCount?: number; page?: number; limit?: number; hasNext?: boolean } })
    .data ?? (res as { items?: SkillDTO[]; totalCount?: number; page?: number; limit?: number; hasNext?: boolean });
  const list = Array.isArray(raw.items) ? raw.items : [];
  const items = list
    .map((dto) => ({
      skillId: String(dto.skillId ?? ''),
      name: dto.skillName ?? dto.name ?? '',
    }))
    .filter((s) => s.skillId && s.name);
  return {
    items,
    totalCount: Number(raw.totalCount ?? 0),
    page: Number(raw.page ?? page),
    limit: Number(raw.limit ?? limit),
    hasNext: Boolean(raw.hasNext),
  };
}

export async function getAllSkills(): Promise<Skill[]> {
  try {
    const res = await apiClient.get('/skill/all');
    const list = extractSkillList(res);
    return list
      .map((dto) => ({
        skillId: String(dto.skillId ?? ''),
        name: dto.skillName ?? dto.name ?? '',
      }))
      .filter((s) => s.skillId && s.name)
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) {
    console.error('[getAllSkills]', err);
    return [];
  }
}

export async function createSkill(skillName: string): Promise<void> {
  await apiClient.post('/skill/add', { skillName });
}

export async function updateSkill(skillId: string, skillName: string): Promise<void> {
  await apiClient.put(`/skill/update?skillId=${skillId}&skillName=${encodeURIComponent(skillName)}`);
}

export async function deleteSkill(skillId: string): Promise<void> {
  await apiClient.delete(`/skill/delete/${skillId}`);
}
