// ============================================================
// BNP Paribas Securities — Dashboard Controller v3
// Decision-oriented: financial context, smart alerts, bottleneck detection
// ============================================================

"use strict";

// ── State ──────────────────────────────────────────────────
let state = {
  assetFilter: "all", clientFilter: "all",
  cutoffFilter: "all", stageFilter: "all",
  searchQuery: "", page: 1, pageSize: 500,
  kpiFilter: null,
  cutoffTimeFilter: { start: -1, end: -1 }, // -1/-1 = All Day
};



let chartInstances = {};
let detailChart = null;

// ── Helpers ────────────────────────────────────────────────
function getFiltered() {
  return window.TRANSACTIONS.filter(tx => {
    // ─ KPI quick-filter (applied first, combinable with other filters) ─
    if (state.kpiFilter === "inProgress" && tx.currentStage === "Completed") return false;
    if (state.kpiFilter === "atRisk" && tx.riskStatus !== "overdue" && tx.riskStatus !== "critical" && !tx.manualIntervention) return false;
    if (state.kpiFilter === "manual" && !tx.manualIntervention) return false;
    if (state.kpiFilter === "completed" && tx.currentStage !== "Completed") return false;
    // kpiFilter === "total" or null = no extra restriction

    // ─ Existing bar/chip/search filters ─
    if (state.assetFilter !== "all" && tx.asset !== state.assetFilter) return false;
    if (state.clientFilter !== "all" && tx.client !== state.clientFilter) return false;
    if (state.stageFilter !== "all" && tx.currentStage !== state.stageFilter) return false;
    if (state.cutoffFilter !== "all") {
      if (state.cutoffFilter === "overdue" && tx.riskStatus !== "overdue") return false;
      if (state.cutoffFilter === "critical" && tx.riskStatus !== "critical") return false;
      if (state.cutoffFilter === "today") {
        // "Today" = transactions whose cut-off date is today (ignore time component)
        if (!tx.cutoff) return false;
        const now = new Date();
        const todayStr = now.getFullYear() + '-' + String(now.getMonth()).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0');
        const cutoffStr = tx.cutoff.getFullYear() + '-' + String(tx.cutoff.getMonth()).padStart(2,'0') + '-' + String(tx.cutoff.getDate()).padStart(2,'0');
        if (cutoffStr !== todayStr) return false;
      }
      if (state.cutoffFilter === "24h" && tx.minutesToCutoff > 1440) return false;
    }
    // ─ Cut-off time interval filter (hour bucket) ─
    if (state.cutoffTimeFilter.start >= 0 && tx.cutoff) {
      const h = tx.cutoff.getHours() + tx.cutoff.getMinutes() / 60;
      if (h < state.cutoffTimeFilter.start || h >= state.cutoffTimeFilter.end) return false;
    } else if (state.cutoffTimeFilter.start >= 0 && !tx.cutoff) {
      return false; // has time filter but tx has no cutoff → exclude
    }
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      if (!tx.id.toLowerCase().includes(q) &&
        !tx.client.toLowerCase().includes(q) &&
        !tx.asset.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}


// ── KPI Computation ────────────────────────────────────────
function computeKPIs(data) {
  const total = data.length;
  const inProgress = data.filter(t => t.currentStage !== "Completed").length;
  const atRisk = data.filter(t => t.riskStatus === "overdue" || t.riskStatus === "critical" || t.manualIntervention).length;
  const manual = data.filter(t => t.manualIntervention).length;
  const completed = data.filter(t => t.currentStage === "Completed").length;
  const stp = data.filter(t => t.isSTP && t.currentStage === "Completed").length;
  const stpRate = completed > 0 ? Math.round((stp / completed) * 100) : 0;
  return { total, inProgress, atRisk, manual, completed, stpRate };
}

function renderKPIs(data) {
  const k = computeKPIs(data);
  document.getElementById("kpi-total-val").textContent = k.total;
  document.getElementById("kpi-pending-val").textContent = k.inProgress;
  document.getElementById("kpi-atrisk-val").textContent = k.atRisk;
  document.getElementById("kpi-manual-val").textContent = k.manual;
  document.getElementById("kpi-completed-val").textContent = k.completed;
  document.getElementById("stp-rate").textContent = k.stpRate + "%";
  document.getElementById("kpi-atrisk").classList.toggle("kpi-alert-card", k.atRisk > 0);

  // Reflect active KPI filter on cards
  const kpiFilterMap = {
    "kpi-total": "total",
    "kpi-pending": "inProgress",
    "kpi-atrisk": "atRisk",
    "kpi-manual": "manual",
    "kpi-completed": "completed",
  };
  Object.entries(kpiFilterMap).forEach(([elId, key]) => {
    const el = document.getElementById(elId);
    if (!el) return;
    el.classList.add("kpi-clickable");
    el.classList.toggle("kpi-active", state.kpiFilter === key);
    el.classList.toggle("kpi-inactive", state.kpiFilter !== null && state.kpiFilter !== key);
  });
}


// ── Stage Bar Chart ─────────────────────────────────────────
function renderStageBar(data) {
  const stages = ["Capture", "Confirmation", "Settlement", "Reconciliation", "Completed"];
  const colors = ["#1976d2", "#f57f17", "#c62828", "#7b1fa2", "#2e7d32"];
  const counts = stages.map(s => data.filter(t => t.currentStage === s).length);

  const opts = {
    chart: { type: "bar", height: 260, toolbar: { show: false }, background: "transparent", fontFamily: "Inter, sans-serif" },
    series: [{ name: "Transactions", data: counts }],
    colors,
    plotOptions: { bar: { distributed: true, borderRadius: 6, columnWidth: "55%", dataLabels: { position: "top" } } },
    dataLabels: { enabled: true, style: { fontSize: "11px", fontWeight: 700, colors: ["#333"] }, offsetY: -18 },
    xaxis: {
      categories: stages,
      labels: { style: { fontSize: "11px", fontFamily: "Inter, sans-serif", fontWeight: 600 } },
      axisBorder: { show: false }, axisTicks: { show: false }
    },
    yaxis: { labels: { style: { fontSize: "10px" } } },
    grid: { borderColor: "#f0f2f6", strokeDashArray: 4 },
    legend: { show: false },
    tooltip: { theme: "light" }
  };

  if (chartInstances.stageBar) {
    chartInstances.stageBar.updateOptions({ series: [{ data: counts }] });
    return;
  }
  chartInstances.stageBar = new ApexCharts(document.getElementById("stageBarChart"), opts);
  chartInstances.stageBar.render();
}

// ── Asset Donut Chart ───────────────────────────────────────
function renderAssetDonut(data) {
  const assets = ["Cash", "FX", "Derivatives", "Money Markets", "Securities"];
  const colors = ["#1976d2", "#2e7d32", "#7b1fa2", "#f57f17", "#00915A"];
  const counts = assets.map(a => data.filter(t => t.asset === a).length);

  const opts = {
    chart: { type: "donut", height: 260, fontFamily: "Inter, sans-serif", toolbar: { show: false } },
    series: counts, labels: assets, colors,
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true, label: "Total", fontSize: "11px", fontWeight: 600, color: "#5c6070",
              formatter: w => w.globals.seriesTotals.reduce((a, b) => a + b, 0)
            }
          }
        }
      }
    },
    legend: { position: "bottom", fontSize: "11px", fontFamily: "Inter, sans-serif", offsetY: 4 },
    tooltip: { theme: "light" }
  };

  if (chartInstances.assetDonut) { chartInstances.assetDonut.updateSeries(counts); return; }
  chartInstances.assetDonut = new ApexCharts(document.getElementById("assetDonutChart"), opts);
  chartInstances.assetDonut.render();
}

