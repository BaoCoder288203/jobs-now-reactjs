import { useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Table2,
  ImagePlus,
  MousePointerClick,
  Linkedin,
  Facebook,
  Twitter,
  Send,
} from 'lucide-react';
import { uploadImageToS3 } from '@/services/upload.service';
import { toast } from 'sonner';

interface TiptapToolbarProps {
  editor: Editor | null;
}

const FONT_SIZES = ['', '14px', '16px', '18px', '20px', '24px'] as const;
const LINE_HEIGHTS = ['', '1.25', '1.5', '1.75', '2'] as const;

function applySocialLink(
  editor: Editor,
  platform: 'linkedin' | 'twitter' | 'facebook' | 'telegram',
) {
  const url = window.prompt('URL mạng xã hội:');
  if (!url?.trim()) return;
  const normalized = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
  const labels = {
    linkedin: 'LinkedIn',
    twitter: 'X',
    facebook: 'Facebook',
    telegram: 'Telegram',
  } as const;
  const cls = `rich-link-social rich-link-${platform}`;
  const { empty } = editor.state.selection;
  if (empty) {
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'paragraph',
        content: [
          {
            type: 'text',
            marks: [
              {
                type: 'link',
                attrs: {
                  href: normalized,
                  class: cls,
                  target: '_blank',
                  rel: 'noopener noreferrer',
                },
              },
            ],
            text: labels[platform],
          },
        ],
      })
      .run();
  } else {
    editor.chain().focus().setLink({ href: normalized, class: cls }).run();
  }
}

export function TiptapToolbar({ editor }: TiptapToolbarProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  if (!editor) return null;

  const setLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL:', previous || 'https://');
    if (url === null) return;
    const t = url.trim();
    if (t === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: t }).run();
  };

  const headingLevel = editor.getAttributes('heading').level as number | undefined;
  const selectValue = headingLevel ? String(headingLevel) : 'p';

  const textStyle = editor.getAttributes('textStyle') as {
    fontSize?: string | null;
    lineHeight?: string | null;
  };
  const fontSizeValue = textStyle.fontSize ?? '';
  const lineHeightValue = textStyle.lineHeight ?? '';

  const onImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadImageToS3(file);
      editor.chain().focus().setImage({ src: url, alt: '' }).run();
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || 'Không thể tải ảnh lên');
    } finally {
      setUploadingImage(false);
    }
  };

  const insertCta = () => {
    const label = window.prompt('Nhãn nút:', 'Xem thêm');
    if (label === null) return;
    const href = window.prompt('URL:', 'https://');
    if (href === null || !href.trim()) return;
    editor
      .chain()
      .focus()
      .insertCtaButton({ href: href.trim(), label: label.trim() || 'Xem thêm' })
      .run();
  };

  const sep = <span className="w-px h-5 bg-gray-300 mx-0.5 shrink-0" aria-hidden />;

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1.5 rounded-t-lg">
      <select
        className="text-sm border-0 bg-transparent cursor-pointer rounded px-1 py-1 max-w-[7.5rem]"
        value={selectValue}
        onChange={e => {
          const v = e.target.value;
          if (v === 'p') editor.chain().focus().setParagraph().run();
          else editor.chain().focus().setHeading({ level: Number(v) as 1 | 2 | 3 }).run();
        }}
      >
        <option value="p">Đoạn văn</option>
        <option value="1">Tiêu đề 1</option>
        <option value="2">Tiêu đề 2</option>
        <option value="3">Tiêu đề 3</option>
      </select>
      {sep}
      <select
        className="text-xs border border-gray-200 bg-white rounded px-1 py-1 max-w-[5.5rem]"
        title="Cỡ chữ (chọn đoạn chữ trước)"
        value={FONT_SIZES.includes(fontSizeValue as (typeof FONT_SIZES)[number]) ? fontSizeValue : ''}
        onChange={e => {
          const v = e.target.value;
          if (v === '') editor.chain().focus().unsetFontSize().run();
          else editor.chain().focus().setFontSize(v).run();
        }}
      >
        <option value="">Cỡ chữ</option>
        {FONT_SIZES.filter(Boolean).map(s => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <select
        className="text-xs border border-gray-200 bg-white rounded px-1 py-1 max-w-[5.5rem]"
        title="Giãn dòng (chọn đoạn chữ trước)"
        value={LINE_HEIGHTS.includes(lineHeightValue as (typeof LINE_HEIGHTS)[number]) ? lineHeightValue : ''}
        onChange={e => {
          const v = e.target.value;
          if (v === '') editor.chain().focus().unsetLineHeight().run();
          else editor.chain().focus().setLineHeight(v).run();
        }}
      >
        <option value="">Dòng</option>
        {LINE_HEIGHTS.filter(Boolean).map(s => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {sep}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={setLink}
        className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('link') ? 'bg-gray-200' : ''}`}
        title="Liên kết"
      >
        <LinkIcon className="h-4 w-4" />
      </button>
      {sep}
      <span className="text-[10px] text-gray-500 uppercase tracking-wide self-center px-0.5">MXH</span>
      <button
        type="button"
        onClick={() => applySocialLink(editor, 'linkedin')}
        className="p-1.5 rounded hover:bg-gray-200 text-[#0a66c2]"
        title="Link LinkedIn (chọn chữ hoặc chèn mới)"
      >
        <Linkedin className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => applySocialLink(editor, 'twitter')}
        className="p-1.5 rounded hover:bg-gray-200"
        title="Link X (chọn chữ hoặc chèn mới)"
      >
        <Twitter className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => applySocialLink(editor, 'facebook')}
        className="p-1.5 rounded hover:bg-gray-200 text-[#1877f2]"
        title="Link Facebook"
      >
        <Facebook className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => applySocialLink(editor, 'telegram')}
        className="p-1.5 rounded hover:bg-gray-200 text-[#229ED9]"
        title="Link Telegram"
      >
        <Send className="h-4 w-4" />
      </button>
      {sep}
      <button
        type="button"
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        className="p-1.5 rounded hover:bg-gray-200"
        title="Chèn bảng (kéo cạnh bảng để chỉnh độ rộng cột)"
      >
        <Table2 className="h-4 w-4" />
      </button>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onImageFile}
      />
      <button
        type="button"
        disabled={uploadingImage}
        onClick={() => imageInputRef.current?.click()}
        className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-50"
        title={uploadingImage ? 'Đang tải...' : 'Chèn ảnh (kéo góc ảnh để resize)'}
      >
        <ImagePlus className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={insertCta}
        className="p-1.5 rounded hover:bg-gray-200 text-violet-700"
        title="Nút kêu gọi (CTA)"
      >
        <MousePointerClick className="h-4 w-4" />
      </button>
      {sep}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
        title="Danh sách"
      >
        <List className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
        title="Danh sách số"
      >
        <ListOrdered className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('blockquote') ? 'bg-gray-200' : ''}`}
        title="Trích dẫn"
      >
        <Quote className="h-4 w-4" />
      </button>
      {sep}
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        className="p-1.5 rounded hover:bg-gray-200"
        title="Hoàn tác"
      >
        <Undo className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        className="p-1.5 rounded hover:bg-gray-200"
        title="Làm lại"
      >
        <Redo className="h-4 w-4" />
      </button>
    </div>
  );
}
