# Transaction Lifecycle Dashboard
### BNP Paribas Securities Services — Multi-Asset Operations Monitoring

🌐 **Live Demo:** [https://dashboardbnp.tiagosolipa.workers.dev/](https://dashboardbnp.tiagosolipa.workers.dev/)

A management-facing dashboard for monitoring multi-asset transactions across the full post-trade lifecycle. Built as a prototype during the BNP Paribas DRIVE Mentoring Programme.

---

## Overview

The Transaction Lifecycle Dashboard provides a real-time, high-level view of transaction flow from **Capture** through to **Settlement**. It is designed for operations managers who need visibility across the full pipeline — not to intervene directly, but to understand where transactions stand, where bottlenecks exist, and which transactions require urgent attention.

The dashboard auto-refreshes every **60 seconds**, recalculating all risk data based on the current system time.

---

## Documentation

| File | Contents |
|---|---|
| [01-filters.md](./docs/01-filters.md) | Filter bar — all filters, how they combine, and the Reset button |
| [02-kpi-cards.md](./docs/02-kpi-cards.md) | KPI summary cards — what each metric means and click-to-filter behaviour |
| [03-charts.md](./docs/03-charts.md) | All charts — Stage Bar, Asset Donut, Avg Processing Time, Funnel, Exposure, Top At-Risk, Historical Volume |
| [04-risk-alert-monitor.md](./docs/04-risk-alert-monitor.md) | Risk & Alert Monitor table — columns, priority logic, risk score formula, row interactions |
| [05-transaction-register.md](./docs/05-transaction-register.md) | Transaction Register — table columns, search, pagination, row colours |
| [06-transaction-detail-modal.md](./docs/06-transaction-detail-modal.md) | Transaction Detail modal — metadata grid, workflow timeline, per-stage chart, how to open/close |
| [07-notifications.md](./docs/07-notifications.md) | Notification bell — how alerts are generated, panel behaviour, and badge count |

---

## How to Run Locally

1. Download the ZIP file of this repository (via the green **Code** button above).
2. Extract the files.
3. Open `index.html` in any web browser — no server required.

---

## Tech Stack

- HTML · CSS · JavaScript
- Built with AI-assisted development during the BNP Paribas DRIVE Mentoring Programme
