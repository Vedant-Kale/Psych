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
        plugins: [cloudflareTest({ wrangler: { configPath: './wrangler.jsonc' } })],
        test: { name: 'worker', include: ['worker/test/**/*.test.ts'] },
      },
    ],
  },
});
