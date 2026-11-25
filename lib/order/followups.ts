/** "Tell me about X" for documented work the answer did not use: never invented, always a title from the site's own sources. */
export function followUps(citedIds: string[], sources: Record<string, { title: string }>, max = 2): string[] {
  const cited = new Set(citedIds.map((id) => id.split('#')[0]));
  return Object.entries(sources)
    .filter(([slug]) => slug !== 'profile' && !cited.has(slug))
    .slice(0, max)
    .map(([, s]) => `Tell me about ${s.title}`);
}
