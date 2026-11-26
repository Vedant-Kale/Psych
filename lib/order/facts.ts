import type { Profile } from '../content/schema';

type Fact = { answer: string; sourceIds: string[] };

/** Ordered: education is checked before location so "where does he study?" is about study, not place. */
const rules: { match: RegExp; answer: (p: Profile) => string }[] = [
  {
    match: /\b(stud(y|ies|ying)|degree|universit(y|ies)|educat\w*|master'?s?|course)\b/i,
    answer: (p) => p.education.map((e) => `${e.degree} at ${e.institution} (${e.status}).`).join(' '),
  },
  {
    match: /\b(where\b.*\b(live|lives|based|located|from)|location|which city)\b/i,
    answer: (p) => `Based in ${p.location}.`,
  },
  {
    match: /\b(contact|reach|email|e-mail|github|linkedin|get in touch|hire him)\b/i,
    answer: (p) =>
      [`GitHub: ${p.contact.github}`, p.contact.linkedin && `LinkedIn: ${p.contact.linkedin}`, p.contact.email && `Email: ${p.contact.email}`]
        .filter(Boolean)
        .join(' · '),
  },
  {
    match: /\b(what'?s|what is) (his|your) name\b|\bwho (is|are) (he|you)\b/i,
    answer: (p) => `${p.name}: ${p.headline}.`,
  },
  {
    match: /\b(current (role|job|position)|what does he do|where does he work)\b/i,
    answer: (p) => `${p.headline}.`,
  },
];

// Keywords alone ("email agents", "high degree of autonomy") are ordinary orders; a fact question names the owner.
const aboutOwner = /\b(he|his|him|vedant|your)\b|\bwho are you\b/i;

/** True for a question about the owner that a profile rule answers. */
export const isFactQuestion = (text: string): boolean => aboutOwner.test(text) && rules.some((r) => r.match.test(text));

/** Deterministic answers to questions about the owner: no model, always cites the profile. */
export function answerFromProfile(text: string, profile: Profile): Fact | null {
  if (!aboutOwner.test(text)) return null;
  const rule = rules.find((r) => r.match.test(text));
  return rule ? { answer: rule.answer(profile), sourceIds: ['profile'] } : null;
}
