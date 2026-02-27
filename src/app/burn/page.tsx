import { AppShell } from "@/components/layout/app-shell";
import { Suspense } from "react";

import { BurnDashboardClient } from "@/components/burn/burn-dashboard-client";
import { getPastMonthBurn, getPastMonthRevenue, getBurnHistoryForProjection, getMonthlyBurnRecords } from "@/lib/db/burn";
import { getRevolutCurrentMonthSpendCents, getRevolutCurrentMonthRevenueCents } from "@/lib/revolut/client";

export const dynamic = "force-dynamic";

function formatCents(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default async function BurnPage() {
  const [pastMonth, pastRevenue, history, previousMonthsBurn, revolutCurrent, revolutRevenue] = await Promise.all([
    getPastMonthBurn(),
    getPastMonthRevenue(),
    getBurnHistoryForProjection(12),
    getMonthlyBurnRecords(24),
    getRevolutCurrentMonthSpendCents().catch(() => null),
    getRevolutCurrentMonthRevenueCents().catch(() => null),
  ]);

  const avgCents =
    history.length > 0
      ? Math.round(history.reduce((s, r) => s + r.amountCents, 0) / history.length)
      : pastMonth?.amountCents ?? 0;
  const currency = pastMonth?.currency ?? "USD";

  const now = new Date();
  const projectedMonths: { yearMonth: string; label: string; amountCents: number }[] = [];
  for (let i = 1; i <= 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const yearMonth = `${y}-${m}`;
    const monthName = d.toLocaleString("default", { month: "short", year: "numeric" });
    projectedMonths.push({ yearMonth, label: monthName, amountCents: avgCents });
  }

  const initialCashCents = Math.round(
    Number(process.env.BURN_INITIAL_CASH_CENTS ?? "486429400") || 486429400
  );
  let remainingCents = initialCashCents;
  const runningRemaining: { label: string; remainingCents: number }[] = [];
  for (const p of projectedMonths) {
    remainingCents -= p.amountCents;
    runningRemaining.push({ label: p.label, remainingCents });
  }
  const runwayMonths =
    avgCents > 0 && remainingCents > 0 ? Math.floor(remainingCents / avgCents) : null;

  const currentMonthRevolutFormatted =
    revolutCurrent != null
      ? formatCents(revolutCurrent.totalOutflowCents, revolutCurrent.currency)
      : null;
  const currentMonthRevolutRevenueFormatted =
    revolutRevenue != null
      ? formatCents(revolutRevenue.totalInflowCents, revolutRevenue.currency)
      : null;
  const pastMonthRevenueFormatted =
    pastRevenue != null
      ? { ...pastRevenue, formatted: formatCents(pastRevenue.amountCents, pastRevenue.currency) }
      : null;

  return (
    <AppShell>
      <div className="flex flex-1 flex-col gap-6 p-6">

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Burn rate dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Past month burn and projected burn for the next months.
        </p>
      </div>

      <div className="rounded-none border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm dark:border-amber-900/50 dark:bg-amber-950/30">
        <p className="font-medium text-amber-900 dark:text-amber-200">Live figures are not confirmed until month end.</p>
        <p className="mt-1 text-amber-800 dark:text-amber-300">
          Revenue and expenses below are from Revolut for the current month. Once the new month starts, attach statements in Claude, get the JSON output, then use &quot;Add or edit month&quot; (and Revenue) to paste and save the reconciled totals and breakdown.
        </p>
      </div>

      <Suspense fallback={<div className="text-muted-foreground">Loading…</div>}>
        <BurnDashboardClient
          pastMonth={pastMonth ? { ...pastMonth, formatted: formatCents(pastMonth.amountCents, pastMonth.currency), breakdown: pastMonth.breakdown ?? null } : null}
          projected={projectedMonths.map((p) => ({
            ...p,
            formatted: formatCents(p.amountCents, currency),
          }))}
          currency={currency}
          initialCashFormatted={formatCents(initialCashCents, currency)}
          runningRemaining={runningRemaining.map((r) => ({ ...r, formatted: formatCents(r.remainingCents, currency) }))}
          runwayMonths={runwayMonths}
          currentMonthRevolutFormatted={currentMonthRevolutFormatted}
          currentMonthRevolutRevenueFormatted={currentMonthRevolutRevenueFormatted}
          pastMonthRevenue={pastMonthRevenueFormatted}
          previousMonthsBurn={previousMonthsBurn.map((r) => ({
            yearMonth: r.yearMonth,
            amountCents: r.amountCents,
            currency: r.currency,
            formatted: formatCents(r.amountCents, r.currency),
            hasBreakdown: !!r.breakdown,
          }))}
        />
      </Suspense>
      </div>
    </AppShell>
  );

