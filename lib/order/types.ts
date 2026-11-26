import type { HouseMenu } from '../content/schema';

export type Layer = { skill: string; evidenceIds: string[]; rationale: string };
export type RefusalReason = 'empty' | 'too_long' | 'injection' | 'off_topic';
export type HouseMenuReason = 'budget' | 'rate-limit' | 'ai-error' | 'disabled';

/** Evidence id of the nearest documented work, when the order matched something but nothing supported it. */
export type OrderResult =
  | { kind: 'mix'; layers: Layer[] }
  | { kind: 'fact'; answer: string; sourceIds: string[] }
  | { kind: 'answer'; text: string; evidenceIds: string[] }
  | { kind: 'none'; message: string; closest?: string }
  | { kind: 'refused'; reason: RefusalReason }
  | { kind: 'house-menu'; reason: HouseMenuReason; menu: HouseMenu };

/** What /api/order returns: a result, plus the id of the stored turn when the order carried a conversation id. */
export type Answered = OrderResult & { turnId?: number };
