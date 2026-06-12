# Filters
### Transaction Lifecycle Dashboard — BNP Paribas Securities Services

The filter bar runs across the top of the dashboard, just below the header. All filters are **combinable** — applying multiple filters narrows the dataset down using AND logic. Every filter change instantly updates all KPI cards, charts, the Risk & Alert Monitor, and the Transaction Register simultaneously.

---

## Filter Controls

### 1. Asset Type

A row of clickable chip buttons. Only one can be active at a time.

| Option | Description |
|---|---|
| **All** | No asset filter applied (default) |
| **Cash** | Show only Cash transactions |
| **FX** | Show only Foreign Exchange transactions |
| **Derivatives** | Show only Derivatives transactions |
| **Money Markets** | Show only Money Market transactions |
| **Securities** | Show only Securities transactions |

**Behaviour:** Clicking a chip activates it (highlighted) and deactivates all others. The entire dashboard re-renders immediately with the filtered dataset.

---

### 2. Client

A dropdown (`<select>`) populated dynamically at page load from the full transaction dataset. Lists every unique client name in alphabetical order, prefixed by **All Clients** (default).

**Behaviour:** Selecting a client limits all data to transactions belonging to that client only. Selecting "All Clients" removes the filter.

---

### 3. Cut-Off Window

A row of clickable chip buttons that filter transactions by their proximity to their cut-off deadline.

| Option | Description |
|---|---|
| **All** | No cut-off filter (default) |
| **Overdue** | Transactions whose cut-off has already passed |
| **Critical (<2h)** | Transactions with less than 2 hours remaining to cut-off |
| **Today** | Transactions whose cut-off date matches today's date (any time) |
| **Next 24h** | Transactions with a cut-off within the next 24 hours |

**Visual styling:** The **Overdue** chip is styled in amber/warning colour and **Critical** in red/alert colour to draw immediate attention.

---

### 4. Cut-Off Time Interval

A custom dropdown that filters transactions by the **hour window** of their scheduled cut-off time. This lets operators focus on transactions expiring within a specific part of the day.

| Option | Hour Range |
|---|---|
| **All Day** | No time filter (default) |
| **00:00 – 05:00** | Overnight / early morning cut-offs |
| **05:00 – 10:00** | Morning cut-offs |
| **10:00 – 14:00** | Late morning / midday cut-offs |
| **14:00 – 18:00** | Afternoon cut-offs |
| **18:00 – 24:00** | Evening cut-offs |

**Behaviour:**
- Clicking the trigger button opens a dropdown panel.
- Selecting an option closes the panel, updates the label on the trigger button, and re-renders the dashboard.
- When a time interval (other than All Day) is active, the trigger button changes colour to signal an active filter.
- Clicking outside the panel, or pressing `Escape`, closes it without changing the selection.
- Transactions that have no cut-off time defined are excluded when any time interval filter is active.

---

### 5. Workflow Stage

A dropdown (`<select>`) that limits the dashboard to transactions currently sitting at a specific stage in the post-trade lifecycle.

| Option | Description |
|---|---|
| **All Stages** | No stage filter (default) |
| **Capture** | Transaction entry / booking stage |
| **Confirmation** | Counterparty confirmation stage |
| **Settlement** | Settlement instruction and matching stage |
| **Reconciliation** | Reconciliation and break resolution stage |
| **Completed** | Fully processed transactions |

---

### Reset Button (↺ Reset)

The **↺ Reset** button at the far right of the filter bar clears all active filters simultaneously and returns every control to its default state:

- Asset Type → **All**
- Client → **All Clients**
- Cut-Off Window → **All**
- Cut-Off Time Interval → **All Day**
- Workflow Stage → **All Stages**
- Search (in the Transaction Register) → cleared
- KPI quick-filter → cleared

The dashboard immediately re-renders with the full unfiltered dataset.

---

## How Filters Combine

All filters are applied together using AND logic. For example:

- Asset Type = **FX** + Cut-Off Window = **Critical** → shows only FX transactions that are within 2 hours of their cut-off.
- Client = **Société Générale** + Workflow Stage = **Settlement** → shows only that client's transactions currently in the Settlement stage.

The KPI card click-to-filter (see [02-kpi-cards.md](./02-kpi-cards.md)) stacks on top of the filter bar selections and also participates in AND logic.
