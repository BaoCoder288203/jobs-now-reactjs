import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CVPreview } from '@/components/cv-builder/CVPreview';
import { improveCVFromText, type ImproveCVResponse } from '@/services/ai.service';
import { useResumes, useUploadResume, useSetDefaultResume, useDeleteResume } from '@/modules/resumes/hooks';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import * as profileCvService from '@/services/profile-cv.service';
import { FileText, Upload, Star, Trash2, Download, Edit, FileEdit, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { ExtractedCVData } from '@/types';

type ImproveLanguage = 'auto' | 'vi' | 'en';

export function JobSeekerResumesPage() {
  const { user } = useAppSelector((state) => state.auth);
  const userId = user?.userId ? String(user.userId) : '';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<ExtractedCVData | null>(null);
  const [previewLanguage, setPreviewLanguage] = useState<'vi' | 'en'>('en');
  const [improveOpen, setImproveOpen] = useState(false);
  const [improveResult, setImproveResult] = useState<ImproveCVResponse | null>(null);
  const [improvingResumeId, setImprovingResumeId] = useState<number | null>(null);
  const [improveTargetResumeId, setImproveTargetResumeId] = useState<number | null>(null);
  const [improvingResumeName, setImprovingResumeName] = useState('');
  const [improveLanguage, setImproveLanguage] = useState<ImproveLanguage>('auto');

  const { data: resumes = [], isLoading } = useResumes(userId);
  const uploadResume = useUploadResume();
  const setDefault = useSetDefaultResume();
  const deleteResume = useDeleteResume();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Chỉ chấp nhận file PDF');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file tối đa 5MB');
      return;
    }

    try {
      await uploadResume.mutateAsync({ userId, file });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      toast.error(error.message || 'Tải lên CV thất bại');
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
    if (!window.confirm('Bạn có chắc muốn xóa CV này?')) return;

    try {
      await deleteResume.mutateAsync({ userId, resumeId });
      toast.success('Đã xóa CV');
    } catch (error: any) {
      toast.error(error.message || 'Xóa CV thất bại');
    }
  };

  const toDisplayDate = (dateValue?: string | null) => {
    if (!dateValue) return '';
    const [year, month] = dateValue.slice(0, 10).split('-');
    if (!year || !month) return dateValue;
    return `${month}/${year}`;
  };

  const getResumeIdentity = (resume: { id?: string; resumeId?: number; file_name?: string; resumeName?: string }) => ({
    resumeId: Number(resume.id ?? resume.resumeId),
    resumeName: resume.file_name ?? resume.resumeName ?? 'CV',
  });

  const handleDownloadCreatedResumePdf = async (resume: {
    id?: string;
    resumeId?: number;
    file_name?: string;
    resumeName?: string;
    summary?: string | null;
  }) => {
    const { resumeId, resumeName } = getResumeIdentity(resume);
    if (!resumeId || Number.isNaN(resumeId)) {
      toast.error('Không tìm thấy resumeId để tạo PDF');
      return;
    }

    try {
      const [profile, workExperiences, educations, projects, certificates, skills] = await Promise.all([
        profileCvService.getProfileByUserId(userId),
        profileCvService.getWorkExperiences(resumeId),
        profileCvService.getEducations(resumeId),
        profileCvService.getProjects(resumeId),
        profileCvService.getCertificates(resumeId),
        profileCvService.getResumeSkills(resumeId),
      ]);

      const mappedData: ExtractedCVData = {
        fullName: profile.fullName ?? user?.fullName ?? '',
        email: profile.email ?? user?.email ?? '',
        phone: profile.phone ?? user?.phone ?? '',
        address: profile.address ?? '',
        title: profile.title ?? '',
        headline: profile.title ?? resumeName,
        summary: resume.summary ?? profile.bio ?? '',
        work_experiences: workExperiences.map((we) => ({
          company: '',
          position: we.title,
          start_date: toDisplayDate(we.startDate),
          end_date: toDisplayDate(we.endDate),
          description: we.description ?? '',
        })),
        educations: educations.map((edu) => ({
          school: edu.title,
          major: edu.majorName ?? '',
          degree: edu.educationLevel,
          start_date: toDisplayDate(edu.startDate),
          end_date: toDisplayDate(edu.endDate),
        })),
        skills: skills.map((skill) => ({ name: skill.skillName, level: skill.level ?? '' })),
        projects: projects.map((project) => ({
          name: project.title,
          description: project.description ?? '',
          duration: [toDisplayDate(project.startDate), toDisplayDate(project.endDate)].filter(Boolean).join(' - '),
        })),
        languages: [],
        certificates: certificates.map((cert) => ({
          name: cert.title,
          issuer: cert.description ?? '',
          issue_date: toDisplayDate(cert.issueDate),
        })),
      };

      setPreviewData(mappedData);
      setPreviewLanguage('en');
      setPreviewOpen(true);
    } catch (error) {
      console.error('Failed to build PDF data for created resume:', error);
      toast.error('Không thể tạo PDF từ CV này. Vui lòng thử lại.');
    }
  };

  const runImproveByResumeId = async (resumeId: number, resumeName: string, language: ImproveLanguage) => {
    try {
      setImprovingResumeId(resumeId);
      setImproveTargetResumeId(resumeId);
      setImprovingResumeName(resumeName);
      setImproveLanguage(language);
      const result = await improveCVFromText({ resumeId, language });
      setImproveResult(result);
      setImproveOpen(true);
    } catch (error: any) {
      toast.error(error?.message || 'Không thể cải thiện CV. Vui lòng thử lại.');
    } finally {
      setImprovingResumeId(null);
    }
  };

  const handleImproveResume = async (resume: {
    id?: string;
    resumeId?: number;
    file_name?: string;
    resumeName?: string;
  }) => {
    const { resumeId, resumeName } = getResumeIdentity(resume);
    if (!resumeId || Number.isNaN(resumeId)) {
      toast.error('Không tìm thấy resumeId để cải thiện CV');
      return;
    }

    await runImproveByResumeId(resumeId, resumeName, improveLanguage);
  };

  const handleChangeImproveLanguage = async (language: ImproveLanguage) => {
    if (!improveTargetResumeId) return;
    await runImproveByResumeId(improveTargetResumeId, improvingResumeName || 'CV', language);
  };

  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý CV</h1>
        <div className="flex gap-2 flex-wrap">
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
                    {resume.type === 'UPLOADED' ? 'Đã tải lên' : 'Đã tạo'}: {new Date(resume.created_at ?? resume.uploadedAt ?? 0).toLocaleDateString('vi-VN')}
                  </p>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {resume.file_url && resume.file_url.trim() ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(resume.file_url, '_blank', 'noopener,noreferrer')}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Xem
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadCreatedResumePdf(resume)}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Tải PDF
                    </Button>
                  )}

                  <Link to={`/user/resumes/edit?id=${resume.id ?? (resume as { resumeId?: number }).resumeId}`} state={{ resumeName: resume.file_name ?? (resume as { resumeName?: string }).resumeName }}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <FileEdit className="h-4 w-4" />
                      Chỉnh sửa nội dung
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleImproveResume(resume)}
                    disabled={improvingResumeId === Number(resume.id ?? resume.resumeId)}
                    className="gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    {improvingResumeId === Number(resume.id ?? resume.resumeId) ? 'Đang cải thiện...' : 'Improve CV'}
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
                      onClick={() => handleSetDefault(resume.id ?? String(resume.resumeId))}
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
                      onClick={() => handleDelete(resume.id ?? String(resume.resumeId))}
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

  return (
    <div className="p-6">
      {content}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-[95vw] p-4" onClose={() => setPreviewOpen(false)}>
          {previewData ? (
            <div className="space-y-3">
              <div className="flex items-center justify-end gap-2">
                <span className="text-sm text-gray-600">Ngôn ngữ PDF</span>
                <select
                  value={previewLanguage}
                  onChange={(e) => setPreviewLanguage(e.target.value as 'vi' | 'en')}
                  className="rounded-md border border-gray-300 px-2 py-1 text-sm"
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              </div>
              <CVPreview data={previewData} language={previewLanguage} onDataChange={() => {}} />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={improveOpen} onOpenChange={setImproveOpen}>
        <DialogContent className="max-w-3xl p-6" onClose={() => setImproveOpen(false)}>
          {improveResult ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Kết quả Improve CV</h2>
                  <p className="text-sm text-gray-600 mt-1">{improvingResumeName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Ngôn ngữ</span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={improveLanguage === 'vi' ? 'default' : 'outline'}
                      onClick={() => handleChangeImproveLanguage('vi')}
                      disabled={improvingResumeId !== null}
                    >
                      Tiếng Việt
                    </Button>
                    <Button
                      size="sm"
                      variant={improveLanguage === 'en' ? 'default' : 'outline'}
                      onClick={() => handleChangeImproveLanguage('en')}
                      disabled={improvingResumeId !== null}
                    >
                      English
                    </Button>
                  </div>
                  <select
                    value={improveLanguage}
                    onChange={(e) => handleChangeImproveLanguage(e.target.value as ImproveLanguage)}
                    disabled={improvingResumeId !== null}
                    className="rounded-md border border-gray-300 px-2 py-1 text-sm"
                  >
                    <option value="auto">Auto</option>
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-lg border border-gray-200 p-3">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Overall Score</p>
                  <p className="text-2xl font-bold text-primary mt-1">{improveResult.overallScore}</p>
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Extracted Skills</p>
                  <p className="text-sm text-gray-800 mt-1">{improveResult.extractedSkills?.length ?? 0} kỹ năng</p>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-sm font-medium text-gray-900 mb-2">Tổng quan</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{improveResult.overviewFeedback || 'Chưa có nhận xét tổng quan.'}</p>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-sm font-medium text-gray-900 mb-2">Summary đề xuất</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{improveResult.improvedSummary || 'Không có summary đề xuất.'}</p>
              </div>

              <div className="rounded-lg border border-gray-200 p-4 space-y-2">
                <p className="text-sm font-medium text-gray-900">Action Items</p>
                {improveResult.actionItems?.length ? (
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    {improveResult.actionItems.map((item, idx) => (
                      <li key={`${item}-${idx}`}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-600">Không có gợi ý hành động cụ thể.</p>
                )}
              </div>

              <div className="rounded-lg border border-gray-200 p-4 space-y-3">
                <p className="text-sm font-medium text-gray-900">Đánh giá theo mục</p>
                {improveResult.sections?.length ? (
                  improveResult.sections.map((section, idx) => (
                    <div key={`${section.section}-${idx}`} className="rounded-md border border-gray-100 p-3 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{section.section}</p>
                        <Badge variant="outline">Score: {section.score}</Badge>
                      </div>
                      {section.suggestions?.length ? (
                        <ul className="list-disc pl-5 text-sm text-gray-700 mt-2 space-y-1">
                          {section.suggestions.map((s, sIdx) => (
                            <li key={`${s}-${sIdx}`}>{s}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-600">Không có đánh giá theo mục.</p>
                )}
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-sm font-medium text-gray-900 mb-2">Missing Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {improveResult.missingKeywords?.length ? (
                    improveResult.missingKeywords.map((kw, idx) => (
                      <Badge key={`${kw}-${idx}`} variant="secondary">{kw}</Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-600">Không có từ khóa thiếu.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  disabled={improvingResumeId !== null}
                  onClick={async () => {
                    if (!improveTargetResumeId) return;
                    await runImproveByResumeId(improveTargetResumeId, improvingResumeName || 'CV', improveLanguage);
                  }}
                >
                  {improvingResumeId !== null ? 'Đang chạy...' : 'Chạy lại'}
                </Button>
                <Button onClick={() => setImproveOpen(false)}>Đóng</Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