// ── Avg Time Per Stage — with bottleneck highlight + avg reference ──
function renderAvgTime(data) {
  const stages = ["Capture", "Confirmation", "Settlement", "Reconciliation"];
  const BASE_COLORS = ["#1976d2", "#f57f17", "#c62828", "#7b1fa2"];

  const avgs = stages.map(s => {
    const txs = data.filter(t => t.timestamps[s] && t.timestamps[s].duration != null);
    if (!txs.length) return 0;
    return Math.round(txs.reduce((acc, t) => acc + t.timestamps[s].duration, 0) / txs.length);
  });

  const maxVal = Math.max(...avgs);
  const avgOfAvg = Math.round(avgs.reduce((a, b) => a + b, 0) / avgs.filter(v => v > 0).length);
  const bottleneckIdx = avgs.indexOf(maxVal);

  const colors = avgs.map((v, i) => i === bottleneckIdx ? "#e53935" : BASE_COLORS[i]);

  const newOpts = {
    chart: { type: "bar", height: 260, toolbar: { show: false }, fontFamily: "Inter, sans-serif", background: "transparent" },
    series: [{ name: "Avg Minutes", data: avgs }],
    colors,
    plotOptions: {
      bar: { distributed: true, horizontal: true, borderRadius: 5, barHeight: "55%", dataLabels: { position: "top" } }
    },
    dataLabels: {
      enabled: true,
      formatter: (v, { dataPointIndex }) => {
        const label = v + " min";
        return dataPointIndex === bottleneckIdx ? label + " ⚠" : label;
      },
      style: { fontSize: "10px", fontWeight: 700, colors: ["#333"] },
      offsetX: 8
    },
    annotations: {
      xaxis: [{
        x: avgOfAvg,
        strokeDashArray: 5,
        borderColor: "#9ba3b5",
        borderWidth: 1.5,
        label: {
          text: `Avg: ${avgOfAvg}m`,
          position: "bottom",
          borderColor: "transparent",
          style: { fontSize: "9px", color: "#9ba3b5", background: "transparent" }
        }
      }]
    },
    xaxis: { title: { text: "Minutes", style: { fontSize: "10px", color: "#9ba3b5" } }, labels: { style: { fontSize: "10px" } } },
    yaxis: { categories: stages, labels: { style: { fontSize: "11px", fontWeight: 600 } } },
    grid: { borderColor: "#f0f2f6", strokeDashArray: 4 },
    legend: { show: false },
    tooltip: {
      theme: "light",
      y: { formatter: (v, { dataPointIndex }) => `${v} min avg${dataPointIndex === bottleneckIdx ? " (BOTTLENECK)" : ""}` }
    }
  };

  if (chartInstances.avgTime) {
    chartInstances.avgTime.destroy();
    chartInstances.avgTime = null;
  }
  chartInstances.avgTime = new ApexCharts(document.getElementById("avgTimeChart"), newOpts);
  chartInstances.avgTime.render();
}

// ── Funnel — with stage-to-stage conversion rates + drop-off highlight ──
function renderFunnel(data) {
  const stages = ["Capture", "Confirmation", "Settlement", "Reconciliation", "Completed"];
  const BASE_COLORS = ["#1976d2", "#f57f17", "#c62828", "#7b1fa2", "#2e7d32"];

  const passed = stages.map((_, idx) => data.filter(t => t.stageIndex >= idx).length);

  let maxDrop = 0, dropIdx = 1;
  for (let i = 1; i < passed.length; i++) {
    const drop = passed[i - 1] - passed[i];
    if (drop > maxDrop) { maxDrop = drop; dropIdx = i; }
  }

  const colors = passed.map((_, i) => i === dropIdx ? "#e53935" : BASE_COLORS[i]);

  const newOpts = {
    chart: { type: "bar", height: 260, toolbar: { show: false }, fontFamily: "Inter, sans-serif", background: "transparent" },
    series: [{ name: "Transactions", data: passed }],
    colors,
    plotOptions: {
      bar: { distributed: true, horizontal: true, barHeight: "60%", borderRadius: 5, dataLabels: { position: "right" } }
    },
    dataLabels: {
      enabled: true,
      formatter: (val, { dataPointIndex: i }) => {
        const pctOfEntry = passed[0] > 0 ? Math.round((val / passed[0]) * 100) : 0;
        const convPrev = i > 0 && passed[i - 1] > 0 ? Math.round((val / passed[i - 1]) * 100) : null;
        const convStr = convPrev !== null ? ` · ${convPrev}% conv.` : "";
        const dropMark = i === dropIdx ? " ⚠" : "";
        return `${val}  (${pctOfEntry}%${convStr})${dropMark}`;
      },
      style: { fontSize: "9px", fontWeight: 700, colors: ["#333"] },
      offsetX: 6
    },
    xaxis: { max: passed[0] + Math.ceil(passed[0] * 0.1), labels: { style: { fontSize: "10px" } } },
    yaxis: { categories: stages, labels: { style: { fontSize: "11px", fontWeight: 600 } } },
    grid: { borderColor: "#f0f2f6", strokeDashArray: 4 },
    legend: { show: false },
    tooltip: {
      theme: "light",
      y: {
        formatter: (val, { dataPointIndex: i }) => {
          if (i === 0) return `${val} (entry)`;
          const drop = passed[i - 1] - val;
          return `${val} · dropped ${drop} from previous stage`;
        }
      }
    }
  };

  if (chartInstances.funnel) {
    chartInstances.funnel.destroy();
    chartInstances.funnel = null;
  }
  chartInstances.funnel = new ApexCharts(document.getElementById("funnelChart"), newOpts);
  chartInstances.funnel.render();
}

