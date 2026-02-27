import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { monthlyBurn, monthlyRevenue } from "@/lib/db/schema";

export interface MonthlyBurnRow {
  id: number;
  yearMonth: string;
  amountCents: number;
  currency: string;
  notes: string | null;
  breakdown: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const YEAR_MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

export function parseYearMonth(value: string): string | null {
  if (!YEAR_MONTH_REGEX.test(value)) return null;
  return value;
}

export function toYearMonth(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export async function getMonthlyBurnRecords(limit = 24): Promise<MonthlyBurnRow[]> {
  const rows = await db
    .select()
    .from(monthlyBurn)
    .orderBy(desc(monthlyBurn.yearMonth))
    .limit(limit);
  return rows as MonthlyBurnRow[];
}

export async function getBurnForYearMonth(yearMonth: string): Promise<MonthlyBurnRow | undefined> {
  const rows = await db.select().from(monthlyBurn).where(eq(monthlyBurn.yearMonth, yearMonth)).limit(1);
  return rows[0] as MonthlyBurnRow | undefined;
}

export async function getPastMonthBurn(): Promise<{
  yearMonth: string;
  amountCents: number;
  currency: string;
  breakdown: string | null;
} | null> {
  const now = new Date();
  const past = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const yearMonth = toYearMonth(past);
  const row = await getBurnForYearMonth(yearMonth);
  if (!row) return null;
  return {
    yearMonth: row.yearMonth,
    amountCents: row.amountCents,
    currency: row.currency,
    breakdown: row.breakdown ?? null,
  };
}

export async function getBurnHistoryForProjection(months = 6): Promise<MonthlyBurnRow[]> {
  const rows = await db
    .select()
    .from(monthlyBurn)
    .orderBy(desc(monthlyBurn.yearMonth))
    .limit(months);
  return rows as MonthlyBurnRow[];
}

export async function upsertMonthlyBurn(data: {
  yearMonth: string;
  amountCents: number;
  currency?: string;
  notes?: string | null;
  breakdown?: string | null;
}): Promise<MonthlyBurnRow> {
  const existing = await getBurnForYearMonth(data.yearMonth);
  const currency = data.currency ?? "USD";
  const notes = data.notes ?? null;
  const breakdown = data.breakdown ?? null;

  if (existing) {
    const [updated] = await db
      .update(monthlyBurn)
      .set({ amountCents: data.amountCents, currency, notes, breakdown, updatedAt: new Date() })
      .where(eq(monthlyBurn.id, existing.id))
      .returning();
    return updated as MonthlyBurnRow;
  }

  const [inserted] = await db
    .insert(monthlyBurn)
    .values({ yearMonth: data.yearMonth, amountCents: data.amountCents, currency, notes, breakdown })
    .returning();
  return inserted as MonthlyBurnRow;
}

export interface MonthlyRevenueRow {
  id: number;
  yearMonth: string;
  amountCents: number;
  currency: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function getRevenueForYearMonth(yearMonth: string): Promise<MonthlyRevenueRow | undefined> {
  const rows = await db.select().from(monthlyRevenue).where(eq(monthlyRevenue.yearMonth, yearMonth)).limit(1);
  return rows[0] as MonthlyRevenueRow | undefined;
}

export async function getPastMonthRevenue(): Promise<{ yearMonth: string; amountCents: number; currency: string } | null> {
  const now = new Date();
  const past = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const yearMonth = toYearMonth(past);
  const row = await getRevenueForYearMonth(yearMonth);
  if (!row) return null;
  return { yearMonth: row.yearMonth, amountCents: row.amountCents, currency: row.currency };
}

export async function upsertMonthlyRevenue(data: {
  yearMonth: string;
  amountCents: number;
  currency?: string;
  notes?: string | null;
}): Promise<MonthlyRevenueRow> {
  const existing = await getRevenueForYearMonth(data.yearMonth);
  const currency = data.currency ?? "USD";
  const notes = data.notes ?? null;
  if (existing) {
    const [updated] = await db
      .update(monthlyRevenue)
      .set({ amountCents: data.amountCents, currency, notes, updatedAt: new Date() })
      .where(eq(monthlyRevenue.id, existing.id))
      .returning();
    return updated as MonthlyRevenueRow;
  }
  const [inserted] = await db
    .insert(monthlyRevenue)
    .values({ yearMonth: data.yearMonth, amountCents: data.amountCents, currency, notes })
    .returning();
  return inserted as MonthlyRevenueRow;
}
