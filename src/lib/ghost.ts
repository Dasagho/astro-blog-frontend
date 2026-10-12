import { GHOST_URL, GHOST_CONTENT_API_KEY } from 'astro:env/server';

export interface Tag {
  id: string;
  name: string;
  slug: string;
  visibility: 'public' | 'internal';
}

export interface Author {
  id: string;
  name: string;
  slug: string;
  profile_image: string | null;
}

export interface Post {
  id: string;
  uuid: string;
  title: string;
  slug: string;
  html: string | null;
  excerpt: string | null;
  custom_excerpt: string | null;
  feature_image: string | null;
  feature_image_alt: string | null;
  feature_image_caption: string | null;
  featured: boolean;
  published_at: string;
  updated_at: string;
  reading_time: number;
  tags?: Tag[];
  primary_tag?: Tag | null;
  authors?: Author[];
  primary_author?: Author | null;
}

export interface Settings {
  title: string;
  description: string;
  logo: string | null;
  icon: string | null;
  accent_color: string | null;
  lang: string;
}

async function request<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`/ghost/api/content/${path}/`, GHOST_URL);
  url.search = new URLSearchParams({ key: GHOST_CONTENT_API_KEY, ...params }).toString();

  const res = await fetch(url, { headers: { 'Accept-Version': 'v6.0' } });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Ghost ${res.status} en /${path}/: ${body.slice(0, 300)}`);
  }
  return res.json() as Promise<T>;
}

// El build hace varias llamadas idénticas (una por página); se cachean en memoria.
const cache = new Map<string, Promise<unknown>>();
function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  if (!cache.has(key)) cache.set(key, load());
  return cache.get(key) as Promise<T>;
}

export function getPosts(): Promise<Post[]> {
  return cached('posts', async () => {
    const { posts } = await request<{ posts: Post[] }>('posts', {
      limit: 'all',
      include: 'tags,authors',
      formats: 'html',
      order: 'published_at desc',
    });
    return posts;
  });
}

export function getSettings(): Promise<Settings> {
  return cached('settings', async () => {
    const { settings } = await request<{ settings: Settings }>('settings');
    return settings;
  });
}

export const publicTags = (post: Post) => (post.tags ?? []).filter((t) => t.visibility === 'public');

export const excerptOf = (post: Post) => post.custom_excerpt || post.excerpt || '';

const dateFormat = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
export const formatDate = (iso: string) => dateFormat.format(new Date(iso));
