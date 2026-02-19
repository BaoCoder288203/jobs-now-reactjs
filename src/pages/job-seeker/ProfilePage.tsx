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
import { mockSkills } from '@/mocks/data/skills.mock';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Edit2, X, Plus } from 'lucide-react';
import type { ProfileSkill } from '@/types';

export function JobSeekerProfilePage() {
  const { user } = useAppSelector((state) => state.auth);
  const userId = user?.id || '';

  const { data: profile, isLoading: profileLoading } = useProfile(userId);
  const { data: skills = [] } = useProfileSkills(userId);

  const updateProfile = useUpdateProfile();
  const addSkill = useAddProfileSkill();
  const removeSkill = useRemoveProfileSkill();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    headline: '',
    summary: '',
    current_position: '',
    years_experience: '',
    education_level: '',
    date_of_birth: '',
    gender: ''
  });
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkill, setNewSkill] = useState({ skillId: '', level: 'beginner' });

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        headline: profile.headline || '',
        summary: profile.summary || '',
        current_position: profile.current_position || '',
        years_experience: profile.years_experience?.toString() || '',
        education_level: profile.education_level || '',
        date_of_birth: profile.date_of_birth || '',
        gender: profile.gender || ''
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        userId,
        data: {
          ...formData,
          years_experience: parseInt(formData.years_experience) || 0
        }
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
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} className="gap-2">
              <Edit2 className="h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="headline">Headline</Label>
                  <Input
                    id="headline"
                    value={formData.headline}
                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                    placeholder="e.g., Senior Software Developer"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary">Summary</Label>
                  <Textarea
                    id="summary"
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current_position">Current Position</Label>
                    <Input
                      id="current_position"
                      value={formData.current_position}
                      onChange={(e) => setFormData({ ...formData, current_position: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="years_experience">Years of Experience</Label>
                    <Input
                      id="years_experience"
                      type="number"
                      value={formData.years_experience}
                      onChange={(e) => setFormData({ ...formData, years_experience: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="education_level">Education Level</Label>
                    <Select
                      id="education_level"
                      value={formData.education_level}
                      onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
                    >
                      <option value="">Select</option>
                      <option value="high_school">High School</option>
                      <option value="bachelor">Bachelor</option>
                      <option value="master">Master</option>
                      <option value="phd">PhD</option>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      id="gender"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={updateProfile.isPending}>
                    {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label className="text-sm text-gray-500">Headline</Label>
                  <p className="text-lg font-medium mt-1">{profile?.headline || 'Not set'}</p>
                </div>

                <div>
                  <Label className="text-sm text-gray-500">Summary</Label>
                  <p className="mt-1 text-gray-700">{profile?.summary || 'Not set'}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-500">Current Position</Label>
                    <p className="mt-1">{profile?.current_position || 'Not set'}</p>
                  </div>

                  <div>
                    <Label className="text-sm text-gray-500">Years of Experience</Label>
                    <p className="mt-1">{profile?.years_experience || 'Not set'}</p>
                  </div>

                  <div>
                    <Label className="text-sm text-gray-500">Education Level</Label>
                    <p className="mt-1 capitalize">{profile?.education_level || 'Not set'}</p>
                  </div>

                  <div>
                    <Label className="text-sm text-gray-500">Gender</Label>
                    <p className="mt-1 capitalize">{profile?.gender || 'Not set'}</p>
                  </div>

                  <div>
                    <Label className="text-sm text-gray-500">Date of Birth</Label>
                    <p className="mt-1">{profile?.date_of_birth || 'Not set'}</p>
                  </div>
                </div>
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
                  <Label>Select Skill</Label>
                  <Select
                    value={newSkill.skillId}
                    onChange={(e) => setNewSkill({ ...newSkill, skillId: e.target.value })}
                  >
                    <option value="">Select a skill</option>
                    {mockSkills
                      .filter(skill => !skills.some(ps => ps.skill_id === skill.skillId))
                      .map(skill => (
                        <option key={skill.skillId} value={skill.skillId}>
                          {skill.name}
                        </option>
                      ))}
                  </Select>
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
                  <Button onClick={handleAddSkill} disabled={addSkill.isPending || !newSkill.skillId} size="sm">
                    {addSkill.isPending ? 'Adding...' : 'Add'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowAddSkill(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skillItem: ProfileSkill) => (
                  <Badge key={skillItem.id} variant="primary" className="text-sm py-1 px-3 flex items-center gap-2">
                    {skillItem.skill?.name} ({skillItem.level})
                    <button
                      onClick={() => handleRemoveSkill(skillItem.skill_id)}
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

