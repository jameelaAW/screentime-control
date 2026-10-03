// Rule-based usage scoring (no model calls). See docs/INTELLIGENCE_LAYER.md.
//
// NOTE: INTELLIGENCE_LAYER.md says amber starts at 0.8, but the PRD success scenario
// requires Mia at 90/120 (= 0.75) to read amber. The PRD scenario is the acceptance
// criterion, so amber starts at 0.75. Change AMBER_AT here to move the threshold.
export const AMBER_AT = 0.75;

export type UsageStatus = "green" | "amber" | "red";

export function usageRatio(total: number, limit: number): number {
  if (limit <= 0) return total > 0 ? Number.POSITIVE_INFINITY : 0;
  return total / limit;
}

export function usageStatus(total: number, limit: number): UsageStatus {
  const r = usageRatio(total, limit);
  if (r > 1) return "red";
  if (r >= AMBER_AT) return "amber";
  return "green";
}

export const STATUS_TEXT: Record<UsageStatus, string> = {
  green: "Within limit",
  amber: "Approaching limit",
  red: "Over limit",
};