// ── Value Analysis: Exposure by Stage (€) ──────────────────
function renderExposureByStage(data) {
  const stages = ["Capture", "Confirmation", "Settlement", "Reconciliation"];
  const colors = ["#1976d2", "#f57f17", "#c62828", "#7b1fa2"];
  const totals = stages.map(s =>
    Math.round(data.filter(t => t.currentStage === s)
      .reduce((acc, t) => acc + t.notionalEUR, 0) / 1000000)
  );

  const opts = {
    chart: { type: "bar", height: 220, toolbar: { show: false }, fontFamily: "Inter, sans-serif", background: "transparent" },
    series: [{ name: "Exposure (€M)", data: totals }],
    colors,
    plotOptions: { bar: { distributed: true, borderRadius: 6, columnWidth: "50%", dataLabels: { position: "top" } } },
    dataLabels: {
      enabled: true,
      formatter: v => `€ ${v}M`,
      style: { fontSize: "10px", fontWeight: 700, colors: ["#333"] },
      offsetY: -16
    },
    xaxis: {
      categories: stages,
      labels: { style: { fontSize: "11px", fontWeight: 600 } },
      axisBorder: { show: false }, axisTicks: { show: false }
    },
    yaxis: { title: { text: "€ Million", style: { fontSize: "10px", color: "#9ba3b5" } }, labels: { style: { fontSize: "10px" } } },
    grid: { borderColor: "#f0f2f6", strokeDashArray: 4 },
    legend: { show: false },
    tooltip: { theme: "light", y: { formatter: v => `€ ${v}M` } }
  };

  if (chartInstances.exposureStage) {
    chartInstances.exposureStage.destroy();
    chartInstances.exposureStage = null;
  }
  chartInstances.exposureStage = new ApexCharts(document.getElementById("exposureStageChart"), opts);
  chartInstances.exposureStage.render();
}

// ── Value Analysis: Top 8 At-Risk by Notional ──────────────
function renderTopAtRisk(data) {
  const atRisk = data
    .filter(t => t.riskStatus === "overdue" || t.riskStatus === "critical" || t.manualIntervention)
    .sort((a, b) => b.notionalEUR - a.notionalEUR)
    .slice(0, 8);

  if (!atRisk.length) {
    document.getElementById("topAtRiskChart").innerHTML =
      `<div style="color:#9ba3b5;font-size:12px;padding:20px;text-align:center;">No at-risk transactions in current filter.</div>`;
    return;
  }

  const labels = atRisk.map(t => t.id);
  const values = atRisk.map(t => +(t.notionalEUR / 1000000).toFixed(1));
  const colors = atRisk.map(t =>
    t.riskStatus === "overdue" ? "#e53935" :
      t.riskStatus === "critical" ? "#f5a623" : "#7c3aed"
  );

  const opts = {
    chart: { type: "bar", height: 220, toolbar: { show: false }, fontFamily: "Inter, sans-serif", background: "transparent" },
    series: [{ name: "Notional (€M)", data: values }],
    colors,
    plotOptions: { bar: { distributed: true, horizontal: true, borderRadius: 4, barHeight: "65%", dataLabels: { position: "right" } } },
    dataLabels: {
      enabled: true,
      formatter: v => `€ ${v}M`,
      style: { fontSize: "10px", fontWeight: 700, colors: ["#333"] },
      offsetX: 5
    },
    xaxis: { title: { text: "€ Million", style: { fontSize: "10px", color: "#9ba3b5" } }, labels: { style: { fontSize: "10px" } } },
    yaxis: { categories: labels, labels: { style: { fontSize: "10px", fontFamily: "'Courier New', monospace", fontWeight: 700 } } },
    grid: { borderColor: "#f0f2f6", strokeDashArray: 4 },
    legend: { show: false },
    tooltip: {
      theme: "light",
      custom: ({ dataPointIndex }) => {
        const t = atRisk[dataPointIndex];
        return `<div style="padding:8px 12px;font-size:11px;font-family:Inter,sans-serif;">
          <strong>${t.id}</strong> · ${t.asset}<br/>
          ${t.client}<br/>
          <span style="color:#9ba3b5;">Notional:</span> <strong>${formatNotional(t.notional, t.currency)}</strong>
          / <strong>${formatEUR(t.notionalEUR)}</strong><br/>
          <span style="color:#9ba3b5;">Stage:</span> ${t.currentStage} &nbsp;
          <span style="color:#9ba3b5;">Status:</span> <strong style="color:${t.riskStatus === 'overdue' ? '#e53935' : '#f5a623'};">${t.riskStatus.toUpperCase()}</strong>
        </div>`;
      }
    }
  };

  if (chartInstances.topAtRisk) { chartInstances.topAtRisk.destroy(); chartInstances.topAtRisk = null; }
  chartInstances.topAtRisk = new ApexCharts(document.getElementById("topAtRiskChart"), opts);
  chartInstances.topAtRisk.render();

  setTimeout(() => {
    document.querySelectorAll("#topAtRiskChart .apexcharts-bar-area").forEach((bar, i) => {
      if (atRisk[i]) bar.style.cursor = "pointer";
      bar.addEventListener("click", () => { if (atRisk[i]) openModal(atRisk[i]); });
    });
  }, 500);
}

