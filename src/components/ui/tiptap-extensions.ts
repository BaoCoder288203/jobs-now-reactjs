import { Node, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    ctaButton: {
      insertCtaButton: (attrs: { href: string; label: string }) => ReturnType;
    };
  }
}

/**
 * Khối nút CTA (link dạng button) — dùng trong editor bài viết cẩm nang.
 */
export const CtaButton = Node.create({
  name: 'ctaButton',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      href: { default: 'https://' },
      label: { default: 'Xem thêm' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-rich-cta]',
        getAttrs: dom => {
          const el = dom as HTMLElement;
          const a = el.querySelector('a');
          return {
            href: el.getAttribute('data-href') || a?.getAttribute('href') || '',
            label:
              el.getAttribute('data-label')?.trim() ||
              a?.textContent?.trim() ||
              'Xem thêm',
          };
        },
      },
    ];
  },

  renderHTML({ node }) {
    const { href, label } = node.attrs;
    return [
      'div',
      mergeAttributes({
        class: 'rich-cta',
        'data-rich-cta': '',
        'data-href': href,
        'data-label': label,
      }),
      [
        'a',
        {
          href,
          class: 'rich-cta__btn',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
        label,
      ],
    ];
  },

  addCommands() {
    return {
      insertCtaButton:
        attrs =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { href: attrs.href, label: attrs.label },
          }),
    };
  },
});
