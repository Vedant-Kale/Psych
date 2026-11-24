import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-plugin';
import { defineConfig } from 'vitest/config';

const migrations = await readD1Migrations('worker/migrations');

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
            // Never reach real Cloudflare services (Workers AI) from tests; AI-path tests pass a mock binding.
            remoteBindings: false,
            // Cloudflare's published always-pass test secret; never a real one.
            miniflare: {
              bindings: {
                TURNSTILE_SECRET: '1x0000000000000000000000000000000AA',
                IP_SALT_SECRET: 'test-salt-not-a-secret',
                TEST_MIGRATIONS: migrations,
              },
            },
          }),
        ],
        test: { name: 'worker', include: ['worker/test/**/*.test.ts'], setupFiles: ['worker/test/apply-migrations.ts'] },
      },
    ],
  },
});
