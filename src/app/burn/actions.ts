"use server";

import { revalidatePath } from "next/cache";

import { parseYearMonth, upsertMonthlyBurn, upsertMonthlyRevenue } from "@/lib/db/burn";

export type AddBurnResult = { ok: true } | { ok: false; error: string };

export async function addOrUpdateBurn(formData: FormData): Promise<AddBurnResult> {
  const yearMonthRaw = formData.get("yearMonth");
  const amountRaw = formData.get("amount");
  const currency = (formData.get("currency") as string) || "USD";
  const notes = (formData.get("notes") as string) || null;

  if (typeof yearMonthRaw !== "string" || typeof amountRaw !== "string") {
    return { ok: false, error: "Year/month and amount are required." };
  }

  const yearMonth = parseYearMonth(yearMonthRaw.trim());
  if (!yearMonth) {
    return { ok: false, error: "Year/month must be YYYY-MM." };
  }

  const amount = Number(amountRaw.trim());
  if (!Number.isFinite(amount) || amount < 0) {
    return { ok: false, error: "Amount must be a non-negative number." };
  }

  const amountCents = Math.round(amount * 100);

  const breakdownRaw = formData.get("breakdown");
  const breakdown =
    typeof breakdownRaw === "string" && breakdownRaw.trim() ? breakdownRaw.trim() : null;

  await upsertMonthlyBurn({ yearMonth, amountCents, currency, notes, breakdown });
  revalidatePath("/burn");
  return { ok: true };
}

export async function addOrUpdateRevenue(formData: FormData): Promise<AddBurnResult> {
  const yearMonthRaw = formData.get("yearMonth");
  const amountRaw = formData.get("amount");
  const currency = (formData.get("currency") as string) || "USD";
  const notes = (formData.get("notes") as string) || null;

  if (typeof yearMonthRaw !== "string" || typeof amountRaw !== "string") {
    return { ok: false, error: "Year/month and amount are required." };
  }

  const yearMonth = parseYearMonth(yearMonthRaw.trim());
  if (!yearMonth) {
    return { ok: false, error: "Year/month must be YYYY-MM." };
  }

  const amount = Number(amountRaw.trim());
  if (!Number.isFinite(amount) || amount < 0) {
    return { ok: false, error: "Amount must be a non-negative number." };
  }

  const amountCents = Math.round(amount * 100);

  await upsertMonthlyRevenue({ yearMonth, amountCents, currency, notes });
  revalidatePath("/burn");
  return { ok: true };
}
