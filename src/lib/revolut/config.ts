"use server";

const REVOLUT_CLIENT_ID = process.env.REVOLUT_CLIENT_ID;
const REVOLUT_JWT_ISSUER = process.env.REVOLUT_JWT_ISSUER;
const REVOLUT_PRIVATE_KEY = process.env.REVOLUT_PRIVATE_KEY;

export function getRevolutConfig(): {
  clientId: string;
  issuer: string;
  privateKey: string;
} {
  if (!REVOLUT_CLIENT_ID?.trim()) {
    throw new Error("REVOLUT_CLIENT_ID is required. Set it in .env.local and in Vercel.");
  }
  if (!REVOLUT_JWT_ISSUER?.trim()) {
    throw new Error("REVOLUT_JWT_ISSUER is required (e.g. throxy-burndashboard.throxy.ai). Set it in .env.local and in Vercel.");
  }
  const raw = REVOLUT_PRIVATE_KEY ?? "";
  const privateKey = raw.replace(/\\n/g, "\n").trim();
  if (!privateKey || !privateKey.includes("-----BEGIN")) {
    throw new Error("REVOLUT_PRIVATE_KEY is required (full PEM including -----BEGIN/END-----). Set it in .env.local and in Vercel.");
  }
  return {
    clientId: REVOLUT_CLIENT_ID.trim(),
    issuer: REVOLUT_JWT_ISSUER.trim(),
    privateKey,
  };
}

export const REVOLUT_API_BASE = "https://b2b.revolut.com/api/1.0";
