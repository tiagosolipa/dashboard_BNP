# KPI Cards
### Transaction Lifecycle Dashboard — BNP Paribas Securities Services

Five KPI cards sit at the top of the main content area, just below the filter bar. They provide an at-a-glance summary of the current state of the transaction pipeline based on whatever filters are active at the time.

All values update automatically every **60 seconds** and immediately on any filter change.

---

## The Five KPI Cards

### 1. Total Transactions ⬡
**What it shows:** The total count of all transactions in the current filtered dataset.

This is the entry point — the full universe of transactions being monitored, after any active filters are applied.

---

### 2. In Progress ⏳
**What it shows:** The number of transactions that have **not yet reached the Completed stage**.

This includes all transactions currently sitting at Capture, Confirmation, Settlement, or Reconciliation. It represents the active workload in the pipeline at this moment.

---

### 3. At Risk ⚠
**What it shows:** The number of transactions that are **overdue**, **critical** (less than 2 hours to cut-off), or flagged for **manual intervention**.

A transaction counts as At Risk if any one of these conditions is true:
- Its cut-off deadline has already passed (`riskStatus = overdue`)
- Its cut-off is less than 2 hours away (`riskStatus = critical`)
- It requires manual intervention (`manualIntervention = true`)

> **Visual alert:** When the At Risk count is greater than zero, this card takes on a red alert styling to draw immediate attention.

---

### 4. Manual Intervention ✋
**What it shows:** The number of transactions flagged as requiring manual action from the operations team.

These are transactions that cannot progress automatically through the STP (Straight-Through Processing) pipeline and need a human to intervene.

---

### 5. Completed ✔
**What it shows:** The number of transactions that have reached the **Completed** stage, along with the **STP Rate**.

**STP Rate** is calculated as:

```
STP Rate = (Completed transactions that are STP / Total completed transactions) × 100
```

A high STP rate indicates that most transactions are flowing through the lifecycle without manual touchpoints — a key operational efficiency metric.

---

## Click-to-Filter Behaviour

Every KPI card is **clickable**. Clicking a card activates a quick-filter that restricts the entire dashboard (all charts, the Risk & Alert Monitor, and the Transaction Register) to show only the transactions relevant to that KPI.

| Card Clicked | Filter Applied |
|---|---|
| Total Transactions | Shows all transactions (no extra restriction) |
| In Progress | Hides Completed transactions |
| At Risk | Shows only overdue, critical, and manual transactions |
| Manual Intervention | Shows only transactions flagged for manual intervention |
| Completed | Shows only Completed transactions |

**Visual feedback:**
- The active KPI card gets a highlighted/selected appearance.
- All other KPI cards are visually dimmed to show they are inactive.
- Clicking the same card again **deactivates** the filter (toggle behaviour) and returns to showing the full filtered dataset.

**Combining with the filter bar:** KPI quick-filters stack on top of any active filter bar selections. For example, clicking "At Risk" while the Asset Type filter is set to "FX" will show only at-risk FX transactions.

**Resetting:** Clicking the ↺ Reset button in the filter bar clears the KPI quick-filter along with all other filters.
