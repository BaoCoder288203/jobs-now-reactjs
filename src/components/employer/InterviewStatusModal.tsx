import { useEffect, useState, useMemo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TiptapEditor } from '@/components/ui/TiptapEditor';
import {
  CalendarDays,
  Clock,
  MapPin,
  Video,
  Building2,
  UserCircle,
  FileText,
  Send,
  Sparkles,
} from 'lucide-react';

type InterviewMode = 'onsite' | 'online';

interface InterviewFormData {
  date: string;
  time: string;
  mode: InterviewMode;
  location: string;
  meetingLink: string;
  interviewer: string;
  note: string;
}

interface InterviewStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (html: string) => Promise<void>;
  isSubmitting?: boolean;
}

const INITIAL_FORM: InterviewFormData = {
  date: '',
  time: '',
  mode: 'onsite',
  location: '',
  meetingLink: '',
  interviewer: '',
  note: '',
};

function buildEmailHtml(form: InterviewFormData): string {
  const dateStr = form.date
    ? new Date(form.date).toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';
  const timeStr = form.time || '';

  const modeLabel = form.mode === 'online' ? 'Phỏng vấn trực tuyến (Online)' : 'Phỏng vấn trực tiếp (Onsite)';

  let locationBlock = '';
  if (form.mode === 'onsite' && form.location) {
    locationBlock = `<p>📍 <strong>Địa điểm:</strong> ${form.location}</p>`;
  }
  if (form.mode === 'online' && form.meetingLink) {
    locationBlock = `<p>🔗 <strong>Link họp:</strong> <a href="${form.meetingLink}" target="_blank" rel="noopener noreferrer">${form.meetingLink}</a></p>`;
  }

  const interviewerBlock = form.interviewer
    ? `<p>👤 <strong>Người phỏng vấn:</strong> ${form.interviewer}</p>`
    : '';

  const noteBlock = form.note
    ? `<p>📝 <strong>Lưu ý:</strong> ${form.note}</p>`
    : '';

  return `
<p>Kính gửi <strong>{{name}}</strong>,</p>
<p>Chúng tôi xin trân trọng thông báo rằng bạn đã được mời tham gia buổi phỏng vấn cho vị trí <strong>{{jobTitle}}</strong> tại <strong>{{companyName}}</strong>.</p>
<hr/>
<p>📅 <strong>Ngày:</strong> ${dateStr}</p>
<p>⏰ <strong>Giờ:</strong> ${timeStr}</p>
<p>🎯 <strong>Hình thức:</strong> ${modeLabel}</p>
${locationBlock}
${interviewerBlock}
${noteBlock}
<hr/>
<p>Vui lòng xác nhận tham dự bằng cách phản hồi email này. Nếu cần thay đổi lịch, xin hãy liên hệ chúng tôi trước ít nhất 24 giờ.</p>
<p>Chúc bạn buổi phỏng vấn thành công!</p>
<p>Trân trọng,<br/><strong>{{companyName}}</strong></p>
  `.trim();
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 text-blue-600">
        <Icon className="w-4 h-4" />
      </div>
      <h3 className="text-sm font-semibold text-gray-800 tracking-wide uppercase">{title}</h3>
    </div>
  );
}

