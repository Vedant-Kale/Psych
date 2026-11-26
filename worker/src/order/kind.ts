import { isFactQuestion } from './facts';

export type OrderKind = 'role' | 'behaviour' | 'fact';

const BEHAVIOUR = /^\s*(how|why|tell me about|describe|what did|has he|have you)\b/i;

/** Sorts an order by its words: a profile fact, a behaviour question ("how did he…"), or else a role to fill. */
export function orderKind(text: string): OrderKind {
  if (isFactQuestion(text)) return 'fact';
  return BEHAVIOUR.test(text) ? 'behaviour' : 'role';
}