// ── Risk Score Explanation Popover ──────────────────────────────────
const RISK_SCORE_HTML = `
<div class="risk-popover" id="riskScorePopover" role="tooltip">
  <div class="risk-pop-title">📊 How the Risk Score is Calculated</div>
  <div class="risk-pop-formula">
    <span class="risk-pop-eq">Risk Score = Time Urgency + Value Weight + Stage Weight</span>
  </div>
  <div class="risk-pop-table">
    <div class="risk-pop-section">⏰ Time Urgency (0–50 pts)</div>
    <div class="risk-pop-row"><span class="rp-label rp-overdue">⛔ Overdue</span><span class="rp-pts">50 pts</span></div>
    <div class="risk-pop-row"><span class="rp-label rp-critical">⚡ Critical (&lt;2 hrs)</span><span class="rp-pts">35 pts</span></div>
    <div class="risk-pop-row"><span class="rp-label rp-warning">⚠️ Warning (&lt;4 hrs)</span><span class="rp-pts">15 pts</span></div>
    <div class="risk-pop-row"><span class="rp-label rp-ok">✅ On Track</span><span class="rp-pts">0 pts</span></div>
    <div class="risk-pop-section">💶 Value Weight (0–30 pts)</div>
    <div class="risk-pop-row"><span class="rp-label">log₁₀(Notional €M + 1) × 20</span><span class="rp-pts">capped 30</span></div>
    <div class="risk-pop-section">🔄 Stage Weight (0–20 pts)</div>
    <div class="risk-pop-row"><span class="rp-label">Settlement</span><span class="rp-pts">20 pts</span></div>
    <div class="risk-pop-row"><span class="rp-label">Reconciliation</span><span class="rp-pts">15 pts</span></div>
    <div class="risk-pop-row"><span class="rp-label">Confirmation</span><span class="rp-pts">10 pts</span></div>
    <div class="risk-pop-row"><span class="rp-label">Capture</span><span class="rp-pts">5 pts</span></div>
    <div class="risk-pop-row"><span class="rp-label">Completed</span><span class="rp-pts">0 pts</span></div>
  </div>
  <div class="risk-pop-footer">Final score is capped at <strong>100</strong>. Higher = more urgent action needed.</div>
</div>`;

function ensureRiskPopover() {
  if (!document.getElementById("riskScorePopover")) {
    document.body.insertAdjacentHTML("beforeend", RISK_SCORE_HTML);
    document.addEventListener("click", e => {
      const pop = document.getElementById("riskScorePopover");
      if (pop && !pop.contains(e.target) && !e.target.classList.contains("risk-info-btn")) {
        pop.classList.remove("visible");
      }
    });
  }
}

function toggleRiskPopover(btn) {
  ensureRiskPopover();
  const pop = document.getElementById("riskScorePopover");
  const rect = btn.getBoundingClientRect();
  pop.style.top = (rect.bottom + window.scrollY + 8) + "px";
  pop.style.left = Math.max(8, rect.left + window.scrollX - 200) + "px";
  pop.classList.toggle("visible");
}

// ── Risk & Alert Monitor — enriched, prioritised table ──────
function renderAlerts(data) {
  const container = document.getElementById("alertsStrip");
  const badge = document.getElementById("alert-count-badge");

  // Collect actionable alerts
  const alertTxs = data.filter(t =>
    t.riskStatus === "overdue" || t.riskStatus === "critical" || t.manualIntervention
  );

  const STAGE_ORDER = { Settlement: 4, Reconciliation: 3, Confirmation: 2, Capture: 1, Completed: 0 };
  const RISK_ORDER = { overdue: 3, critical: 2, warning: 1, ok: 0 };

  alertTxs.sort((a, b) => {
    const rDiff = RISK_ORDER[b.riskStatus] - RISK_ORDER[a.riskStatus];
    if (rDiff !== 0) return rDiff;
    const sDiff = b.riskScore - a.riskScore;
    if (sDiff !== 0) return sDiff;
    const vDiff = b.notionalEUR - a.notionalEUR;
    if (vDiff !== 0) return vDiff;
    return (STAGE_ORDER[b.currentStage] || 0) - (STAGE_ORDER[a.currentStage] || 0);
  });

  // Show ALL alerts — badge count must match rows displayed
  const shown = alertTxs;
  badge.textContent = shown.length + " alerts";

  if (!shown.length) {
    container.innerHTML = `<div style="color:#5c6070;font-size:12px;padding:10px 0;">✅ No active alerts — all transactions within SLA.</div>`;
    return;
  }

  container.innerHTML = `
    <div class="alert-table">
      <div class="alert-table-head">
        <span>Priority</span>
        <span>Transaction</span>
        <span>Stage</span>
        <span>Value (EUR)</span>
        <span>Cut-off Date</span>
        <span>Cut-off Time</span>
        <span>Alert Reason</span>
        <span class="risk-score-head">
          Risk Score
          <button class="risk-info-btn" onclick="toggleRiskPopover(this)" title="How is this calculated?">&#9432;</button>
        </span>
      </div>
      ${shown.map(tx => {
    const priorityIcon = tx.priority === "high" ? "🔴" : tx.priority === "medium" ? "🟡" : "🔵";
    const priorityCls = `alert-row-${tx.priority}`;
    const riskReason = tx.alertReason || (tx.manualIntervention ? "Manual required" : "No cut-off defined");
    const scoreWidth = tx.riskScore;
    const eurValueCls = tx.priority === 'high' ? 'al-eur-high' : tx.priority === 'medium' ? 'al-eur-medium' : '';

    let cutoffDate = "—", cutoffTime = "—", cutoffDateCls = "", cutoffTimeCls = "";
    if (tx.cutoff) {
      const co = tx.cutoff;
      cutoffDate = co.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
      cutoffTime = co.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
      if (tx.riskStatus === "overdue") { cutoffDateCls = "cutoff-overdue"; cutoffTimeCls = "cutoff-overdue"; }
      else if (tx.riskStatus === "critical") { cutoffDateCls = "cutoff-critical"; cutoffTimeCls = "cutoff-critical"; }
    }

    return `
        <div class="alert-table-row ${priorityCls}" data-txid="${tx.id}">
          <span class="al-priority">
            <span class="al-icon">${priorityIcon}</span>
            <span class="al-pri-label priority-${tx.priority}">${tx.priority.toUpperCase()}</span>
          </span>
          <span class="al-tx">
            <span class="al-txid">${tx.id}</span>
            <span class="badge ${assetBadgeClass(tx.asset)}" style="font-size:9px;">${tx.asset}</span>
            <span class="al-client">${tx.client.split(" ").slice(0, 2).join(" ")}</span>
          </span>
          <span><span class="stage-badge ${stageBadgeClass(tx.currentStage)}" style="font-size:9px;">${tx.currentStage}</span></span>
          <span class="al-eur-val ${eurValueCls}">${formatEUR(tx.notionalEUR)}</span>
          <span class="al-cutoff-date ${cutoffDateCls}">${cutoffDate}</span>
          <span class="al-cutoff-time ${cutoffTimeCls}">${cutoffTime}</span>
          <span class="al-reason ${tx.riskStatus === 'overdue' ? 'reason-overdue' : tx.riskStatus === 'critical' ? 'reason-critical' : 'reason-manual'}">
            ${riskReason || "—"}
          </span>
          <span class="al-score-cell">
            <div class="al-score-bar-wrap">
              <div class="al-score-bar" style="width:${scoreWidth}%;background:${tx.priority === 'high' ? '#e53935' : tx.priority === 'medium' ? '#f5a623' : '#1976d2'};"></div>
            </div>
            <span class="al-score-val">${tx.riskScore}</span>
          </span>
        </div>`;
  }).join("")}
    </div>`;

  container.querySelectorAll(".alert-table-row[data-txid]").forEach(el => {
    el.addEventListener("click", () => {
      const tx = window.TRANSACTIONS.find(t => t.id === el.dataset.txid);
      if (tx) openModal(tx);
    });
  });
}

