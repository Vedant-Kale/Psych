import next from 'eslint-config-next';

const config = [
  { ignores: ['out/**', '.next/**', 'node_modules/**', 'spikes/**', '.wrangler/**', 'playwright-report/**', 'test-results/**', 'worker/generated/**'] },
  ...next,
];

export default config;
