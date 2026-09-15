import { ReplitConnectors } from "@replit/connectors-sdk";
import fs from "fs";
import path from "path";
import { getUncachableResendClient } from "./resend";

const SHEET_ID_FILE = path.resolve("./sheets-id.json");

function loadSheetId(): string | null {
  try {
    if (fs.existsSync(SHEET_ID_FILE)) {
      const data = JSON.parse(fs.readFileSync(SHEET_ID_FILE, "utf8"));
      return data.spreadsheetId || null;
    }
  } catch {}
  return null;
}

function saveSheetId(id: string) {
  try {
    fs.writeFileSync(SHEET_ID_FILE, JSON.stringify({ spreadsheetId: id }), "utf8");
  } catch (err) {
    console.error("[SHEETS] Failed to save spreadsheet ID:", err);
  }
}

async function getOrCreateSpreadsheet(): Promise<string> {
  const existing = loadSheetId();
  if (existing) return existing;

  const connectors = new ReplitConnectors();

  const res = await connectors.proxy("google-sheet", "/v4/spreadsheets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      properties: { title: "Orbit to Orbit Express — Mission Intakes" },
      sheets: [{
        properties: { title: "Intakes" },
        data: [{
          startRow: 0,
          startColumn: 0,
          rowData: [{
            values: [
              "ID", "Submitted At", "Name", "Email", "Organization",
              "Payload Type", "Payload Mass (kg)", "Destination",
              "Timeline", "Challenges", "Additional Context", "Phone",
              "Website", "Mission Objective", "Mission Success",
              "Payload Dimensions", "Form Factor", "Desired Altitude",
              "Desired Inclination", "Mission Maturity", "Spacecraft Status",
              "Technical Requirements", "Special Handling", "Regulatory Status",
              "Earliest Flight Date", "Latest Useful Date", "Timing Flexibility",
              "Funding Status", "Biggest Question"
            ].map(v => ({ userEnteredValue: { stringValue: v } }))
          }]
        }]
      }]
    }),
  });

  const data = await res.json() as { spreadsheetId: string };
  const spreadsheetId = data.spreadsheetId;
  saveSheetId(spreadsheetId);
  console.log(`[SHEETS] Created CRM spreadsheet: https://docs.google.com/spreadsheets/d/${spreadsheetId}`);
  return spreadsheetId;
}