// ── Table helpers ─────────────────────────────────────────
function assetBadgeClass(asset) {
  return { Cash: "badge-cash", FX: "badge-fx", Derivatives: "badge-deriv", "Money Markets": "badge-mm", Securities: "badge-sec" }[asset] || "";
}
function stageBadgeClass(stage) {
  return { Capture: "stage-capture", Confirmation: "stage-confirmation", Settlement: "stage-settlement", Reconciliation: "stage-reconciliation", Completed: "stage-completed" }[stage] || "";
}
function riskDotClass(risk) {
  return { ok: "risk-ok", warning: "risk-warn", critical: "risk-critical", overdue: "risk-overdue" }[risk] || "risk-ok";
}
function formatCutoff(tx) {
  if (!tx.cutoff) return `<span style="color:#9ba3b5;">—</span>`;
  const fmt = fmtDateTime(tx.cutoff);
  if (tx.riskStatus === "overdue") return `<span style="color:#e53935;font-weight:700;">⛔ ${fmt}</span>`;
  if (tx.riskStatus === "critical") return `<span style="color:#f5a623;font-weight:700;">⚡ ${fmt}</span>`;
  if (tx.riskStatus === "warning") return `<span style="color:#f9c030;font-weight:600;">${fmt}</span>`;
  return `<span>${fmt}</span>`;
}

// ── Table Rendering ─────────────────────────────────────────
function renderTable(data) {
  const tbody = document.getElementById("txTableBody");
  const start = (state.page - 1) * state.pageSize;
  const paged = data.slice(start, start + state.pageSize);
  document.getElementById("rowCount").textContent = data.length + " rows";

  if (!paged.length) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:28px;color:#9ba3b5;">No transactions match current filters.</td></tr>`;
    return;
  }

  tbody.innerHTML = paged.map(tx => {
    const rowClass = tx.riskStatus === "overdue" ? "row-overdue" : tx.riskStatus === "critical" ? "row-critical" : "";
    const timeInStage = Math.max(0, tx.timestamps[tx.currentStage]?.duration ?? 0);
    return `
    <tr class="${rowClass}" data-txid="${tx.id}">
      <td><span class="tx-id">${tx.id}</span></td>
      <td><span class="badge ${assetBadgeClass(tx.asset)}">${tx.asset}</span></td>
      <td style="max-width:140px;overflow:hidden;text-overflow:ellipsis;">${tx.client}</td>
      <td><span class="client-id-badge">${tx.clientId || '—'}</span></td>
      <td><span class="stage-badge ${stageBadgeClass(tx.currentStage)}">${tx.currentStage}</span></td>
      <td style="font-variant-numeric:tabular-nums;">${formatDuration(timeInStage)}</td>
      <td>${formatCutoff(tx)}</td>
      <td><span class="risk-dot ${riskDotClass(tx.riskStatus)}"></span>${tx.riskStatus.charAt(0).toUpperCase() + tx.riskStatus.slice(1)}</td>
      <td><span class="manual-flag ${tx.manualIntervention ? "manual-yes" : "manual-no"}">${tx.manualIntervention ? "Yes" : "No"}</span></td>
      <td><span class="${tx.isSTP ? "stp-yes" : "stp-no"}">${tx.isSTP ? "STP" : "Non-STP"}</span></td>
    </tr>`;
  }).join("");

  tbody.querySelectorAll("tr[data-txid]").forEach(row => {
    row.addEventListener("click", () => {
      const tx = window.TRANSACTIONS.find(t => t.id === row.dataset.txid);
      if (tx) openModal(tx);
    });
  });

  const totalPages = Math.max(1, Math.ceil(data.length / state.pageSize));
  document.getElementById("pageInfo").textContent = `${data.length} transactions`;
  document.getElementById("prevPage").disabled = state.page <= 1;
  document.getElementById("nextPage").disabled = state.page >= totalPages;

  const paginationRow = document.querySelector(".pagination-row");
  if (paginationRow) paginationRow.style.display = totalPages <= 1 ? "none" : "flex";
}

