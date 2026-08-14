"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { SectionId } from "@/lib/trialgptbot";
import {
  analyticsKpis,
  analyticsThroughputSeries,
  analyticsRiskDistribution,
  analyticsReviewerLeaderboard,
  analyticsExplainabilitySamples,
  analyticsCostBreakdown,
  analyticsRocCurves,
  analyticsCohorts,
  analyticsFairnessMatrix,
  analyticsGeoSites,
  analyticsDriftMatrix,
  analyticsConfidenceHistogram,
  analyticsRangeMultipliers,
} from "@/lib/trialgptbot";
import { BackToDashboard } from "./_BackToDashboard";

/**
 * Analytics page — a comprehensive, modern analytics surface that goes
 * well beyond the dashboard's compact Advanced Analytics panels.
 *
 * Designed to match the ever-evolving landscape of operational tooling
 * (MLOps, LLMOps, real-time streaming, explainability, cost telemetry):
 *
 *   • Hero with live platform KPIs + sparklines
 *   • Throughput stream chart (24h)
 *   • Risk distribution donut
 *   • Reviewer leaderboard
 *   • AI explainability (SHAP-style feature attribution)
 *   • Cost breakdown
 *   • Live activity ticker
 */
interface AnalyticsSectionProps {
  onNavigate: (id: SectionId) => void;
}

