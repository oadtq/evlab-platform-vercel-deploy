import 'server-only';

import { getMcpOAuthByUser } from '@/lib/db/queries';

function base64UrlDecode(input: string): string {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4));
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/') + pad;
  return Buffer.from(b64, 'base64').toString('utf8');
}

function parseJwtExpSeconds(jwt?: string | null): number | undefined {
  if (!jwt) return undefined;
  const parts = jwt.split('.');
  if (parts.length < 2) return undefined;
  try {
    const payloadJson = base64UrlDecode(parts[1]);
    const payload = JSON.parse(payloadJson);
    const exp = payload?.exp;
    if (typeof exp === 'number') return exp;
  } catch {
    // ignore parsing errors
  }
  return undefined;
}

export async function shouldRelinkMcp(
  userId: string,
  provider: string,
  skewSeconds = 60,
): Promise<boolean> {
  const row = await getMcpOAuthByUser({ userId, provider });
  if (!row || !row.tokens) return true; // not linked

  // Try id_token exp first
  const idToken = (row.tokens as any)?.id_token as string | undefined;
  const expSec = parseJwtExpSeconds(idToken);
  const nowSec = Math.floor(Date.now() / 1000);
  if (typeof expSec === 'number') {
    return nowSec + skewSeconds >= expSec;
  }

  // Fallback to updatedAt + expires_in
  const expiresIn = (row.tokens as any)?.expires_in as number | undefined;
  if (typeof expiresIn === 'number' && row.updatedAt) {
    const issuedSec = Math.floor(new Date(row.updatedAt).getTime() / 1000);
    return nowSec + skewSeconds >= issuedSec + expiresIn;
  }

  // If no signals about expiry, assume valid
  return false;
}

