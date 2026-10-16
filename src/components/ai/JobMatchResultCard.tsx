import type { JobMatchResponse } from '@/services/ai.service';
import { CheckCircle, XCircle, Sparkles, TrendingUp } from 'lucide-react';

function getQuickInsight(result: JobMatchResponse): string {
  if (result.aiFeedback && result.aiFeedback.trim()) {
    return result.aiFeedback;
  }

  if (result.skillMatchScore >= 80 && result.aiSemanticScore < 50) {
    return 'CV khớp nhiều kỹ năng từ khóa, nhưng phần mô tả kinh nghiệm và ngữ cảnh công việc chưa đủ rõ nên AI đánh giá thấp.';
  }

  if (result.missingSkills.length > 0) {
    return `Bạn còn thiếu một số kỹ năng quan trọng: ${result.missingSkills.slice(0, 3).join(', ')}${result.missingSkills.length > 3 ? '...' : ''}.`;
  }

  if (result.aiSemanticScore < 60) {
    return 'Nên làm rõ thành tựu, phạm vi công việc và kết quả đo lường để tăng điểm AI phân tích.';
  }

  return 'Hồ sơ tương đối phù hợp, bạn có thể tối ưu thêm phần mô tả thành tựu để tăng độ thuyết phục.';
}

function getDifferenceHint(result: JobMatchResponse): string | null {
  const gap = result.ruleBasedScore - result.aiSemanticScore;
  if (gap >= 30) {
    return `Điểm AI thấp hơn Tổng hợp ${gap} điểm: hồ sơ có thể khớp kỹ năng nhưng chưa thể hiện rõ mức độ phù hợp theo ngữ cảnh công việc.`;
  }
  return null;
}

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  let color = '#ef4444';
  if (score >= 80) color = '#22c55e';
  else if (score >= 60) color = '#3b82f6';
  else if (score >= 40) color = '#f59e0b';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e5e7eb" strokeWidth="6" fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth="6" fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold" style={{ color }}>{score}</span>
      </div>
    </div>
  );
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  let barColor = 'bg-red-500';
  if (score >= 80) barColor = 'bg-green-500';
  else if (score >= 60) barColor = 'bg-blue-500';
  else if (score >= 40) barColor = 'bg-yellow-500';

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-800">{score}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div className={`${barColor} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${Math.min(score, 100)}%` }} />
      </div>
    </div>
  );
}

export function JobMatchResultCard({ result, compact }: { result: JobMatchResponse; compact?: boolean }) {
  const quickInsight = getQuickInsight(result);
  const differenceHint = getDifferenceHint(result);

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <ScoreRing score={result.overallScore} size={56} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800">Mức độ phù hợp</p>
            <p className="text-xs text-gray-500 truncate">{result.jobTitle}</p>
          </div>
        </div>
        <div className="space-y-1.5">
          <ScoreBar score={result.skillMatchScore} label="Kỹ năng" />
          <ScoreBar score={result.ruleBasedScore} label="Tổng hợp" />
          <ScoreBar score={result.aiSemanticScore} label="AI phân tích" />
        </div>

        <div className="rounded-md border border-blue-200 bg-blue-50 p-2.5">
          <p className="text-[11px] font-semibold text-blue-900">Nhận xét nhanh</p>
          <p className="mt-1 text-xs text-blue-800 leading-relaxed">{quickInsight}</p>
          {differenceHint ? (
            <p className="mt-1.5 text-[11px] text-blue-700">{differenceHint}</p>
          ) : null}
          {result.missingSkills.length > 0 ? (
            <p className="mt-1.5 text-[11px] text-blue-700">
              Thiếu kỹ năng: {result.missingSkills.slice(0, 3).join(', ')}{result.missingSkills.length > 3 ? '...' : ''}
            </p>
          ) : null}
        </div>

        {result.recommendations.length > 0 ? (
          <div className="rounded-md border border-gray-200 bg-white p-2.5">
            <p className="text-[11px] font-semibold text-gray-800">Gợi ý ưu tiên</p>
            <ul className="mt-1 space-y-1">
              {result.recommendations.slice(0, 2).map((r, i) => (
                <li key={i} className="text-xs text-gray-600">{i + 1}. {r}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <ScoreRing score={result.overallScore} />
        <div>
          <p className="font-bold text-lg text-gray-900">Điểm phù hợp tổng thể</p>
          <p className="text-sm text-gray-500">{result.jobTitle} — {result.companyName}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ScoreBar score={result.skillMatchScore} label="Kỹ năng" />
        <ScoreBar score={result.experienceMatchScore} label="Kinh nghiệm" />
        <ScoreBar score={result.educationMatchScore} label="Học vấn" />
        <ScoreBar score={result.aiSemanticScore} label="AI phân tích" />
      </div>

      {result.aiFeedback && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800 flex items-start gap-2">
            <Sparkles className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{result.aiFeedback}</span>
          </p>
        </div>
      )}

      {(result.matchedSkills.length > 0 || result.missingSkills.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {result.matchedSkills.length > 0 && (
            <div>
              <p className="text-xs font-medium text-green-700 mb-1.5 flex items-center gap-1">
                <CheckCircle className="h-3.5 w-3.5" /> Kỹ năng khớp
              </p>
              <div className="flex flex-wrap gap-1">
                {result.matchedSkills.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">{s}</span>
                ))}
              </div>
            </div>
          )}
          {result.missingSkills.length > 0 && (
            <div>
              <p className="text-xs font-medium text-red-700 mb-1.5 flex items-center gap-1">
                <XCircle className="h-3.5 w-3.5" /> Kỹ năng còn thiếu
              </p>
              <div className="flex flex-wrap gap-1">
                {result.missingSkills.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {result.recommendations.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" /> Gợi ý cải thiện
          </p>
          <ul className="text-xs text-gray-600 space-y-1">
            {result.recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-600 mt-0.5">{i + 1}</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
