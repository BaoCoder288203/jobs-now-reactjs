import { useRef, useCallback, useEffect, useState } from 'react';
import type { ExtractedCVData } from '@/types';
import type { CVTemplateKey } from '@/constants/cvTemplates';
import { getCVTemplateOptionByKey } from '@/constants/cvTemplates';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { mixHex } from './templates/common';
import { DarkSidebarTemplate } from './templates/DarkSidebarTemplate';
import { AutomotiveTemplate } from './templates/AutomotiveTemplate';
import { ServiceTemplate } from './templates/ServiceTemplate';
import { SpecialistTemplate } from './templates/SpecialistTemplate';
import { StudentTemplate } from './templates/StudentTemplate';
import { SalesTemplate } from './templates/SalesTemplate';
import { ITSoftwareTemplate } from './templates/ITSoftwareTemplate';

interface CVPreviewProps {
  data: ExtractedCVData;
  onDataChange?: (data: ExtractedCVData) => void;
  language?: 'vi' | 'en';
  templateKey?: CVTemplateKey;
  showDownloadButton?: boolean;
  accentColor?: string;
}

const labels = {
  vi: {
    experience: 'Kinh nghiệm làm việc',
    education: 'Học vấn',
    skills: 'Kỹ năng',
    projects: 'Dự án',
    certificates: 'Chứng chỉ',
    languages: 'Ngôn ngữ',
    present: 'Hiện tại',
    technology: 'Công nghệ',
    downloadPdf: 'Tải PDF',
    contact: 'Liên hệ',
    summary: 'Mục tiêu nghề nghiệp',
  },
  en: {
    experience: 'Work Experience',
    education: 'Education',
    skills: 'Skills',
    projects: 'Projects',
    certificates: 'Certifications',
    languages: 'Languages',
    present: 'Present',
    technology: 'Technologies',
    downloadPdf: 'Download PDF',
    contact: 'Contact',
    summary: 'Career Objective',
  },
};

