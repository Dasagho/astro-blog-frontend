// @ts-check
import { defineConfig, envField } from 'astro/config';

export default defineConfig({
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
