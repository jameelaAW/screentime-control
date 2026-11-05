# AI review of the Terms, Privacy and Refunds pages

Done on 5 November 2026 by an AI model. This is a consistency and gap check, not legal advice. Use the "Questions for a lawyer" list if you book a short lawyer check.

## Fixed in the pages
- Terms 7: said we would give a copy of records "if feasible, on request". Now says you can download it yourself from the Account page (matches the app).
- Terms 8A (new): phone alerts are best-effort and may arrive late or not at all. Added because the Terms did not mention alerts.

## Needs your decision (not changed)
1. **Who the seller is.** The pages say "MZDigitalbuys, trading as MZ Digital Buys". That reads as the same name twice. If MZDigitalbuys is a brand, the legal name should be your own full name or your registered business name, with MZDigitalbuys as the trading name. In Singapore a business trading under a name other than the owner's own name is normally registered with ACRA. Check this.
2. **Provider regions.** Privacy says Supabase is in Singapore and Resend is in Tokyo. Confirm both in the provider dashboards.
3. **Payhip refund effect.** Refunds page says Payhip disables the licence key on refund. Confirm this in Payhip with a test refund. Pausing the app account is still a manual step (docs/REFUNDS.md).
4. **Timer wording.** Terms 8 says an unstopped timer is closed at the daily limit or after 3 hours. Check this holds for accounts without phone alerts when the app is closed.

## Questions for a lawyer
- Is the liability cap (price paid, so SGD 0 for early accounts) reasonable under Singapore law (Unfair Contract Terms Act)?
- Does the Refund Policy meet the Consumer Protection (Fair Trading) Act for a digital product?
- PDPA: is the consent and notice wording enough, given the data is about children but supplied by an adult? Is a named data protection officer needed beyond the support email?
- PDPA transfer limitation: Is "we rely on providers' security commitments" enough for data held by Vercel, Resend, Payhip and others outside Singapore?
- Do we need to describe the push-alert text (it includes a child's first name) in more detail?
- Anything missing: ownership of data, intellectual property, assignment, force majeure.

## Checked and consistent with the app
- One licence key per account; early accounts keep access; delete-account is immediate; self-service download; push data is listed; the 3-hour timer guard; the price is SGD 5 on the Refunds page.
