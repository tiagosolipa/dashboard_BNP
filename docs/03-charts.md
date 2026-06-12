# Charts
### Transaction Lifecycle Dashboard — BNP Paribas Securities Services

The dashboard contains seven charts arranged below the KPI cards. All charts are **filter-aware** — they re-render whenever any filter changes to reflect the current dataset. Built with [ApexCharts](https://apexcharts.com/).

---

## Chart 1 — Transaction Volume by Stage

**Type:** Vertical bar chart  
**Location:** Top row, left (wide)

Shows how many transactions are currently sitting at each stage of the post-trade lifecycle.

**Stages displayed:**
- Capture
- Confirmation
- Settlement
- Reconciliation
- Completed

Each bar is colour-coded by stage (blue, amber, red, purple, green). The count is shown as a data label above each bar. Hovering over a bar shows a tooltip with the exact count.

**Use case:** Quickly identify where volume is concentrated in the pipeline. If Settlement has a disproportionately high count, for example, that signals a potential jam.

---

## Chart 2 — Asset Mix

**Type:** Donut chart  
**Location:** Top row, right (narrow)

Shows the distribution of transactions across asset classes as a percentage of the total count.

**Asset classes:**
- Cash
- FX
- Derivatives
- Money Markets
- Securities

The centre of the donut shows the total transaction count. A legend below the chart identifies each segment. Hovering shows the count and percentage for that asset type.

**Use case:** Understand which asset classes dominate the current pipeline and whether the mix has shifted from typical patterns.

---

## Chart 3 — Avg. Processing Time per Stage

**Type:** Horizontal bar chart  
**Location:** Second row, left

Shows the **average time (in minutes)** that transactions have spent at each processing stage — Capture, Confirmation, Settlement, and Reconciliation.

**Special features:**
- A **vertical dashed reference line** shows the average-of-averages across all stages.
- The **slowest stage is automatically highlighted in red** and labelled with a ⚠ warning symbol — this is the bottleneck.
- Tooltips display the average duration and flag the bottleneck stage explicitly.

**Use case:** Pinpoint where the pipeline is slowest. The bottleneck stage is the one to investigate for SLA compliance and process optimisation.

---

## Chart 4 — Transaction Flow Funnel

**Type:** Horizontal bar chart (funnel-style)  
**Location:** Second row, right

Visualises the **cumulative volume progression** through the lifecycle. Each bar represents the number of transactions that have reached at least that stage.

For each stage, the data label shows:
- The absolute transaction count
- The percentage of total entry volume
- The stage-to-stage conversion rate (e.g. `95% conv.`)

**Special features:**
- The stage with the **largest volume drop compared to the previous stage** is highlighted in red with a ⚠ symbol — this is where the most transactions are falling out.
- Tooltips show the drop count from the previous stage.

**Use case:** Understand where transactions are completing versus stalling. A large drop between Confirmation and Settlement, for example, may indicate matching failures.

---

## Chart 5 — Exposure by Lifecycle Stage

**Type:** Vertical bar chart  
**Location:** Third row, left

Shows the **total notional value (in EUR millions)** locked at each active stage — Capture, Confirmation, Settlement, and Reconciliation. Completed transactions are excluded.

Data labels above each bar show the EUR millions figure. Tooltips confirm the exact value.

**Use case:** Understand not just how many transactions are at each stage, but how much **financial exposure** is concentrated there. A moderate number of high-value transactions at Settlement is more critical than a large number of low-value ones at Capture.

---

## Chart 6 — Top Transactions by Value at Risk

**Type:** Horizontal bar chart  
**Location:** Third row, right

Lists the **top 8 at-risk transactions by notional value**, sorted largest first.

Colour coding by risk type:
- 🔴 **Red** — Overdue
- 🟠 **Amber** — Critical (less than 2 hours to cut-off)
- 🟣 **Purple** — Manual intervention required

Tooltips show the transaction ID, asset type, client name, notional value in original currency and EUR equivalent, current stage, and risk status.

**Clicking a bar** opens the full Transaction Detail modal for that transaction (see [06-transaction-detail-modal.md](./06-transaction-detail-modal.md)).

**Use case:** Immediately surface the highest-value transactions that need attention, so operators can triage by financial impact rather than just count.

---

## Chart 7 — Daily Transaction Volume — Last 14 Days

**Type:** Area chart (smooth curve)  
**Location:** Full-width row below the value analysis charts

Shows the number of transactions per calendar day over a rolling **14-day window**: 10 days in the past, today, and 3 days forward (to capture future-dated transactions).

**Special features:**
- The **peak day is marked with a red dot** and a "Peak: N" label.
- All other data points are shown as small blue dots.
- The subtitle dynamically updates to reflect whether a filter is active:
  - With no filters: *"All transactions · 14-day window"*
  - With filters active: *"Showing filtered data · N transactions"* (displayed in blue)

**Use case:** Spot volume trends, identify unusual spikes or drops, and see the distribution of upcoming transactions by trade date. The filter-aware subtitle makes it easy to see the historical pattern for a specific asset class or client.
