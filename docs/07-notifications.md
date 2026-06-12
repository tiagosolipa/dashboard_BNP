# Notifications
### Transaction Lifecycle Dashboard — BNP Paribas Securities Services

The notification system provides a persistent, real-time alert bell in the dashboard header, giving operators instant awareness of high-priority issues without needing to scroll down to the Risk & Alert Monitor.

---

## The Notification Bell

A **bell icon (🔔)** is injected into the header bar by `notifications.js`, positioned between the Live badge and the real-time clock.

When there are active alerts, the bell displays a **red badge** showing the count of unread/active notifications. If there are no alerts, the badge is hidden.

---

## Opening the Notification Panel

**Clicking the bell icon** opens a dropdown notification panel directly below the header.

The panel is a scrollable list of alert cards, one per flagged transaction. It can be closed by:
- Clicking the bell icon again
- Clicking anywhere outside the panel

---

## What Triggers a Notification

A notification is generated for each transaction that meets **any** of the following conditions:

| Condition | Notification Type |
|---|---|
| Cut-off deadline has passed | 🔴 Overdue |
| Cut-off is less than 2 hours away | 🟠 Critical |
| Manual intervention required | 🟣 Manual |

These are the same conditions that drive the Risk & Alert Monitor — the notifications are a header-level shortcut to the same underlying alert set.

---

## Notification Card Contents

Each card in the panel shows:
- **Priority icon** — 🔴 (High), 🟡 (Medium), or 🔵 (Low)
- **Transaction ID** — the unique identifier
- **Asset type badge** — colour-coded chip
- **Client name** — abbreviated
- **Current stage badge**
- **Alert reason** — a plain-language description (e.g. *"Cut-off passed 23 minutes ago"*, *"Cut-off in 55m — urgent"*, *"Manual intervention required"*)
- **Cut-off time** — if applicable

Cards are sorted by the same priority order as the Risk & Alert Monitor: overdue first, then critical, then manual, with higher risk scores surfaced first within each group.

---

## Badge Count

The badge on the bell icon always matches the total number of transactions currently in an alert state. It updates in sync with the auto-refresh cycle (every 60 seconds) and immediately when any filter is changed.

---

## Relationship to the Risk & Alert Monitor

The notification bell and the Risk & Alert Monitor are two views of the same data:

- The **bell** is a compact, always-visible header shortcut — useful for a quick check without scrolling.
- The **Risk & Alert Monitor** is the full detailed table with risk scores, cut-off dates, EUR values, and click-through to the Transaction Detail modal.

Clicking a notification card in the panel opens the full **Transaction Detail modal** for that transaction — the same as clicking a row in the Risk & Alert Monitor.

---

## Live Badge

Separately from the notification bell, the header also displays a **"Live" badge** with a pulsing green dot, confirming that the dashboard is actively running and will auto-refresh. This is a static indicator — it does not reflect any specific transaction state.

---

## Header Clock

The header clock (next to the notification bell) displays the current local time and date in real time, updating every second:

```
HH:MM:SS · Day, DD Mon
```

For example: `14:32:07 · Fri, 13 Jun`

This helps operators correlate cut-off times visible in the alerts and table against the current time without checking an external clock.
