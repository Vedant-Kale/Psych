import { useId } from 'react';
import type { Layer } from '@/lib/order/types';

// A rocks glass: inside walls from (12,24)–(108,24) down to (20,140)–(100,140). Liquid fills from y=40.
const INSIDE = 'M12 24 L108 24 L100 140 L20 140 Z';
const TOP = 40;
const BOTTOM = 140;
const DEEP = [122, 63, 12];
const LIGHT = [246, 201, 138];

/** First layer at the bottom in deep amber, last at the top in pale amber. */
function amber(i: number, n: number) {
  const t = n > 1 ? i / (n - 1) : 0.5;
  const [r, g, b] = DEEP.map((d, k) => Math.round(d + (LIGHT[k]! - d) * t));
  return `rgb(${r} ${g} ${b})`;
}

/** Decorative: the receipt carries the meaning. Bands pour in one after another (CSS); reduced motion shows them filled. */
export function Pour({ layers }: { layers: Layer[] }) {
  const clip = `pour-${useId().replace(/[^\w-]/g, '')}`;
  const h = (BOTTOM - TOP) / layers.length;
  return (
    <svg className="pour" viewBox="0 0 120 150" width="120" height="150" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={clip}>
          <path d={INSIDE} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        {layers.map((_, i) => (
          <rect key={i} className="pour-band" x="0" y={BOTTOM - (i + 1) * h} width="120" height={h + 0.5} fill={amber(i, layers.length)} />
        ))}
      </g>
      <path d="M8 20 L20 144 L100 144 L112 20" className="pour-glass" />
    </svg>
  );
}
