// @ts-check
/* global process */
import { defineConfig, envField } from 'astro/config';

// SITE_URL (opcional): dominio público del frontend, usado en el RSS.
export default defineConfig({
  site: process.env.SITE_URL || undefined,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  env: {
    schema: {
      // Local: https://blog.dsaleh.xyz · Swarm: http://ghost:2368
      GHOST_URL: envField.string({ context: 'server', access: 'public', url: true }),
      GHOST_CONTENT_API_KEY: envField.string({ context: 'server', access: 'secret' }),
    },
  },
});
