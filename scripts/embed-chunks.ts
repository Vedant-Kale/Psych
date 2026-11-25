import { readFileSync, writeFileSync } from 'node:fs';

const MODEL = '@cf/baai/bge-small-en-v1.5';
const BATCH = 20;
/** The vectors ship inside the Worker bundle, which is limited; stop well short of that. */
export const VECTORS_LIMIT = 1024 * 1024;

type Embed = (texts: string[]) => Promise<number[][]>;

/** Chunk id → rounded embedding. Rounds to 4 decimals to keep the file small. */
export async function embedChunks(chunks: { id: string; text: string }[], embed: Embed, batch = BATCH): Promise<Record<string, number[]>> {
  const out: Record<string, number[]> = {};
  for (let i = 0; i < chunks.length; i += batch) {
    const part = chunks.slice(i, i + batch);
    const vectors = await embed(part.map((c) => c.text));
    if (vectors.length !== part.length) throw new Error(`embedded ${part.length} texts but ${vectors.length} vectors came back`);
    part.forEach((c, n) => {
      out[c.id] = vectors[n]!.map((x) => Math.round(x * 1e4) / 1e4);
    });
  }
  return out;
}

export function assertSmallEnough(json: string) {
  if (json.length > VECTORS_LIMIT) throw new Error(`vectors.json is ${json.length} bytes, over the ${VECTORS_LIMIT} byte limit`);
}

/** Workers AI over REST with the CI token. */
const cloudflareEmbed =
  (accountId: string, token: string): Embed =>
  async (texts) => {
    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${MODEL}`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ text: texts }),
      signal: AbortSignal.timeout(30_000),
    });
    const body = (await res.json()) as { success?: boolean; result?: { data?: number[][] }; errors?: { message: string }[] };
    if (!res.ok || !body.success || !body.result?.data) throw new Error(`embeddings API ${res.status}: ${body.errors?.[0]?.message ?? 'no data'}`);
    return body.result.data;
  };

async function main() {
  const out = 'worker/generated/vectors.json';
  const { CLOUDFLARE_API_TOKEN: token, CLOUDFLARE_ACCOUNT_ID: account } = process.env;
  let vectors: Record<string, number[]> = {};
  if (!token || !account) {
    console.log('vectors: no Cloudflare token, so keyword search only (worker/generated/vectors.json is empty)');
  } else {
    try {
      const chunks = JSON.parse(readFileSync('worker/generated/chunks.json', 'utf8')) as { id: string; text: string }[];
      vectors = await embedChunks(chunks, cloudflareEmbed(account, token));
      console.log(`vectors: ${Object.keys(vectors).length} chunks embedded`);
    } catch (e) {
      // A failed embeddings call must not stop a deploy: the Worker falls back to keyword search.
      console.log(`::warning::embeddings failed, shipping keyword search only: ${e instanceof Error ? e.message : String(e)}`);
      vectors = {};
    }
  }
  const json = JSON.stringify(vectors);
  assertSmallEnough(json);
  writeFileSync(out, json);
}

if (import.meta.main) await main();
