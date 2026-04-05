import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TiptapEditor } from '@/components/ui/TiptapEditor';

const DEFAULT_INTERVIEW_HTML = `<p>Kính gửi {{name}},</p><p>Chúng tôi xin trân trọng mời bạn tham gia buổi phỏng vấn. Vui lòng bổ sung thời gian, địa điểm hoặc link họp trực tuyến bên dưới.</p><p>Trân trọng,</p>`;

interface InterviewStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (html: string) => Promise<void>;
  isSubmitting?: boolean;
}

export function InterviewStatusModal({ open, onOpenChange, onConfirm, isSubmitting }: InterviewStatusModalProps) {
  const [html, setHtml] = useState(DEFAULT_INTERVIEW_HTML);

  useEffect(() => {
    if (open) {
      setHtml(DEFAULT_INTERVIEW_HTML);
    }
  }, [open]);

  const handleSubmit = async () => {
    const stripped = html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').trim();
    if (!stripped) return;
    await onConfirm(html);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6" onClose={() => onOpenChange(false)}>
        <h2 className="text-lg font-semibold text-gray-900 pr-8">Thông tin phỏng vấn</h2>
        <p className="text-sm text-gray-500 pt-1 pb-3">
          Soạn nội dung gửi ứng viên qua email. Có thể dùng biến:{' '}
          <code className="text-xs bg-gray-100 px-1 rounded">{'{{name}}'}</code>,{' '}
          <code className="text-xs bg-gray-100 px-1 rounded">{'{{jobTitle}}'}</code>,{' '}
          <code className="text-xs bg-gray-100 px-1 rounded">{'{{companyName}}'}</code> — hệ thống sẽ thay bằng dữ liệu thật khi gửi mail.
        </p>
        <TiptapEditor value={html} onChange={setHtml} minHeight="200px" placeholder="Nhập lịch phỏng vấn..." />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Đang gửi...' : 'Xác nhận & gửi'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