// ── Modal ───────────────────────────────────────────────────
function openModal(tx) {
  const overlay = document.getElementById("modalOverlay");

  document.getElementById("modalTitle").textContent = tx.id;
  document.getElementById("modalSub").textContent = `${tx.asset} · ${tx.client}`;

  const riskColor = tx.riskStatus === "overdue" ? "#e53935" : tx.riskStatus === "critical" ? "#f5a623" : tx.riskStatus === "warning" ? "#f9c030" : "#2e7d32";
  const priorityIcon = tx.priority === "high" ? "🔴" : tx.priority === "medium" ? "🟡" : "🟢";
  const priorityLabel = tx.priority.charAt(0).toUpperCase() + tx.priority.slice(1);
  const tts = formatTimeToSettlement(tx);

  // Split cut-off into date / time for modal display
  let cutoffDateStr = "—", cutoffTimeStr = "—";
  let cutoffStatusCls = "";
  if (tx.cutoff) {
    cutoffDateStr = tx.cutoff.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
    cutoffTimeStr = tx.cutoff.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
    if (tx.riskStatus === "overdue") cutoffStatusCls = "cutoff-modal-overdue";
    else if (tx.riskStatus === "critical") cutoffStatusCls = "cutoff-modal-critical";
  }

  // Enriched meta grid (3 rows × 4 cols)
  document.getElementById("modalMeta").innerHTML = `
    <div class="meta-item"><span class="meta-lbl">Asset Type</span><span class="meta-val">${tx.asset}</span></div>
    <div class="meta-item"><span class="meta-lbl">Client</span><span class="meta-val" style="font-size:11px;">${tx.client}</span></div>
    <div class="meta-item"><span class="meta-lbl">Client ID</span><span class="meta-val"><span class="client-id-badge">${tx.clientId || '—'}</span></span></div>
    <div class="meta-item"><span class="meta-lbl">Current Stage</span><span class="meta-val"><span class="stage-badge ${stageBadgeClass(tx.currentStage)}">${tx.currentStage}</span></span></div>
    <div class="meta-item"><span class="meta-lbl">Risk Status</span><span class="meta-val" style="color:${riskColor};font-weight:700;">${tx.riskStatus.toUpperCase()}</span></div>
    <div class="meta-item cutoff-meta-block ${cutoffStatusCls}">
      <span class="meta-lbl">⏰ Cut-off Date</span>
      <span class="meta-val cutoff-meta-val">${cutoffDateStr}</span>
    </div>
    <div class="meta-item cutoff-meta-block ${cutoffStatusCls}">
      <span class="meta-lbl">⏰ Cut-off Time</span>
      <span class="meta-val cutoff-meta-val">${cutoffTimeStr}</span>
    </div>

    <div class="meta-item meta-financial"><span class="meta-lbl">Notional</span><span class="meta-val meta-val-financial">${formatNotional(tx.notional, tx.currency)}</span></div>
    <div class="meta-item meta-financial"><span class="meta-lbl">EUR Equivalent</span><span class="meta-val meta-val-financial eur-highlight">${formatEUR(tx.notionalEUR)}</span></div>
    <div class="meta-item"><span class="meta-lbl">Time to Settlement</span><span class="meta-val" style="color:${tx.riskStatus === 'overdue' ? '#e53935' : tx.riskStatus === 'critical' ? '#f5a623' : '#1a1d23'};font-weight:700;">${tts}</span></div>
    <div class="meta-item">
      <span class="meta-lbl">Priority
        <button class="risk-info-btn modal-risk-info" onclick="toggleRiskPopover(this)" title="How is the Risk Score calculated?">&#9432;</button>
      </span>
      <span class="meta-val">${priorityIcon} ${priorityLabel} &nbsp;<span class="priority-score-chip">Score: ${tx.riskScore}/100</span></span>
    </div>

    <div class="meta-item"><span class="meta-lbl">Manual Intervention</span><span class="meta-val">${tx.manualIntervention ? "⚠ Required" : "None"}</span></div>
    <div class="meta-item"><span class="meta-lbl">STP</span><span class="meta-val ${tx.isSTP ? 'stp-yes' : 'stp-no'}">${tx.isSTP ? "✔ STP" : "✖ Non-STP"}</span></div>
    <div class="meta-item"><span class="meta-lbl">Trade Date</span><span class="meta-val">${fmtDateTime(tx.tradeDate)}</span></div>
    <div class="meta-item"><span class="meta-lbl">Total Lifecycle</span><span class="meta-val">${formatDuration(tx.totalDuration)}</span></div>
  `;

  // Timeline
  const stages = ["Capture", "Confirmation", "Settlement", "Reconciliation", "Completed"];
  const stageColors = { Capture: "#1976d2", Confirmation: "#f57f17", Settlement: "#c62828", Reconciliation: "#7b1fa2", Completed: "#2e7d32" };
  const stageClasses = { Capture: "tl-capture", Confirmation: "tl-confirmation", Settlement: "tl-settlement", Reconciliation: "tl-reconciliation", Completed: "tl-completed" };

  document.getElementById("timelineContainer").innerHTML = stages.map(s => {
    const ts = tx.timestamps[s];
    const isActive = tx.currentStage === s && s !== "Completed";
    const isFuture = !ts;
    const cls = isFuture ? "tl-pending" : stageClasses[s];

    if (isFuture) return `
      <div class="tl-item ${cls}">
        <div class="tl-dot"></div>
        <div class="tl-content" style="opacity:0.4;">
          <div class="tl-stage-name">${s}</div>
          <div style="font-size:11px;color:#9ba3b5;margin-top:4px;">Pending</div>
        </div>
      </div>`;

    return `
      <div class="tl-item ${cls}">
        <div class="tl-dot"></div>
        <div class="tl-content">
          <div class="tl-stage-name" style="color:${stageColors[s]};">${s}</div>
          <div class="tl-timestamps">
            <div class="tl-ts-group"><span class="tl-ts-lbl">Entry</span><span class="tl-ts-val">${fmtDateTime(ts.entry)}</span></div>
            ${ts.exit ? `<div class="tl-ts-group"><span class="tl-ts-lbl">Exit</span><span class="tl-ts-val">${fmtDateTime(ts.exit)}</span></div>` : ""}
          </div>
          ${ts.duration != null ? `<span class="tl-duration">⏱ ${formatDuration(ts.duration)}${isActive ? " so far" : ""}</span>` : ""}
          ${isActive ? `<div class="tl-active-indicator"><span class="tl-active-dot"></span> Currently Active</div>` : ""}
        </div>
      </div>`;
  }).join("");

  // Per-stage breakdown chart
  const stagesForChart = ["Capture", "Confirmation", "Settlement", "Reconciliation"];
  const durations = stagesForChart.map(s => tx.timestamps[s]?.duration || 0);
  const maxDur = Math.max(...durations);
  const chartColors = durations.map((v, i) => v === maxDur && v > 0 ? "#e53935" : ["#1976d2", "#f57f17", "#c62828", "#7b1fa2"][i]);

  if (detailChart) { detailChart.destroy(); detailChart = null; }
  const chartEl = document.getElementById("txDetailChart");
  chartEl.innerHTML = "";

  detailChart = new ApexCharts(chartEl, {
    chart: { type: "bar", height: 200, toolbar: { show: false }, fontFamily: "Inter, sans-serif", background: "transparent" },
    series: [{ name: "Duration (min)", data: durations }],
    colors: chartColors,
    plotOptions: { bar: { distributed: true, borderRadius: 5, columnWidth: "45%", dataLabels: { position: "top" } } },
    dataLabels: {
      enabled: true,
      formatter: v => v > 0 ? formatDuration(v) : "—",
      style: { fontSize: "10px", fontWeight: 700, colors: ["#333"] },
      offsetY: -14
    },
    xaxis: { categories: stagesForChart, labels: { style: { fontSize: "11px", fontWeight: 600 } }, axisBorder: { show: false } },
    yaxis: { title: { text: "Minutes", style: { fontSize: "10px", color: "#9ba3b5" } }, labels: { style: { fontSize: "10px" } } },
    grid: { borderColor: "#f0f2f6", strokeDashArray: 4 },
    legend: { show: false },
    tooltip: { theme: "light", y: { formatter: v => formatDuration(v) } }
  });
  detailChart.render();

  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("open");
  document.body.style.overflow = "";
}

