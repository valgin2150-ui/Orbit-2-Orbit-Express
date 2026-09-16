import { Resend } from "resend";

const EMAIL_ADDRESS_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const DISPLAY_EMAIL_PATTERN = /^(.+?)\s*<([^<>\s]+@[^<>\s]+)>$/;
const DEFAULT_FROM_EMAIL = "Orbit2Orbit Express <noreply@orbit2orbitexpress.com>";

/**
 * Validate the configured sender without exposing the configured value in errors.
 * Resend accepts either a bare address or a display name followed by an address.
 */
export function validateSenderEmail(value: string): string {
  let trimmed = value.trim()
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
  const matchingWrapper =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith("`") && trimmed.endsWith("`"));
  if (matchingWrapper) {
    trimmed = trimmed.slice(1, -1).trim();
  }
  const displayMatch = trimmed.match(DISPLAY_EMAIL_PATTERN);
  const address = displayMatch ? displayMatch[2] : trimmed;

  if (
    !address ||
    address.includes("\r") ||
    address.includes("\n") ||
    (!EMAIL_ADDRESS_PATTERN.test(address) || (displayMatch && !displayMatch[1].trim()))
  ) {
    throw new Error('RESEND_FROM_EMAIL must be a valid email address or "Name <email@domain>"');
  }

  return trimmed;
}

export function resolveSenderEmail(value: string | undefined): string {
  if (!value) return DEFAULT_FROM_EMAIL;
  try {
    return validateSenderEmail(value);
  } catch {
    console.warn("[EMAIL] RESEND_FROM_EMAIL is invalid; using the verified-domain sender");
    return DEFAULT_FROM_EMAIL;
  }
}

export function assertEmailSent(result: { data?: { id?: string } | null; error?: unknown | null }) {
  if (result.error || !result.data?.id) {
    const detail = result.error instanceof Error
      ? result.error.message
      : JSON.stringify(result.error || "Resend returned no message id");
    throw new Error(`Email delivery failed: ${detail}`);
  }
  return result.data.id;
}

// Never cache — always read the env var fresh so key rotations take effect immediately
export async function getUncachableResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }
  const configuredFromEmail = process.env.RESEND_FROM_EMAIL;
  return {
    client: new Resend(apiKey),
    fromEmail: resolveSenderEmail(configuredFromEmail),
  };
}
