import { useRef, useCallback } from 'react';
import type { ExtractedCVData } from '@/types';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CVPreviewProps {
  data: ExtractedCVData;
  onDataChange?: (data: ExtractedCVData) => void;
  language?: 'vi' | 'en';
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
  },
};

const sectionHeaderStyle = {
  fontSize: '11pt',
  fontWeight: 700,
  color: '#2563eb',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  borderBottom: '1px solid #e5e7eb',
  paddingBottom: '4px',
  marginBottom: '10px',
};

const PLACEHOLDER_VALUES = new Set(['n/a', 'na', 'null', 'undefined', '-', '']);

function normalizeText(value?: string) {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) return '';
  return PLACEHOLDER_VALUES.has(trimmed.toLowerCase()) ? '' : trimmed;
}

function htmlToPlainText(value?: string) {
  const source = value ?? '';
  if (!source.trim()) return '';

  return source
    .replace(/<br\s*\/?>(\s*)/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function toTimeline(duration?: string, startDate?: string, endDate?: string, presentLabel = 'Present') {
  const normalizedDuration = normalizeText(duration);
  if (normalizedDuration) return normalizedDuration;

  const start = normalizeText(startDate);
  const end = normalizeText(endDate);
  if (!start && !end) return '';
  if (start && !end) return `${start} - ${presentLabel}`;
  if (!start && end) return end;
  return `${start} - ${end}`;
}

function isMeaningfulCompany(value?: string) {
  const normalized = normalizeText(value).toLowerCase();
  if (!normalized) return false;
  return normalized !== 'internship' && normalized !== 'current position' && normalized !== 'present';
}

export function CVPreview({ data, language = 'vi' }: CVPreviewProps) {
  const cvRef = useRef<HTMLDivElement>(null);
  const l = labels[language];
  const displayName = data.fullName?.trim() || data.headline || 'Curriculum Vitae';
  const displayTitle = data.title?.trim() || (data.fullName ? data.headline : '');
  const summaryText = htmlToPlainText(data.summary);
  const contactParts = [data.email, data.phone, data.address].filter(
    (value): value is string => Boolean(value && value.trim())
  );
  const uniqueSkills = (data.skills ?? []).filter((skill, index, list) => {
    const normalizedName = normalizeText(skill.name).toLowerCase();
    if (!normalizedName) return false;
    return list.findIndex((item) => normalizeText(item.name).toLowerCase() === normalizedName) === index;
  });

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
            onclone: (clonedDoc: Document) => {
              clonedDoc.querySelectorAll('style, link[rel="stylesheet"]').forEach((el) => el.remove());
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

  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-3">
        <Button onClick={handleDownloadPDF} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          {l.downloadPdf}
        </Button>
      </div>

      <div className="flex justify-center overflow-x-auto">
        <div
          ref={cvRef}
          style={{
            width: '210mm',
            minHeight: '297mm',
            padding: '20mm 18mm',
            background: '#fff',
            fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
            fontSize: '10pt',
            lineHeight: '1.5',
            color: '#1a1a1a',
            boxSizing: 'border-box',
          }}
          className="shadow-2xl border border-gray-200"
        >
          <div style={{ borderBottom: '3px solid #2563eb', paddingBottom: '14px', marginBottom: '16px' }}>
            <h1 style={{ fontSize: '22pt', fontWeight: 700, color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>
              {displayName}
            </h1>
            {displayTitle && (
              <p style={{ fontSize: '11pt', color: '#1f2937', marginTop: '4px', marginBottom: 0, fontWeight: 600 }}>
                {displayTitle}
              </p>
            )}
            {contactParts.length > 0 && (
              <p style={{ fontSize: '9.5pt', color: '#6b7280', marginTop: '6px', marginBottom: 0 }}>
                {contactParts.join(' | ')}
              </p>
            )}
            {summaryText && (
              <p style={{ fontSize: '10pt', color: '#4b5563', marginTop: '8px', lineHeight: '1.6' }}>
                {summaryText}
              </p>
            )}
          </div>

          {data.work_experiences && data.work_experiences.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <h2 style={sectionHeaderStyle}>{l.experience}</h2>
              {data.work_experiences.map((exp, i) => (
                <div key={i} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '10.5pt', color: '#111827' }}>{normalizeText(exp.position)}</span>
                      {isMeaningfulCompany(exp.company) && (
                        <span style={{ color: '#6b7280' }}> — {exp.company}</span>
                      )}
                    </div>
                    <span style={{ fontSize: '9pt', color: '#9ca3af', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                      {toTimeline(exp.duration, exp.start_date, exp.end_date, l.present)}
                    </span>
                  </div>
                  {normalizeText(htmlToPlainText(exp.description)) && (
                    <ul style={{ margin: '4px 0 0 0', paddingLeft: '18px', color: '#374151' }}>
                      {htmlToPlainText(exp.description)
                        .split('\n')
                        .map((line) => line.trim())
                        .filter(Boolean)
                        .map((line, j) => (
                        <li key={j} style={{ marginBottom: '2px' }}>{line.replace(/^[•\-–]\s*/, '')}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {data.educations && data.educations.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <h2 style={sectionHeaderStyle}>{l.education}</h2>
              {data.educations.map((edu, i) => (
                <div key={i} style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div>
                      <span style={{ fontWeight: 600, color: '#111827' }}>{normalizeText(edu.school)}</span>
                      {normalizeText(edu.degree) && <span style={{ color: '#6b7280' }}> — {edu.degree}</span>}
                      {normalizeText(edu.major) && <span style={{ color: '#6b7280' }}> ({edu.major})</span>}
                    </div>
                    <span style={{ fontSize: '9pt', color: '#9ca3af', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                      {toTimeline(edu.duration, edu.start_date, edu.end_date, l.present)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {uniqueSkills.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <h2 style={sectionHeaderStyle}>{l.skills}</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {uniqueSkills.map((skill, i) => (
                  <span
                    key={i}
                    style={{
                      display: 'inline-block', padding: '3px 10px', backgroundColor: '#eff6ff',
                      color: '#1d4ed8', borderRadius: '4px', fontSize: '9pt', fontWeight: 500,
                      border: '1px solid #bfdbfe',
                    }}
                  >
                    {normalizeText(skill.name)}{normalizeText(skill.level) ? ` (${skill.level})` : ''}
                  </span>
                ))}
              </div>
            </div>
          )}

          {data.projects && data.projects.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <h2 style={sectionHeaderStyle}>{l.projects}</h2>
              {data.projects.map((prj, i) => (
                <div key={i} style={{ marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600, color: '#111827' }}>{normalizeText(prj.name)}</span>
                  {normalizeText(prj.duration) && (
                    <span style={{ fontSize: '9pt', color: '#9ca3af', marginLeft: '8px' }}>{prj.duration}</span>
                  )}
                  {normalizeText(htmlToPlainText(prj.description)) && (
                    <p style={{ color: '#374151', marginTop: '2px' }}>{htmlToPlainText(prj.description)}</p>
                  )}
                  {prj.technologies && prj.technologies.length > 0 && (
                    <p style={{ color: '#6b7280', fontSize: '9pt', marginTop: '2px' }}>
                      {l.technology}: {prj.technologies.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {data.certificates && data.certificates.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <h2 style={sectionHeaderStyle}>{l.certificates}</h2>
              <ul style={{ margin: 0, paddingLeft: '18px', color: '#374151' }}>
                {data.certificates.map((cert, i) => (
                  <li key={i} style={{ marginBottom: '2px' }}>
                    {typeof cert === 'string'
                      ? cert
                      : [
                          normalizeText((cert as { name?: string }).name),
                          normalizeText((cert as { issuer?: string }).issuer),
                          normalizeText((cert as { issue_date?: string }).issue_date),
                        ]
                          .filter(Boolean)
                          .join(' — ')}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.languages && data.languages.length > 0 && (
            <div>
              <h2 style={sectionHeaderStyle}>{l.languages}</h2>
              <div style={{ display: 'flex', gap: '16px', color: '#374151' }}>
                {data.languages.map((lang, i) => (
                  <span key={i}>
                    {typeof lang === 'string' ? lang : (lang as { name?: string; proficiency?: string }).name ?? ''}
                    {typeof lang !== 'string' && (lang as { proficiency?: string }).proficiency
                      ? ` (${(lang as { proficiency?: string }).proficiency})`
                      : ''}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
