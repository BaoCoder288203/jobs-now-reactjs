import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAppSelector } from '@/app/hooks';
import { useImproveCVFromText, useImproveCVFromFile } from '@/modules/cv/hooks';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import type { ImproveCVResponse, SectionFeedback } from '@/services/ai.service';
import { Upload, FileText, Sparkles, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

type InputMode = 'text' | 'file';
type AnalysisLanguage = 'auto' | 'vi' | 'en';

function getScoreColor(score: number) {
  if (score >= 80) return { text: 'text-emerald-600', bg: 'bg-emerald-500', light: 'bg-emerald-50 border-emerald-200 text-emerald-700', gradient: 'from-emerald-400 to-emerald-600' };
  if (score >= 60) return { text: 'text-sky-600', bg: 'bg-sky-500', light: 'bg-sky-50 border-sky-200 text-sky-700', gradient: 'from-sky-400 to-sky-600' };
  if (score >= 40) return { text: 'text-amber-600', bg: 'bg-amber-500', light: 'bg-amber-50 border-amber-200 text-amber-700', gradient: 'from-amber-400 to-amber-600' };
  return { text: 'text-rose-600', bg: 'bg-rose-500', light: 'bg-rose-50 border-rose-200 text-rose-700', gradient: 'from-rose-400 to-rose-600' };
}

function getScoreLabel(score: number) {
  if (score >= 80) return 'Xuất sắc';
  if (score >= 60) return 'Khá';
  if (score >= 40) return 'Trung bình';
  return 'Cần cải thiện';
}

function RadialScore({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const colors = getScoreColor(score);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={radius} fill="none"
          strokeWidth="10" strokeLinecap="round"
          stroke="url(#scoreGradient)"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" className={colors.text} style={{ stopColor: 'currentColor' }} />
            <stop offset="100%" className={colors.text} style={{ stopColor: 'currentColor', stopOpacity: 0.6 }} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-bold ${colors.text}`}>{score}</span>
        <span className="text-xs text-gray-400 font-medium">/100</span>
      </div>
    </div>
  );
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  const colors = getScoreColor(score);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-700 font-medium">{label}</span>
        <span className={`text-sm font-semibold ${colors.text}`}>{score}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colors.gradient}`}
          style={{ width: `${score}%`, transition: 'width 0.8s ease-out' }}
        />
      </div>
    </div>
  );
}

