const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

type FetchFn = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

/** Server-side Turnstile check. Fails closed: no secret, network error or odd reply all mean "not verified". */
export async function verifyTurnstile(token: string, secret: string, ip: string, fetchFn: FetchFn = fetch): Promise<boolean> {
  if (!secret || !token) return false;
  const body = new FormData();
  body.set('secret', secret);
  body.set('response', token);
  if (ip) body.set('remoteip', ip);
  try {
    const res = await fetchFn(SITEVERIFY, { method: 'POST', body });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: unknown };
    return data.success === true;
  } catch {
    return false;
  }
}
