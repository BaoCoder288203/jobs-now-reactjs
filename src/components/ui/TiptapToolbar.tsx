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
} from 'lucide-react';

interface TiptapToolbarProps {
  editor: Editor | null;
}

export function TiptapToolbar({ editor }: TiptapToolbarProps) {
  if (!editor) return null;

  const setLink = () => {
    const url = window.prompt('URL:');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const headingLevel = editor.getAttributes('heading').level;
  const selectValue = headingLevel ? String(headingLevel) : 'p';

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1 rounded-t-lg">
      <select
        className="text-sm border-0 bg-transparent cursor-pointer rounded px-1 py-1"
        value={selectValue}
        onChange={(e) => {
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
      <span className="w-px h-5 bg-gray-300 mx-0.5" aria-hidden />
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
        title="Link"
      >
        <LinkIcon className="h-4 w-4" />
      </button>
      <span className="w-px h-5 bg-gray-300 mx-0.5" aria-hidden />
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
      <span className="w-px h-5 bg-gray-300 mx-0.5" aria-hidden />
      <button type="button" onClick={() => editor.chain().focus().undo().run()} className="p-1.5 rounded hover:bg-gray-200" title="Hoàn tác">
        <Undo className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} className="p-1.5 rounded hover:bg-gray-200" title="Làm lại">
        <Redo className="h-4 w-4" />
      </button>
    </div>
  );
}
