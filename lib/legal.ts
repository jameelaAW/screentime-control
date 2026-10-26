// The facts and choices the legal pages (/privacy, /terms, /refunds) depend on, in ONE place.
// A value of null means "not decided yet": the page shows a highlighted [to be confirmed].
// The drafted suggestion for each value is in the comment beside it. Nothing here is legal advice.

/**
 * Flip to true only when (1) every value below is filled in and (2) a lawyer has reviewed the pages.
 * While false, the pages show a "draft, not yet in force" banner, ask search engines to ignore them,
 * and the sign-in / sign-up screens do not link to them.
 */
export const LEGAL_FINAL = false;

export const legal = {
  supportEmail: 'support@mzdigitalbuys.com',
  legalName: null as string | null,              // your full legal name or business name
  effectiveDate: null as string | null,          // e.g. '1 November 2026'
  governingLaw: null as string | null,           // drafted: 'Singapore'
  refundDays: null as number | null,             // drafted: 7
  fixBusinessDays: null as number | null,        // drafted: 3
  replyBusinessDays: null as number | null,      // drafted: 2
  minAccessMonths: null as number | null,        // drafted: 12
  closureNoticeDays: null as number | null,      // drafted: 30
  historyRetentionMonths: null as number | null, // drafted: 12
  deleteWithinDays: null as number | null,       // drafted: 30
  backupDays: null as number | null,             // drafted: 30
};
