import { useEffect, useState } from 'react';
import { useHotkey } from '@tanstack/react-hotkeys';
import { useAppSelector } from '@/app/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { useProfile, useProfileSkills, useUpdateProfile, useAddProfileSkill, useRemoveProfileSkill } from '@/modules/profile/hooks';
import { getAllSkills } from '@/services/skill.service';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { RichTextContent } from '@/components/ui/RichTextContent';
import { Edit2, X, Plus } from 'lucide-react';
import type { ProfileSkill, Skill } from '@/types';
import { SocialLinksEditor } from '@/components/social/SocialLinksEditor';
import type { SocialLinkFormRow } from '@/constants/socialPlatforms';

export function JobSeekerProfilePage() {
  const { user } = useAppSelector((state) => state.auth);
  const userId = user?.userId ? String(user.userId) : '';

  const { data: profile, isLoading: profileLoading } = useProfile(userId);
  const { data: skills = [] } = useProfileSkills(userId);

  const updateProfile = useUpdateProfile();
  const addSkill = useAddProfileSkill();
  const removeSkill = useRemoveProfileSkill();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    headline: '',
  });
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkill, setNewSkill] = useState({ skillId: '', level: 'beginner' });
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [skillSearch, setSkillSearch] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);

  useEffect(() => {
    getAllSkills().then(setAllSkills).catch(() => {});
  }, []);
  const [socialLinks, setSocialLinks] = useState<SocialLinkFormRow[]>([
    { platform: 'FACEBOOK', url: '', logo_url: '' },
  ]);

  useEffect(() => {
    if (profile) {
      setFormData({
        headline: profile.headline ?? profile.title ?? '',
      });
      setSocialLinks(
        profile.socials?.length ?
          profile.socials.map((s) => ({
            platform: s.platform,
            url: s.url,
            logo_url: s.logoUrl ?? '',
          }))
        : [{ platform: 'FACEBOOK', url: '', logo_url: '' }],
      );
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      const socialsPayload = socialLinks
        .filter((s) => s.url.trim())
        .map((s) => ({
          platform: s.platform,
          url: s.url.trim(),
          logo_url: s.logo_url?.trim() || undefined,
        }));
      await updateProfile.mutateAsync({
        userId,
        data: {
          title: formData.headline.trim(), // API mapping handles this, but lets be explicit
          socials: socialsPayload,
        },
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  useHotkey('Mod+S', (e) => {
    e.preventDefault();
    if (isEditing && !updateProfile.isPending) handleSave();
  }, { enabled: isEditing && !updateProfile.isPending });

  const handleAddSkill = async () => {
    if (!newSkill.skillId) return;
    try {
      await addSkill.mutateAsync({
        userId,
        skillId: newSkill.skillId,
        level: newSkill.level
      });
      setNewSkill({ skillId: '', level: 'beginner' });
      setShowAddSkill(false);
    } catch (error) {
      console.error('Failed to add skill:', error);
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    try {
      await removeSkill.mutateAsync({ userId, skillId });
    } catch (error) {
      console.error('Failed to remove skill:', error);
    }
  };

  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Hồ sơ nghề nghiệp</h1>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} className="gap-2">
            <Edit2 className="h-4 w-4" />
            Chỉnh sửa hồ sơ
          </Button>
        )}
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Chức danh & Mạng xã hội</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="headline">Chuyên môn / Định vị (Headline)</Label>
                <Input
                  id="headline"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  placeholder="Ví dụ: Senior Software Developer, Digital Marketing Specialist..."
                />
              </div>

              <SocialLinksEditor
                value={socialLinks}
                onChange={setSocialLinks}
                disabled={updateProfile.isPending}
              />

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Hủy
                </Button>
              </div>
            </>
          ) : (
            <>
              <div>
                <Label className="text-sm text-gray-500">Chuyên môn (Headline)</Label>
                <p className="text-lg font-medium mt-1">{profile?.title || profile?.headline || 'Chưa thiết lập'}</p>
              </div>

              {profile?.socials && profile.socials.length > 0 && (
                <div className="pt-2 border-t border-gray-100">
                  <Label className="text-sm text-gray-500">Mạng xã hội</Label>
                  <ul className="mt-2 space-y-2">
                    {profile.socials.map((s) => (
                      <li key={s.id ?? `${s.platform}-${s.url}`}>
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-600 hover:underline text-sm break-all"
                        >
                          {s.platform}: {s.url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Skills</CardTitle>
          {!showAddSkill && (
            <Button variant="outline" size="sm" onClick={() => setShowAddSkill(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Skill
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {showAddSkill && (
            <div className="mb-4 p-4 border border-gray-200 rounded-lg space-y-3">
              <div className="space-y-2">
                <Label>Tìm kỹ năng</Label>
                <div className="relative">
                  <Input
                    value={skillSearch}
                    onFocus={() => setShowSkillDropdown(true)}
                    onBlur={() => setTimeout(() => setShowSkillDropdown(false), 200)}
                    onChange={(e) => {
                      setSkillSearch(e.target.value);
                      setShowSkillDropdown(true);
                      const match = allSkills.find(
                        (s) => s.name.toLowerCase() === e.target.value.toLowerCase()
                      );
                      setNewSkill({ ...newSkill, skillId: match ? String(match.skillId) : '' });
                    }}
                    placeholder="Gõ để tìm kỹ năng..."
                  />
                  
                  {showSkillDropdown && (
                    <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {allSkills
                        .filter(
                          (skill) =>
                            !skills.some(
                              (ps) =>
                                String(ps.skillId ?? (ps as { skill_id?: string }).skill_id) === String(skill.skillId)
                            )
                        )
                        .filter(
                          (skill) =>
                            !skillSearch ||
                            skill.name.toLowerCase().includes(skillSearch.toLowerCase())
                        )
                        .map((skill) => (
                          <li
                            key={skill.skillId}
                            className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-primary/10 hover:text-primary cursor-pointer"
                            onClick={() => {
                              setSkillSearch(skill.name);
                              setNewSkill({ ...newSkill, skillId: String(skill.skillId) });
                              setShowSkillDropdown(false);
                            }}
                          >
                            <span className="block truncate font-medium">{skill.name}</span>
                          </li>
                        ))}
                        {allSkills.filter((skill) => !skills.some((ps) => String(ps.skillId ?? (ps as { skill_id?: string }).skill_id) === String(skill.skillId)))
                            .filter((skill) => !skillSearch || skill.name.toLowerCase().includes(skillSearch.toLowerCase())).length === 0 && (
                          <li className="relative cursor-default select-none py-2 px-3 text-gray-500">
                            Không tìm thấy kỹ năng phù hợp
                          </li>
                        )}
                    </ul>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Level</Label>
                <Select
                  value={newSkill.level}
                  onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => { handleAddSkill(); setSkillSearch(''); }} disabled={addSkill.isPending || !newSkill.skillId} size="sm">
                  {addSkill.isPending ? 'Đang thêm...' : 'Thêm'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setShowAddSkill(false); setSkillSearch(''); }}>
                  Hủy
                </Button>
              </div>
            </div>
          )}

          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((skillItem: ProfileSkill) => (
                <Badge key={skillItem.skillId ?? skillItem.id} variant="primary" className="text-sm py-1 px-3 flex items-center gap-2">
                  {skillItem.skillName ?? skillItem.skill?.name} ({skillItem.level})
                  <button
                    onClick={() => handleRemoveSkill(String(skillItem.skillId ?? skillItem.skill_id))}
                    className="hover:text-red-600"
                    disabled={removeSkill.isPending}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No skills added yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );

  if (profileLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Profile not found</p>
        </div>
      </div>
    );
  }

  return <div className="p-6">{content}</div>;
}

