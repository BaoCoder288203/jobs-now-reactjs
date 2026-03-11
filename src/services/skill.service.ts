import type { Skill } from '@/types';
import { apiClient } from './api';

/** BE may return { data: [...] } or array; items may have skillId/skillName or skill_id/skill_name */
function unwrapList(res: unknown): { skillId: number; skillName: string }[] {
  let list: unknown[] = [];
  if (Array.isArray(res)) list = res;
  else if (res && typeof res === 'object') {
    const obj = res as Record<string, unknown>;
    const data = obj.data ?? obj.result ?? obj.items;
    if (Array.isArray(data)) list = data;
  }
  return list.map((item: unknown) => {
    const o = item as Record<string, unknown>;
    return {
      skillId: Number(o.skillId ?? o.skill_id ?? 0),
      skillName: String(o.skillName ?? o.skill_name ?? o.name ?? ''),
    };
  });
}

function toSkill(item: { skillId: number; skillName: string }): Skill {
  return {
    skillId: String(item.skillId),
    name: item.skillName,
  };
}

/** Get all skills (BE: GET /skill/all) */
export async function getAllSkills(): Promise<Skill[]> {
  const res = await apiClient.get('/skill/all');
  const list = unwrapList(res);
  return list.filter((s) => s.skillId && s.skillName).map(toSkill);
}

/** Create skill (BE: POST /skill or /skill/add) */
export async function createSkill(skillName: string): Promise<Skill> {
  const res = await apiClient.post('/skill/add', { skillName: skillName.trim() });
  const data = (res as { data?: { skillId?: number; skillName?: string } })?.data ?? (res as { skillId?: number; skillName?: string });
  const id = data?.skillId ?? 0;
  const name = data?.skillName ?? skillName.trim();
  return { skillId: String(id), name };
}

/** Update skill (BE: PUT /skill/update) */
export async function updateSkill(skillId: string, skillName: string): Promise<void> {
  await apiClient.put('/skill/update', { skillId: Number(skillId), skillName: skillName.trim() });
}

/** Delete skill (BE: DELETE /skill/delete/:id) */
export async function deleteSkill(skillId: string): Promise<void> {
  await apiClient.delete(`/skill/delete/${skillId}`);
}
