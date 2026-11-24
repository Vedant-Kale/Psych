import type { HouseMenu } from '../content/schema';

export type Layer = { skill: string; evidenceIds: string[]; rationale: string };
export type RefusalReason = 'empty' | 'too_long' | 'injection' | 'off_topic';
export type HouseMenuReason = 'budget' | 'rate-limit' | 'ai-error' | 'disabled';

export type OrderResult =
  | { kind: 'mix'; layers: Layer[] }
  | { kind: 'fact'; answer: string; sourceIds: string[] }
  | { kind: 'none'; message: string }
  | { kind: 'refused'; reason: RefusalReason }
  | { kind: 'house-menu'; reason: HouseMenuReason; menu: HouseMenu };
