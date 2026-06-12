# Transaction Detail Modal
### Transaction Lifecycle Dashboard — BNP Paribas Securities Services

The Transaction Detail modal provides a **deep-dive view** of a single transaction. It shows all metadata, a complete workflow timeline tracking the transaction through each lifecycle stage, and a per-stage duration chart.

---

## How to Open

The modal can be opened from three places:
1. **Clicking any row** in the Transaction Register
2. **Clicking any row** in the Risk & Alert Monitor
3. **Clicking any bar** in the "Top Transactions by Value at Risk" chart

---

## How to Close

The modal can be closed in three ways:
- Clicking the **✕ button** in the top-right corner of the modal
- Clicking **anywhere on the dark overlay** outside the modal
- Pressing the **Escape key**

When the modal is open, the page behind it is scroll-locked.

---

## Modal Header

The top of the modal shows:
- **Transaction ID** — large title (e.g. `TX-00423`)
- **Subtitle** — asset type and client name (e.g. `FX · Goldman Sachs Asset Management`)

---

## Metadata Grid

A structured grid of information fields displayed in three rows, four columns. Each field has a label and a value.

**Row 1 — Identity**

| Field | Description |
|---|---|
| Asset Type | The asset class of the transaction |
| Client | Full client name |
| Client ID | The client's internal identifier |
| Current Stage | Colour-coded stage badge |

**Row 2 — Risk & Cut-Off**

| Field | Description |
|---|---|
| Risk Status | Text label in colour matching urgency (green / yellow / amber / red) |
| Cut-off Date | Date component of the deadline (DD/MM/YYYY), styled red if overdue, amber if critical |
| Cut-off Time | Time component of the deadline (HH:MM), same colour styling |
| Time to Settlement | Countdown or elapsed time to/from the cut-off. Displayed in red if overdue, amber if critical |

**Row 3 — Financials & Priority**

| Field | Description |
|---|---|
| Notional | Transaction value in its original currency (e.g. `USD 45,000,000`) |
| EUR Equivalent | Notional converted to EUR, displayed with highlight styling |
| Priority | Priority level with icon (🔴 High / 🟡 Medium / 🟢 Low) and the Risk Score chip (e.g. `Score: 87/100`) |
| — | *(blank or additional context)* |

**Row 4 — Processing**

| Field | Description |
|---|---|
| Manual Intervention | "⚠ Required" if flagged, "None" otherwise |
| STP | "✔ STP" (green) or "✖ Non-STP" (styled accordingly) |
| Trade Date | The date the trade was booked |
| Total Lifecycle | Total time the transaction has been in the system, formatted as hours and minutes |

> **ⓘ Risk Score info button:** A small info button next to the Priority label opens the same risk score formula popover available in the Risk & Alert Monitor. See [04-risk-alert-monitor.md](./04-risk-alert-monitor.md) for the full formula breakdown.

---

## Workflow Timeline

Below the metadata grid, a vertical timeline traces the transaction through every stage of the post-trade lifecycle: **Capture → Confirmation → Settlement → Reconciliation → Completed**.

Each stage in the timeline shows:

**For completed/active stages:**
- Stage name (colour-coded to match the stage)
- **Entry timestamp** — when the transaction entered this stage
- **Exit timestamp** — when it left (omitted for the currently active stage)
- **Duration** — time spent at this stage (labelled *"X min so far"* if the stage is currently active)
- **Currently Active indicator** — a pulsing dot with the label *"Currently Active"* for the stage the transaction is in right now

**For future/pending stages:**
- Stage name displayed at reduced opacity
- Label: *"Pending"*

This makes it immediately clear how far a transaction has progressed and how long it has spent at each step.

---

## Time per Stage Breakdown Chart

Directly below the workflow timeline, a vertical bar chart visualises the **duration at each processing stage** (Capture, Confirmation, Settlement, Reconciliation) as a bar.

- The **longest stage is highlighted in red** — this is the stage where this specific transaction has spent the most time.
- Data labels above each bar show the formatted duration.
- Bars for stages not yet reached show zero / a dash.
- Hovering over a bar shows the formatted duration in a tooltip.

**Use case:** At a glance, identify which step in the lifecycle was (or is) the bottleneck for this specific transaction.
