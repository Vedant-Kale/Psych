import type { OrderError } from '@/lib/order/client';
import type { HouseMenuReason, RefusalReason } from '@/lib/order/types';

/** Every line the bar says on its own. Skill text always comes from the API, never from here. */
export const resultHeading = {
  mix: 'Your mix',
  fact: 'From the facts',
  answer: 'My answer',
  none: 'Nothing to pour yet',
  refused: "I can't make that one",
  'house-menu': 'From the house menu',
  error: "That order didn't go through",
} as const;

export const refusalCopy: Record<RefusalReason, string> = {
  empty: 'Tell me a little more: at least 3 characters.',
  too_long: "That's a long order. Keep it under 500 characters.",
  injection: "I only mix from real work, so I don't take instructions. Describe the engineer you need instead.",
  off_topic: "That's not on this bar's menu. Describe the engineer or the skills you need.",
};

export const houseMenuCopy: Record<HouseMenuReason, string> = {
  budget: "The AI has served its last order for today. Here's the house menu instead.",
  'rate-limit': "That's a lot of orders in a few minutes. Here's the house menu while you wait.",
  'ai-error': "The AI couldn't mix that one. Here's the house menu instead.",
  disabled: "The AI side of the bar isn't open yet. Here's the house menu.",
};

export const errorCopy: Record<OrderError, string> = {
  verification: "The human check didn't pass. It has reset, so place the order again.",
  network: "Couldn't reach the bar. Check your connection and try again.",
  'bad-request': "That order didn't arrive in one piece. Try again.",
};

export const exitCopy = {
  question: 'Did this answer it?',
  yes: 'Yes',
  no: 'No',
  thanksYes: 'Glad it helped.',
  receiptHint: 'Your receipt is above: print it or save it as a PDF.',
  thanksNo: 'Thanks. That helps me improve the answers.',
  sorryNo: 'Sorry about that. What was missing?',
  missingLabel: 'What was missing?',
  interview: 'Ask for an interview',
  copied: 'Your summary is copied. Paste it into your message.',
  related: 'Related, not the same',
  askNext: 'Ask next',
} as const;

export const turnstileBlocked =
  "The human check couldn't load, so orders can't go through. An ad blocker may be stopping it.";
