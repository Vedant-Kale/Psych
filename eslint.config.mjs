import next from 'eslint-config-next';

const config = [
  { ignores: ['out/**', '.next/**', 'node_modules/**', 'spikes/**', '.wrangler/**', 'playwright-report/**', 'test-results/**', 'worker/generated/**', '.content-collections/**'] },
  ...next,
];

export default config;
