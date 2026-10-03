# Test Plan (v1)

## Success Scenario — Manual Steps
1. Open app URL in a fresh browser (logged out). Expect: dashboard loads with 4 demo children, usage bars visible. NOT a login page.
2. Verify bars show green/amber/red relative to daily_limit_minutes.
3. Click **Log Session**.
4. Select child "Mia", device "Tablet", activity "Educational", start = today 10:00, duration 30 min, note "ABC app".
5. Click **Save**. Expect: success toast, modal closes.
6. Dashboard refreshes; Mia's total increases by 30; bar colour updates.
7. Reload page. Expect: the new session still listed (server truth survives refresh).
8. Check Supabase `screen_sessions` has the new row; `audit_logs` has a create entry.

## Empty State
- Delete all children (or fresh DB). Open dashboard. Expect: friendly empty message + **Add a child** CTA, no broken bars.

## Error State
- Temporarily break Supabase URL (or disconnect network). Log a session. Expect: visible error toast "Couldn't save — try again", no silent fail, no stale optimistic UI.

## Validation
- Try duration = 0 or negative → blocked with message.
- Try to save session with no child selected → blocked.
- Try daily_limit < 0 → blocked.

## Loading State
- Throttle network to slow 3G. Open dashboard. Expect: skeleton bars, not blank screen.

## Edit/Delete
- Edit an existing session's duration → total updates, audit log has update entry.
- Delete a session → total drops, audit log has delete entry.

## Responsive
- Resize to mobile width. Expect: sidebar collapses to hamburger; Log Session form stacks; bars stay readable.