export function AnalyticsSection({ onNavigate }: AnalyticsSectionProps) {
  const [range, setRange] = useState<"24h" | "7d" | "30d">("24h");

  return (
    <div className="ax-page">
      <BackToDashboard
        onNavigate={onNavigate}
        secondary={{ label: "Open Edge Hub", target: "edge" }}
      />

      {/* Hero */}
      <section className="ax-hero">
        <div className="ax-hero-content">
          <h1>📈 Platform Analytics</h1>
          <p>
            Real-time visibility into reviewer throughput, AI calibration,
            cost-per-decision, model drift, edge sync health, and reviewer
            cognition. Streaming metrics powered by the platform&apos;s
            operational telemetry pipeline.
          </p>
          <div className="ax-hero-toolbar">
            <span className="ax-toolbar-pill">
              <span className="dot" /> Live telemetry
            </span>
            <span className="ax-toolbar-pill">Model: edge-clin-v3.4.1</span>
            <span className="ax-toolbar-pill">Pipeline: SSE + Kafka</span>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value as "24h" | "7d" | "30d")}
              className="ax-toolbar-pill"
              style={{ cursor: "pointer" }}
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
            <span className="ax-toolbar-pill" style={{ background: "#eff6ff", color: "#1e40af" }}>
              {range === "24h" ? "24h view" : range === "7d" ? "7d aggregated" : "30d aggregated"}
            </span>
          </div>
        </div>
      </section>

      {/* KPI grid */}
      <section>
        <div className="ax-kpi-grid">
          {analyticsKpis.map((kpi) => (
            <KpiCard key={kpi.label} kpi={kpi} />
          ))}
        </div>
      </section>

      {/* Throughput + Risk */}
      <div className="ax-grid-2">
        <section className="ax-section">
          <div className="ax-section-header">
            <div>
              <h2 className="ax-section-title">⚡ Throughput stream</h2>
              <p className="ax-section-subtitle">
                Hourly decisions over the last 24h, split by outcome
              </p>
            </div>
            <span className="aa-pill aa-pill-good">+8.2% vs. last period</span>
          </div>
          <ThroughputChart series={analyticsThroughputSeries} range={range} />
        </section>

        <section className="ax-section">
          <div className="ax-section-header">
            <div>
              <h2 className="ax-section-title">⚠️ Risk category distribution</h2>
              <p className="ax-section-subtitle">
                Open tasks by risk category (last 7 days)
              </p>
            </div>
          </div>
          <RiskDonut data={analyticsRiskDistribution} />
        </section>
      </div>

      {/* Reviewer leaderboard + Explainability */}
      <div className="ax-grid-2">
        <section className="ax-section">
          <div className="ax-section-header">
            <div>
              <h2 className="ax-section-title">🏆 Reviewer leaderboard</h2>
              <p className="ax-section-subtitle">
                Composite score from decisions, accuracy, and dwell time
              </p>
            </div>
          </div>
          <ReviewerLeaderboard />
        </section>

        <section className="ax-section">
          <div className="ax-section-header">
            <div>
              <h2 className="ax-section-title">🔬 AI explainability</h2>
              <p className="ax-section-subtitle">
                SHAP-style feature attribution for sample predictions
              </p>
            </div>
          </div>
          <ExplainabilityCards />
        </section>
      </div>

      {/* Cost + Activity */}
      <div className="ax-grid-2">
        <section className="ax-section">
          <div className="ax-section-header">
            <div>
              <h2 className="ax-section-title">💸 Cost breakdown</h2>
              <p className="ax-section-subtitle">
                Per-decision cost components (last 30 days)
              </p>
            </div>
          </div>
          <CostBreakdown />
        </section>

        <section className="ax-section">
          <div className="ax-section-header">
            <div>
              <h2 className="ax-section-title">🌊 Live activity stream</h2>
              <p className="ax-section-subtitle">
                Real-time platform events (refreshes every few seconds)
              </p>
            </div>
          </div>
          <LiveActivityStream />
        </section>
      </div>

      {/* === NEW: Model performance === */}
      <div className="ax-grid-2">
        <section className="ax-section">
          <div className="ax-section-header">
            <div>
              <h2 className="ax-section-title">🎯 ROC curve — model discrimination</h2>
              <p className="ax-section-subtitle">
                TPR vs FPR across thresholds; active model vs legacy baseline
              </p>
            </div>
          </div>
          <RocChart />
        </section>

        <section className="ax-section">
          <div className="ax-section-header">
            <div>
              <h2 className="ax-section-title">📊 Confidence distribution</h2>
              <p className="ax-section-subtitle">
                Histogram of model confidence scores across recent decisions
              </p>
            </div>
          </div>
          <ConfidenceHistogram />
        </section>
      </div>

      {/* === NEW: Cohort analytics === */}
      <section className="ax-section">
        <div className="ax-section-header">
          <div>
            <h2 className="ax-section-title">🧪 Cohort analytics</h2>
            <p className="ax-section-subtitle">
              Approval / escalation / rejection rates broken down by trial arm and demographic slice
            </p>
          </div>
        </div>
        <CohortTable />
      </section>

      {/* === NEW: Fairness heatmap === */}
      <section className="ax-section">
        <div className="ax-section-header">
          <div>
            <h2 className="ax-section-title">⚖️ Fairness audit</h2>
            <p className="ax-section-subtitle">
              Demographic group × evaluation metric parity (green = fair, amber = watch, red = unfair)
            </p>
          </div>
        </div>
        <FairnessHeatmap />
      </section>

      {/* === NEW: Drift heatmap === */}
      <section className="ax-section">
        <div className="ax-section-header">
          <div>
            <h2 className="ax-section-title">🌡️ Feature drift heatmap</h2>
            <p className="ax-section-subtitle">
              Population Stability Index (PSI) by feature × week. PSI &gt; 0.25 = significant drift.
            </p>
          </div>
        </div>
        <DriftHeatmap />
      </section>

      {/* === NEW: Geography map === */}
      <section className="ax-section">
        <div className="ax-section-header">
          <div>
            <h2 className="ax-section-title">🌍 Geographic distribution</h2>
            <p className="ax-section-subtitle">
              Edge-deployed sites with task volume and approval-rate shading
            </p>
          </div>
        </div>
        <GeoMap />
      </section>
    </div>
  );
}

/* ============================================================ */

function KpiCard({ kpi }: { kpi: AnalyticsKpi }) {
  const improved =
    (kpi.deltaGoodDirection === "up" && kpi.deltaPct > 0) ||
    (kpi.deltaGoodDirection === "down" && kpi.deltaPct < 0);
  const cls = improved ? "up-good" : "down-bad";
  const arrow = kpi.deltaPct > 0 ? "▲" : kpi.deltaPct < 0 ? "▼" : "→";
  return (
    <div className="ax-kpi-card">
      <div className="ax-kpi-label">{kpi.label}</div>
      <div className="ax-kpi-value">{kpi.value}</div>
      <span className={`ax-kpi-delta ${cls}`}>
        {arrow} {Math.abs(kpi.deltaPct).toFixed(1)}%
      </span>
      {kpi.hint && <div className="ax-kpi-hint">{kpi.hint}</div>}
      <Sparkline data={kpi.spark} />
    </div>
  );
}

