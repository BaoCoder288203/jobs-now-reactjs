import type { ExtractedCVData } from '@/types';

interface CVPreviewProps {
  data: ExtractedCVData;
  onDataChange?: (data: ExtractedCVData) => void;
}

export function CVPreview({ data }: CVPreviewProps) {
  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8 border">
      <h3 className="text-xl font-bold text-gray-900">{data.headline ?? 'CV'}</h3>
      <p className="text-gray-600 mt-2">{data.summary}</p>
      {data.work_experiences?.length ? (
        <div className="mt-6">
          <h4 className="font-semibold text-gray-900">Kinh nghiệm làm việc</h4>
          {data.work_experiences.map((we, i) => (
            <div key={i} className="mt-2 text-sm">
              <p className="font-medium">{we.position} tại {we.company}</p>
              <p className="text-gray-500">{we.start_date} - {we.end_date ?? 'Hiện tại'}</p>
              {we.description && <p className="text-gray-600 mt-1">{we.description}</p>}
            </div>
          ))}
        </div>
      ) : null}
      {data.educations?.length ? (
        <div className="mt-6">
          <h4 className="font-semibold text-gray-900">Học vấn</h4>
          {data.educations.map((ed, i) => (
            <div key={i} className="mt-2 text-sm">
              <p className="font-medium">{ed.school} - {ed.degree} {ed.major}</p>
              <p className="text-gray-500">{ed.start_date} - {ed.end_date}</p>
            </div>
          ))}
        </div>
      ) : null}
      {data.skills?.length ? (
        <div className="mt-6">
          <h4 className="font-semibold text-gray-900">Kỹ năng</h4>
          <div className="flex flex-wrap gap-2 mt-2">
            {data.skills.map((s, i) => (
              <span key={i} className="px-2 py-1 bg-gray-100 rounded text-sm">
                {s.name}{s.level ? ` (${s.level})` : ''}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