export async function appendIntakeToSheet(intake: {
  id: number;
  name: string;
  email: string;
  phone: string;
  organization?: string;
  website?: string;
  missionObjective?: string;
  missionSuccess?: string;
  payloadType: string;
  payloadMass?: string;
  payloadDimensions?: string;
  formFactor?: string;
  destination: string;
  desiredAltitude?: string;
  desiredInclination?: string;
  timeline: string;
  earliestFlightDate?: string;
  latestFlightDate?: string;
  timingFlexible?: string;
  missionMaturity?: string;
  spacecraftStatus?: string;
  technicalRequirements: string[];
  specialHandling: string[];
  regulatoryStatus: string[];
  budgetRange?: string;
  challenges: string[];
  biggestQuestion?: string;
  additionalContext?: string;
}): Promise<void> {
  const connectors = new ReplitConnectors();
  const spreadsheetId = await getOrCreateSpreadsheet();

  const headerRes = await connectors.proxy(
    "google-sheet",
    `/v4/spreadsheets/${spreadsheetId}/values/Intakes!L1?valueInputOption=RAW`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values: [["Phone"]] }),
    }
  );
  if (!headerRes.ok) {
    const text = await headerRes.text();
    throw new Error(`Sheets phone header update failed (${headerRes.status}): ${text}`);
  }

  const extendedHeaders = [
    "Website", "Mission Objective", "Mission Success", "Payload Dimensions",
    "Form Factor", "Desired Altitude", "Desired Inclination", "Mission Maturity",
    "Spacecraft Status", "Technical Requirements", "Special Handling",
    "Regulatory Status", "Earliest Flight Date", "Latest Useful Date",
    "Timing Flexibility", "Funding Status", "Biggest Question",
  ];
  const extendedHeaderRes = await connectors.proxy(
    "google-sheet",
    `/v4/spreadsheets/${spreadsheetId}/values/Intakes!M1:AC1?valueInputOption=RAW`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values: [extendedHeaders] }),
    }
  );
  if (!extendedHeaderRes.ok) {
    const text = await extendedHeaderRes.text();
    throw new Error(`Sheets mission headers update failed (${extendedHeaderRes.status}): ${text}`);
  }

  const row = [
    String(intake.id),
    new Date().toISOString(),
    intake.name,
    intake.email,
    intake.organization || "",
    intake.payloadType,
    intake.payloadMass || "",
    intake.destination,
    intake.timeline,
    intake.challenges.join(", "),
    intake.additionalContext || "",
    intake.phone,
    intake.website || "",
    intake.missionObjective || "",
    intake.missionSuccess || "",
    intake.payloadDimensions || "",
    intake.formFactor || "",
    intake.desiredAltitude || "",
    intake.desiredInclination || "",
    intake.missionMaturity || "",
    intake.spacecraftStatus || "",
    intake.technicalRequirements.join(", "),
    intake.specialHandling.join(", "),
    intake.regulatoryStatus.join(", "),
    intake.earliestFlightDate || "",
    intake.latestFlightDate || "",
    intake.timingFlexible || "",
    intake.budgetRange || "",
    intake.biggestQuestion || "",
  ];

  const res = await connectors.proxy(
    "google-sheet",
    `/v4/spreadsheets/${spreadsheetId}/values/Intakes!A:AC:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values: [row] }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Sheets append failed (${res.status}): ${text}`);
  }

  console.log(`[SHEETS] Logged intake #${intake.id} for ${intake.email}`);

  // Backup email — sent after confirmed Sheets write
  try {
    const { client, fromEmail } = await getUncachableResendClient();
    const safe = (value?: string) =>
      (value || "—").replace(/[&<>"']/g, character => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
      })[character] || character);
    const safeList = (items: string[]) => safe(items.join(", ") || "—");
    await client.emails.send({
      from: fromEmail,
      to: "vlad@orbit2orbitexpress.com",
      replyTo: intake.email,
      subject: `CRM Updated — ${intake.organization || "Independent"} — ${intake.payloadType}`,
      html: `
        <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff">
          <div style="background:#1a1a1a;padding:20px 24px;display:flex;align-items:center;gap:12px">
            <span style="color:#e3000f;font-size:18px;font-weight:bold">O2O</span>
            <span style="color:#fff;font-size:14px">New mission intake logged to CRM</span>
          </div>
          <div style="padding:24px">
            <table style="width:100%;border-collapse:collapse;font-size:13px">
              <tr><td style="padding:6px 0;color:#666;width:160px">Contact</td><td style="padding:6px 0;font-weight:600">${safe(intake.name)} · ${safe(intake.email)} · ${safe(intake.phone)}</td></tr>
              <tr><td style="padding:6px 0;color:#666">Organization</td><td style="padding:6px 0">${safe(intake.organization)}${intake.website ? ` · ${safe(intake.website)}` : ""}</td></tr>
              <tr><td style="padding:6px 0;color:#666;vertical-align:top">Mission objective</td><td style="padding:6px 0">${safe(intake.missionObjective)}<br><strong>Success:</strong> ${safe(intake.missionSuccess)}</td></tr>
              <tr><td style="padding:6px 0;color:#666;vertical-align:top">Payload</td><td style="padding:6px 0">${safe(intake.payloadType)}${intake.payloadMass ? ` · ${safe(intake.payloadMass)} kg` : ""}<br>${safe(intake.payloadDimensions)} · ${safe(intake.formFactor)}<br><strong>Maturity:</strong> ${safe(intake.missionMaturity)} · <strong>Spacecraft:</strong> ${safe(intake.spacecraftStatus)}</td></tr>
              <tr><td style="padding:6px 0;color:#666">Destination / orbit</td><td style="padding:6px 0">${safe(intake.destination)} · ${safe(intake.desiredAltitude)} · ${safe(intake.desiredInclination)}</td></tr>
              <tr><td style="padding:6px 0;color:#666">Timing</td><td style="padding:6px 0">${safe(intake.timeline)} · ${safe(intake.earliestFlightDate)} to ${safe(intake.latestFlightDate)} · ${safe(intake.timingFlexible)}</td></tr>
              <tr><td style="padding:6px 0;color:#666;vertical-align:top">Technical requirements</td><td style="padding:6px 0">${safeList(intake.technicalRequirements)}</td></tr>
              <tr><td style="padding:6px 0;color:#666;vertical-align:top">Special / regulatory</td><td style="padding:6px 0">${safeList(intake.specialHandling)}<br>${safeList(intake.regulatoryStatus)}</td></tr>
              <tr><td style="padding:6px 0;color:#666">Funding</td><td style="padding:6px 0">${safe(intake.budgetRange)}</td></tr>
              <tr><td style="padding:6px 0;color:#666;vertical-align:top">Challenges</td><td style="padding:6px 0">${safeList(intake.challenges)}</td></tr>
              <tr><td style="padding:6px 0;color:#666;vertical-align:top">Biggest question</td><td style="padding:6px 0">${safe(intake.biggestQuestion)}</td></tr>
              <tr><td style="padding:6px 0;color:#666;vertical-align:top">Additional notes</td><td style="padding:6px 0">${safe(intake.additionalContext)}</td></tr>
            </table>
            <div style="margin-top:20px;border-top:1px solid #eee;padding-top:16px;display:flex;gap:12px">
              <a href="https://docs.google.com/spreadsheets/d/${spreadsheetId}" style="background:#e3000f;color:#fff;text-decoration:none;padding:8px 16px;font-size:12px;font-weight:600">Open CRM Sheet →</a>
              <a href="mailto:${encodeURIComponent(intake.email)}?subject=${encodeURIComponent(`Re: Your mission brief — ${intake.payloadType} to ${intake.destination}`)}" style="border:1px solid #e3000f;color:#e3000f;text-decoration:none;padding:8px 16px;font-size:12px;font-weight:600">Reply to ${safe(intake.name)} →</a>
            </div>
          </div>
          <div style="background:#f5f5f5;padding:12px 24px;font-size:11px;color:#999">
            Orbit to Orbit Express · orbit2orbitexpress.com · Intake #${intake.id}
          </div>
        </div>
      `,
    });
    console.log(`[SHEETS] Backup email sent for intake #${intake.id}`);
  } catch (emailErr) {
    console.error("[SHEETS] Backup email failed:", emailErr);
  }
}
