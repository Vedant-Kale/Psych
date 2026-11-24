import type { Message } from './prompt';

/** Same shape the citations check expects; JSON mode asks the model to fill it. */
const responseSchema = {
  type: 'object',
  properties: {
    layers: {
      type: 'array',
      maxItems: 5,
      items: {
        type: 'object',
        properties: {
          skill: { type: 'string' },
          evidence_ids: { type: 'array', items: { type: 'string' } },
          rationale: { type: 'string' },
        },
        required: ['skill', 'evidence_ids', 'rationale'],
      },
    },
  },
  required: ['layers'],
};

type AiRunner = { run: (model: string, input: Record<string, unknown>) => Promise<unknown> };

/** One Workers AI call in JSON mode. Throws on any error so the caller can serve the house menu. */
export async function callModel(ai: AiRunner, model: string, messages: Message[]): Promise<unknown> {
  const out = (await ai.run(model, {
    messages,
    response_format: { type: 'json_schema', json_schema: responseSchema },
    max_tokens: 512,
    temperature: 0.2,
  })) as { response?: unknown } | null;
  if (!out || out.response === undefined) throw new Error('model returned no response');
  return out.response;
}
