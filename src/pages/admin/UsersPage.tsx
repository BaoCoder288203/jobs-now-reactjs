import { useState } from 'react';
import { useAppSelector } from '@/app/hooks';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Users, Search, Edit2, Shield, Mail, Calendar } from 'lucide-react';
import { mockUsers } from '@/mocks/data/users.mock';

export function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter users
  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge className="bg-accent-light text-gray-900">Active</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Inactive</Badge>
    );
  };

  const getRoleBadge = (roleName?: string) => {
    if (!roleName) return null;
    
    const colors: Record<string, string> = {
      'job_seeker': 'bg-primary-light text-gray-900',
      'recruiter': 'bg-accent-light text-gray-900',
      'admin': 'bg-gray-100 text-gray-700'
    };
    
    return (
      <Badge className={colors[roleName.toLowerCase()] || 'bg-gray-100 text-gray-700'}>
        {roleName.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">
              Manage all users in the platform
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Joined</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            {user.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt={user.full_name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-900">
                                  {user.full_name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{user.full_name}</p>
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Mail className="h-3 w-3" />
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {getRoleBadge(user.role?.name)}
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(user.status)}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" className="gap-2">
                              <Edit2 className="h-4 w-4" />
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No users found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

