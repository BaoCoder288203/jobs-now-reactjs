import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface ImageUploadSingleProps {
  value?: string;
  onChange: (dataUrl: string) => void;
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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      <Input
        id={id}
        type="file"
        accept={accept}
        onChange={handleChange}
      />
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
  newPreviews: string[];
  onAdd: (files: File[]) => void;
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
  newPreviews,
  onAdd,
  onRemoveExisting,
  onRemoveNew,
  maxCount,
  label = 'Ảnh thumbnail',
  accept = 'image/*',
  previewClassName,
  id = 'image-upload-multiple',
}: ImageUploadMultipleProps) {
  const currentCount = existingImages.length + newPreviews.length;
  const disabled = currentCount >= maxCount;

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const toAdd = files.slice(0, maxCount - currentCount);
    if (toAdd.length === 0) return;
    onAdd(toAdd);
    e.target.value = '';
  };

  const items: { type: 'existing'; id: number; src: string }[] = existingImages.map((img) => ({
    type: 'existing',
    id: img.id,
    src: img.url,
  }));
  const newItems: { type: 'new'; index: number; src: string }[] = newPreviews.map((src, index) => ({
    type: 'new',
    index,
    src,
  }));
  const allItems = [...items, ...newItems];

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
      {allItems.length > 0 && (
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
