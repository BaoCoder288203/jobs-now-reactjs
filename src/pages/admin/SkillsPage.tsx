import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockSkills } from '@/mocks/data/skills.mock';
import { Sparkles, Search, Plus, Edit2, Trash2 } from 'lucide-react';

export function AdminSkillsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');

  const filteredSkills = mockSkills.filter(skill =>
    skill.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    // In real app, call API to add skill
    alert(`Skill "${newSkillName}" added`);
    setNewSkillName('');
    setShowAddForm(false);
  };

  const handleDelete = (skillId: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;
    // In real app, call API to delete
    alert('Skill deleted');
  };

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Skill Management</h1>
            <p className="text-gray-600 mt-1">
              Manage all skills in the platform
            </p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Skill
          </Button>
        </div>

        {/* Add Skill Form */}
        {showAddForm && (
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Input
                  placeholder="Enter skill name..."
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                  className="flex-1"
                />
                <Button onClick={handleAddSkill}>Add</Button>
                <Button variant="outline" onClick={() => {
                  setShowAddForm(false);
                  setNewSkillName('');
                }}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSkills.map((skill) => (
            <Card key={skill.skillId} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-accent" />
                    <h3 className="font-semibold text-gray-900">
                      {skill.name}
                    </h3>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                  >
                    <Edit2 className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(skill.skillId)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSkills.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Sparkles className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">No skills found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

