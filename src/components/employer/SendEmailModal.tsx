import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TiptapEditor } from '@/components/ui/TiptapEditor';
import { Input } from '@/components/ui/input';
import { Mail, Send, Type } from 'lucide-react';

interface SendEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (subject: string, html: string) => Promise<void>;
  isSubmitting?: boolean;
}

const DEFAULT_CONTENT = `
<p>Thân gửi <strong>[Tên Ứng Viên]</strong>,</p>
<p>Cảm ơn bạn đã quan tâm và ứng tuyển vào vị trí <strong>[Tên Công Việc]</strong> tại <strong>[Tên Công Ty]</strong>.</p>
<p>Chúng tôi đã nhận được hồ sơ của bạn và...</p>
<p>Chúc bạn một ngày tốt lành,</p>
<p>Bộ phận Tuyển dụng <strong>[Tên Công Ty]</strong></p>
`;

export function SendEmailModal({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting,
}: SendEmailModalProps) {
  const [subject, setSubject] = useState('');
  const [htmlContent, setHtmlContent] = useState(DEFAULT_CONTENT);

  const handleSubmit = async () => {
    if (!subject.trim()) {
      alert('Vui lòng nhập tiêu đề email');
      return;
    }
    await onConfirm(subject, htmlContent);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0 border-t-4 border-t-sky-500"
        onClose={() => onOpenChange(false)}
      >
        <div className="sticky top-0 z-10 bg-white px-6 py-5 border-b border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-sky-50 text-sky-500">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Gửi email cho ứng viên</h2>
              <p className="text-gray-500 text-sm mt-0.5">
                Các từ khoá <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700">[Tên Ứng Viên]</code>, <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700">[Tên Công Việc]</code>, <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700">[Tên Công Ty]</code> sẽ tự động được thay bằng thông tin thực.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-6">
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
              <Type className="w-4 h-4 text-gray-500" />
              Tiêu đề email <span className="text-red-500">*</span>
            </label>
            <Input 
              placeholder="VD: JobsNow - Thông báo kết quả phỏng vấn"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-gray-50/50 border-gray-200 focus-visible:ring-blue-500 text-base py-5"
            />
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
              <Mail className="w-4 h-4 text-gray-500" />
              Nội dung email <span className="text-red-500">*</span>
            </label>
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <TiptapEditor
                value={htmlContent}
                onChange={setHtmlContent}
                placeholder="Soạn nội dung email..."
                minHeight="250px"
              />
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 z-10 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-lg flex items-center justify-between">
          <p className="text-xs text-gray-500 hidden sm:block">
            Email sẽ được gửi qua hệ thống JobsNow
          </p>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none border-gray-200 hover:bg-gray-100"
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !subject.trim() || !htmlContent.trim()}
              className="flex-1 sm:flex-none gap-2 bg-sky-500 text-white hover:bg-sky-600 shadow-sm"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Đang gửi...' : 'Xác nhận & Gửi'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
