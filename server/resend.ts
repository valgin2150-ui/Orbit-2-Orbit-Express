import { Resend } from "resend";

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
  return {
    client: new Resend(apiKey),
    fromEmail: process.env.RESEND_FROM_EMAIL || "Orbit2Orbit Express <onboarding@resend.dev>",
  };
}
