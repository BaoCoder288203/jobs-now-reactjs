import { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getResumesByProfileId } from '@/services/resume.service';
import * as profileCvService from '@/services/profile-cv.service';
import { CVPreview } from '@/components/cv-builder/CVPreview';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import type { ExtractedCVData } from '@/types';
import type { CVTemplateKey } from '@/constants/cvTemplates';
import { getStoredCVHeadline } from '@/lib/cvHeadlineStorage';
import { getStoredCVAvatar } from '@/lib/cvAvatarStorage';
import { getStoredCVLanguages } from '@/lib/cvLanguageStorage';

const toDisplayDate = (dateValue?: string | null) => {
  if (!dateValue) return '';
  const [year, month] = dateValue.slice(0, 10).split('-');
  if (!year || !month) return dateValue;
  return `${month}/${year}`;
};

export function PublicCVPreviewPage() {
  const { profileId } = useParams<{ profileId: string }>();
  const [searchParams] = useSearchParams();
  const resumeIdParam = searchParams.get('resumeId');

  // --- Hook 1: fetch all resumes for this profile ---
  const { data: resumes, isLoading: isLoadingResumes, error: resumesError } = useQuery({
    queryKey: ['resumesByProfile', profileId],
    queryFn: () => getResumesByProfileId(Number(profileId)),
    enabled: !!profileId,
  });

  // --- Derive which resume to show (pure computation, no hooks) ---
  const resumeToShow = useMemo(() => {
    if (!resumes || resumes.length === 0) return null;
    if (resumeIdParam) {
      const found = resumes.find(
        (r) => String(r.id) === resumeIdParam || String(r.resumeId) === resumeIdParam,
      );
      if (found) return found;
    }
    return resumes.find((r) => r.is_default) || resumes[0];
  }, [resumes, resumeIdParam]);

  const isManualCV = !!resumeToShow && !resumeToShow.extracted_text;
  const manualResumeId = resumeToShow ? Number(resumeToShow.resumeId || resumeToShow.id) : 0;

  // --- Hook 2: fetch detailed CV data for manual CVs (always called, conditionally enabled) ---
  const {
    data: manualCvData,
    isLoading: isLoadingManualData,
    error: manualCvError,
  } = useQuery({
    queryKey: ['manualCvData', profileId, manualResumeId],
    queryFn: async () => {
      const [profile, workExperiences, educations, projects, certificates, skills] =
        await Promise.all([
          profileCvService.getProfileByProfileId(Number(profileId)),
          profileCvService.getWorkExperiences(manualResumeId),
          profileCvService.getEducations(manualResumeId),
          profileCvService.getProjects(manualResumeId),
          profileCvService.getCertificates(manualResumeId),
          profileCvService.getResumeSkills(manualResumeId),
        ]);

      const manualCvHeadline = getStoredCVHeadline(manualResumeId);

      const mappedData: ExtractedCVData = {
        avatarUrl: getStoredCVAvatar(manualResumeId) ?? undefined,
        fullName: profile.fullName ?? '',
        email: profile.email ?? '',
        phone: profile.phone ?? '',
        address: profile.address ?? '',
        title: manualCvHeadline || profile.title || '',
        headline:
          manualCvHeadline ||
          profile.title ||
          resumeToShow?.resumeName ||
          resumeToShow?.file_name ||
          'CV',
        summary: resumeToShow?.summary ?? profile.bio ?? '',
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
          duration: [toDisplayDate(project.startDate), toDisplayDate(project.endDate)]
            .filter(Boolean)
            .join(' - '),
        })),
        languages: getStoredCVLanguages(manualResumeId),
        certificates: certificates.map((cert) => ({
          name: cert.title,
          issuer: cert.description ?? '',
          issue_date: toDisplayDate(cert.issueDate),
        })),
      };
      return mappedData;
    },
    enabled: isManualCV && manualResumeId > 0,
  });

  // ──────────── Render logic (all hooks are above, safe to return early) ────────────

  if (isLoadingResumes || (isManualCV && isLoadingManualData)) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (resumesError || !resumes || resumes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Không tìm thấy hồ sơ</h2>
          <p className="text-gray-600">Ứng viên này chưa có hồ sơ nào hoặc hồ sơ đã bị xóa.</p>
        </div>
      </div>
    );
  }

  if (!resumeToShow || (isManualCV && manualCvError)) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Hồ sơ không khả dụng</h2>
          <p className="text-gray-600">Hồ sơ này không thể tải được dữ liệu chi tiết.</p>
        </div>
      </div>
    );
  }

  let cvData: ExtractedCVData;
  if (isManualCV && manualCvData) {
    cvData = manualCvData;
  } else if (resumeToShow.extracted_text) {
    try {
      cvData = JSON.parse(resumeToShow.extracted_text);
    } catch {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Lỗi dữ liệu</h2>
            <p className="text-gray-600">Dữ liệu hồ sơ bị lỗi định dạng.</p>
          </div>
        </div>
      );
    }
  } else {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 py-8">
      <div className="max-w-[210mm] mx-auto bg-white shadow-xl min-h-[297mm]">
        <CVPreview
          data={cvData}
          templateKey={(resumeToShow.templateKey as CVTemplateKey) || 'cvhay-industry-safety'}
          showDownloadButton={true}
        />
      </div>
    </div>
  );
}
