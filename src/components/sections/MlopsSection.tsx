"use client";

import { useState } from "react";
import { SectionId } from "@/lib/trialgptbot";
import {
  mlopsKpis,
  mlopsModelVersions,
  mlopsAbTests,
  mlopsPipelineRuns,
  mlopsMonitoringMetrics,
} from "@/lib/trialgptbot";
import { BackToDashboard } from "./_BackToDashboard";
import { useLiveTick, formatSeconds } from "@/hooks/use-live-tick";

/**
 * MlopsSection — Comprehensive MLOps Infrastructure (Feature #14).
 *
 * Production-grade model lifecycle: versioning, A/B testing, automated
 * retraining pipelines, monitoring dashboards, bias detection, drift alerting.
 *
 * Surfaces:
 *   • KPI strip (registry size, A/B tests, retrain freq, deploy time, alerts, bias checks)
 *   • Model version registry (champion / challenger / shadow / archived)
 *   • A/B test results with statistical decision
 *   • Pipeline run history (retrain / evaluate / deploy / rollback / drift_check)
 *   • Live monitoring dashboard (8 metrics across 6 categories with 7-day sparklines)
 *
 * Tech Readiness: Production Ready | Impact: Foundation | Complexity: Medium
 */
interface MlopsSectionProps {
  onNavigate: (id: SectionId) => void;
}

const VERSION_STATUS_COLOR: Record<string, string> = {
  champion: "#10b981",
  challenger: "#f59e0b",
  shadow: "#8b5cf6",
  archived: "#94a3b8",
};

const AB_STATUS_COLOR: Record<string, string> = {
  running: "#3b82f6",
  completed: "#10b981",
  stopped_early: "#ef4444",
};

const PIPELINE_COLOR: Record<string, string> = {
  retrain: "#3b82f6",
  evaluate: "#8b5cf6",
  deploy: "#10b981",
  rollback: "#ef4444",
  drift_check: "#f59e0b",
};

const PIPELINE_STATUS_COLOR: Record<string, string> = {
  succeeded: "#10b981",
  running: "#3b82f6",
  failed: "#ef4444",
  cancelled: "#94a3b8",
};

const METRIC_STATUS_COLOR: Record<string, string> = {
  healthy: "#10b981",
  warning: "#f59e0b",
  critical: "#ef4444",
};

const CATEGORY_COLOR: Record<string, string> = {
  performance: "#3b82f6",
  drift: "#f59e0b",
  bias: "#ec4899",
  calibration: "#8b5cf6",
  latency: "#06b6d4",
  throughput: "#10b981",
};

const TREND_ARROW: Record<string, string> = { up: "↑", down: "↓", flat: "→" };

function Sparkline({ data, color = "#3b82f6" }: { data: number[]; color?: string }) {
  const W = 80;
  const H = 24;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const path = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * W;
      const y = H - ((v - min) / range) * H;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mlops-sparkline" preserveAspectRatio="none">
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" />
      <circle cx={W} cy={H - ((data[data.length - 1] - min) / range) * H} r="2" fill={color} />
    </svg>
  );
}

