# Transaction Register
### Transaction Lifecycle Dashboard — BNP Paribas Securities Services

The Transaction Register is the full paginated list of all transactions in the current filtered dataset. It sits at the bottom of the dashboard, below the Risk & Alert Monitor.

---

## Search

A text input field in the top-right corner of the table header allows free-text searching across the visible dataset.

**Searchable fields:**
- Transaction ID
- Client name
- Asset type

Typing triggers a search after a short debounce delay (200ms), so the table updates while you type without firing on every keystroke. The search applies on top of all active filter bar selections — it narrows down the already-filtered dataset further.

The total row count (e.g. *"247 rows"*) is displayed next to the search input and updates in real time.

---

## Table Columns

| Column | Description |
|---|---|
| **Tx ID** | The unique transaction identifier (e.g. `TX-00423`) |
| **Asset Type** | Colour-coded badge: Cash, FX, Derivatives, Money Markets, or Securities |
| **Client** | The client name (truncated with ellipsis if too long) |
| **Client ID** | The client's internal identifier code |
| **Current Stage** | A colour-coded stage badge showing where in the lifecycle the transaction is |
| **Time in Stage** | How long the transaction has been at its current stage, formatted as minutes or hours/minutes |
| **Cut-Off** | The cut-off deadline, with visual urgency indicators (see below) |
| **Status** | A coloured dot and text label for the risk status |
| **Manual** | Whether manual intervention is required ("Yes" or "No") |
| **STP** | Whether the transaction is Straight-Through Processing ("STP" or "Non-STP") |

---

## Cut-Off Column — Visual Urgency Indicators

The cut-off date and time is formatted differently based on the transaction's risk status:

| Risk Status | Display |
|---|---|
| **Overdue** | ⛔ Date/time in bold red |
| **Critical** | ⚡ Date/time in bold amber |
| **Warning** | Date/time in yellow |
| **On Track** | Date/time in normal text |
| **No cut-off** | — (dash) |

---

## Status Column — Risk Dots

Each transaction displays a coloured dot alongside its status label:

| Dot Colour | Status |
|---|---|
| 🟢 Green | OK — on track |
| 🟡 Yellow | Warning — cut-off within 4 hours |
| 🟠 Amber | Critical — cut-off within 2 hours |
| 🔴 Red | Overdue — cut-off has passed |

---

## Row Colour Coding

Rows are subtly background-tinted based on urgency:

- **Overdue** transactions have a light red row background
- **Critical** transactions have a light amber row background
- All others have a standard white/neutral background

This allows a quick visual scan to spot the most urgent rows even before reading the status column.

---

## Clicking a Row

Clicking **any row in the table** opens the **Transaction Detail modal** for that transaction. The modal shows the full metadata, workflow timeline, and per-stage duration chart.

See [06-transaction-detail-modal.md](./06-transaction-detail-modal.md) for everything available in the modal.

---

## Pagination

The table displays up to **500 rows per page**. For large datasets, pagination controls appear at the bottom of the table:

- **← Prev** — navigate to the previous page (disabled on page 1)
- **Page info** — shows the total number of transactions in the current view
- **Next →** — navigate to the next page (disabled on the last page)

If the entire dataset fits on one page, the pagination row is hidden automatically.

---

## Interaction with Filters

The Transaction Register reflects all active filters simultaneously — the filter bar, KPI card quick-filters, and the in-table search all combine. Changing any filter re-renders the table from page 1.