function Sparkline({ data }: { data: number[] }) {
  if (!data || data.length === 0) return null;
  const w = 100;
  const h = 36;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 6) - 3;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  const last = data[data.length - 1];
  const lastX = w;
  const lastY = h - ((last - min) / range) * (h - 6) - 3;
  return (
    <svg
      className="ax-sparkline"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`spark-${data.join("")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(59,130,246,0.25)" />
          <stop offset="100%" stopColor="rgba(59,130,246,0)" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${h} ${pts} ${w},${h}`}
        fill={`url(#spark-${data.join("")})`}
      />
      <polyline
        points={pts}
        fill="none"
        stroke="#3b82f6"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={lastX} cy={lastY} r="2.5" fill="#3b82f6" />
    </svg>
  );
}

function ThroughputChart({ series, range = "24h" }: { series: typeof analyticsThroughputSeries; range?: "24h" | "7d" | "30d" }) {
  // Compute stacked bars — scale values by the range multiplier so the
  // chart visually reflects 7d / 30d aggregation rather than just 24h.
  const multiplier = analyticsRangeMultipliers[range];
  const scaled = series.map((s) => ({
    ...s,
    data: s.data.map((d) => ({ ...d, value: Math.round(d.value * multiplier) })),
  }));
  const hours = scaled[0].data.length;
  const maxTotal = Math.max(
    ...Array.from({ length: hours }, (_, h) =>
      scaled.reduce((sum, s) => sum + s.data[h].value, 0),
    ),
  );

  return (
    <div>
      <div className="ax-bar-chart">
        {Array.from({ length: hours }).map((_, h) => {
          const total = scaled.reduce((sum, s) => sum + s.data[h].value, 0);
          return (
            <div key={h} className="ax-bar-group">
              <div className="ax-bar-stack" style={{ height: "100%" }}>
                {scaled.map((s) => {
                  const heightPct = (s.data[h].value / maxTotal) * 100;
                  return (
                    <div
                      key={s.label}
                      className="ax-bar-seg"
                      style={{
                        height: `${heightPct}%`,
                        background: s.color,
                      }}
                      title={`${s.label}: ${s.data[h].value.toLocaleString()}`}
                    />
                  );
                })}
              </div>
              {h % 3 === 0 && (
                <div className="ax-bar-label">
                  {new Date(scaled[0].data[h].ts).getHours()}:00
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div
        style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
          marginTop: "0.5rem",
        }}
      >
        {scaled.map((s) => (
          <span key={s.label} className="aa-legend-item">
            <span
              className="aa-legend-dot"
              style={{ background: s.color }}
            />
            {s.label}
          </span>
        ))}
      </div>
      <div style={{ fontSize: "0.7rem", color: "#9ca3af", marginTop: "0.4rem", textAlign: "center" }}>
        Values scaled ×{multiplier} for {range} aggregation window.
      </div>
    </div>
  );
}

function RiskDonut({ data }: { data: typeof analyticsRiskDistribution }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="ax-donut-wrap">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="20"
        />
        {data.map((d) => {
          const dash = (d.value / total) * circumference;
          const seg = (
            <circle
              key={d.label}
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={d.color}
              strokeWidth="20"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 80 80)"
            />
          );
          offset += dash;
          return seg;
        })}
        <text
          x="80"
          y="76"
          textAnchor="middle"
          className="aa-ring-text"
          style={{ fontSize: "20px", fill: "#111827" }}
        >
          {total}
        </text>
        <text
          x="80"
          y="92"
          textAnchor="middle"
          style={{ fontSize: "10px", fill: "#6b7280" }}
        >
          open tasks
        </text>
      </svg>
      <div className="ax-donut-legend">
        {data.map((d) => (
          <div key={d.label} className="ax-donut-legend-row">
            <span
              className="ax-donut-legend-dot"
              style={{ background: d.color }}
            />
            <span className="ax-donut-legend-label">{d.label}</span>
            <span className="ax-donut-legend-value">
              {((d.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewerLeaderboard() {
  return (
    <div className="ax-leaderboard">
      {analyticsReviewerLeaderboard.map((r) => (
        <div
          key={r.name}
          className={`ax-leaderboard-row rank-${r.rank}`}
        >
          <span className="rank">#{r.rank}</span>
          <span className="name">{r.name}</span>
          <span className="stat">{r.decisions.toLocaleString()}</span>
          <span className="stat">{r.accuracy.toFixed(1)}%</span>
          <span className="stat">{r.avgTime}s</span>
          <span className="trend">{r.trend === "up" ? "📈" : "📉"}</span>
        </div>
      ))}
      <div
        className="ax-leaderboard-row"
        style={{
          background: "transparent",
          fontSize: "0.65rem",
          color: "#9ca3af",
          marginTop: "0.25rem",
          fontWeight: 600,
        }}
      >
        <span className="rank"></span>
        <span></span>
        <span className="stat" style={{ color: "#9ca3af" }}>decisions</span>
        <span className="stat" style={{ color: "#9ca3af" }}>accuracy</span>
        <span className="stat" style={{ color: "#9ca3af" }}>avg dwell</span>
        <span className="trend"></span>
      </div>
    </div>
  );
}

function ExplainabilityCards() {
  return (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      {analyticsExplainabilitySamples.map((sample) => (
        <div key={sample.taskId} className="ax-explain-card">
          <div className="ax-explain-header">
            <span className="ax-explain-taskid">{sample.taskId}</span>
            <span
              className={`aa-pill ${
                sample.prediction === "approve"
                  ? "aa-pill-good"
                  : sample.prediction === "escalate"
                    ? "aa-pill-warn"
                    : "aa-pill-bad"
              }`}
            >
              {sample.prediction} · {(sample.confidence * 100).toFixed(0)}%
            </span>
          </div>
          <div className="ax-explain-features">
            {sample.topFeatures.map((f) => {
              const maxAbs = Math.max(
                ...sample.topFeatures.map((f) => Math.abs(f.weight)),
              );
              const widthPct = (Math.abs(f.weight) / maxAbs) * 50;
              return (
                <div key={f.name} className="ax-explain-feature">
                  <span className="ax-explain-feature-name">{f.name}</span>
                  <span className="ax-explain-feature-value">{f.value}</span>
                  <div className="ax-explain-feature-bar">
                    <div className="ax-explain-feature-bar-center" />
                    <div
                      className={`ax-explain-feature-bar-fill ${
                        f.weight >= 0 ? "pos" : "neg"
                      }`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function CostBreakdown() {
  const total = analyticsCostBreakdown.reduce((s, c) => s + c.value, 0);
  return (
    <div>
      <div
        style={{
          display: "flex",
          height: "32px",
          borderRadius: "8px",
          overflow: "hidden",
          marginBottom: "0.85rem",
        }}
      >
        {analyticsCostBreakdown.map((c) => (
          <div
            key={c.label}
            style={{
              width: `${(c.value / total) * 100}%`,
              background: c.color,
              transition: "width 0.4s",
            }}
            title={`${c.label}: ${c.value}%`}
          />
        ))}
      </div>
      <div className="ax-donut-legend">
        {analyticsCostBreakdown.map((c) => (
          <div key={c.label} className="ax-donut-legend-row">
            <span
              className="ax-donut-legend-dot"
              style={{ background: c.color }}
            />
            <span className="ax-donut-legend-label">{c.label}</span>
            <span className="ax-donut-legend-value">
              {((c.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: "0.85rem",
          padding: "0.6rem 0.75rem",
          background: "#f9fafb",
          borderRadius: "8px",
          fontSize: "0.75rem",
          color: "#374151",
        }}
      >
        <strong>Avg cost per decision:</strong> $0.043 ·{" "}
        <strong>Total this period:</strong> $
        {(1247 * 0.043).toFixed(2)} across 1,247 decisions
      </div>
    </div>
  );
}

/**
 * LiveActivityStream — a simulated ticker of platform events.
 * Uses a self-contained interval; in production this would consume
 * the same SSE feed as the edge sync log (or a separate platform-events
 * WebSocket).
 */
function LiveActivityStream() {
  const [events, setEvents] = useState<
    Array<{ id: number; ts: string; text: string; tone: string }>
  >([]);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    // seed with a few events so the panel isn't empty
    setEvents([
      { id: 1, ts: new Date(Date.now() - 4 * 1000).toISOString(), text: "TASK-1042 approved by Dr. Sarah Chen (confidence 92%)", tone: "good" },
      { id: 2, ts: new Date(Date.now() - 12 * 1000).toISOString(), text: "Model drift check passed — PSI 1.8% (threshold 2.5%)", tone: "neutral" },
      { id: 3, ts: new Date(Date.now() - 28 * 1000).toISOString(), text: "Edge sync completed at SITE-LAG-01 — 12 records pushed", tone: "good" },
      { id: 4, ts: new Date(Date.now() - 47 * 1000).toISOString(), text: "Conflict auto-merged at SITE-DAC-05 — reviewer notified", tone: "warn" },
    ]);

    // tick — add a new event every ~5s
    const id = setInterval(() => {
      setEvents((prev) => {
        const templates = [
          { text: "TASK-approved by Dr. James Okafor (confidence 89%)", tone: "good" },
          { text: "Edge sync started at SITE-NBO-02 — 18 records queued", tone: "neutral" },
          { text: "Compliance check: HIPAA score 94.8% (1 open issue)", tone: "warn" },
          { text: "Auto-approve job completed — 14 high-confidence tasks approved", tone: "good" },
          { text: "EDC sync completed for Medidata Rave — 234 records", tone: "good" },
          { text: "Reviewer fatigue risk elevated — recommend break", tone: "warn" },
          { text: "Edge sync completed at SITE-ACC-06 — 9 records pushed", tone: "good" },
          { text: "Audit entry written: AUD-2026-08-14-009871", tone: "neutral" },
        ];
        const t = templates[Math.floor(Math.random() * templates.length)];
        const next = [
          {
            id: Date.now(),
            ts: new Date().toISOString(),
            text: t.text.replace("TASK-", `TASK-${1042 + Math.floor(Math.random() * 50)}`),
            tone: t.tone,
          },
          ...prev,
        ].slice(0, 12);
        return next;
      });
    }, 5000);

    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        maxHeight: "280px",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "0.4rem",
      }}
    >
      {events.length === 0 && (
        <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
          Waiting for events…
        </div>
      )}
      {events.map((e) => (
        <div
          key={e.id}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "0.5rem",
            padding: "0.4rem 0.55rem",
            background: "#f9fafb",
            borderRadius: "6px",
            fontSize: "0.72rem",
            borderLeft: `3px solid ${
              e.tone === "good"
                ? "#10b981"
                : e.tone === "warn"
                  ? "#f59e0b"
                  : "#3b82f6"
            }`,
            animation: "aa-sync-flash 1.6s ease-out",
          }}
        >
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "0.6rem",
              color: "#9ca3af",
              flexShrink: 0,
              marginTop: "1px",
            }}
          >
            {new Date(e.ts).toLocaleTimeString()}
          </span>
          <span style={{ color: "#374151", flex: 1 }}>{e.text}</span>
        </div>
      ))}
    </div>
  );
}

/* ============================================================ */

// Local types matching the imported analyticsKpis shape
type AnalyticsKpi = (typeof analyticsKpis)[number];

/* === NEW: ROC curve === */
function RocChart() {
  const width = 320;
  const height = 280;
  const padding = 36;
  const colors = ["#3b82f6", "#9ca3af", "#e5e7eb"];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", maxWidth: 360, height: "auto" }}>
        {/* Axes */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e5e7eb" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#e5e7eb" strokeWidth="1" />
        {/* Grid */}
        {[0.25, 0.5, 0.75, 1].map((g) => (
          <line key={`gx-${g}`} x1={padding} y1={height - padding - g * (height - 2 * padding)} x2={width - padding} y2={height - padding - g * (height - 2 * padding)} stroke="#f3f4f6" strokeWidth="1" />
        ))}
        {[0.25, 0.5, 0.75, 1].map((g) => (
          <line key={`gy-${g}`} x1={padding + g * (width - 2 * padding)} y1={padding} x2={padding + g * (width - 2 * padding)} y2={height - padding} stroke="#f3f4f6" strokeWidth="1" />
        ))}
        {/* Axis labels */}
        <text x={width / 2} y={height - 6} textAnchor="middle" style={{ fontSize: "10px", fill: "#6b7280" }}>False Positive Rate →</text>
        <text x={10} y={height / 2} textAnchor="middle" transform={`rotate(-90 10 ${height / 2})`} style={{ fontSize: "10px", fill: "#6b7280" }}>True Positive Rate →</text>
        {/* Curves */}
        {analyticsRocCurves.map((curve, ci) => {
          const pts = curve.points.map((p) => {
            const x = padding + p.fpr * (width - 2 * padding);
            const y = height - padding - p.tpr * (height - 2 * padding);
            return `${x.toFixed(1)},${y.toFixed(1)}`;
          }).join(" ");
          return (
            <g key={curve.modelId}>
              <polyline points={pts} fill="none" stroke={colors[ci]} strokeWidth={ci === 0 ? 2.5 : 1.5} strokeDasharray={ci === 0 ? "none" : "4 3"} />
              {/* Operating point */}
              {curve.operatingPoint && (
                <circle
                  cx={padding + curve.operatingPoint.fpr * (width - 2 * padding)}
                  cy={height - padding - curve.operatingPoint.tpr * (height - 2 * padding)}
                  r="4"
                  fill="#dc2626"
                  stroke="#fff"
                  strokeWidth="1.5"
                />
              )}
            </g>
          );
        })}
      </svg>
      <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", fontSize: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
        {analyticsRocCurves.map((c, i) => (
          <span key={c.modelId} className="aa-legend-item">
            <span className="aa-legend-dot" style={{ background: colors[i] }} />
            {c.modelId} (AUC {c.auc.toFixed(3)})
          </span>
        ))}
      </div>
      <div style={{ fontSize: "0.7rem", color: "#9ca3af", marginTop: "0.3rem" }}>
        ● Operating point (threshold 0.85)
      </div>
    </div>
  );
}

/* === NEW: Confidence histogram === */
function ConfidenceHistogram() {
  const max = Math.max(...analyticsConfidenceHistogram.map((b) => b.count));
  return (
    <div>
      <div className="ax-bar-chart" style={{ height: 200 }}>
        {analyticsConfidenceHistogram.map((b) => {
          const h = (b.count / max) * 100;
          return (
            <div key={b.bin} className="ax-bar-group" title={`${b.bin}: ${b.count} decisions`}>
              <div className="ax-bar-stack" style={{ height: "100%", justifyContent: "flex-end" }}>
                <div
                  className="ax-bar-seg"
                  style={{
                    height: `${h}%`,
                    background: b.bin === "0.9-1.0" ? "#10b981" : b.bin >= "0.7-0.8" ? "#3b82f6" : "#f59e0b",
                  }}
                />
              </div>
              <div className="ax-bar-label" style={{ fontSize: "0.6rem" }}>{b.bin.split("-")[0]}</div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: "0.4rem", textAlign: "center" }}>
        Confidence bin → high-confidence decisions (0.9-1.0) are auto-approval candidates.
      </div>
    </div>
  );
}

/* === NEW: Cohort analytics table === */
function CohortTable() {
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="ax-cohort-table">
        <thead>
          <tr>
            <th>Cohort</th>
            <th style={{ textAlign: "right" }}>Subjects</th>
            <th style={{ textAlign: "right" }}>Approval %</th>
            <th style={{ textAlign: "right" }}>Escalation %</th>
            <th style={{ textAlign: "right" }}>Rejection %</th>
            <th style={{ textAlign: "right" }}>Avg conf.</th>
            <th style={{ textAlign: "right" }}>Brier</th>
          </tr>
        </thead>
        <tbody>
          {analyticsCohorts.map((c) => (
            <tr key={c.name}>
              <td>{c.name}</td>
              <td style={{ textAlign: "right" }}>{c.subjects.toLocaleString()}</td>
              <td style={{ textAlign: "right" }}>
                <span className={c.approvalRate >= 75 ? "good" : c.approvalRate >= 60 ? "warn" : "bad"}>
                  {c.approvalRate.toFixed(1)}%
                </span>
              </td>
              <td style={{ textAlign: "right" }}>
                <span className={c.escalationRate <= 15 ? "good" : c.escalationRate <= 25 ? "warn" : "bad"}>
                  {c.escalationRate.toFixed(1)}%
                </span>
              </td>
              <td style={{ textAlign: "right" }}>
                <span className={c.rejectionRate <= 10 ? "good" : c.rejectionRate <= 15 ? "warn" : "bad"}>
                  {c.rejectionRate.toFixed(1)}%
                </span>
              </td>
              <td style={{ textAlign: "right" }}>{(c.avgConfidence * 100).toFixed(0)}%</td>
              <td style={{ textAlign: "right" }}>{c.brierScore.toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* === NEW: Fairness heatmap === */
function FairnessHeatmap() {
  const groups = Array.from(new Set(analyticsFairnessMatrix.map((c) => c.group)));
  const metrics = Array.from(new Set(analyticsFairnessMatrix.map((c) => c.metric)));
  const colorFor = (parity: string) =>
    parity === "fair" ? "#10b981" : parity === "watch" ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ overflowX: "auto" }}>
      <table className="ax-fairness-table">
        <thead>
          <tr>
            <th>Group</th>
            {metrics.map((m) => (
              <th key={m} style={{ textAlign: "center" }}>{m}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => (
            <tr key={g}>
              <td className="ax-fairness-row-label">{g}</td>
              {metrics.map((m) => {
                const cell = analyticsFairnessMatrix.find((c) => c.group === g && c.metric === m);
                return (
                  <td key={m} style={{ textAlign: "center" }}>
                    {cell && (
                      <div
                        className="ax-fairness-cell"
                        style={{ background: colorFor(cell.parity) }}
                        title={`${g} · ${m}: ${cell.value} (${cell.parity})`}
                      >
                        {cell.value}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", fontSize: "0.7rem", color: "#6b7280", justifyContent: "center" }}>
        <span><span style={{ display: "inline-block", width: 10, height: 10, background: "#10b981", marginRight: 4 }} /> Fair (≥92)</span>
        <span><span style={{ display: "inline-block", width: 10, height: 10, background: "#f59e0b", marginRight: 4 }} /> Watch (86-91)</span>
        <span><span style={{ display: "inline-block", width: 10, height: 10, background: "#ef4444", marginRight: 4 }} /> Unfair (&lt;86)</span>
      </div>
    </div>
  );
}

/* === NEW: Drift heatmap === */
function DriftHeatmap() {
  const features = Array.from(new Set(analyticsDriftMatrix.map((c) => c.feature)));
  const weeks = Array.from(new Set(analyticsDriftMatrix.map((c) => c.week)));
  const colorFor = (psi: number) => {
    if (psi < 0.1) return "#dcfce7";
    if (psi < 0.2) return "#bbf7d0";
    if (psi < 0.25) return "#fed7aa";
    if (psi < 0.35) return "#fdba74";
    return "#f87171";
  };
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="ax-drift-table">
        <thead>
          <tr>
            <th>Feature</th>
            {weeks.map((w) => (
              <th key={w} style={{ textAlign: "center" }}>{w}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {features.map((f) => (
            <tr key={f}>
              <td className="ax-drift-row-label">{f}</td>
              {weeks.map((w) => {
                const cell = analyticsDriftMatrix.find((c) => c.feature === f && c.week === w);
                return (
                  <td key={w} style={{ textAlign: "center" }}>
                    {cell && (
                      <div
                        className="ax-drift-cell"
                        style={{ background: colorFor(cell.psi) }}
                        title={`${f} · ${w}: PSI ${cell.psi}`}
                      >
                        {cell.psi.toFixed(2)}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem", fontSize: "0.7rem", color: "#6b7280", justifyContent: "center", flexWrap: "wrap" }}>
        <span><span style={{ display: "inline-block", width: 10, height: 10, background: "#dcfce7", marginRight: 4 }} /> &lt;0.1 stable</span>
        <span><span style={{ display: "inline-block", width: 10, height: 10, background: "#bbf7d0", marginRight: 4 }} /> 0.1-0.2 ok</span>
        <span><span style={{ display: "inline-block", width: 10, height: 10, background: "#fed7aa", marginRight: 4 }} /> 0.2-0.25 watch</span>
        <span><span style={{ display: "inline-block", width: 10, height: 10, background: "#fdba74", marginRight: 4 }} /> 0.25-0.35 drift</span>
        <span><span style={{ display: "inline-block", width: 10, height: 10, background: "#f87171", marginRight: 4 }} /> &gt;0.35 severe</span>
      </div>
    </div>
  );
}

/* === NEW: Geography map (simplified equirectangular projection) === */
function GeoMap() {
  const width = 640;
  const height = 280;
  // Equirectangular projection: lng -180..180 → 0..width, lat 90..-90 → 0..height
  const project = (lat: number, lng: number) => ({
    x: ((lng + 180) / 360) * width,
    y: ((90 - lat) / 180) * height,
  });
  const maxTasks = Math.max(...analyticsGeoSites.map((s) => s.tasks));
  return (
    <div style={{ overflowX: "auto" }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", minWidth: 480, height: "auto", background: "#f1f5f9", borderRadius: 8 }}>
        {/* Continent silhouettes (very simplified) */}
        <ellipse cx={120} cy={100} rx={50} ry={35} fill="#e2e8f0" />
        <ellipse cx={280} cy={90} rx={40} ry={28} fill="#e2e8f0" />
        <ellipse cx={340} cy={150} rx={30} ry={45} fill="#e2e8f0" />
        <ellipse cx={440} cy={110} rx={55} ry={40} fill="#e2e8f0" />
        <ellipse cx={520} cy={180} rx={35} ry={25} fill="#e2e8f0" />

        {/* Latitude lines */}
        {[60, 30, 0, -30].map((lat) => {
          const y = project(lat, 0).y;
          return <line key={lat} x1={0} y1={y} x2={width} y2={y} stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="3 3" />;
        })}

        {/* Sites */}
        {analyticsGeoSites.map((s) => {
          const { x, y } = project(s.lat, s.lng);
          const r = 4 + (s.tasks / maxTasks) * 12;
          const color = s.approvalRate >= 80 ? "#10b981" : s.approvalRate >= 75 ? "#3b82f6" : "#f59e0b";
          return (
            <g key={s.siteId}>
              <circle cx={x} cy={y} r={r} fill={color} fillOpacity={0.6} stroke={color} strokeWidth="1.5" />
              <circle cx={x} cy={y} r={2} fill={color} />
              <text x={x + r + 2} y={y + 3} style={{ fontSize: "9px", fill: "#475569", fontWeight: 500 }}>
                {s.city}
              </text>
              {s.emergingMarket && (
                <text x={x + r + 2} y={y + 13} style={{ fontSize: "8px", fill: "#9ca3af" }}>
                  EM · {s.tasks.toLocaleString()} tasks
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", fontSize: "0.7rem", color: "#6b7280", justifyContent: "center" }}>
        <span><span style={{ display: "inline-block", width: 10, height: 10, background: "#10b981", marginRight: 4, borderRadius: "50%" }} /> ≥80% approval</span>
        <span><span style={{ display: "inline-block", width: 10, height: 10, background: "#3b82f6", marginRight: 4, borderRadius: "50%" }} /> 75-79%</span>
        <span><span style={{ display: "inline-block", width: 10, height: 10, background: "#f59e0b", marginRight: 4, borderRadius: "50%" }} /> &lt;75%</span>
        <span>· bubble size = task volume</span>
      </div>
    </div>
  );
}

export default AnalyticsSection;
