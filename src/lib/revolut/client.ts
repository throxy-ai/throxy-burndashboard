import { createSign } from "crypto";

import { getRevolutConfig, REVOLUT_API_BASE } from "./config";

function base64url(input: Buffer | string): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input, "utf8");
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function createRevolutJwt(): string {
  const { clientId, issuer, privateKey } = getRevolutConfig();
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: issuer,
    sub: clientId,
    iat: now,
    exp: now + 3600,
  };
  const headerB64 = base64url(JSON.stringify(header));
  const payloadB64 = base64url(JSON.stringify(payload));
  const signingInput = `${headerB64}.${payloadB64}`;
  const sign = createSign("RSA-SHA256");
  sign.update(signingInput);
  sign.end();
  const signature = sign.sign(privateKey);
  const signatureB64 = base64url(signature);
  return `${signingInput}.${signatureB64}`;
}

export async function revolutFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = createRevolutJwt();
  const url = path.startsWith("http") ? path : `${REVOLUT_API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Revolut API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function getRevolutAccounts(): Promise<{ id: string; name: string; state: string }[]> {
  const data = (await revolutFetch<{ id: string; name: string; state: string }[]>("/accounts")) ?? [];
  return Array.isArray(data) ? data : [];
}

export async function getRevolutTransactions(accountId: string, from?: string, to?: string): Promise<unknown[]> {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const qs = params.toString();
  const path = `/accounts/${accountId}/transactions${qs ? `?${qs}` : ""}`;
  const data = await revolutFetch<unknown[]>(path);
  return Array.isArray(data) ? data : [];
}

/** Sum outflows (spend) in cents from Revolut transactions. Handles legs[].amount or amount; Revolut may use minor units (cents) or major. */
function sumRevolutOutflowCents(txs: unknown[]): number {
  let total = 0;
  for (const t of txs) {
    const tx = t as Record<string, unknown>;
    const legs = tx?.legs as Array<{ amount?: number }> | undefined;
    const amounts: number[] = [];
    if (Array.isArray(legs)) {
      for (const leg of legs) {
        const a = Number(leg?.amount);
        if (Number.isFinite(a) && a < 0) amounts.push(Math.abs(a));
      }
    } else {
      const a = Number(tx?.amount);
      if (Number.isFinite(a) && a < 0) amounts.push(Math.abs(a));
    }
    for (const a of amounts) {
      const cents = a >= 1000 && Number.isInteger(a) ? a : Math.round(a * 100);
      total += cents;
    }
  }
  return total;
}

/** Sum inflows (revenue) in cents from Revolut transactions. Positive amounts = money in. */
function sumRevolutInflowCents(txs: unknown[]): number {
  let total = 0;
  for (const t of txs) {
    const tx = t as Record<string, unknown>;
    const legs = tx?.legs as Array<{ amount?: number }> | undefined;
    const amounts: number[] = [];
    if (Array.isArray(legs)) {
      for (const leg of legs) {
        const a = Number(leg?.amount);
        if (Number.isFinite(a) && a > 0) amounts.push(a);
      }
    } else {
      const a = Number(tx?.amount);
      if (Number.isFinite(a) && a > 0) amounts.push(a);
    }
    for (const a of amounts) {
      const cents = a >= 1000 && Number.isInteger(a) ? a : Math.round(a * 100);
      total += cents;
    }
  }
  return total;
}

/** Live spend from Revolut for the current calendar month (day 1 through today). */
export async function getRevolutCurrentMonthSpendCents(): Promise<{
  totalOutflowCents: number;
  currency: string;
} | null> {
  const accounts = await getRevolutAccounts();
  if (!accounts.length) return null;
  const now = new Date();
  const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const to = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  let totalCents = 0;
  for (const acc of accounts) {
    const txs = await getRevolutTransactions(acc.id, from, to);
    totalCents += sumRevolutOutflowCents(txs);
  }
  return { totalOutflowCents: totalCents, currency: "USD" };
}

/** Live revenue (inflows) from Revolut for the current calendar month (day 1 through today). */
export async function getRevolutCurrentMonthRevenueCents(): Promise<{
  totalInflowCents: number;
  currency: string;
} | null> {
  const accounts = await getRevolutAccounts();
  if (!accounts.length) return null;
  const now = new Date();
  const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const to = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  let totalCents = 0;
  for (const acc of accounts) {
    const txs = await getRevolutTransactions(acc.id, from, to);
    totalCents += sumRevolutInflowCents(txs);
  }
  return { totalInflowCents: totalCents, currency: "USD" };
}

/** Raw fetch for debugging: returns response as JSON without assuming shape. */
export async function revolutFetchRaw(path: string): Promise<{ status: number; data: unknown }> {
  const token = createRevolutJwt();
  const url = path.startsWith("http") ? path : `${REVOLUT_API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  const data = await res.json().catch(() => ({ _parseError: "response was not JSON" }));
  return { status: res.status, data };
}
