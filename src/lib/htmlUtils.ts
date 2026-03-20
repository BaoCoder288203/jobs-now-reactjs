/** Strip tags for validation / length checks (client-side). */
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Legacy plain-text job fields → simple HTML for TipTap. */
export function plainTextToTipTapHtml(text: string): string {
  const t = (text ?? '').trim();
  if (!t) return '';
  if (t.startsWith('<') && /<\/?[a-z][\s\S]*>/i.test(t)) return text;
  const paras = t.split(/\n+/).filter(Boolean);
  return paras.map((p) => `<p>${escapeHtml(p)}</p>`).join('');
}

const WS = /\s+/g;

/**
 * Lấy danh sách text cho chip phúc lợi trên JobCard: ưu tiên từng <li>, không có thì từng <p>,
 * cuối cùng plain text (tách , ; hoặc xuống dòng). Chỉ client (DOMParser).
 */
export function extractBenefitItemsFromHtml(html: string): string[] {
  const raw = (html ?? '').trim();
  if (!raw) return [];

  const normalize = (s: string) => s.replace(WS, ' ').trim();

  if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
    const toParse = raw.includes('<') ? raw : `<p>${escapeHtml(raw)}</p>`;
    const doc = new DOMParser().parseFromString(toParse, 'text/html');

    const fromLi = Array.from(doc.querySelectorAll('li'))
      .map((el) => normalize(el.textContent ?? ''))
      .filter(Boolean);
    if (fromLi.length > 0) return fromLi;

    const fromP = Array.from(doc.querySelectorAll('p'))
      .map((el) => normalize(el.textContent ?? ''))
      .filter(Boolean);
    if (fromP.length > 0) return fromP;

    const bodyText = normalize(doc.body?.textContent ?? '');
    if (bodyText) return [bodyText];
  }

  const plain = htmlToPlainText(raw);
  if (!plain) return [];
  return plain
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}
