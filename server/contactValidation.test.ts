import assert from "node:assert/strict";
import test from "node:test";
import { insertMissionIntakeSchema } from "@shared/schema";
import { assertEmailSent } from "./resend";

const validIntake = {
  name: "Mission Owner",
  email: "owner@example.com",
  phone: "+1 (555) 123-4567",
  payloadType: "Research payload",
  destination: "LEO",
  timeline: "Within 12 months",
  challenges: [],
};

test("mission intake requires a valid email and phone number", () => {
  assert.equal(insertMissionIntakeSchema.safeParse(validIntake).success, true);
  assert.equal(
    insertMissionIntakeSchema.safeParse({ ...validIntake, email: "invalid" }).success,
    false,
  );
  assert.equal(
    insertMissionIntakeSchema.safeParse({ ...validIntake, phone: "call me" }).success,
    false,
  );
  assert.equal(
    insertMissionIntakeSchema.safeParse({ ...validIntake, phone: undefined }).success,
    false,
  );
});

test("mission intake accepts expanded optional brief details", () => {
  const result = insertMissionIntakeSchema.safeParse({
    ...validIntake,
    website: "https://example.com/project",
    missionObjective: "Demonstrate a new sensor in orbit.",
    missionSuccess: "Collect a complete calibration dataset.",
    missionMaturity: "Prototype",
    technicalRequirements: ["Power requirements"],
    specialHandling: ["Batteries"],
    regulatoryStatus: ["Need help understanding requirements"],
    earliestFlightDate: "2027-01-01",
    latestFlightDate: "2028-12-31",
    timingFlexible: "Some flexibility",
    biggestQuestion: "Which mission architecture fits the objective?",
  });
  assert.equal(result.success, true);
});

test("email delivery is successful only when Resend returns a message id", () => {
  assert.equal(assertEmailSent({ data: { id: "email_123" }, error: null }), "email_123");
  assert.throws(() => assertEmailSent({ data: null, error: { message: "rejected" } }));
  assert.throws(() => assertEmailSent({ data: null, error: null }));
});