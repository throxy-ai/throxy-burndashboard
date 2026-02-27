import { NextResponse } from "next/server";

import { getRevolutAccounts, revolutFetchRaw } from "@/lib/revolut/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/revolut/debug
 * Returns raw Revolut API responses (accounts + transactions for first account) so you can
 * inspect JSON structure, date formats, and fields. Use only in development or remove in production.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;

  const toISO = (d: Date) => d.toISOString().slice(0, 10);
  const now = new Date();
  const defaultTo = to ?? toISO(now);
  const defaultFrom = from ?? toISO(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));

  try {
    const [accountsRes, accountsList] = await Promise.all([
      revolutFetchRaw("/accounts"),
      getRevolutAccounts(),
    ]);

    const accounts = Array.isArray(accountsRes.data) ? accountsRes.data : accountsRes.data;
    const firstId = Array.isArray(accountsList) && accountsList[0] ? accountsList[0].id : null;

    let transactionsRes: { status: number; data: unknown } = { status: 0, data: null };
    if (firstId) {
      const path = `/accounts/${firstId}/transactions?from=${encodeURIComponent(defaultFrom)}&to=${encodeURIComponent(defaultTo)}`;
      transactionsRes = await revolutFetchRaw(path);
    }

    return NextResponse.json({
      _meta: {
        fetchedAt: new Date().toISOString(),
        dateRange: { from: defaultFrom, to: defaultTo },
        accountsEndpoint: "/accounts",
        transactionsEndpoint: firstId ? `/accounts/${firstId}/transactions` : null,
      },
      accounts: {
        status: accountsRes.status,
        data: accounts,
      },
      transactions: firstId
        ? { status: transactionsRes.status, data: transactionsRes.data }
        : { status: null, data: null, _note: "No account id available to fetch transactions" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: message, _meta: { fetchedAt: new Date().toISOString() } },
      { status: 500 }
    );
  }
}
