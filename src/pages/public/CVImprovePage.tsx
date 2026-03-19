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

function ScoreBadge({ score }: { score: number }) {
  let color = 'bg-red-100 text-red-700';
  if (score >= 80) color = 'bg-green-100 text-green-700';
  else if (score >= 60) color = 'bg-blue-100 text-blue-700';
  else if (score >= 40) color = 'bg-yellow-100 text-yellow-700';

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${color}`}>
      {score}/100
    </span>
  );
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  let barColor = 'bg-red-500';
  if (score >= 80) barColor = 'bg-green-500';
  else if (score >= 60) barColor = 'bg-blue-500';
  else if (score >= 40) barColor = 'bg-yellow-500';

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-700 font-medium">{label}</span>
        <span className="text-gray-500">{score}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`${barColor} h-2 rounded-full transition-all duration-500`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function SectionCard({ section }: { section: SectionFeedback }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ScoreBadge score={section.score} />
          <span className="font-semibold text-gray-800">{section.section}</span>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
      </button>
      {expanded && (
        <div className="mt-4 space-y-3">
          {section.issues && section.issues.length > 0 && (
            <div>
              <p className="text-sm font-medium text-red-600 mb-1 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" /> Vấn đề cần sửa
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                {section.issues.map((issue, i) => <li key={i} className="pl-4">• {issue}</li>)}
              </ul>
            </div>
          )}
          {section.suggestions && section.suggestions.length > 0 && (
            <div>
              <p className="text-sm font-medium text-green-600 mb-1 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" /> Gợi ý cải thiện
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                {section.suggestions.map((s, i) => <li key={i} className="pl-4">• {s}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ResultView({ result, onReset }: { result: ImproveCVResponse; onReset: () => void }) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
        <p className="text-sm text-gray-500 mb-2">Điểm tổng quan</p>
        <div className="text-5xl font-bold text-primary mb-2">{result.overallScore}</div>
        <p className="text-gray-600">{result.overviewFeedback}</p>
      </div>

      {result.sections && result.sections.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="text-lg font-bold text-gray-800">Phân tích từng phần</h3>
          <div className="space-y-2">
            {result.sections.map((sec, i) => (
              <ScoreBar key={i} score={sec.score} label={sec.section} />
            ))}
          </div>
          <div className="space-y-2 mt-4">
            {result.sections.map((sec, i) => (
              <SectionCard key={i} section={sec} />
            ))}
          </div>
        </div>
      )}

      {result.improvedSummary && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">Tóm tắt cải thiện</h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{result.improvedSummary}</p>
        </div>
      )}

      {result.extractedSkills && result.extractedSkills.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">Kỹ năng trích xuất</h3>
          <div className="flex flex-wrap gap-2">
            {result.extractedSkills.map((skill, i) => (
              <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">{skill}</span>
            ))}
          </div>
        </div>
      )}

      {result.missingKeywords && result.missingKeywords.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">Từ khóa còn thiếu</h3>
          <div className="flex flex-wrap gap-2">
            {result.missingKeywords.map((kw, i) => (
              <span key={i} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">{kw}</span>
            ))}
          </div>
        </div>
      )}

      {result.actionItems && result.actionItems.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">Hành động ưu tiên</h3>
          <ol className="space-y-2">
            {result.actionItems.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="flex justify-center gap-3">
        <Button variant="outline" onClick={onReset}>Phân tích CV khác</Button>
        <Button asChild><Link to="/tools/tao-cv/builder">Tạo CV mới</Link></Button>
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
            <h1 className="text-2xl md:text-3xl font-bold text-center mb-8">Kết quả phân tích CV</h1>
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