export function InterviewStatusModal({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting,
}: InterviewStatusModalProps) {
  const [form, setForm] = useState<InterviewFormData>(INITIAL_FORM);
  const [showEditor, setShowEditor] = useState(false);
  const [customHtml, setCustomHtml] = useState('');

  useEffect(() => {
    if (open) {
      setForm(INITIAL_FORM);
      setShowEditor(false);
      setCustomHtml('');
    }
  }, [open]);

  const generatedHtml = useMemo(() => buildEmailHtml(form), [form]);

  useEffect(() => {
    if (!showEditor) {
      setCustomHtml(generatedHtml);
    }
  }, [generatedHtml, showEditor]);

  const update = <K extends keyof InterviewFormData>(key: K, value: InterviewFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const canSubmit = form.date && form.time && (form.mode === 'onsite' ? !!form.location : !!form.meetingLink);

  const handleSubmit = async () => {
    const htmlToSend = showEditor ? customHtml : generatedHtml;
    const stripped = htmlToSend
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .trim();
    if (!stripped) return;
    await onConfirm(htmlToSend);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} containerClassName="max-w-3xl">
      <DialogContent
        className="max-w-3xl max-h-[92vh] overflow-y-auto p-0"
        onClose={() => onOpenChange(false)}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Mời phỏng vấn ứng viên</h2>
              <p className="text-blue-100 text-sm mt-0.5">
                Điền thông tin bên dưới — email sẽ được gửi tự động cho ứng viên
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-6">
          <section>
            <SectionHeader icon={CalendarDays} title="Lịch phỏng vấn" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Ngày */}
              <div className="space-y-1.5">
                <Label htmlFor="iv-date" className="flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                  Ngày phỏng vấn <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="iv-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => update('date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="bg-gray-50/50"
                />
              </div>

              {/* Giờ */}
              <div className="space-y-1.5">
                <Label htmlFor="iv-time" className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  Giờ phỏng vấn <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="iv-time"
                  type="time"
                  value={form.time}
                  onChange={(e) => update('time', e.target.value)}
                  className="bg-gray-50/50"
                />
              </div>
            </div>
          </section>

          <section>
            <SectionHeader icon={Building2} title="Hình thức phỏng vấn" />

            <div className="flex gap-3 mb-4">
              <button
                type="button"
                onClick={() => update('mode', 'onsite')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                  form.mode === 'onsite'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm shadow-blue-100'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <MapPin className="w-4 h-4" />
                Trực tiếp
              </button>
              <button
                type="button"
                onClick={() => update('mode', 'online')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                  form.mode === 'online'
                    ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm shadow-purple-100'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Video className="w-4 h-4" />
                Trực tuyến
              </button>
            </div>

            {/* Conditional field */}
            {form.mode === 'onsite' ? (
              <div className="space-y-1.5">
                <Label htmlFor="iv-location" className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  Địa điểm <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="iv-location"
                  placeholder="Ví dụ: Tầng 5, Tòa nhà ABC, 123 Nguyễn Huệ, Q1, TP.HCM"
                  value={form.location}
                  onChange={(e) => update('location', e.target.value)}
                  className="bg-gray-50/50"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="iv-link" className="flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-gray-400" />
                  Link cuộc họp <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="iv-link"
                  type="url"
                  placeholder="Ví dụ: https://meet.google.com/abc-defg-hij"
                  value={form.meetingLink}
                  onChange={(e) => update('meetingLink', e.target.value)}
                  className="bg-gray-50/50"
                />
              </div>
            )}
          </section>

          <section>
            <SectionHeader icon={UserCircle} title="Thông tin bổ sung" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="iv-interviewer" className="flex items-center gap-1.5">
                  <UserCircle className="w-3.5 h-3.5 text-gray-400" />
                  Người phỏng vấn
                </Label>
                <Input
                  id="iv-interviewer"
                  placeholder="Họ tên người phỏng vấn"
                  value={form.interviewer}
                  onChange={(e) => update('interviewer', e.target.value)}
                  className="bg-gray-50/50"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="iv-note" className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-gray-400" />
                  Lưu ý cho ứng viên
                </Label>
                <Input
                  id="iv-note"
                  placeholder="Ví dụ: Mang theo CCCD, bản cứng CV..."
                  value={form.note}
                  onChange={(e) => update('note', e.target.value)}
                  className="bg-gray-50/50"
                />
              </div>
            </div>
          </section>

          <div>
            <button
              type="button"
              onClick={() => {
                if (!showEditor) setCustomHtml(generatedHtml);
                setShowEditor((prev) => !prev);
              }}
              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              {showEditor ? 'Ẩn trình soạn thảo nâng cao' : 'Tùy chỉnh nội dung email'}
            </button>

            {showEditor && (
              <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <TiptapEditor
                  value={customHtml}
                  onChange={setCustomHtml}
                  minHeight="200px"
                  placeholder="Soạn nội dung email gửi ứng viên..."
                />
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-lg flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Email sẽ được gửi ngay sau khi xác nhận
          </p>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !canSubmit}
              className="gap-2 bg-blue-600 text-white hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Đang gửi...' : 'Xác nhận & Gửi email'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