// ── Historical Daily Volume Chart (filter-aware) ──────────────
function renderHistoricalChart(filteredData) {
  // Build the 14-day window: 10 days back + today + 3 days forward
  // This ensures future-dated transactions (24th, 25th) are visible
  const anchor = window.NOW_TS || new Date();
  const anchorDay = new Date(anchor);
  anchorDay.setHours(0, 0, 0, 0);

  // Generate the 14 day labels (oldest → newest)
  const dayLabels = [];
  const dayKeys = [];   // YYYY-MM-DD for bucketing
  for (let i = 10; i >= -3; i--) {
    const d = new Date(anchorDay);
    d.setDate(d.getDate() - i);
    dayLabels.push(d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }));
    dayKeys.push(d.toISOString().slice(0, 10)); // "2026-03-29"
  }

  // Count filtered transactions per day using tradeDate
  const buckets = {};
  dayKeys.forEach(k => { buckets[k] = 0; });
  (filteredData || []).forEach(tx => {
    if (!tx.tradeDate) return;
    const key = new Date(tx.tradeDate).toISOString().slice(0, 10);
    if (key in buckets) buckets[key]++;
  });

  const counts = dayKeys.map(k => buckets[k]);
  const maxVal = Math.max(...counts, 1);
  const isFiltered = state.assetFilter !== "all" || state.clientFilter !== "all" ||
    state.cutoffFilter !== "all" || state.stageFilter !== "all" ||
    state.searchQuery !== "";

  // Subtitle annotation
  const subtitleEl = document.getElementById("historicalChartSubtitle");
  if (subtitleEl) {
    subtitleEl.textContent = isFiltered
      ? "Showing filtered data · " + (filteredData ? filteredData.length : 0) + " transactions"
      : "All transactions · 14-day window";
    subtitleEl.style.color = isFiltered ? "#1976d2" : "";
  }

  const newSeries = [{ name: "Transactions", data: counts }];
  const newAnnotations = {
    points: [{
      x: dayLabels[counts.indexOf(maxVal)],
      y: maxVal,
      marker: { size: maxVal > 0 ? 6 : 0, fillColor: "#e53935", strokeWidth: 0 },
      label: {
        text: maxVal > 0 ? "Peak: " + maxVal : "",
        borderColor: "transparent",
        style: { fontSize: "9px", color: "#e53935", background: "transparent", fontWeight: 700 },
        offsetY: -8
      }
    }]
  };

  if (chartInstances.historicalVolume) {
    chartInstances.historicalVolume.updateOptions({
      series: newSeries,
      xaxis: { categories: dayLabels },
      markers: { size: 4, colors: counts.map(c => c === maxVal && c > 0 ? "#e53935" : "#1976d2"), strokeWidth: 0 },
      annotations: newAnnotations
    });
    return;
  }

  const opts = {
    chart: {
      type: "area",
      height: 220,
      toolbar: { show: false },
      fontFamily: "Inter, sans-serif",
      background: "transparent",
      sparkline: { enabled: false }
    },
    series: newSeries,
    colors: ["#1976d2"],
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.03, stops: [0, 90] }
    },
    stroke: { curve: "smooth", width: 2.5 },
    markers: {
      size: 4,
      colors: counts.map(c => c === maxVal && c > 0 ? "#e53935" : "#1976d2"),
      strokeWidth: 0
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: dayLabels,
      labels: { style: { fontSize: "10px", fontFamily: "Inter, sans-serif" } },
      axisBorder: { show: false }, axisTicks: { show: false }
    },
    yaxis: {
      title: { text: "# Transactions", style: { fontSize: "10px", color: "#9ba3b5" } },
      labels: { style: { fontSize: "10px" } },
      min: 0
    },
    grid: { borderColor: "#f0f2f6", strokeDashArray: 4, padding: { left: 4, right: 8 } },
    legend: { show: false },
    tooltip: {
      theme: "light",
      y: { formatter: v => v + " transactions" }
    },
    annotations: newAnnotations
  };

  chartInstances.historicalVolume = new ApexCharts(document.getElementById("historicalVolumeChart"), opts);
  chartInstances.historicalVolume.render();
}

// ── Master Render ───────────────────────────────────────────
function render() {
  // Recalculate all time-sensitive risk data from current system time
  if (window.recalculateRiskData) window.recalculateRiskData();
  const filtered = getFiltered();
  renderKPIs(filtered);
  renderStageBar(filtered);
  renderAssetDonut(filtered);
  renderAvgTime(filtered);
  renderFunnel(filtered);
  renderExposureByStage(filtered);
  renderTopAtRisk(filtered);
  renderAlerts(filtered);
  renderTable(filtered);
  renderHistoricalChart(filtered);
}

