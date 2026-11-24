import { withContentCollections } from '@content-collections/next';
import type { NextConfig } from 'next';

const config: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
};

export default withContentCollections(config);
