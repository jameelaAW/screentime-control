# Agentic Layer

## Risk Levels
- **Low (auto):** tag a session's activity_type from a note; compute usage score; summarise weekly usage.
- **Medium (light approval):** draft a reminder to caregiver when a child approaches limit; update a child's suggested daily limit — caregiver approves before save.
- **High (always approval):** send a push/email alert to a parent; create a recurring schedule change.
- **Critical (human-only):** delete a child profile; bulk delete sessions; any data export of child records.

## Draftable Actions (low/medium)
- Draft suggested daily_limit_minutes per child based on age + 7-day usage (medium → caregiver approves).
- Draft weekly summary text (low → auto, shown as draft, editable).
- Draft reminder message: "Mia is at 100/120 min today" (medium → approve to send).

## Executable After Approval
- Apply suggested limit change to child row.
- Send approved reminder.

## Human-Only
- Delete child, delete session, export data — never automated.

## Named Tools (approved only, never raw run_any)
- `tag_session_activity` (input: note text → output: structured tag + confidence).
- `draft_limit_suggestion` (input: child_id → output: int minutes + rationale).
- `draft_reminder` (input: child_id → output: message text).
- `send_reminder` (high → requires explicit approval flag).
No shell/file/raw-HTTP tools.

## Audit Log Fields (per agentic action)
action, entity_type, entity_id, tool_name, input_summary, output_summary, confidence, approval_status, approved_by, created_at.

## v1 vs Later
- **v1:** none. Pure CRUD + rule-based limits.
- **Later:** tag_session_activity (low auto), draft_limit_suggestion (medium), draft_reminder (medium), send_reminder (high).