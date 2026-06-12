# Risk & Alert Monitor
### Transaction Lifecycle Dashboard — BNP Paribas Securities Services

The Risk & Alert Monitor sits below the charts section and above the Transaction Register. It is the **primary triage tool** on the dashboard — a prioritised, structured table of every transaction that currently requires attention.

---

## What Appears Here

A transaction appears in the Risk & Alert Monitor if **any one** of the following is true:
- Its cut-off deadline has passed → **Overdue**
- Its cut-off is less than 2 hours away → **Critical**
- It is flagged for manual intervention

The monitor shows **all qualifying transactions** with no cap on row count. The alert count badge (top right of the section header) always reflects the exact number of rows displayed.

If no transactions qualify, a green confirmation message is shown: *"✅ No active alerts — all transactions within SLA."*

---

## Sort Order

Rows are automatically sorted by severity, so the most urgent transactions always appear at the top:

1. **Risk status** — Overdue first, then Critical, then Manual
2. **Risk score** — Higher scores within each status group appear first
3. **Notional value (EUR)** — Higher value within the same score
4. **Stage weight** — Settlement > Reconciliation > Confirmation > Capture

This means the very first row is always the single most urgent, highest-value transaction requiring attention.

---

## Table Columns

### Priority
Displays an icon and text label indicating the urgency level.

| Icon | Label | Meaning |
|---|---|---|
| 🔴 | HIGH | Overdue or very high risk score |
| 🟡 | MEDIUM | Critical (near cut-off) or moderate risk |
| 🔵 | LOW | Manual intervention required, lower urgency |

Each row is also subtly colour-coded in the background based on its priority level.

---

### Transaction
Shows three pieces of information stacked together:
- **Transaction ID** — the unique identifier (e.g. `TX-00423`)
- **Asset badge** — colour-coded chip showing the asset type (Cash, FX, Derivatives, Money Markets, Securities)
- **Client name** — abbreviated to the first two words for readability

---

### Stage
A colour-coded badge showing the current workflow stage of the transaction.

| Stage | Badge Colour |
|---|---|
| Capture | Blue |
| Confirmation | Amber |
| Settlement | Red |
| Reconciliation | Purple |
| Completed | Green |

---

### Value (EUR)
The transaction's notional value converted to EUR. High-priority rows display this value in a bold red colour; medium-priority rows in amber, for immediate visual scanning.

---

### Cut-off Date
The date component of the transaction's cut-off deadline, formatted as DD/MM/YYYY.

- **Overdue** transactions show the date in red.
- **Critical** transactions show the date in amber.
- Transactions with no cut-off defined display a dash (—).

---

### Cut-off Time
The time component of the cut-off deadline (HH:MM, 24-hour format), colour-coded the same way as the date column.

---

### Alert Reason
A plain-language description of why this transaction is flagged. Examples:
- *"Cut-off passed 47 minutes ago"*
- *"Cut-off in 1h 12m — urgent action required"*
- *"Manual required"*
- *"No cut-off defined"*

Overdue reasons are styled in red; critical reasons in amber; manual reasons in purple.

---

### Risk Score
A composite score from **0 to 100** that quantifies the urgency of each transaction. Displayed as a horizontal progress bar and a numeric value side by side. The bar colour matches the priority (red / amber / blue).

#### How the Risk Score is Calculated

Clicking the **ⓘ info button** next to the "Risk Score" column header opens a popover explaining the formula in detail. The score has three components:

**⏰ Time Urgency (0–50 points)**

| Status | Points |
|---|---|
| Overdue | 50 pts |
| Critical (< 2 hours) | 35 pts |
| Warning (< 4 hours) | 15 pts |
| On Track | 0 pts |

**💶 Value Weight (0–30 points)**

Calculated as: `log₁₀(Notional €M + 1) × 20`, capped at 30 points. This means larger transactions score higher, but with diminishing returns — a €1B transaction doesn't score ten times more than a €100M one.

**🔄 Stage Weight (0–20 points)**

| Stage | Points |
|---|---|
| Settlement | 20 pts |
| Reconciliation | 15 pts |
| Confirmation | 10 pts |
| Capture | 5 pts |
| Completed | 0 pts |

The final score is: `Time Urgency + Value Weight + Stage Weight`, **capped at 100**. Higher scores mean more urgent action is required.

The ⓘ popover closes automatically when clicking anywhere outside it.

---

## Clicking a Row

Clicking **anywhere on an alert row** opens the **Transaction Detail modal** for that transaction.

The modal shows the full metadata, complete workflow timeline, and per-stage duration breakdown. See [06-transaction-detail-modal.md](./06-transaction-detail-modal.md) for full detail.

---

## Interaction with Filters

The Risk & Alert Monitor is fully filter-aware. If you apply a filter (e.g. Asset Type = FX), only at-risk FX transactions will appear in the monitor. The alert count badge updates accordingly.
