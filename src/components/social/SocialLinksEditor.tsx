import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { SOCIAL_PLATFORM_OPTIONS, type SocialLinkFormRow } from '@/constants/socialPlatforms';
import { uploadImageToS3 } from '@/services/upload.service';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface SocialLinksEditorProps {
  value: SocialLinkFormRow[];
  onChange: (rows: SocialLinkFormRow[]) => void;
  disabled?: boolean;
}

const emptyRow = (): SocialLinkFormRow => ({
  platform: 'FACEBOOK',
  url: '',
  logo_url: '',
});

export function SocialLinksEditor({ value, onChange, disabled }: SocialLinksEditorProps) {
  const rows = value.length > 0 ? value : [emptyRow()];
  const [uploadingRowIndex, setUploadingRowIndex] = useState<number | null>(null);

  const updateRow = (index: number, patch: Partial<SocialLinkFormRow>) => {
    const next = rows.map((r, i) => (i === index ? { ...r, ...patch } : r));
    onChange(next);
  };

  const addRow = () => {
    onChange([...rows, emptyRow()]);
  };

  const removeRow = (index: number) => {
    if (rows.length <= 1) {
      onChange([emptyRow()]);
      return;
    }
    onChange(rows.filter((_, i) => i !== index));
  };

  const handleLogoFile = async (index: number, file: File) => {
    setUploadingRowIndex(index);
    try {
      const url = await uploadImageToS3(file);
      updateRow(index, { logo_url: url });
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || 'Không thể tải logo lên');
    } finally {
      setUploadingRowIndex(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Mạng xã hội & liên kết</Label>
        <Button type="button" variant="outline" size="sm" className="gap-1" onClick={addRow} disabled={disabled}>
          <Plus className="h-4 w-4" />
          Thêm link
        </Button>
      </div>
      <p className="text-xs text-gray-500">
        Chọn loại và dán URL đầy đủ (https://…). Logo (tuỳ chọn): tải ảnh nhỏ lên server.
      </p>
      <div className="space-y-6">
        {rows.map((row, index) => (
          <div
            key={index}
            className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-gray-50/50 p-4 md:grid-cols-12 md:items-end"
          >
            <div className="md:col-span-3">
              <Label className="text-xs font-medium text-gray-600">Loại</Label>
              <Select
                value={row.platform}
                disabled={disabled}
                onChange={(e) => updateRow(index, { platform: e.target.value })}
              >
                {SOCIAL_PLATFORM_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="md:col-span-5">
              <Label className="text-xs font-medium text-gray-600">URL</Label>
              <Input
                type="url"
                placeholder="https://..."
                value={row.url}
                disabled={disabled}
                onChange={(e) => updateRow(index, { url: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="md:col-span-3 space-y-1">
              <Label className="text-xs font-medium text-gray-600">Logo (tuỳ chọn)</Label>
              <Input
                type="file"
                accept="image/*"
                disabled={disabled || uploadingRowIndex === index}
                className="mt-1 cursor-pointer text-xs h-9 file:mr-2 file:text-xs"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (file) void handleLogoFile(index, file);
                }}
              />
              {uploadingRowIndex === index && (
                <p className="text-xs text-muted-foreground">Đang tải lên…</p>
              )}
              {row.logo_url ? (
                <div className="flex items-center gap-2 pt-1">
                  <img
                    src={row.logo_url}
                    alt=""
                    className="h-9 w-9 shrink-0 rounded border border-gray-200 object-cover"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    disabled={disabled || uploadingRowIndex === index}
                    onClick={() => updateRow(index, { logo_url: '' })}
                  >
                    Xóa logo
                  </Button>
                </div>
              ) : null}
            </div>
            <div className="flex md:col-span-1 md:justify-end md:pb-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={disabled}
                onClick={() => removeRow(index)}
                aria-label="Xóa dòng"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
