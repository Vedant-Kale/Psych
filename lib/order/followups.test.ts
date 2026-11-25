import { describe, expect, it } from 'vitest';
import { followUps } from './followups';

const sources = {
  profile: { title: 'Facts' },
  'expense-track': { title: 'expense-track-agent' },
  'why-bars-light-amber': { title: 'Why bars light amber' },
  'third-work': { title: 'Third work' },
};

describe('followUps', () => {
  it('suggests asking about documented work the answer did not use, never the profile page', () => {
    expect(followUps(['expense-track#0'], sources)).toEqual(['Tell me about Why bars light amber', 'Tell me about Third work']);
  });

  it('skips every source the answer cited, however many chunks of it were used', () => {
    expect(followUps(['expense-track#0', 'expense-track#3', 'why-bars-light-amber#0'], sources)).toEqual(['Tell me about Third work']);
  });

  it('keeps at most 2, and none when everything has been cited', () => {
    expect(followUps([], sources)).toHaveLength(2);
    expect(followUps([], sources, 1)).toEqual(['Tell me about expense-track-agent']);
    expect(followUps(['expense-track#0', 'why-bars-light-amber#0', 'third-work#0'], sources)).toEqual([]);
  });

  it('only ever uses titles from the documented sources it is given', () => {
    expect(followUps([], { profile: { title: 'Facts' } })).toEqual([]);
    expect(followUps(['unknown#0'], { x: { title: 'X' } })).toEqual(['Tell me about X']);
  });
});
