import { cloudflareTest } from '@cloudflare/vitest-plugin';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    passWithNoTests: true,
    projects: [
      {
        test: {
          name: 'unit',
          environment: 'node',
          include: ['lib/**/*.test.ts', 'scripts/**/*.test.ts'],
        },
      },
      {
        plugins: [
          cloudflareTest({
            wrangler: { configPath: './wrangler.jsonc' },
            // Cloudflare's published always-pass test secret; never a real one.
            miniflare: { bindings: { TURNSTILE_SECRET: '1x0000000000000000000000000000000AA' } },
          }),
        ],
        test: { name: 'worker', include: ['worker/test/**/*.test.ts'] },
      },
    ],
  },
});
