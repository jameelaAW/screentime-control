# Intelligence Layer

## Messy Inputs (later)
Free-text session notes: "Mia watched Bluey for a bit then played a game".
Goal: auto-split into device + activity + duration estimate.

## Auto-Structure Schema (later, JSON example)
```json
{
  "child_name": "Mia",
  "sessions": [
    {"activity": "video", "device": "tv", "duration_minutes": 20, "confidence": 0.82}
  ],
  "source": "note-parse",
  "review_status": "unreviewed"
}
```

## Events to Track
- session_logged, session_edited, session_deleted
- limit_approached (≥75% of daily_limit)
- limit_exceeded (>100%)
- child_added, limit_changed

## Scoring Rules (start rule-based, give numbers)
- **Usage ratio** = today_total / daily_limit_minutes.
  - < 0.75 → green
  - 0.75–1.0 → amber
  - > 1.0 → red
- **Weekly balance score** (later) = avg(usage_ratio) over 7 days; >1.2 flagged.
- **Activity mix** (later): educational <25% of weekly minutes → low score.

## What Gets Ranked
- Dashboard: children sorted by usage_ratio desc (closest to/over limit first).
- Later: daily report ranks children needing attention.

## v1 vs Later
- **v1:** rule-based limit colour + sort by ratio. No model calls.
- **Later:** free-note parsing, activity auto-tag (value+source+confidence+review_status), weekly balance insights, suggested schedule adjustments.
