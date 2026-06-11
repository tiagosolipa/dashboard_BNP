# Transaction Lifecycle Dashboard
### BNP Paribas Securities Services — Multi-Asset Operations Monitoring

🌐 **Live Demo:** https://dashboardbnp.tiagosolipa.workers.dev/

A management-facing dashboard for monitoring multi-asset transactions across the full post-trade lifecycle. Built as a prototype during the BNP Paribas DRIVE Mentoring Programme.

## Overview
Provides a real-time, high-level view of transaction flow from Capture through to Settlement. Designed for operations managers who need visibility across the full pipeline — not to intervene, but to understand.

## Features
- **KPI Summary** — Total transactions, in progress, at risk, manual interventions, and STP rate
- **Transaction Volume by Stage** — Bar chart showing distribution across Capture, Confirmation, Settlement, Reconciliation, and Completed
- **Asset Mix** — Donut chart breaking down transactions by asset type (Cash, FX, Derivatives, Money Markets, Securities)
- **Avg. Processing Time per Stage** — Identifies bottlenecks across the lifecycle
- **Transaction Flow Funnel** — Volume progression from entry to completion
- **Exposure by Lifecycle Stage** — Total notional (€M) at each stage
- **Top Transactions by Value at Risk** — Largest overdue, critical, and manual transactions
- **Daily Volume — Last 14 Days** — Trend view with peak day highlight
- **Risk & Alert Monitor** — Flagged transactions requiring attention
- **Transaction Register** — Full paginated list with per-transaction workflow timeline

## Filters
- Asset Type, Client, Cut-Off Window, Cut-Off Time Interval, Workflow Stage

## 📂 How to Run Locally
1. Download the ZIP file of this repository (via the green **Code** button above).
2. Extract the files.
3. Open `index.html` in any web browser.

## Tech Stack
- Java · Python · Cloudflare Workers
- Built with AI-assisted development using Google Antigravity
