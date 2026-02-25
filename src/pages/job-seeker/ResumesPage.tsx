import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useResumes, useUploadResume, useSetDefaultResume, useDeleteResume } from '@/modules/resumes/hooks';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { FileText, Upload, Star, Trash2, Download, Edit } from 'lucide-react';

export function JobSeekerResumesPage() {
  const { user } = useAppSelector((state) => state.auth);
  const userId = user?.userId ? String(user.userId) : '';
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

  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý CV</h1>
        <div className="flex gap-2">
          <Link to="/tools/tao-cv/builder">
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              Tạo CV mới
            </Button>
          </Link>
          <Button onClick={() => fileInputRef.current?.click()} className="gap-2">
            <Upload className="h-4 w-4" />
            Tải CV lên
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
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
                  <div className="flex-1">
                    <CardTitle className="text-lg">{resume.file_name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {resume.type === 'UPLOADED' && (
                        <Badge variant="secondary">Đã tải lên</Badge>
                      )}
                      {resume.type === 'CREATED' && resume.is_ai_generated && (
                        <Badge className="bg-primary/20 text-primary">Tạo bởi AI</Badge>
                      )}
                      {resume.type === 'CREATED' && !resume.is_ai_generated && (
                        <Badge variant="outline">Tạo thủ công</Badge>
                      )}
                      {resume.is_default && (
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          Mặc định
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    {resume.type === 'UPLOADED' ? 'Đã tải lên' : 'Đã tạo'}: {new Date(resume.created_at).toLocaleDateString('vi-VN')}
                  </p>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(resume.file_url, '_blank')}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Xem
                  </Button>

                  {resume.extracted_text && (
                    <Link to={`/tools/tao-cv/builder?edit=${resume.id}`}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Edit className="h-4 w-4" />
                        Chỉnh sửa
                      </Button>
                    </Link>
                  )}

                  {!resume.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(resume.id)}
                      disabled={setDefault.isPending}
                      className="gap-2"
                    >
                      <Star className="h-4 w-4" />
                      Đặt mặc định
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
                      Xóa
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
            <p className="text-gray-600 mb-4">Chưa có CV nào</p>
            <div className="flex gap-2">
              <Link to="/tools/tao-cv/builder">
                <Button className="gap-2">
                  <FileText className="h-4 w-4" />
                  Tạo CV mới
                </Button>
              </Link>
              <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Tải CV lên
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg">Hướng dẫn</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>• Chỉ chấp nhận file PDF</p>
          <p>• Kích thước file tối đa: 5MB</p>
          <p>• Đảm bảo CV của bạn được cập nhật và định dạng chuyên nghiệp</p>
          <p>• Bạn có thể đặt một CV làm mặc định để ứng tuyển nhanh</p>
          <p>• CV tạo bằng AI hoặc thủ công có thể chỉnh sửa sau</p>
        </CardContent>
      </Card>
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return <div className="p-6">{content}</div>;
}

