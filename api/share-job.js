const SITE_URL = (process.env.SITE_URL || 'https://jobsnow.id.vn').replace(/\/+$/, '');
const API_BASE_URL = 'https://jobsnow.onrender.com';
const DEFAULT_IMAGE = `${SITE_URL}/og-default.jpg`;

function escapeHtml(input = '') {
  return String(input)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function toAbsoluteUrl(value) {
  if (!value) return DEFAULT_IMAGE;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return `${SITE_URL}${value.startsWith('/') ? '' : '/'}${value}`;
}

function stripHtml(value = '') {
  return String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function truncate(value = '', max = 180) {
  return value.length > max ? `${value.slice(0, max - 1)}...` : value;
}

function getFirstString(...candidates) {
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
  }
  return '';
}

export default async function handler(req, res) {
  const id = String(req.query?.id || '').trim();
  if (!id) {
    res.statusCode = 400;
    res.setHeader('content-type', 'text/plain; charset=utf-8');
    res.end('Missing job id');
    return;
  }

  const canonicalUrl = `${SITE_URL}/jobs/${encodeURIComponent(id)}`;
  const fallbackTitle = 'Việc làm | JobsNow';
  const fallbackDescription = 'Cơ hội việc làm mới nhất trên JobsNow.';

  try {
    if (!API_BASE_URL) {
      throw new Error('Missing API_BASE_URL');
    }

    const endpoint = `${API_BASE_URL}/job/${encodeURIComponent(id)}`;
    const upstream = await fetch(endpoint, {
      headers: { Accept: 'application/json' },
    });

    if (!upstream.ok) {
      throw new Error(`Fetch failed with ${upstream.status}`);
    }

    const payload = await upstream.json();
    const raw = payload?.data ?? payload ?? {};
    const jobTitle = getFirstString(raw.title);
    const companyName = getFirstString(raw.company?.name, raw.companyName);
    const title = jobTitle ? `${jobTitle} | JobsNow` : fallbackTitle;
    const descriptionSource = getFirstString(raw.description, raw.requirements, companyName);
    const description = truncate(stripHtml(descriptionSource || fallbackDescription), 180) || fallbackDescription;
    const image = toAbsoluteUrl(
      getFirstString(raw.company?.logo_url, raw.company?.logoUrl, raw.logo_url, raw.logoUrl)
    );

    const html = `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="JobsNow" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />
    <meta http-equiv="refresh" content="0;url=${escapeHtml(canonicalUrl)}" />
  </head>
  <body>
    <script>location.replace(${JSON.stringify(canonicalUrl)});</script>
    <a href="${escapeHtml(canonicalUrl)}">Go to job detail</a>
  </body>
</html>`;

    res.statusCode = 200;
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.setHeader('cache-control', 'public, s-maxage=300, stale-while-revalidate=86400');
    res.end(html);
  } catch (_error) {
    const fallbackHtml = `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(fallbackTitle)}</title>
    <meta property="og:title" content="${escapeHtml(fallbackTitle)}" />
    <meta property="og:description" content="${escapeHtml(fallbackDescription)}" />
    <meta property="og:image" content="${escapeHtml(DEFAULT_IMAGE)}" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta http-equiv="refresh" content="0;url=${escapeHtml(canonicalUrl)}" />
  </head>
  <body></body>
</html>`;
    res.statusCode = 200;
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.end(fallbackHtml);
  }
}