// ── Populate Client Dropdown ────────────────────────────────
function populateClients() {
  const clients = [...new Set(window.TRANSACTIONS.map(t => t.client))].sort();
  const sel = document.getElementById("clientFilter");
  clients.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c; opt.textContent = c;
    sel.appendChild(opt);
  });
}

// ── Event Listeners ─────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  populateClients();
  render();
  startClock();
  startAutoRefresh();

  document.getElementById("assetFilter").addEventListener("click", e => {
    if (!e.target.classList.contains("chip")) return;
    document.querySelectorAll("#assetFilter .chip").forEach(c => c.classList.remove("active"));
    e.target.classList.add("active");
    state.assetFilter = e.target.dataset.value; state.page = 1; render();
  });

  document.getElementById("cutoffFilter").addEventListener("click", e => {
    if (!e.target.classList.contains("chip")) return;
    document.querySelectorAll("#cutoffFilter .chip").forEach(c => c.classList.remove("active"));
    e.target.classList.add("active");
    state.cutoffFilter = e.target.dataset.value; state.page = 1; render();
  });

  document.getElementById("clientFilter").addEventListener("change", e => {
    state.clientFilter = e.target.value; state.page = 1; render();
  });
  document.getElementById("stageFilter").addEventListener("change", e => {
    state.stageFilter = e.target.value; state.page = 1; render();
  });

  document.getElementById("resetFilters").addEventListener("click", () => {
    state = {
      ...state, assetFilter: "all", clientFilter: "all", cutoffFilter: "all",
      stageFilter: "all", searchQuery: "", kpiFilter: null,
      cutoffTimeFilter: { start: -1, end: -1 }, page: 1
    };
    document.querySelectorAll("#assetFilter .chip").forEach(c => c.classList.remove("active"));
    document.querySelector("#assetFilter .chip[data-value='all']").classList.add("active");
    document.querySelectorAll("#cutoffFilter .chip").forEach(c => c.classList.remove("active"));
    document.querySelector("#cutoffFilter .chip[data-value='all']").classList.add("active");
    // Reset cutoff time dropdown
    document.querySelectorAll("#cutoffTimePanel .cutoff-time-option").forEach(o => {
      o.classList.remove("active");
      o.setAttribute("aria-selected", "false");
    });
    const defaultOpt = document.querySelector("#cutoffTimePanel .cutoff-time-option[data-start='-1']");
    if (defaultOpt) { defaultOpt.classList.add("active"); defaultOpt.setAttribute("aria-selected", "true"); }
    document.getElementById("cutoffTimeLabel").textContent = "All Day";
    document.getElementById("cutoffTimeDropdown").classList.remove("is-active", "open");
    document.getElementById("clientFilter").value = "all";
    document.getElementById("stageFilter").value = "all";
    document.getElementById("tableSearch").value = "";
    render();
  });

  let searchTimer;
  document.getElementById("tableSearch").addEventListener("input", e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { state.searchQuery = e.target.value.trim(); state.page = 1; render(); }, 200);
  });

  document.getElementById("prevPage").addEventListener("click", () => { if (state.page > 1) { state.page--; renderTable(getFiltered()); } });
  document.getElementById("nextPage").addEventListener("click", () => { state.page++; renderTable(getFiltered()); });

  // ── KPI Card click handlers ────────────────────────────
  const kpiClickMap = {
    "kpi-total": "total",
    "kpi-pending": "inProgress",
    "kpi-atrisk": "atRisk",
    "kpi-manual": "manual",
    "kpi-completed": "completed",
  };
  Object.entries(kpiClickMap).forEach(([elId, filterKey]) => {
    const el = document.getElementById(elId);
    if (!el) return;
    el.addEventListener("click", () => {
      // Toggle: click same KPI again to deselect
      state.kpiFilter = (state.kpiFilter === filterKey) ? null : filterKey;
      state.page = 1;
      render();
    });
  });

  // ── Cut-off time interval dropdown ───────────────────────────
  const ctDropdown = document.getElementById("cutoffTimeDropdown");
  const ctTrigger  = document.getElementById("cutoffTimeTrigger");
  const ctPanel    = document.getElementById("cutoffTimePanel");
  const ctLabel    = document.getElementById("cutoffTimeLabel");

  function closeCutoffDropdown() {
    ctDropdown.classList.remove("open");
    ctTrigger.setAttribute("aria-expanded", "false");
  }

  ctTrigger.addEventListener("click", e => {
    e.stopPropagation();
    const isOpen = ctDropdown.classList.toggle("open");
    ctTrigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  ctPanel.addEventListener("click", e => {
    const btn = e.target.closest(".cutoff-time-option");
    if (!btn) return;

    // Update active option
    ctPanel.querySelectorAll(".cutoff-time-option").forEach(o => {
      o.classList.remove("active");
      o.setAttribute("aria-selected", "false");
    });
    btn.classList.add("active");
    btn.setAttribute("aria-selected", "true");

    // Update trigger label
    ctLabel.textContent = btn.textContent;

    // Apply/clear accent class on the wrapper
    const start = parseInt(btn.dataset.start, 10);
    const end   = parseInt(btn.dataset.end,   10);
    ctDropdown.classList.toggle("is-active", start >= 0);

    // Update state and re-render
    state.cutoffTimeFilter = { start, end };
    state.page = 1;
    render();

    // Collapse panel
    closeCutoffDropdown();
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", e => {
    if (!ctDropdown.contains(e.target)) closeCutoffDropdown();
  });

  // Close on Escape key
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeCutoffDropdown();
  });

  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("modalOverlay").addEventListener("click", e => { if (e.target === document.getElementById("modalOverlay")) closeModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
});

// ── Clock ───────────────────────────────────────────────────
function startClock() {
  function tick() {
    const now = new Date();
    document.getElementById("headerTime").textContent =
      now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) +
      " · " + now.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  }
  tick();
  setInterval(tick, 1000);
}

// ── Auto-Refresh: recalculate risk & re-render every 60 seconds ──
let autoRefreshTimer = null;
function startAutoRefresh() {
  if (autoRefreshTimer) clearInterval(autoRefreshTimer);
  autoRefreshTimer = setInterval(function() {
    render();
  }, 60000); // every 60 seconds
}
