import { orderKind } from './kind';

const OPTIONS = ['a product users touch', 'internal tools', 'research', 'data and security'] as const;

/** Words that say what kind of work an order is about. An order with none of them is too vague to match well. */
const DOMAIN =
  /\b(product|products|frontend|backend|full-?stack|web|mobile|ui|ux|design|api|apis|data|database|sql|postgres|security|secure|privacy|auth|ai|ml|llm|agents?|machine|learning|research|science|analytics|cloud|devops|infra\w*|platform|tools?|tooling|internal|finance|fintech|payments?|geospatial|maps?|psychology|business|testing|tests?|performance|embedded|games?)\b/i;

export type Clarification = { question: string; options: readonly string[] };

/** One question for a vague role order ("a developer"); null for anything specific, and for every non-role order. No AI call. */
export function clarify(text: string): Clarification | null {
  if (text.trim() === '' || orderKind(text) !== 'role' || DOMAIN.test(text)) return null;
  return { question: 'What will they work on?', options: OPTIONS };
}

/** The order with the visitor's choice added. Keeps within the 500 character limit by trimming the visitor's own words. */
export function withChoice(text: string, option: string, max = 500): string {
  const suffix = `, for ${option}`;
  const base = text.trim().replace(/[.,;:\s]+$/, '');
  return `${base.slice(0, Math.max(0, max - suffix.length))}${suffix}`;
}
