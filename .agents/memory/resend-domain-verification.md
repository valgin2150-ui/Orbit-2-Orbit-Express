---
name: Resend domain verification
description: Provider verification timing behavior after email DNS records are published.
---

Resend domain verification may remain pending for several minutes after all required DNS records resolve publicly.

**Why:** During setup, DKIM and SPF records resolved correctly before Resend accepted mail from the domain; repeated verification calls also caused individual record statuses to temporarily return to pending.

**How to apply:** After confirming authoritative DNS is correct, avoid repeatedly restarting verification. Poll the domain status and use an actual send as the final acceptance test.