function SectionCard({ section }: { section: SectionFeedback }) {
  const [expanded, setExpanded] = useState(false);
  const colors = getScoreColor(section.score);

  return (
    <div className={`rounded-xl border transition-all duration-200 ${expanded ? 'border-gray-300 shadow-md' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}>
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl border flex items-center justify-center font-bold text-sm ${colors.light}`}>
            {section.score}
          </div>
          <div className="text-left">
            <span className="font-semibold text-gray-800 text-sm">{section.section}</span>
            <p className={`text-xs font-medium mt-0.5 ${colors.text}`}>{getScoreLabel(section.score)}</p>
          </div>
        </div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${expanded ? 'bg-gray-100' : 'bg-gray-50'}`}>
          {expanded ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
        </div>
      </button>
      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
          {section.issues && section.issues.length > 0 && (
            <div className="bg-rose-50/60 rounded-lg p-4">
              <p className="text-sm font-semibold text-rose-700 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" /> Vấn đề cần sửa
              </p>
              <ul className="space-y-1.5">
                {section.issues.map((issue, i) => (
                  <li key={i} className="text-sm text-rose-800/80 flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-rose-400 mt-2 shrink-0" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {section.suggestions && section.suggestions.length > 0 && (
            <div className="bg-emerald-50/60 rounded-lg p-4">
              <p className="text-sm font-semibold text-emerald-700 mb-2 flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" /> Gợi ý cải thiện
              </p>
              <ul className="space-y-1.5">
                {section.suggestions.map((s, i) => (
                  <li key={i} className="text-sm text-emerald-800/80 flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-emerald-400 mt-2 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ResultView({ result, onReset }: { result: ImproveCVResponse; onReset: () => void }) {
  const overallColors = getScoreColor(result.overallScore);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* CỘT TRÁI: Đánh giá tổng quan, Tóm tắt, Kỹ năng */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card Điểm tổng quan */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="flex flex-col items-center text-center gap-5">
              <RadialScore score={result.overallScore} />
              <div>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Sparkles className={`h-5 w-5 ${overallColors.text}`} />
                  <h3 className="text-xl font-bold text-gray-900">Đánh giá chung từ AI</h3>
                </div>
                <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border mb-4 ${overallColors.light}`}>
                  {getScoreLabel(result.overallScore)}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
                  {result.overviewFeedback}
                </p>
              </div>
            </div>
          </div>

          {/* Tóm tắt CV (nếu có) */}
          {result.improvedSummary && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-500" />
                  Tóm tắt hồ sơ (AI gợi ý)
                </h3>
              </div>
              <div className="p-5">
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap italic">
                    "{result.improvedSummary}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Kỹ năng trích xuất */}
          {result.extractedSkills && result.extractedSkills.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  Kỹ năng đã trích xuất ({result.extractedSkills.length})
                </h3>
              </div>
              <div className="p-5">
                <div className="flex flex-wrap gap-2">
                  {result.extractedSkills.map((skill, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">
                      <CheckCircle className="h-3 w-3" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Từ khóa còn thiếu */}
          {result.missingKeywords && result.missingKeywords.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Từ khóa còn thiếu ({result.missingKeywords.length})
                </h3>
              </div>
              <div className="p-5">
                <div className="flex flex-wrap gap-2">
                  {result.missingKeywords.map((kw, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold">
                      <AlertTriangle className="h-3 w-3" />
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* CỘT PHẢI: Phân tích chi tiết và Hành động ưu tiên */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Phân tích từng phần */}
          {result.sections && result.sections.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col">
              <div className="px-6 py-5 border-b border-gray-100 flex-shrink-0">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-gradient-to-b from-sky-500 to-sky-300 rounded-full" />
                  Phân tích chi tiết từng phần
                </h3>
              </div>
              <div className="p-6 flex-1">
                {/* Lưới điểm nhanh */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  {result.sections.map((sec, i) => {
                    const c = getScoreColor(sec.score);
                    return (
                      <div key={i} className={`rounded-xl border p-3 text-center transition-colors ${c.light}`}>
                        <p className="text-2xl font-bold">{sec.score}</p>
                        <p className="text-xs font-medium mt-0.5 opacity-80 truncate">{sec.section}</p>
                      </div>
                    );
                  })}
                </div>
                
                {/* Lưới thanh tiến trình (2 cột layout nhỏ) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-8 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                  {result.sections.map((sec, i) => (
                    <ScoreBar key={i} score={sec.score} label={sec.section} />
                  ))}
                </div>

                {/* Các thẻ mở rộng phân tích chi tiết */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 ml-1">Nhận xét chuyên sâu:</h4>
                  {result.sections.map((sec, i) => (
                    <SectionCard key={i} section={sec} />
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* CỘT FULL DƯỚI CÙNG (nếu muốn, hoặc ta đẩy actionItems xuống đây để cân xứng layout, nhưng thường thẻ ActionItems rất nhạy bén nên cho vào lưới) */}
        {result.actionItems && result.actionItems.length > 0 && (
          <div className="lg:col-span-12">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-gradient-to-b from-violet-500 to-violet-300 rounded-full" />
                  Kế hoạch hành động ưu tiên ({result.actionItems.length})
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.actionItems.map((item, i) => {
                    const priorityColors = ['bg-rose-500', 'bg-amber-500', 'bg-sky-500', 'bg-emerald-500', 'bg-violet-500'];
                    return (
                      <div key={i} className="flex items-start gap-4 p-5 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100/80 transition-colors">
                        <span className={`flex-shrink-0 w-8 h-8 ${priorityColors[i % priorityColors.length]} text-white rounded-lg flex items-center justify-center text-sm font-bold shadow-md`}>
                          {i + 1}
                        </span>
                        <span className="text-sm text-gray-700 leading-relaxed font-medium">{item}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      <div className="flex justify-center gap-4 mt-10 mb-4">
        <Button variant="outline" onClick={onReset} className="gap-2 px-8 h-12 text-sm">
          Phân tích CV khác
        </Button>
        <Button asChild className="gap-2 px-8 h-12 text-sm shadow-md">
          <Link to="/tools/tao-cv/builder">
            <Sparkles className="h-4 w-4" /> Tạo CV mới theo chuẩn AI
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function CVImprovePage() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { openLoginModal } = useAuthModal();
  const [mode, setMode] = useState<InputMode>('file');
  const [cvText, setCvText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisLanguage, setAnalysisLanguage] = useState<AnalysisLanguage>('auto');
  const [result, setResult] = useState<ImproveCVResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const textMutation = useImproveCVFromText();
  const fileMutation = useImproveCVFromFile();
  const isLoading = textMutation.isPending || fileMutation.isPending;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx'].includes(ext ?? '')) {
      toast.error('Chỉ chấp nhận file PDF hoặc DOCX');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Kích thước file tối đa 10MB');
      return;
    }
    setSelectedFile(file);
  };

  const handleAnalyze = async () => {
    if (!isAuthenticated) {
      openLoginModal('job_seeker');
      return;
    }
    try {
      let data: ImproveCVResponse;
      if (mode === 'file' && selectedFile) {
        data = await fileMutation.mutateAsync({ file: selectedFile, language: analysisLanguage });
      } else if (mode === 'text' && cvText.trim()) {
        data = await textMutation.mutateAsync({ cvText: cvText.trim(), language: analysisLanguage });
      } else {
        toast.error(mode === 'file' ? 'Vui lòng chọn file CV' : 'Vui lòng nhập nội dung CV');
        return;
      }
      setResult(data);
    } catch {
      toast.error('Phân tích thất bại. Vui lòng thử lại.');
    }
  };

  const handleReset = () => {
    setResult(null);
    setCvText('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-24 min-h-[60vh]">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 text-lg">AI đang phân tích CV của bạn...</p>
          <p className="mt-1 text-gray-400 text-sm">Quá trình này có thể mất 10-30 giây</p>
        </div>
      </AppLayout>
    );
  }

  if (result) {
    return (
      <AppLayout>
        <div className="bg-gray-50 min-h-screen py-8">
          <div className="container mx-auto px-4">
            <div className="mb-6">
              <Link to="/tools/chuan-hoa-cv" className="text-primary hover:underline font-medium text-sm">
                ← Quay lại
              </Link>
            </div>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-primary text-sm font-medium">AI Analysis Complete</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Kết quả phân tích CV</h1>
            </div>
            <ResultView result={result} onReset={handleReset} />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Link to="/tools/chuan-hoa-cv" className="text-primary hover:underline font-medium text-sm">
              ← Quay lại
            </Link>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full mb-4">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-primary text-sm font-medium">Powered by AI</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Cải thiện CV của bạn</h1>
              <p className="text-gray-600">AI sẽ phân tích CV và đưa ra đánh giá chi tiết cùng gợi ý cải thiện</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setMode('file')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${
                    mode === 'file' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Upload className="h-4 w-4" /> Tải file CV
                </button>
                <button
                  onClick={() => setMode('text')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${
                    mode === 'text' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <FileText className="h-4 w-4" /> Dán nội dung
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Ngôn ngữ nhận xét</label>
                <select
                  value={analysisLanguage}
                  onChange={(e) => setAnalysisLanguage(e.target.value as AnalysisLanguage)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                >
                  <option value="auto">Tự động theo CV</option>
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              </div>

              {mode === 'file' ? (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                  {selectedFile ? (
                    <div>
                      <p className="font-medium text-gray-800">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500 mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-600 font-medium">Kéo thả hoặc click để chọn file</p>
                      <p className="text-sm text-gray-400 mt-1">Hỗ trợ PDF, DOCX (tối đa 10MB)</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <textarea
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg min-h-[250px] resize-y focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="Dán toàn bộ nội dung CV của bạn vào đây..."
                />
              )}

              <Button
                onClick={handleAnalyze}
                className="w-full py-3 text-base"
                disabled={isLoading || (mode === 'file' ? !selectedFile : !cvText.trim())}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Phân tích CV
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
