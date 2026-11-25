import type { Profile } from '../content/schema';

/** Where "Ask for an interview" goes and what is copied for the visitor to paste there; null (no button) without a LinkedIn. */
export function interviewLink(profile: Profile, order: string, missing = ''): { href: string; summary: string } | null {
  const href = profile.contact.linkedin;
  if (!href?.startsWith('https://')) return null;
  const lines = [`Ordered: ${order.trim()}`];
  if (missing.trim()) lines.push(`What was missing: ${missing.trim()}`);
  return { href, summary: lines.join('\n') };
}
