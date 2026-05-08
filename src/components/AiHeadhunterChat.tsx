import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Search, Loader2, RefreshCw, Users, FileText, ChevronDown, Briefcase } from 'lucide-react';
import { ragService } from '@/services/rag.service';
import type { CandidateMatch } from '@/services/rag.service';
import { toast } from 'sonner';
import { useJobs } from '@/modules/jobs/hooks';
import { useMyCompany } from '@/modules/companies/hooks';
import { useAppSelector } from '@/app/hooks';
import * as resumeService from '@/services/resume.service';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  candidates?: CandidateMatch[];
  timestamp: Date;
}

const SUGGESTION_QUERIES = [
  'Tìm ứng viên có kỹ năng ReactJS và NodeJS',
  'Ứng viên nào có tiếng Anh tốt và giao tiếp giỏi?',
  'Ai có kinh nghiệm làm việc với AWS / Docker?',
];

interface AiHeadhunterChatProps {
  isOpen: boolean;
  onClose: () => void;
  defaultJobId?: number;
}

export default function AiHeadhunterChat({ isOpen, onClose, defaultJobId }: AiHeadhunterChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | undefined>(defaultJobId);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (defaultJobId !== undefined) {
      setSelectedJobId(defaultJobId);
    }
  }, [defaultJobId, isOpen]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user } = useAppSelector((state) => state.auth);
  const { data: myCompany } = useMyCompany();
  // Fetch jobs for this company
  const { data: jobsData } = useJobs({ company_id: myCompany?.id }, { enabled: !!myCompany?.id });
  const myJobs = jobsData?.items || [];

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (queryText?: string) => {
    const query = queryText || input.trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await ragService.searchCandidates({ 
        query, 
        topK: 5,
        jobId: selectedJobId 
      });
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer,
        candidates: response.candidates,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Xin lỗi, đã có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại sau.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIndex = async () => {
    setIsIndexing(true);
    try {
      await ragService.indexAllProfiles();
      toast.success('Đã đồng bộ dữ liệu ứng viên thành công!');
    } catch {
      toast.error('Lỗi khi đồng bộ dữ liệu. Vui lòng thử lại.');
    } finally {
      setIsIndexing(false);
    }
  };

  const handleOpenResume = async (profileId: number) => {
    try {
      const resumes = await resumeService.getResumesByProfileId(profileId);
      if (!resumes || resumes.length === 0) {
        toast.error('Ứng viên chưa có CV nào.');
        return;
      }
      const primary = resumes.find((r) => r.is_default) ?? resumes[0];
      const resumeUrl = primary?.resumeUrl ?? primary?.file_url;
      if (resumeUrl && resumeUrl.trim()) {
        // PDF CV — open directly
        window.open(resumeUrl, '_blank', 'noopener,noreferrer');
      } else {
        // Manual CV — open preview page
        const rId = primary?.resumeId ?? primary?.id;
        window.open(`/cv/${profileId}?resumeId=${rId}`, '_blank', 'noopener,noreferrer');
      }
    } catch {
      toast.error('Không thể mở CV.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderCandidateCard = (candidate: CandidateMatch, index: number) => (
    <div
      key={candidate.profileId}
      className="bg-white border border-slate-200 rounded-lg p-3 mt-3 shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm shrink-0 overflow-hidden border border-slate-200">
          {candidate.avatarUrl ? (
            <img src={candidate.avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            candidate.fullName?.charAt(0)?.toUpperCase() || 'U'
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-slate-800 truncate">
            {candidate.fullName}
          </div>
          <div className="text-xs text-slate-500 truncate">{candidate.title || candidate.email}</div>
        </div>
        {candidate.relevanceScore > 0 && (
          <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
            {(candidate.relevanceScore * 100).toFixed(0)}%
          </div>
        )}
      </div>

      {candidate.skills && candidate.skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {candidate.skills.slice(0, 5).map((skill, i) => (
            <span key={i} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-medium">
              {skill}
            </span>
          ))}
          {candidate.skills.length > 5 && (
            <span className="text-[10px] text-slate-400">+{candidate.skills.length - 5}</span>
          )}
        </div>
      )}

      {candidate.matchReason && (
        <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded border-l-2 border-blue-500 mb-2">
          {candidate.matchReason}
        </div>
      )}

      <button
        type="button"
        onClick={() => handleOpenResume(candidate.profileId)}
        className="inline-flex items-center text-xs text-sky-600 font-medium hover:text-sky-800 transition-colors"
      >
        <FileText size={12} className="mr-1" />
        Xem CV
      </button>
    </div>
  );

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-32 right-6 w-[400px] h-[500px] max-h-[75vh] rounded-xl bg-white shadow-2xl flex flex-col overflow-hidden z-50 border border-slate-200">
          {/* Header */}
          <div className="bg-sky-400 px-4 py-3 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-sky-500 p-1.5 rounded-lg">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">AI Applicant Screening</div>
                  <div className="text-sky-50 text-xs">Lọc hồ sơ bằng ngôn ngữ tự nhiên</div>
                </div>
              </div>
              <div className="flex gap-2">
                {user?.role === 'ROLE_ADMIN' && (
                  <button
                    onClick={handleIndex}
                    disabled={isIndexing}
                    className="text-sky-100 hover:text-white p-1 rounded transition-colors disabled:opacity-50"
                    title="Đồng bộ dữ liệu ứng viên mới nhất"
                  >
                    <RefreshCw size={16} className={isIndexing ? 'animate-spin' : ''} />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-sky-100 hover:text-white p-1 rounded transition-colors"
                >
                  <ChevronDown size={20} />
                </button>
              </div>
            </div>
            
            {/* Job Filter Dropdown */}
            {user?.role !== 'ROLE_ADMIN' && (
              <div className="relative" ref={dropdownRef}>
                <div 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="bg-sky-500 hover:bg-sky-600 transition-colors rounded-md border border-sky-400 flex items-center px-3 py-2 cursor-pointer"
                >
                  <Briefcase size={14} className="text-sky-100 mr-2 shrink-0" />
                  <div className="flex-1 text-white text-xs font-medium truncate">
                    {selectedJobId 
                      ? myJobs.find(j => j.id === String(selectedJobId))?.title || 'Đang tải...' 
                      : '🌐 Toàn bộ ứng viên hệ thống'}
                  </div>
                  <ChevronDown size={14} className={`text-sky-100 ml-2 shrink-0 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                {isDropdownOpen && (
                  <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-md shadow-xl border border-slate-200 z-[60] max-h-60 overflow-y-auto py-1">
                    <div 
                      onClick={() => { setSelectedJobId(undefined); setIsDropdownOpen(false); }}
                      className={`px-3 py-2.5 text-xs cursor-pointer hover:bg-sky-50 transition-colors ${!selectedJobId ? 'bg-sky-50 text-sky-700 font-semibold' : 'text-slate-700'}`}
                    >
                      🌐 Toàn bộ ứng viên hệ thống
                    </div>
                    {myJobs.length > 0 && (
                      <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-y border-slate-100">
                        Ứng viên theo Job
                      </div>
                    )}
                    {myJobs.map(job => (
                      <div 
                        key={job.id} 
                        onClick={() => { setSelectedJobId(Number(job.id)); setIsDropdownOpen(false); }}
                        className={`px-3 py-2 text-xs cursor-pointer hover:bg-sky-50 transition-colors truncate ${selectedJobId === Number(job.id) ? 'bg-sky-50 text-sky-700 font-semibold' : 'text-slate-700'}`}
                        title={job.title}
                      >
                        {job.title}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-4">
            {messages.length === 0 && (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                  <Users size={24} className="text-blue-600" />
                </div>
                <div className="font-semibold text-slate-800 text-sm mb-1">
                  Trợ lý lọc hồ sơ AI
                </div>
                <div className="text-xs text-slate-500 mb-5 px-4 leading-relaxed">
                  {selectedJobId 
                    ? "Hãy mô tả yêu cầu để tôi tìm những ứng viên phù hợp nhất đã ứng tuyển vào job này." 
                    : "Bạn đang tìm kiếm toàn bộ ứng viên trên nền tảng. Hãy nhập tiêu chí tìm kiếm của bạn."}
                </div>
                <div className="flex flex-col gap-2">
                  {SUGGESTION_QUERIES.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(q)}
                      className="bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-600 text-left hover:border-blue-400 hover:text-blue-600 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-sky-400' : 'bg-sky-500'}`}>
                  {msg.role === 'user' ? <span className="text-white text-xs font-bold">U</span> : <Bot size={14} className="text-white" />}
                </div>
                <div className="max-w-[85%]">
                  <div
                    className={`px-3 py-2 text-sm whitespace-pre-wrap word-break shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-sky-400 text-white rounded-l-lg rounded-br-lg' 
                        : 'bg-white text-slate-700 rounded-r-lg rounded-bl-lg border border-slate-200'
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.candidates && msg.candidates.length > 0 && (
                    <div className="mt-2">
                      {msg.candidates.map((c, i) => renderCandidateCard(c, i))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 items-start">
                <div className="w-7 h-7 rounded-full bg-sky-500 flex items-center justify-center shrink-0">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="bg-white border border-slate-200 px-4 py-3 rounded-r-lg rounded-bl-lg shadow-sm flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-sky-500" />
                  <span className="text-xs text-slate-500">Đang quét hồ sơ...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-200">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập yêu cầu để lọc hồ sơ..."
                disabled={isLoading}
                className="flex-1 bg-transparent border-none outline-none px-2 py-1.5 text-sm text-slate-800 placeholder-slate-400"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                  input.trim() && !isLoading 
                    ? 'bg-sky-400 text-white hover:bg-sky-500' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
