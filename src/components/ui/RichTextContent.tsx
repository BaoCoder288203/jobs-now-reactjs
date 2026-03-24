import DOMPurify from 'dompurify';
import './RichTextContent.css';

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'b', 'i', 'u', 's', 'a', 'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'span',
  'div', 'code', 'pre', 'hr',
];

const ALLOWED_ATTR = ['href', 'target', 'rel', 'class'];

export interface RichTextContentProps {
  html: string;
  className?: string;
  emptyPlaceholder?: React.ReactNode;
}

export function RichTextContent({
  html,
  className = '',
  emptyPlaceholder = '—',
}: RichTextContentProps) {
  const sanitized = DOMPurify.sanitize(html ?? '', {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: true,
  });
  const isEmpty = !sanitized.trim();

  if (isEmpty) {
    return (
      <div className={`rich-text-content text-gray-500 ${className}`.trim()}>
        {emptyPlaceholder}
      </div>
    );
  }

  return (
    <div
      className={`rich-text-content ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
