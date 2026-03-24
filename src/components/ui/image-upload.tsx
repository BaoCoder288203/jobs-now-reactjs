import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { uploadImageToS3 } from '@/services/upload.service';
import { toast } from 'sonner';

export interface ImageUploadSingleProps {
  /** Public image URL (e.g. S3) or legacy data URL */
  value?: string;
  onChange: (imageUrl: string) => void;
  onClear: () => void;
  label?: string;
  accept?: string;
  previewClassName?: string;
  id?: string;
}

export function ImageUploadSingle({
  value,
  onChange,
  onClear,
  label = 'Ảnh',
  accept = 'image/*',
  previewClassName,
  id = 'image-upload-single',
}: ImageUploadSingleProps) {
  const [uploading, setUploading] = React.useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageToS3(file);
      onChange(url);
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || 'Không thể tải ảnh lên');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      <Input
        id={id}
        type="file"
        accept={accept}
        onChange={handleChange}
        disabled={uploading}
      />
      {uploading && <p className="text-sm text-muted-foreground">Đang tải lên...</p>}
      {value && (
        <div className="mt-2 relative group inline-block">
          <img
            src={value}
            alt="Preview"
            className={cn(
              'h-24 w-40 rounded-lg border border-gray-200 object-cover',
              previewClassName
            )}
          />
          <button
            type="button"
            onClick={onClear}
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"
            aria-label="Xóa ảnh"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export interface ExistingImageItem {
  id: number;
  url: string;
}

export interface ImageUploadMultipleProps {
  existingImages: ExistingImageItem[];
  /** New URLs from S3 uploads (pending save) */
  newImageUrls: string[];
  onUploadedUrls: (urls: string[]) => void;
  onRemoveExisting: (id: number) => void;
  onRemoveNew: (index: number) => void;
  maxCount: number;
  label?: string;
  accept?: string;
  previewClassName?: string;
  id?: string;
}

export function ImageUploadMultiple({
  existingImages,
  newImageUrls,
  onUploadedUrls,
  onRemoveExisting,
  onRemoveNew,
  maxCount,
  label = 'Ảnh thumbnail',
  accept = 'image/*',
  previewClassName,
  id = 'image-upload-multiple',
}: ImageUploadMultipleProps) {
  const [uploading, setUploading] = React.useState(false);
  const currentCount = existingImages.length + newImageUrls.length;
  const disabled = currentCount >= maxCount || uploading;

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = '';
    const toAdd = files.slice(0, maxCount - currentCount);
    if (toAdd.length === 0) return;
    setUploading(true);
    try {
      const urls = await Promise.all(toAdd.map((f) => uploadImageToS3(f)));
      onUploadedUrls(urls);
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || 'Không thể tải ảnh lên');
    } finally {
      setUploading(false);
    }
  };

  const items: { type: 'existing'; id: number; src: string }[] = existingImages.map((img) => ({
    type: 'existing',
    id: img.id,
    src: img.url,
  }));
  const newItems: { type: 'new'; index: number; src: string }[] = newImageUrls.map((src, index) => ({
    type: 'new',
    index,
    src,
  }));

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} (tối đa {maxCount} ảnh)
      </Label>
      <Input
        id={id}
        type="file"
        accept={accept}
        multiple
        onChange={handleChange}
        disabled={disabled}
      />
      {uploading && <p className="text-sm text-muted-foreground">Đang tải lên...</p>}
      {items.length + newItems.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {items.map((item) => (
            <div key={`existing-${item.id}`} className="relative group">
              <img
                src={item.src}
                alt="Thumbnail"
                className={cn(
                  'h-20 w-20 rounded-lg border border-gray-200 object-cover',
                  previewClassName
                )}
              />
              <button
                type="button"
                onClick={() => onRemoveExisting(item.id)}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                aria-label="Xóa ảnh"
              >
                ×
              </button>
            </div>
          ))}
          {newItems.map((item) => (
            <div key={`new-${item.index}`} className="relative group">
              <img
                src={item.src}
                alt={`Thumbnail mới ${item.index + 1}`}
                className={cn(
                  'h-20 w-20 rounded-lg border border-gray-200 object-cover',
                  previewClassName
                )}
              />
              <button
                type="button"
                onClick={() => onRemoveNew(item.index)}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                aria-label="Xóa ảnh"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