export function CVPreview({
  data,
  language = 'vi',
  templateKey = 'cvhay-industry-safety',
  showDownloadButton = true,
  accentColor,
}: CVPreviewProps) {
  const cvRef = useRef<HTMLDivElement>(null);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const l = labels[language];
  const templateOption = getCVTemplateOptionByKey(templateKey);
  const family = templateOption.family;
  
  const basePalette = family === 'dark-sidebar'
    ? {
        accent: '#f3af3e',
        accentSoft: '#fdf4e1',
        title: '#111827',
        text: '#1f2937',
        muted: '#6b7280',
        chipBg: '#fff6e9',
        chipBorder: '#f6c26b',
        sidebarBg: '#2f3f49',
        sidebarText: '#e5e7eb',
      }
    : family === 'automotive'
      ? {
          accent: '#2a69d1',
          accentSoft: '#ebf3ff',
          title: '#0f172a',
          text: '#1f2937',
          muted: '#64748b',
          chipBg: '#eff6ff',
          chipBorder: '#93c5fd',
          sidebarBg: '#f8fbff',
          sidebarText: '#1e3a8a',
        }
      : family === 'service'
        ? {
            accent: '#0e4f73',
            accentSoft: '#e8f4fa',
            title: '#0f172a',
            text: '#1f2937',
            muted: '#475569',
            chipBg: '#e6f5ff',
            chipBorder: '#7dd3fc',
            sidebarBg: '#f0f9ff',
            sidebarText: '#0c4a6e',
          }
        : family === 'student'
        ? {
            accent: '#0d9488',
            accentSoft: '#f0fdfa',
            title: '#111827',
            text: '#374151',
            muted: '#6b7280',
            chipBg: '#ccfbf1',
            chipBorder: '#5eead4',
            sidebarBg: '#fafaf9',
            sidebarText: '#1c1917',
          }
        : family === 'sales'
        ? {
            accent: '#dc2626',
            accentSoft: '#fef2f2',
            title: '#171717',
            text: '#404040',
            muted: '#737373',
            chipBg: '#f5f5f5',
            chipBorder: '#e5e5e5',
            sidebarBg: '#ffffff',
            sidebarText: '#171717',
          }
        : family === 'it-software'
        ? {
            accent: '#0ea5e9',
            accentSoft: '#eef6ff',
            title: '#0f172a',
            text: '#1e293b',
            muted: '#475569',
            chipBg: '#e0f2fe',
            chipBorder: '#bae6fd',
            sidebarBg: '#0f172a',
            sidebarText: '#e2e8f0',
          }
        : {
            accent: '#b45309',
            accentSoft: '#fff7e6',
            title: '#1f2937',
            text: '#374151',
            muted: '#6b7280',
            chipBg: '#fffbeb',
            chipBorder: '#fcd34d',
            sidebarBg: '#fffbeb',
            sidebarText: '#92400e',
          };

  const palette = accentColor
    ? {
        ...basePalette,
        accent: accentColor,
        accentSoft: mixHex(accentColor, '#ffffff', 0.87),
        chipBg: mixHex(accentColor, '#ffffff', 0.9),
        chipBorder: mixHex(accentColor, '#ffffff', 0.7),
        sidebarBg: family === 'dark-sidebar' || family === 'it-software'
          ? mixHex(accentColor, '#111827', 0.72)
          : basePalette.sidebarBg,
      }
    : basePalette;

  const displayName = data.fullName?.trim() || data.headline || 'Curriculum Vitae';

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [data.avatarUrl]);

  const handleDownloadPDF = useCallback(async () => {
    if (!cvRef.current) return;
    try {
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default ?? html2pdfModule;
      const filename = `CV_${(displayName || 'Resume').replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      await html2pdf()
        .set({
          margin: 0,
          filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            scrollY: 0,
            onclone: (clonedDoc: Document) => {
              const clonedRoot = clonedDoc.querySelector('[data-cv-root="true"]') as HTMLElement | null;
              if (clonedRoot) {
                clonedRoot.style.boxShadow = 'none';
                clonedRoot.style.border = 'none';
                clonedRoot.style.margin = '0';
              }
            },
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(cvRef.current)
        .save();
    } catch (err) {
      console.error('PDF generation failed:', err);
      toast.error('Tải PDF thất bại. Vui lòng thử lại.');
    }
  }, [displayName]);

  const templateProps = {
    data,
    palette,
    l,
    avatarLoadFailed,
    setAvatarLoadFailed
  };

  const fontFamilyMap = {
     'specialist': "'Inter', 'Segoe UI', 'Helvetica Neue', sans-serif",
     'service': "'Georgia', serif, 'Times New Roman'",
     'automotive': "'Roboto', 'Segoe UI', 'Helvetica Neue', sans-serif",
     'dark-sidebar': "'Arial', 'Segoe UI', sans-serif",
     'student': "'Inter', 'Segoe UI', 'Helvetica Neue', sans-serif",
     'sales': "'Inter', 'Segoe UI', 'Helvetica Neue', sans-serif",
     'it-software': "'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
  };

  const selectedFont = fontFamilyMap[family] || "'Arial', sans-serif";

  return (
    <div className="space-y-4">
      {showDownloadButton && (
        <div className="flex justify-center gap-3">
          <Button onClick={handleDownloadPDF} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            {l.downloadPdf}
          </Button>
        </div>
      )}

      <div className="flex justify-center overflow-x-auto">
        <div
          ref={cvRef}
          data-cv-root="true"
          style={{
            width: '210mm',
            minHeight: '297mm',
            padding: '0',
            background: '#fff',
            fontFamily: selectedFont,
            fontSize: '10.5pt',
            lineHeight: '1.65',
            color: palette.text,
            boxSizing: 'border-box',
            border: '1px solid #e5e7eb',
            boxShadow: '0 18px 38px rgba(15, 23, 42, 0.18)',
          }}
        >
          {family === 'dark-sidebar' && <DarkSidebarTemplate {...templateProps} />}
          {family === 'automotive' && <AutomotiveTemplate {...templateProps} />}
          {family === 'service' && <ServiceTemplate {...templateProps} />}
          {family === 'specialist' && <SpecialistTemplate {...templateProps} />}
          {family === 'student' && <StudentTemplate {...templateProps} />}
          {family === 'sales' && <SalesTemplate {...templateProps} />}
          {family === 'it-software' && <ITSoftwareTemplate {...templateProps} />}
        </div>
      </div>
    </div>
  );
}
