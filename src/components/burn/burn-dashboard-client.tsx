"use client";

import { useState } from "react";

import { addOrUpdateBurn, addOrUpdateRevenue } from "@/app/burn/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function BurnBreakdownView({ breakdownJson, currency }: { breakdownJson: string; currency: string }) {
  const [open, setOpen] = useState(false);
  let data: {
    categories?: Array<{
      id?: string;
      name: string;
      total: number;
      type?: string;
      subcategories?: Array<{
        name: string;
        total: number;
        items?: Array<{ name: string; amount: number }>;
      }>;
    }>;
  };
  try {
    data = JSON.parse(breakdownJson) as typeof data;
  } catch {
    return <p className="text-muted-foreground text-sm">Invalid breakdown JSON.</p>;
  }
  const categories = data?.categories ?? [];
  if (categories.length === 0) return null;

  return (
    <div className="border rounded-none">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-full justify-between rounded-none"
        onClick={() => setOpen((o) => !o)}
      >
        View categories
        <span className="tabular-nums text-muted-foreground">{open ? "−" : "+"}</span>
      </Button>
      {open && (
        <div className="border-t px-3 py-2 text-sm max-h-80 overflow-auto">
          {categories.map((cat) => (
            <div key={(cat as { id?: string }).id ?? cat.name} className="mb-3">
              <div className="font-medium flex justify-between">
                <span>{cat.name}</span>
                <span className="tabular-nums">{formatMoney(cat.total, currency)}</span>
              </div>
              {cat.subcategories?.map((sub) => (
                <div key={sub.name} className="ml-3 mt-1">
                  <div className="text-muted-foreground flex justify-between">
                    <span>{sub.name}</span>
                    <span className="tabular-nums">{formatMoney(sub.total, currency)}</span>
                  </div>
                  {sub.items?.map((item) => (
                    <div key={item.name} className="ml-3 flex justify-between text-muted-foreground">
                      <span>{item.name}</span>
                      <span className="tabular-nums">{formatMoney(item.amount, currency)}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type PastMonth = {
  yearMonth: string;
  amountCents: number;
  currency: string;
  formatted: string;
  breakdown: string | null;
};

type Projected = {
  yearMonth: string;
  label: string;
  amountCents: number;
  formatted: string;
};

type RunningRemaining = { label: string; remainingCents: number; formatted: string };

type PastMonthRevenue = { yearMonth: string; amountCents: number; currency: string; formatted: string };

export function BurnDashboardClient({
  pastMonth,
  projected,
  currency,
  initialCashFormatted,
  runningRemaining,
  runwayMonths,
  currentMonthRevolutFormatted,
  pastMonthRevenue,
}: {
  pastMonth: PastMonth | null;
  projected: Projected[];
  currency: string;
  initialCashFormatted: string;
  runningRemaining: RunningRemaining[];
  runwayMonths: number | null;
  currentMonthRevolutFormatted: string | null;
  currentMonthRevolutRevenueFormatted: string | null;
  pastMonthRevenue: PastMonthRevenue | null;
  previousMonthsBurn: { yearMonth: string; amountCents: number; currency: string; formatted: string; hasBreakdown: boolean }[];
}) {
  const [editing, setEditing] = useState(false);
  const [editingRevenue, setEditingRevenue] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function onSubmit(formData: FormData) {
    setMessage(null);
    const result = await addOrUpdateBurn(formData);
    if (result.ok) {
      setMessage({ type: "ok", text: "Saved." });
      setEditing(false);
      window.location.reload();
    } else {
      setMessage({ type: "err", text: result.error });
    }
  }

  async function onSubmitRevenue(formData: FormData) {
    setMessage(null);
    const result = await addOrUpdateRevenue(formData);
    if (result.ok) {
      setMessage({ type: "ok", text: "Saved." });
      setEditingRevenue(false);
      window.location.reload();
    } else {
      setMessage({ type: "err", text: result.error });
    }
  }

  const thisMonth = new Date();
  const defaultYearMonth =
    thisMonth.getFullYear() +
    "-" +
    String(thisMonth.getMonth() + 1).padStart(2, "0");

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="rounded-none border-green-200 bg-green-50/50 dark:border-green-900/50 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="text-base text-green-800 dark:text-green-200">Revenue (live) — Revolut</CardTitle>
          <CardDescription>Money in so far this calendar month. Not confirmed until month end.</CardDescription>
        </CardHeader>
        <CardContent>
          {currentMonthRevolutRevenueFormatted != null ? (
            <p className="text-2xl font-semibold tabular-nums text-green-700 dark:text-green-300">
              {currentMonthRevolutRevenueFormatted}
            </p>
          ) : (
            <p className="text-muted-foreground text-sm">Set REVOLUT_* env to connect, or no inflows yet.</p>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-none">
        <CardHeader>
          <CardTitle className="text-base">Cash in bank</CardTitle>
          <CardDescription>Starting balance used for runway.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold tabular-nums">{initialCashFormatted}</p>
          <p className="text-muted-foreground mt-1 text-xs">Set BURN_INITIAL_CASH_CENTS in env (cents).</p>
        </CardContent>
      </Card>

      <Card className="rounded-none">
        <CardHeader>
          <CardTitle className="text-base">Runway at this rate</CardTitle>
          <CardDescription>Remaining after each projected month; months left at average burn.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {runwayMonths !== null ? (
            <p className="text-2xl font-semibold tabular-nums">{runwayMonths} months</p>
          ) : (
            <p className="text-muted-foreground text-sm">Add past month burn to see projection.</p>
          )}
          {runningRemaining.length > 0 && (
            <ul className="space-y-2 border-t pt-3 text-sm">
              {runningRemaining.map((r) => (
                <li key={r.label} className="flex justify-between">
                  <span className="text-muted-foreground">After {r.label}</span>
                  <span className="tabular-nums font-medium">{r.formatted}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-none">
        <CardHeader>
          <CardTitle className="text-base">Expenses (live) — Revolut</CardTitle>
          <CardDescription>Money out so far this calendar month. Not confirmed until month end.</CardDescription>
        </CardHeader>
        <CardContent>
          {currentMonthRevolutFormatted != null ? (
            <p className="text-2xl font-semibold tabular-nums">{currentMonthRevolutFormatted}</p>
          ) : (
            <p className="text-muted-foreground text-sm">Set REVOLUT_* env to connect, or no transactions yet.</p>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-none">
        <CardHeader>
          <CardTitle className="text-base">Revenue</CardTitle>
          <CardDescription>Past month revenue (reconciled).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pastMonthRevenue ? (
            <p className="text-2xl font-semibold tabular-nums">{pastMonthRevenue.formatted}</p>
          ) : (
            <p className="text-muted-foreground text-sm">No data for last month yet.</p>
          )}
          {!editingRevenue ? (
            <Button variant="outline" size="sm" className="rounded-none" onClick={() => setEditingRevenue(true)}>
              Add or edit month
            </Button>
          ) : (
            <form action={onSubmitRevenue} className="space-y-3">
              <div className="grid gap-2">
                <Label htmlFor="revYearMonth">Year-month (YYYY-MM)</Label>
                <Input
                  id="revYearMonth"
                  name="yearMonth"
                  defaultValue={pastMonthRevenue?.yearMonth ?? defaultYearMonth}
                  placeholder="2025-01"
                  className="rounded-none"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="revAmount">Amount</Label>
                <Input
                  id="revAmount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={pastMonthRevenue ? pastMonthRevenue.amountCents / 100 : ""}
                  placeholder="0"
                  className="rounded-none"
                />
              </div>
              <input type="hidden" name="currency" value={currency} />
              <div className="flex gap-2">
                <Button type="submit" size="sm" className="rounded-none">
                  Save
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-none"
                  onClick={() => setEditingRevenue(false)}
                >
                  Cancel
                </Button>
              </div>
              {message && (
                <p className={message.type === "err" ? "text-destructive text-sm" : "text-muted-foreground text-sm"}>
                  {message.text}
                </p>
              )}
            </form>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-none">
        <CardHeader>
          <CardTitle className="text-base">Past month burn</CardTitle>
          <CardDescription>Total burn for the previous calendar month.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pastMonth ? (
            <p className="text-2xl font-semibold tabular-nums">{pastMonth.formatted}</p>
          ) : (
            <p className="text-muted-foreground text-sm">No data for last month yet.</p>
          )}
          {pastMonth?.breakdown && !editing && (
            <BurnBreakdownView breakdownJson={pastMonth.breakdown} currency={currency} />
          )}
          {!editing ? (
            <Button variant="outline" size="sm" className="rounded-none" onClick={() => setEditing(true)}>
              Add or edit month
            </Button>
          ) : (
            <form action={onSubmit} className="space-y-3">
              <div className="grid gap-2">
                <Label htmlFor="yearMonth">Year-month (YYYY-MM)</Label>
                <Input
                  id="yearMonth"
                  name="yearMonth"
                  defaultValue={pastMonth?.yearMonth ?? defaultYearMonth}
                  placeholder="2025-01"
                  className="rounded-none"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={pastMonth ? pastMonth.amountCents / 100 : ""}
                  placeholder="0"
                  className="rounded-none"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="breakdown">Breakdown (JSON, optional)</Label>
                <textarea
                  id="breakdown"
                  name="breakdown"
                  rows={6}
                  className="rounded-none border bg-background px-3 py-2 text-sm font-mono"
                  placeholder='{"categories": [...]}'
                  defaultValue={pastMonth?.breakdown ?? ""}
                />
                <p className="text-muted-foreground text-xs">Paste full month JSON with categories, subcategories, items.</p>
              </div>
              <input type="hidden" name="currency" value={currency} />
              <div className="flex gap-2">
                <Button type="submit" size="sm" className="rounded-none">
                  Save
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-none"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
              </div>
              {message && (
                <p className={message.type === "err" ? "text-destructive text-sm" : "text-muted-foreground text-sm"}>
                  {message.text}
                </p>
              )}
            </form>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-none">
        <CardHeader>
          <CardTitle className="text-base">Projected burn (next 6 months)</CardTitle>
          <CardDescription>Based on average of recorded months.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {projected.map((p) => (
              <li key={p.yearMonth} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{p.label}</span>
                <span className="tabular-nums font-medium">{p.formatted}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="rounded-none md:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Previous months (reconciled)</CardTitle>
          <CardDescription>All months in the database. Add or edit via Past month burn or import JSON at month end.</CardDescription>
        </CardHeader>
        <CardContent>
          {previousMonthsBurn.length === 0 ? (
            <p className="text-muted-foreground text-sm">No previous months yet. Use Add or edit month or paste Claude JSON at month end.</p>
          ) : (
            <ul className="grid gap-2 text-sm sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {previousMonthsBurn.map((r) => (
                <li key={r.yearMonth} className="flex justify-between rounded-none border px-3 py-2">
                  <span className="text-muted-foreground">{r.yearMonth}</span>
                  <span className="tabular-nums font-medium">{r.formatted}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
