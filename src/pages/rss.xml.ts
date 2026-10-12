import type { APIRoute } from 'astro';
import { excerptOf, getPosts, getSettings } from '../lib/ghost';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const GET: APIRoute = async ({ site }) => {
  const [posts, settings] = await Promise.all([getPosts(), getSettings()]);
  // Define SITE_URL (dominio público del frontend) para URLs absolutas; si no, se usan relativas.
  const base = (site?.origin ?? '').replace(/\/$/, '');

  const items = posts
    .map(
      (p) => `<item>
<title>${esc(p.title)}</title>
<link>${base}/${p.slug}/</link>
<guid isPermaLink="false">${p.id}</guid>
<pubDate>${new Date(p.published_at).toUTCString()}</pubDate>
<description>${esc(excerptOf(p))}</description>
</item>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>${esc(settings.title)}</title>
<link>${base}/</link>
<description>${esc(settings.description ?? '')}</description>
<language>${settings.lang || 'es'}</language>
${items}
</channel></rss>`;

  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
