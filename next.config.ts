import { withContentCollections } from '@content-collections/next';
import type { NextConfig } from 'next';

const config: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  // Client components (the receipt) only see env vars inlined here; without this they fall back to localhost.
  ...(process.env.SITE_URL && { env: { SITE_URL: process.env.SITE_URL } }),
};

export default withContentCollections(config);
