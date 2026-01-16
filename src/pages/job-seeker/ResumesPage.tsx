import { useRef } from 'react';
import { useAppSelector } from '@/app/hooks';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { JobSeekerSidebar } from '@/components/layout/JobSeekerSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useResumes, useUploadResume, useSetDefaultResume, useDeleteResume } from '@/modules/resumes/hooks';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { FileText, Upload, Star, Trash2, Download } from 'lucide-react';

export function JobSeekerResumesPage() {
  const { user } = useAppSelector((state) => state.auth);
  const userId = user?.id || '';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: resumes = [], isLoading } = useResumes(userId);
  const uploadResume = useUploadResume();
  const setDefault = useSetDefaultResume();
  const deleteResume = useDeleteResume();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    try {
      await uploadResume.mutateAsync({ userId, file });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      alert(error.message || 'Failed to upload resume');
    }
  };

  const handleSetDefault = async (resumeId: string) => {
    try {
      await setDefault.mutateAsync({ userId, resumeId });
    } catch (error) {
      console.error('Failed to set default resume:', error);
    }
  };

  const handleDelete = async (resumeId: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;

    try {
      await deleteResume.mutateAsync({ userId, resumeId });
    } catch (error: any) {
      alert(error.message || 'Failed to delete resume');
    }
  };

  return (
    <DashboardLayout sidebar={<JobSeekerSidebar />}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">My Resumes</h1>
          <Button onClick={() => fileInputRef.current?.click()} className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Resume
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : resumes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resumes.map((resume) => (
              <Card key={resume.id} className={resume.is_default ? 'border-primary' : ''}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{resume.file_name}</CardTitle>
                      {resume.is_default && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-600">Default Resume</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600">
                      Uploaded: {new Date(resume.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(resume.file_url, '_blank')}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      View
                    </Button>

                    {!resume.is_default && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(resume.id)}
                        disabled={setDefault.isPending}
                        className="gap-2"
                      >
                        <Star className="h-4 w-4" />
                        Set Default
                      </Button>
                    )}

                    {resumes.length > 1 && !resume.is_default && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(resume.id)}
                        disabled={deleteResume.isPending}
                        className="gap-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">No resumes uploaded yet</p>
              <Button onClick={() => fileInputRef.current?.click()} className="gap-2">
                <Upload className="h-4 w-4" />
                Upload Your First Resume
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-lg">Resume Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p>• Only PDF files are accepted</p>
            <p>• Maximum file size: 5MB</p>
            <p>• Make sure your resume is up-to-date and formatted professionally</p>
            <p>• You can set one resume as default for quick job applications</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