export function MlopsSection({ onNavigate }: MlopsSectionProps) {
  const [monitorFilter, setMonitorFilter] = useState<string>("all");
  const latestPipeline = mlopsPipelineRuns[0];
  const secs = useLiveTick(latestPipeline.startedAt);

  const filteredMetrics = monitorFilter === "all"
    ? mlopsMonitoringMetrics
    : mlopsMonitoringMetrics.filter((m) => m.category === monitorFilter);

  return (
    <div className="mlops-page">
      <BackToDashboard
        onNavigate={onNavigate}
        secondary={{ label: "Open Calibration", target: "calibration" }}
      />

      {/* Hero */}
      <section className="mlops-hero">
        <div className="mlops-hero-content">
          <div className="mlops-hero-title-row">
            <h1>⚙️ Comprehensive MLOps Infrastructure</h1>
            <span className="mlops-hero-badge">Feature #14 · Production Ready · Impact Foundation</span>
          </div>
          <p>
            Production-grade model lifecycle: versioning, A/B testing, automated
            retraining pipelines, monitoring dashboards, bias detection, and
            drift alerting. Champion/challenger pattern with shadow deployments
            for safe rollout; PSI-driven automated retraining; bias disparity
            checks across 8 demographic groups enforced before promotion.
          </p>
          <div className="mlops-hero-meta">
            <span>📦 47 models in registry (12 production)</span>
            <span>•</span>
            <span>🔄 Daily retrain cadence (drift-triggered)</span>
            <span>•</span>
            <span>📊 Last pipeline: {latestPipeline.pipeline} ({formatSeconds(secs)} ago)</span>
          </div>
        </div>
      </section>

      {/* KPI strip */}
      <section className="mlops-kpi-grid">
        {mlopsKpis.map((kpi) => (
          <div key={kpi.label} className="mlops-kpi-card">
            <div className="mlops-kpi-label">{kpi.label}</div>
            <div className="mlops-kpi-value-row">
              <span className="mlops-kpi-value">{kpi.value}</span>
              {kpi.deltaPct !== undefined && kpi.deltaPct !== 0 && (
                <span
                  className={`mlops-kpi-delta ${
                    (kpi.trend === "down" && kpi.deltaPct < 0) || (kpi.trend === "up" && kpi.deltaPct > 0)
                      ? "good"
                      : "bad"
                  }`}
                >
                  {TREND_ARROW[kpi.trend ?? "flat"]} {Math.abs(kpi.deltaPct)}%
                </span>
              )}
            </div>
            {kpi.hint && <div className="mlops-kpi-hint">{kpi.hint}</div>}
          </div>
        ))}
      </section>

      {/* Model version registry */}
      <section className="mlops-section">
        <div className="mlops-section-head">
          <h2>Model Version Registry</h2>
          <span className="mlops-section-sub">
            clinical-reviewer · champion / challenger / shadow / archived
          </span>
        </div>
        <div className="mlops-version-table">
          <div className="mlops-version-head">
            <span>Version</span>
            <span>Parent</span>
            <span>Status</span>
            <span>Traffic</span>
            <span>AUC</span>
            <span>ECE</span>
            <span>PSI</span>
            <span>Bias max</span>
            <span>Promoted</span>
            <span>Notes</span>
          </div>
          {mlopsModelVersions.map((v) => (
            <div key={v.versionId} className={`mlops-version-row ${v.status}`}>
              <span><code>{v.versionId}</code></span>
              <span>{v.parentVersion ? <code>{v.parentVersion}</code> : "—"}</span>
              <span>
                <span
                  className="mlops-version-status-pill"
                  style={{ background: `${VERSION_STATUS_COLOR[v.status]}22`, color: VERSION_STATUS_COLOR[v.status] }}
                >
                  {v.status}
                </span>
              </span>
              <span>
                <div className="mlops-traffic-bar-track">
                  <div
                    className="mlops-traffic-bar-fill"
                    style={{ width: `${v.trafficPct}%`, background: VERSION_STATUS_COLOR[v.status] }}
                  />
                  <span className="mlops-traffic-bar-val">{v.trafficPct}%</span>
                </div>
              </span>
              <span>{v.auc.toFixed(3)}</span>
              <span>{v.calibrationErrorPct.toFixed(1)}%</span>
              <span className={v.driftPsi > 0.15 ? "critical" : "healthy"}>{v.driftPsi.toFixed(3)}</span>
              <span className={v.biasMaxDisparity > 5 ? "critical" : "healthy"}>{v.biasMaxDisparity.toFixed(1)}%</span>
              <span>{new Date(v.promotedAt).toLocaleDateString()}</span>
              <span className="mlops-version-notes">{v.notes}</span>
            </div>
          ))}
        </div>
      </section>

      {/* A/B tests */}
      <section className="mlops-section">
        <div className="mlops-section-head">
          <h2>A/B Test Results</h2>
          <span className="mlops-section-sub">
            Champion vs challenger · statistical decision after target sample size
          </span>
        </div>
        <div className="mlops-ab-grid">
          {mlopsAbTests.map((t) => (
            <div key={t.testId} className={`mlops-ab-card ${t.status}`}>
              <div className="mlops-ab-head">
                <div>
                  <div className="mlops-ab-name">{t.name}</div>
                  <div className="mlops-ab-id"><code>{t.testId}</code></div>
                </div>
                <span
                  className="mlops-ab-status-pill"
                  style={{ background: `${AB_STATUS_COLOR[t.status]}22`, color: AB_STATUS_COLOR[t.status] }}
                >
                  {t.status.replace(/_/g, " ")}
                </span>
              </div>
              <div className="mlops-ab-versions">
                <div className="mlops-ab-version champion">
                  <span className="mlops-ab-version-label">Champion</span>
                  <code>{t.championVersion}</code>
                  <span className="mlops-ab-version-metric">{t.championMetric.toFixed(3)}</span>
                  <div className="mlops-ab-traffic-bar">
                    <div className="mlops-ab-traffic-fill" style={{ width: `${t.trafficSplit.champion}%` }} />
                  </div>
                  <span className="mlops-ab-traffic-pct">{t.trafficSplit.champion}%</span>
                </div>
                <div className="mlops-ab-version challenger">
                  <span className="mlops-ab-version-label">Challenger</span>
                  <code>{t.challengerVersion}</code>
                  <span className="mlops-ab-version-metric">{t.challengerMetric.toFixed(3)}</span>
                  <div className="mlops-ab-traffic-bar">
                    <div className="mlops-ab-traffic-fill" style={{ width: `${t.trafficSplit.challenger}%` }} />
                  </div>
                  <span className="mlops-ab-traffic-pct">{t.trafficSplit.challenger}%</span>
                </div>
              </div>
              <div className="mlops-ab-metric-row">
                <span className="mlops-ab-metric-label">Primary metric:</span>
                <span className="mlops-ab-metric-name">{t.primaryMetric}</span>
                <span
                  className={`mlops-ab-uplift ${t.upliftPct > 0 ? "good" : "bad"}`}
                >
                  {t.upliftPct > 0 ? "+" : ""}{t.upliftPct.toFixed(1)}%
                </span>
              </div>
              <div className="mlops-ab-progress-row">
                <span className="mlops-ab-progress-label">
                  Samples: {t.samplesCollected.toLocaleString()} / {t.samplesTarget.toLocaleString()}
                </span>
                <div className="mlops-ab-progress-track">
                  <div
                    className="mlops-ab-progress-fill"
                    style={{
                      width: `${Math.min(100, (t.samplesCollected / t.samplesTarget) * 100)}%`,
                      background: AB_STATUS_COLOR[t.status],
                    }}
                  />
                </div>
              </div>
              {t.decision && (
                <div className="mlops-ab-decision">
                  <span className="mlops-ab-decision-label">Decision:</span>
                  <span className="mlops-ab-decision-val">{t.decision}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Pipeline history */}
      <section className="mlops-section">
        <div className="mlops-section-head">
          <h2>Pipeline Run History</h2>
          <span className="mlops-section-sub">
            retrain / evaluate / deploy / rollback / drift_check
          </span>
        </div>
        <div className="mlops-pipeline-table">
          <div className="mlops-pipeline-head">
            <span>Run ID</span>
            <span>Pipeline</span>
            <span>Trigger</span>
            <span>Started</span>
            <span>Duration</span>
            <span>Steps</span>
            <span>Status</span>
            <span>Artifact</span>
          </div>
          {mlopsPipelineRuns.map((r) => (
            <div key={r.runId} className="mlops-pipeline-row">
              <span><code>{r.runId}</code></span>
              <span>
                <span
                  className="mlops-pipeline-pill"
                  style={{ background: `${PIPELINE_COLOR[r.pipeline]}22`, color: PIPELINE_COLOR[r.pipeline] }}
                >
                  {r.pipeline}
                </span>
              </span>
              <span>
                <span className={`mlops-trigger-pill ${r.triggeredBy}`}>{r.triggeredBy.replace(/_/g, " ")}</span>
              </span>
              <span>{new Date(r.startedAt).toLocaleString()}</span>
              <span>{(r.durationSec / 60).toFixed(1)} min</span>
              <span>{r.stepsCompleted}/{r.stepsTotal}</span>
              <span>
                <span
                  className="mlops-status-pill"
                  style={{ background: `${PIPELINE_STATUS_COLOR[r.status]}22`, color: PIPELINE_STATUS_COLOR[r.status] }}
                >
                  {r.status}
                </span>
              </span>
              <span><code>{r.artifact}</code></span>
            </div>
          ))}
        </div>
      </section>

      {/* Live monitoring */}
      <section className="mlops-section">
        <div className="mlops-section-head">
          <h2>Live Monitoring Dashboard</h2>
          <div className="mlops-monitor-filter">
            {["all", "performance", "drift", "bias", "calibration", "latency", "throughput"].map((c) => (
              <button
                key={c}
                type="button"
                className={`mlops-monitor-chip ${monitorFilter === c ? "active" : ""}`}
                onClick={() => setMonitorFilter(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="mlops-monitor-grid">
          {filteredMetrics.map((m) => {
            const ratio = m.value / m.threshold;
            const healthy = m.status === "healthy";
            return (
              <div key={m.metricId} className={`mlops-monitor-card ${m.status}`}>
                <div className="mlops-monitor-head">
                  <span
                    className="mlops-monitor-cat-pill"
                    style={{ background: `${CATEGORY_COLOR[m.category]}22`, color: CATEGORY_COLOR[m.category] }}
                  >
                    {m.category}
                  </span>
                  <span
                    className="mlops-monitor-status-dot"
                    style={{ background: METRIC_STATUS_COLOR[m.status] }}
                    aria-hidden="true"
                  />
                </div>
                <div className="mlops-monitor-name">{m.name}</div>
                <div className="mlops-monitor-value-row">
                  <span className="mlops-monitor-value">
                    {m.value.toLocaleString()}{m.unit && ` ${m.unit}`}
                  </span>
                  <Sparkline data={m.trend7d} color={METRIC_STATUS_COLOR[m.status]} />
                </div>
                <div className="mlops-monitor-threshold">
                  threshold: {m.threshold}{m.unit} · {ratio < 0.7 ? "well within" : ratio < 1 ? "approaching" : "exceeded"}
                </div>
                <div className="mlops-monitor-bar-track">
                  <div
                    className="mlops-monitor-bar-fill"
                    style={{
                      width: `${Math.min(100, ratio * 100)}%`,
                      background: METRIC_STATUS_COLOR[m.status],
                    }}
                  />
                </div>
                <div className="mlops-monitor-desc">{m.description}</div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default MlopsSection;
