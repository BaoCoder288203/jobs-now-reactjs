import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import type { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { TiptapToolbar } from './TiptapToolbar';
import './TiptapEditor.css';

export interface TiptapEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
}

export function TiptapEditor({
  value,
  onChange,
  placeholder = 'Nhập nội dung...',
  minHeight = '120px',
  className = '',
}: TiptapEditorProps) {
  const editorRef = useRef<Editor | null>(null);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    editable: true,
    editorProps: {
      attributes: {
        class: 'tiptap-editor-content focus:outline-none min-h-[120px] px-3 py-2',
      },
      handleDOMEvents: {
        blur: () => {
          const ed = editorRef.current;
          if (ed) onChange(ed.getHTML());
        },
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });
  editorRef.current = editor;

  useEffect(() => {
    if (!editor || value === undefined) return;
    const current = editor.getHTML();
    if ((value || '').trim() !== current.trim()) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div
      className={`rounded-lg border border-gray-300 bg-white overflow-hidden ${className}`}
      style={{ minHeight }}
    >
      <TiptapToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
