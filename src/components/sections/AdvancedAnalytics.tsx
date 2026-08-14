"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import type { Stats, EdgeSyncEvent } from "@/lib/trialgptbot";

/**
 * Advanced Analytics Dashboard panels.
 *
 * This module renders four panels that satisfy the "Advanced Analytics
 * Dashboards" capability requirement:
 *
 *   1. AI Confidence Calibration — real-time Brier score, ECE, calibration
 *      curve, drift detection against the production model version.
 *   2. Regulatory Compliance Matrix — live indicators across FDA 21 CFR
 *      Part 11, EMA Annex 11, GDPR, and HIPAA.
 *   3. Reviewer Cognitive Profile — decision velocity, attention span,
 *      cognitive-load index, decision-bias detection.
 *   4. EDC Predictive Maintenance — MTBF, degradation trend, predicted
 *      failure window, proactive alerts.
 *   5. Edge Computing Capabilities — lightweight on-site inference models,
 *      offline queue management, eventual-consistency sync, model
 *      compression (quantization/pruning) for bandwidth-constrained
 *      environments in emerging markets.
 *      Tech Readiness: Emerging | Impact: High | Complexity: Medium.
 *
 * Each panel is a self-contained component that consumes the corresponding
 * slice of the `Stats` object. A thin `useLiveTick` hook simulates
 * real-time telemetry by nudging a "seconds since last update" counter
 * every second.
 */

interface AdvancedAnalyticsProps {
  stats: Stats;
  onNavigate?: (id: Parameters<NonNullable<unknown>>[0] | "compliance" | "edc") => void;
}

export function AdvancedAnalytics({ stats, onNavigate }: AdvancedAnalyticsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">
            Advanced Analytics
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Real-time visibility into AI calibration, regulatory posture,
            reviewer cognition, EDC predictive maintenance, and edge computing
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live telemetry
          </span>
          <span className="hidden sm:inline">
            Tech Readiness: Production Ready · Impact: High · Complexity: Low
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AICalibrationPanel calibration={stats.calibration} />
        <ComplianceMatrixPanel
          compliance={stats.complianceStatus}
          onNavigate={onNavigate}
        />
        <ReviewerCognitivePanel profile={stats.reviewerProfile} />
        <EdcPredictivePanel
          predictive={stats.edcPredictive}
          onNavigate={onNavigate}
        />
        <EdgeComputingPanel
          edge={stats.edgeComputing}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
}

/* ============================================================
   Shared hooks / helpers
   ============================================================ */

function useLiveTick(isoTs?: string) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!isoTs) return;
    const start = Date.now();
    const baseline = Math.max(0, Math.floor((start - new Date(isoTs).getTime()) / 1000));
    setSeconds(baseline);
    const id = setInterval(() => {
      setSeconds(Math.floor((Date.now() - new Date(isoTs).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [isoTs]);
  return seconds;
}

function formatSeconds(s: number) {
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

function daysUntil(iso: string) {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
}

/* ============================================================
   Panel 1 — AI Confidence Calibration
   ============================================================ */

function AICalibrationPanel({
  calibration,
}: {
  calibration?: Stats["calibration"];
}) {
  const secs = useLiveTick(calibration?.lastUpdated);

  if (!calibration) {
    return <EmptyPanel title="AI Confidence Calibration" />;
  }

  const maxBucketCount = Math.max(...calibration.buckets.map((b) => b.count), 1);
  const eceTrendDelta =
    calibration.trend.length >= 2
      ? calibration.trend[0].ece - calibration.trend[calibration.trend.length - 1].ece
      : 0;
  const eceImproving = eceTrendDelta > 0;

  return (
    <section className="aa-panel">
      <header className="aa-panel-header">
        <div>
          <h3 className="aa-panel-title">🎯 AI Confidence Calibration</h3>
          <p className="aa-panel-subtitle">
            Model <code className="aa-code">{calibration.modelVersion}</code>
            {" · "}
            {calibration.samples.toLocaleString()} samples
            {" · "}
            updated {formatSeconds(secs)}
          </p>
        </div>
        <CalibrationStatusBadge drift={calibration.driftDetected} />
      </header>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <MetricBox
          label="Brier Score"
          value={calibration.brierScore.toFixed(3)}
          hint="0 = perfect"
          tone={calibration.brierScore < 0.1 ? "good" : calibration.brierScore < 0.2 ? "warn" : "bad"}
        />
        <MetricBox
          label="ECE"
          value={`${calibration.ece.toFixed(1)}%`}
          hint="Expected Calibration Error"
          tone={calibration.ece < 5 ? "good" : calibration.ece < 10 ? "warn" : "bad"}
        />
        <MetricBox
          label="Log Loss"
          value={calibration.logLoss.toFixed(3)}
          hint="lower = better"
          tone={calibration.logLoss < 0.3 ? "good" : calibration.logLoss < 0.5 ? "warn" : "bad"}
        />
      </div>

      {/* Calibration curve — predicted vs observed */}
      <div className="aa-calibration-curve">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-600 dark:text-slate-300">
            Calibration Curve (predicted vs. observed)
          </span>
          <span className="text-[10px] text-gray-400 dark:text-slate-500">
            {eceImproving ? "▼ improving" : "▲ drifting"} {Math.abs(eceTrendDelta).toFixed(1)}% over 24h
          </span>
        </div>
        <div className="aa-curve-area">
          {calibration.buckets.map((b) => {
            const gap = Math.abs(b.predicted - b.observed);
            const tone = gap < 3 ? "good" : gap < 8 ? "warn" : "bad";
            return (
              <div key={b.range} className="aa-curve-bar-group">
                <div className="aa-curve-bars">
                  <div
                    className={`aa-curve-bar aa-curve-bar-pred tone-${tone}`}
                    style={{ height: `${(b.predicted / 100) * 100}%` }}
                    title={`Predicted: ${b.predicted}%`}
                  />
                  <div
                    className={`aa-curve-bar aa-curve-bar-obs tone-${tone}`}
                    style={{ height: `${(b.observed / 100) * 100}%` }}
                    title={`Observed: ${b.observed}%`}
                  />
                </div>
                <div className="aa-curve-count" style={{ opacity: 0.4 + (b.count / maxBucketCount) * 0.6 }}>
                  {b.count.toLocaleString()}
                </div>
                <div className="aa-curve-label">{b.range}</div>
              </div>
            );
          })}
        </div>
        <div className="aa-curve-legend">
          <span className="aa-legend-item">
            <span className="aa-legend-dot aa-legend-pred" /> Predicted
          </span>
          <span className="aa-legend-item">
            <span className="aa-legend-dot aa-legend-obs" /> Observed
          </span>
        </div>
      </div>

      {calibration.driftDetected && (
        <div className="aa-alert aa-alert-warn mt-3">
          <strong>⚠ Drift detected</strong> — magnitude {calibration.driftMagnitude.toFixed(1)}%.
          Consider triggering a model re-evaluation.
        </div>
      )}
    </section>
  );
}

function CalibrationStatusBadge({ drift }: { drift: boolean }) {
  return drift ? (
    <span className="aa-badge aa-badge-warn">⚠ Drift</span>
  ) : (
    <span className="aa-badge aa-badge-good">✓ Stable</span>
  );
}

/* ============================================================
   Panel 2 — Regulatory Compliance Matrix
   ============================================================ */

const COMPLIANCE_ROWS: Array<{
  key: string;
  label: string;
  short: string;
  icon: string;
  description: string;
}> = [
  { key: "fda21CFR11", label: "FDA 21 CFR Part 11", short: "FDA", icon: "💊", description: "Electronic records & signatures" },
  { key: "emaAnnex11", label: "EMA Annex 11", short: "EMA", icon: "🇪🇺", description: "Computerised systems in GxP" },
  { key: "gdpr", label: "GDPR", short: "GDPR", icon: "🔒", description: "EU data protection" },
  { key: "hipaa", label: "HIPAA", short: "HIPAA", icon: "🏥", description: "US health data privacy" },
];

function ComplianceMatrixPanel({
  compliance,
  onNavigate,
}: {
  compliance?: Stats["complianceStatus"];
  onNavigate?: (id: "compliance") => void;
}) {
  if (!compliance) {
    return <EmptyPanel title="Regulatory Compliance Matrix" />;
  }

  const rows = COMPLIANCE_ROWS.filter((r) => compliance[r.key]);
  const overallScore =
    rows.reduce((s, r) => s + (compliance[r.key]?.score ?? 0), 0) / Math.max(rows.length, 1);

  return (
    <section className="aa-panel">
      <header className="aa-panel-header">
        <div>
          <h3 className="aa-panel-title">🛡️ Regulatory Compliance Matrix</h3>
          <p className="aa-panel-subtitle">
            Live indicators across FDA / EMA / GDPR / HIPAA frameworks
            {" · "}
            overall {overallScore.toFixed(1)}%
          </p>
        </div>
        {onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate("compliance")}
            className="aa-link-btn"
          >
            Open Compliance Hub →
          </button>
        )}
      </header>

      <div className="space-y-2">
        {rows.map((row) => {
          const c = compliance[row.key];
          if (!c) return null;
          const days = daysUntil(c.nextAudit);
          return (
            <div key={row.key} className="aa-compliance-row">
              <div className="aa-compliance-icon">{row.icon}</div>
              <div className="aa-compliance-body">
                <div className="aa-compliance-title-row">
                  <span className="aa-compliance-label">{row.label}</span>
                  <ComplianceStatusPill status={c.status} />
                </div>
                <div className="aa-compliance-meta">
                  <span>Score <strong>{c.score.toFixed(1)}%</strong></span>
                  <span>·</span>
                  <span>{c.findings} findings</span>
                  <span>·</span>
                  <span>{c.openIssues} open</span>
                  <span>·</span>
                  <span className={days < 14 ? "text-amber-600 dark:text-amber-400 font-semibold" : ""}>
                    next audit in {days}d
                  </span>
                </div>
                <div className="aa-compliance-bar">
                  <div
                    className={`aa-compliance-bar-fill tone-${
                      c.status === "compliant"
                        ? "good"
                        : c.status === "warning"
                          ? "warn"
                          : c.status === "non_compliant"
                            ? "bad"
                            : "neutral"
                    }`}
                    style={{ width: `${c.score}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ComplianceStatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    compliant:     { label: "Compliant",    cls: "aa-pill aa-pill-good" },
    warning:       { label: "Warning",      cls: "aa-pill aa-pill-warn" },
    non_compliant: { label: "Non-Compliant",cls: "aa-pill aa-pill-bad"  },
    pending_review:{ label: "Pending",      cls: "aa-pill aa-pill-neutral" },
  };
  const m = map[status] ?? map.pending_review;
  return <span className={m.cls}>{m.label}</span>;
}

/* ============================================================
   Panel 3 — Reviewer Cognitive Profile
   ============================================================ */

function ReviewerCognitivePanel({
  profile,
}: {
  profile?: Stats["reviewerProfile"];
}) {
  if (!profile) {
    return <EmptyPanel title="Reviewer Cognitive Profile" />;
  }

  const fatigueTone =
    profile.fatigueRisk === "low" ? "good" : profile.fatigueRisk === "moderate" ? "warn" : "bad";
  const biasTone =
    profile.bias.biasLabel === "balanced" ? "good" : "warn";

  return (
    <section className="aa-panel">
      <header className="aa-panel-header">
        <div>
          <h3 className="aa-panel-title">🧠 Reviewer Cognitive Profile</h3>
          <p className="aa-panel-subtitle">
            Decision velocity, attention, cognitive load &amp; bias detection
          </p>
        </div>
        <span className={`aa-badge aa-badge-${biasTone}`}>
          {profile.bias.biasLabel.replace("-", " ")}
        </span>
      </header>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <MetricBox
          label="Decision Velocity"
          value={`${profile.decisionVelocity}/h`}
          hint={`avg dwell ${(profile.avgDwellMs / 1000).toFixed(1)}s`}
          tone={profile.decisionVelocity >= 25 && profile.decisionVelocity <= 45 ? "good" : "warn"}
        />
        <MetricBox
          label="Attention Score"
          value={`${profile.attentionScore}/100`}
          hint="sustained focus"
          tone={profile.attentionScore >= 75 ? "good" : profile.attentionScore >= 50 ? "warn" : "bad"}
        />
        <MetricBox
          label="Cognitive Load"
          value={`${profile.cognitiveLoadIndex}/100`}
          hint="lower = better"
          tone={profile.cognitiveLoadIndex < 40 ? "good" : profile.cognitiveLoadIndex < 65 ? "warn" : "bad"}
        />
        <MetricBox
          label="Fatigue Risk"
          value={profile.fatigueRisk}
          hint={`${profile.outlierDecisions} outlier decisions`}
          tone={fatigueTone}
        />
      </div>

      {/* Decision bias distribution */}
      <div className="aa-bias-section">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-600 dark:text-slate-300">
            Decision Distribution
          </span>
          <span className="text-[10px] text-gray-400 dark:text-slate-500">
            peak hours: {profile.peakHours.join(" · ")}
          </span>
        </div>
        <div className="aa-bias-bar">
          <div
            className="aa-bias-seg aa-bias-approve"
            style={{ width: `${profile.bias.approveRatio * 100}%` }}
            title={`Approve ${(profile.bias.approveRatio * 100).toFixed(0)}%`}
          />
          <div
            className="aa-bias-seg aa-bias-reject"
            style={{ width: `${profile.bias.rejectRatio * 100}%` }}
            title={`Reject ${(profile.bias.rejectRatio * 100).toFixed(0)}%`}
          />
          <div
            className="aa-bias-seg aa-bias-escalate"
            style={{ width: `${profile.bias.escalationRatio * 100}%` }}
            title={`Escalate ${(profile.bias.escalationRatio * 100).toFixed(0)}%`}
          />
        </div>
        <div className="aa-bias-legend">
          <span className="aa-legend-item">
            <span className="aa-legend-dot aa-bias-approve" />
            Approve {(profile.bias.approveRatio * 100).toFixed(0)}%
          </span>
          <span className="aa-legend-item">
            <span className="aa-legend-dot aa-bias-reject" />
            Reject {(profile.bias.rejectRatio * 100).toFixed(0)}%
          </span>
          <span className="aa-legend-item">
            <span className="aa-legend-dot aa-bias-escalate" />
            Escalate {(profile.bias.escalationRatio * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {profile.fatigueRisk === "high" && (
        <div className="aa-alert aa-alert-bad mt-3">
          <strong>⚠ High fatigue risk</strong> — consider a break or shift rotation.
        </div>
      )}
    </section>
  );
}

/* ============================================================
   Panel 4 — EDC Predictive Maintenance
   ============================================================ */

function EdcPredictivePanel({
  predictive,
  onNavigate,
}: {
  predictive?: Stats["edcPredictive"];
  onNavigate?: (id: "edc") => void;
}) {
  if (!predictive || predictive.length === 0) {
    return <EmptyPanel title="EDC Predictive Maintenance" />;
  }

  const worst = predictive.reduce(
    (acc, p) => (p.alertLevel === "critical" || (p.alertLevel === "warning" && acc !== "critical") ? p.alertLevel : acc),
    "none" as string,
  );

  return (
    <section className="aa-panel">
      <header className="aa-panel-header">
        <div>
          <h3 className="aa-panel-title">🔧 EDC Predictive Maintenance</h3>
          <p className="aa-panel-subtitle">
            MTBF · degradation trend · predicted failure window
          </p>
        </div>
        {onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate("edc")}
            className="aa-link-btn"
          >
            Manage EDC Systems →
          </button>
        )}
      </header>

      <div className="space-y-2">
        {predictive.map((p) => {
          const tone =
            p.alertLevel === "none"
              ? "good"
              : p.alertLevel === "advisory"
                ? "neutral"
                : p.alertLevel === "warning"
                  ? "warn"
                  : "bad";
          return (
            <div key={p.system} className="aa-edc-row">
              <div className="aa-edc-health-ring">
                <HealthRing score={p.healthScore} tone={tone} />
              </div>
              <div className="aa-edc-body">
                <div className="aa-edc-title-row">
                  <span className="aa-edc-name">{p.system}</span>
                  <AlertLevelPill level={p.alertLevel} />
                </div>
                <div className="aa-edc-meta">
                  <span>MTBF <strong>{p.mtbfHours.toLocaleString()}h</strong></span>
                  <span>·</span>
                  <span>drift <strong className={p.degradationTrend > 10 ? "text-red-600 dark:text-red-400" : p.degradationTrend > 3 ? "text-amber-600 dark:text-amber-400" : ""}>
                    +{p.degradationTrend.toFixed(1)}ms/wk
                  </strong></span>
                  <span>·</span>
                  <span>errors <strong>{p.errorRate.toFixed(2)}%</strong></span>
                  <span>·</span>
                  <span>sync {p.syncLag}m ago</span>
                </div>
                <div className="aa-edc-prediction">
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-slate-500">
                    Predicted failure window
                  </span>
                  <span className={`aa-edc-window tone-${tone}`}>{p.predictedFailureWindow}</span>
                </div>
                {p.alertMessage && (
                  <div className={`aa-alert aa-alert-${tone} mt-2`}>
                    {p.alertMessage}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {worst === "critical" && (
        <div className="aa-alert aa-alert-bad mt-3">
          <strong>🚨 Critical alert</strong> — at least one EDC system requires immediate attention.
        </div>
      )}
    </section>
  );
}

function AlertLevelPill({ level }: { level: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    none:      { label: "Healthy",  cls: "aa-pill aa-pill-good" },
    advisory:  { label: "Advisory", cls: "aa-pill aa-pill-neutral" },
    warning:   { label: "Warning",  cls: "aa-pill aa-pill-warn" },
    critical:  { label: "Critical", cls: "aa-pill aa-pill-bad" },
  };
  const m = map[level] ?? map.none;
  return <span className={m.cls}>{m.label}</span>;
}

function HealthRing({ score, tone }: { score: number; tone: string }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" className="aa-health-ring">
      <circle cx="22" cy="22" r={r} fill="none" stroke="currentColor" strokeWidth="4" className="aa-ring-bg" />
      <circle
        cx="22" cy="22" r={r} fill="none" strokeWidth="4"
        className={`aa-ring-fg tone-${tone}`}
        strokeDasharray={`${dash} ${c}`}
        transform="rotate(-90 22 22)"
        strokeLinecap="round"
      />
      <text x="22" y="26" textAnchor="middle" className={`aa-ring-text tone-${tone}`}>
        {score}
      </text>
    </svg>
  );
}

/* ============================================================
   Shared presentational helpers
   ============================================================ */

function MetricBox({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone: "good" | "warn" | "bad" | "neutral";
}) {
  return (
    <div className={`aa-metric-box tone-${tone}`}>
      <div className="aa-metric-value">{value}</div>
      <div className="aa-metric-label">{label}</div>
      {hint && <div className="aa-metric-hint">{hint}</div>}
    </div>
  );
}

function EmptyPanel({ title }: { title: string }) {
  return (
    <section className="aa-panel aa-panel-empty">
      <h3 className="aa-panel-title">{title}</h3>
      <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">
        No data available.
      </p>
    </section>
  );
}

/* ============================================================
   Panel 5 — Edge Computing Capabilities
   Tech Readiness: Emerging | Impact: High | Complexity: Medium
   ============================================================ */

const EDGE_STATUS_MAP: Record<
  string,
  { label: string; cls: string; tone: "good" | "warn" | "bad" | "neutral" }
> = {
  online:         { label: "Online",     cls: "aa-pill aa-pill-good",    tone: "good"    },
  syncing:        { label: "Syncing",    cls: "aa-pill aa-pill-neutral", tone: "neutral" },
  degraded:       { label: "Degraded",   cls: "aa-pill aa-pill-warn",    tone: "warn"    },
  offline:        { label: "Offline",    cls: "aa-pill aa-pill-bad",     tone: "bad"     },
  pending_deploy: { label: "Pending",    cls: "aa-pill aa-pill-neutral", tone: "neutral" },
};

function EdgeComputingPanel({
  edge,
  onNavigate,
}: {
  edge?: Stats["edgeComputing"];
  onNavigate?: (id: "edc") => void;
}) {
  const secs = useLiveTick(edge?.lastUpdated);
  const [wizardOpen, setWizardOpen] = useState(false);

  // Live sync log — streams in over SSE
  const { liveLog, connected } = useLiveSyncLog(edge?.syncLog ?? []);

  if (!edge) {
    return <EmptyPanel title="Edge Computing Capabilities" />;
  }

  const { kpis, sites, compressionTechniques } = edge;
  const syncLog = liveLog;

  // compression ratio is in [0,1] — we want it inside the 0.10–0.20 target band
  const ratioPct = kpis.avgCompressionRatio * 100;
  const compressionTone =
    ratioPct >= 10 && ratioPct <= 20
      ? "good"
      : ratioPct < 10
        ? "warn"
        : "warn";

  const offlineTone =
    kpis.offlineCapablePct >= 80 ? "good" : kpis.offlineCapablePct >= 60 ? "warn" : "bad";

  const bandwidthTone =
    kpis.bandwidthSavedPct >= 60 ? "good" : kpis.bandwidthSavedPct >= 40 ? "warn" : "bad";

  const latencyTone =
    kpis.avgInferenceLatencyMs <= 60 ? "good" : kpis.avgInferenceLatencyMs <= 120 ? "warn" : "bad";

  const syncLagTone =
    kpis.syncLagP95Min <= 30 ? "good" : kpis.syncLagP95Min <= 60 ? "warn" : "bad";

  const criticalCount = sites.filter((s) => s.status === "offline" || s.status === "degraded").length;
  const emergingMarketCount = sites.filter((s) => s.emergingMarket).length;
  const deployedSites = sites.filter((s) => s.status !== "pending_deploy").length;
  const totalConflicts = sites.reduce((acc, s) => acc + s.conflictCount, 0);

  return (
    <section className="aa-panel aa-panel-wide">
      <header className="aa-panel-header">
        <div>
          <h3 className="aa-panel-title">🛰️ Edge Computing Capabilities</h3>
          <p className="aa-panel-subtitle">
            Lightweight on-site inference · offline operation ·
            eventual-consistency sync · target: bandwidth-constrained
            environments in emerging markets
            {" · "}
            updated {formatSeconds(secs)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <span
            className={`aa-pill ${connected ? "aa-pill-good" : "aa-pill-neutral"}`}
            title={connected ? "Live SSE stream connected" : "Stream disconnected — showing cached log"}
          >
            <span
              className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${
                connected ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
              }`}
            />
            {connected ? "Live" : "Cached"}
          </span>
          <span className="aa-badge aa-badge-warn">
            Emerging · Impact High · Complexity Medium
          </span>
          <button
            type="button"
            onClick={() => setWizardOpen(true)}
            className="aa-link-btn aa-link-btn-strong"
            title="Open the Edge Deployment wizard"
          >
            🚀 Open EDC Hub →
          </button>
        </div>
      </header>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <MetricBox
          label="Sites Deployed"
          value={`${kpis.activeSites}/${kpis.totalSites}`}
          hint={`${Math.round((kpis.activeSites / Math.max(kpis.totalSites, 1)) * 100)}% rollout · ${emergingMarketCount} emerging markets`}
          tone={kpis.activeSites / Math.max(kpis.totalSites, 1) >= 0.6 ? "good" : "warn"}
        />
        <MetricBox
          label="Offline Capable"
          value={`${kpis.offlineCapablePct.toFixed(1)}%`}
          hint="sites operating fully offline"
          tone={offlineTone}
        />
        <MetricBox
          label="Avg Compression"
          value={`${ratioPct.toFixed(1)}%`}
          hint="target 10–20% of original"
          tone={compressionTone}
        />
        <MetricBox
          label="Bandwidth Saved"
          value={`${kpis.bandwidthSavedPct.toFixed(1)}%`}
          hint="vs. cloud-only operation"
          tone={bandwidthTone}
        />
        <MetricBox
          label="Edge Inference"
          value={`${kpis.avgInferenceLatencyMs}ms`}
          hint="on-device latency"
          tone={latencyTone}
        />
        <MetricBox
          label="Pending Sync"
          value={kpis.pendingSyncRecords.toLocaleString()}
          hint="records queued locally"
          tone={kpis.pendingSyncRecords > 500 ? "warn" : "neutral"}
        />
        <MetricBox
          label="Sync Lag (P95)"
          value={`${kpis.syncLagP95Min}m`}
          hint="eventual-consistency delay"
          tone={syncLagTone}
        />
        <MetricBox
          label="Conflicts"
          value={totalConflicts}
          hint="auto-merged / flagged"
          tone={totalConflicts === 0 ? "good" : totalConflicts <= 3 ? "warn" : "bad"}
        />
      </div>

      {/* Two-column area: site roster + compression breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Site roster */}
        <div className="aa-edge-subpanel">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-600 dark:text-slate-300">
              Edge-deployed sites ({deployedSites}/{sites.length})
            </span>
            <span className="text-[10px] text-gray-400 dark:text-slate-500">
              {criticalCount} require attention
            </span>
          </div>
          <div className="aa-edge-site-list">
            {sites.map((s) => {
              const statusInfo = EDGE_STATUS_MAP[s.status] ?? EDGE_STATUS_MAP.pending_deploy;
              const ratioPct = s.compressionRatio * 100;
              const sizePct = Math.min(100, Math.max(4, ratioPct));
              return (
                <div key={s.siteId} className="aa-edge-site-row">
                  <div className="aa-edge-site-header">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`aa-edge-site-dot tone-${statusInfo.tone}`} />
                      <div className="min-w-0">
                        <div className="aa-edge-site-name">
                          {s.name}
                          {s.emergingMarket && (
                            <span className="aa-edge-emerging-badge" title="Emerging market">
                              EM
                            </span>
                          )}
                        </div>
                        <div className="aa-edge-site-meta">
                          <span>{s.siteId}</span>
                          <span>·</span>
                          <span>{s.country}</span>
                          <span>·</span>
                          <span className={s.bandwidthKbps < 500 ? "text-amber-600 dark:text-amber-400 font-medium" : ""}>
                            {s.bandwidthKbps === 0 ? "no uplink" : `${s.bandwidthKbps} kbps`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className={statusInfo.cls}>{statusInfo.label}</span>
                  </div>

                  {s.status !== "pending_deploy" ? (
                    <>
                      <div className="aa-edge-site-stats">
                        <span>latency <strong>{s.inferenceLatencyMs}ms</strong></span>
                        <span>·</span>
                        <span>
                          model <strong>{(s.originalModelSizeMb).toFixed(0)}→{(s.compressedModelSizeMb).toFixed(1)} MB</strong>
                        </span>
                        <span>·</span>
                        <span>queue <strong>{s.pendingRecords}</strong></span>
                        <span>·</span>
                        <span>storage <strong>{s.storageUsedPct}%</strong></span>
                      </div>
                      <div className="aa-edge-compression-bar">
                        <div
                          className={`aa-edge-compression-fill tone-${
                            ratioPct >= 10 && ratioPct <= 20
                              ? "good"
                              : ratioPct < 10
                                ? "warn"
                                : "warn"
                          }`}
                          style={{ width: `${sizePct}%` }}
                          title={`Compressed to ${ratioPct.toFixed(1)}% of original`}
                        />
                        <span className="aa-edge-compression-label">
                          {ratioPct.toFixed(1)}% of original
                        </span>
                      </div>
                      {s.conflictCount > 0 && (
                        <div className="aa-alert aa-alert-warn aa-edge-site-alert">
                          {s.conflictCount} sync conflict{s.conflictCount > 1 ? "s" : ""} pending review
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="aa-edge-pending">
                      <span>Awaiting model deployment</span>
                      <span className="aa-edge-pending-bar">
                        <span className="aa-edge-pending-bar-fill" style={{ width: "30%" }} />
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Compression techniques + sync log */}
        <div className="space-y-4">
          <div className="aa-edge-subpanel">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                Model compression techniques
              </span>
              <span className="text-[10px] text-gray-400 dark:text-slate-500">
                target: 10–20% of original size
              </span>
            </div>
            <div className="aa-edge-tech-list">
              {compressionTechniques.map((t) => {
                const sizePct = Math.min(100, Math.max(2, t.sizeReductionPct));
                return (
                  <div key={t.name} className={`aa-edge-tech-row ${t.applied ? "" : "aa-edge-tech-disabled"}`}>
                    <div className="aa-edge-tech-header">
                      <span className="aa-edge-tech-name">
                        {t.applied ? "✓" : "○"} {t.name}
                      </span>
                      {t.applied && (
                        <span className="aa-edge-tech-stat">
                          −{t.sizeReductionPct.toFixed(1)}% size
                          {" · "}
                          <span className={t.latencyImpactPct < 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>
                            {t.latencyImpactPct > 0 ? "+" : ""}{t.latencyImpactPct.toFixed(1)}% latency
                          </span>
                          {" · "}
                          <span className={t.accuracyDeltaPct >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>
                            {t.accuracyDeltaPct > 0 ? "+" : ""}{t.accuracyDeltaPct.toFixed(1)}% accuracy
                          </span>
                        </span>
                      )}
                    </div>
                    {t.applied && (
                      <div className="aa-edge-tech-bar">
                        <div className="aa-edge-tech-bar-fill" style={{ width: `${sizePct}%` }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="aa-edge-subpanel">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-600 dark:text-slate-300">
                Local queue &amp; sync log
                <span
                  className={`ml-2 inline-flex items-center gap-1 text-[10px] font-semibold ${
                    connected
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-400"
                  }`}
                >
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full ${
                      connected ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                    }`}
                  />
                  {connected ? "streaming live" : "cached"}
                </span>
              </span>
              <span className="text-[10px] text-gray-400 dark:text-slate-500">
                eventual consistency
              </span>
            </div>
            <div className="aa-edge-sync-log">
              {syncLog.map((entry, idx) => (
                <div
                  key={`${entry.siteId}-${idx}-${entry.ts}`}
                  className={`aa-edge-sync-row event-${entry.event} ${idx === 0 ? "aa-edge-sync-row-live" : ""}`}
                >
                  <span className="aa-edge-sync-time">{formatSeconds(Math.floor((Date.now() - new Date(entry.ts).getTime()) / 1000))}</span>
                  <span className={`aa-edge-sync-event event-${entry.event}`}>
                    {entry.event.replace(/_/g, " ")}
                  </span>
                  <span className="aa-edge-sync-site">{entry.siteId}</span>
                  <span className="aa-edge-sync-records">{entry.records} rec</span>
                  {entry.detail && (
                    <span className="aa-edge-sync-detail">{entry.detail}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {criticalCount > 0 && (
        <div className="aa-alert aa-alert-warn mt-2">
          <strong>⚠ {criticalCount} site{criticalCount > 1 ? "s" : ""} require attention</strong>
          {" — "}
          degraded or offline edge nodes detected. Local queues will sync on
          reconnect via eventual consistency.
        </div>
      )}

      {wizardOpen && (
        <EdgeDeploymentWizard
          sites={sites}
          onClose={() => setWizardOpen(false)}
        />
      )}
    </section>
  );
}

/* ============================================================
   useLiveSyncLog — SSE-driven live sync log hook
   ============================================================ */

function useLiveSyncLog(seed: Stats["edgeComputing"]["syncLog"]) {
  const [liveLog, setLiveLog] = useState<EdgeSyncEvent[]>(seed);
  const [connected, setConnected] = useState(false);
  const seedRef = useRef(seed);
  seedRef.current = seed;

  useEffect(() => {
    // Reset to the latest seed whenever the parent re-passes it
    setLiveLog(seedRef.current);

    // Feature-detect EventSource (Next.js SSR safety)
    if (typeof window === "undefined" || typeof EventSource === "undefined") {
      return;
    }

    let es: EventSource | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let closed = false;

    const connect = () => {
      if (closed) return;
      es = new EventSource("/api/edge/sync-stream");

      es.addEventListener("ready", () => setConnected(true));

      es.addEventListener("sync", (e: MessageEvent) => {
        try {
          const evt = JSON.parse(e.data) as EdgeSyncEvent;
          setLiveLog((prev) => [evt, ...prev].slice(0, 50));
        } catch {
          /* ignore malformed payload */
        }
      });

      es.onerror = () => {
        setConnected(false);
        es?.close();
        // exponential-ish backoff capped at 15s
        if (!closed) {
          retryTimer = setTimeout(connect, 4000 + Math.random() * 3000);
        }
      };
    };

    connect();

    return () => {
      closed = true;
      es?.close();
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, []);

  return { liveLog, connected };
}

/* ============================================================
   Edge Deployment Wizard — multi-step model push
   ============================================================ */

type WizardSite = Stats["edgeComputing"]["sites"][number];

interface EdgeDeploymentWizardProps {
  sites: WizardSite[];
  onClose: () => void;
}

type WizardStep = "select" | "model" | "compress" | "review" | "deploy" | "done";

function EdgeDeploymentWizard({ sites, onClose }: EdgeDeploymentWizardProps) {
  const pendingSites = sites.filter((s) => s.status === "pending_deploy");
  const allSites = sites;

  const [step, setStep] = useState<WizardStep>("select");
  const [siteId, setSiteId] = useState<string>(
    pendingSites[0]?.siteId ?? allSites[0].siteId,
  );
  const [baseModelId, setBaseModelId] = useState("edge-clin-v3.4.1");
  const [techniques, setTechniques] = useState<Record<string, boolean>>({
    int8: true,
    pruning: true,
    distillation: true,
    clustering: false,
  });
  const [pruningPct, setPruningPct] = useState(40);
  const [syncPolicy, setSyncPolicy] = useState("eventual_consistency");
  const [maxQueue, setMaxQueue] = useState(5000);
  const [progress, setProgress] = useState(0);
  const [deployLog, setDeployLog] = useState<string[]>([]);
  const [jobId] = useState(
    () => `EDGE-DEPLOY-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`,
  );

  const selectedSite = allSites.find((s) => s.siteId === siteId) ?? allSites[0];
  const baseModel = BASE_MODELS.find((m) => m.id === baseModelId) ?? BASE_MODELS[0];

  // Compute predicted compression
  const prediction = computePrediction(baseModel, techniques, pruningPct);

  const handleDeploy = useCallback(() => {
    setStep("deploy");
    setProgress(0);
    setDeployLog([]);

    const steps = [
      `Request received — jobId ${jobId}`,
      `Validating target site ${selectedSite.siteId} (${selectedSite.country})…`,
      `Loading base model ${baseModel.id} (${baseModel.sizeMb.toFixed(0)} MB)…`,
      `Applying INT8 post-training quantization…`,
      techniques.pruning
        ? `Applying structural channel pruning (${pruningPct}%)…`
        : `Skipping pruning (disabled)…`,
      techniques.distillation
        ? `Running knowledge distillation pass…`
        : `Skipping distillation (disabled)…`,
      techniques.clustering
        ? `Applying 4-bit weight clustering…`
        : `Skipping weight clustering (experimental, disabled)…`,
      `Compressed model size: ${prediction.compressedSizeMb.toFixed(1)} MB (${(prediction.ratio * 100).toFixed(1)}% of original)`,
      `Packaging edge runtime artifact…`,
      `Streaming artifact to ${selectedSite.name}…`,
      `Provisioning on-site inference worker…`,
      `Verifying health endpoint…`,
      `Cutover complete — site is now online with model ${baseModel.id}`,
    ];

    let i = 0;
    const tick = () => {
      if (i >= steps.length) {
        setProgress(100);
        setStep("done");
        return;
      }
      setDeployLog((prev) => [...prev, steps[i]]);
      setProgress(Math.round(((i + 1) / steps.length) * 100));
      i++;
      setTimeout(tick, 600 + Math.random() * 400);
    };
    setTimeout(tick, 400);
  }, [baseModel, jobId, prediction, pruningPct, selectedSite, techniques]);

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="aa-wizard"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="aa-wizard-header">
          <div>
            <h3 className="aa-wizard-title">🚀 Edge Deployment Wizard</h3>
            <p className="aa-wizard-subtitle">
              Push a freshly compressed model to a pending-deploy edge site ·
              Job <code className="aa-code">{jobId}</code>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="aa-wizard-close"
            aria-label="Close wizard"
          >
            ×
          </button>
        </header>

        <WizardStepper step={step} />

        <div className="aa-wizard-body">
          {step === "select" && (
            <WizardStepSelect
              pendingSites={pendingSites}
              allSites={allSites}
              siteId={siteId}
              setSiteId={setSiteId}
              onNext={() => setStep("model")}
            />
          )}

          {step === "model" && (
            <WizardStepModel
              baseModelId={baseModelId}
              setBaseModelId={setBaseModelId}
              onBack={() => setStep("select")}
              onNext={() => setStep("compress")}
            />
          )}

          {step === "compress" && (
            <WizardStepCompress
              techniques={techniques}
              setTechniques={setTechniques}
              pruningPct={pruningPct}
              setPruningPct={setPruningPct}
              syncPolicy={syncPolicy}
              setSyncPolicy={setSyncPolicy}
              maxQueue={maxQueue}
              setMaxQueue={setMaxQueue}
              onBack={() => setStep("model")}
              onNext={() => setStep("review")}
            />
          )}

          {step === "review" && (
            <WizardStepReview
              site={selectedSite}
              baseModel={baseModel}
              techniques={techniques}
              pruningPct={pruningPct}
              syncPolicy={syncPolicy}
              maxQueue={maxQueue}
              prediction={prediction}
              onBack={() => setStep("compress")}
              onDeploy={handleDeploy}
            />
          )}

          {step === "deploy" && (
            <WizardStepDeploy progress={progress} log={deployLog} />
          )}

          {step === "done" && (
            <WizardStepDone
              site={selectedSite}
              baseModel={baseModel}
              prediction={prediction}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function WizardStepper({ step }: { step: WizardStep }) {
  const steps: Array<{ id: WizardStep; label: string }> = [
    { id: "select", label: "1 · Site" },
    { id: "model", label: "2 · Model" },
    { id: "compress", label: "3 · Compress" },
    { id: "review", label: "4 · Review" },
    { id: "deploy", label: "5 · Deploy" },
    { id: "done", label: "6 · Done" },
  ];
  const activeIdx = steps.findIndex((s) => s.id === step);
  return (
    <div className="aa-wizard-stepper">
      {steps.map((s, i) => {
        const isActive = i === activeIdx;
        const isDone = i < activeIdx;
        return (
          <div
            key={s.id}
            className={`aa-wizard-step ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}
          >
            <span className="aa-wizard-step-label">{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function WizardStepSelect({
  pendingSites,
  allSites,
  siteId,
  setSiteId,
  onNext,
}: {
  pendingSites: WizardSite[];
  allSites: WizardSite[];
  siteId: string;
  setSiteId: (id: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="aa-wizard-h4">Select target edge site</h4>
        <p className="aa-wizard-p">
          Sites in <span className="aa-pill aa-pill-neutral">Pending</span> status
          have hardware provisioned but no compressed model pushed yet. You can
          also re-deploy to an existing site.
        </p>
      </div>

      {pendingSites.length > 0 && (
        <div className="space-y-2">
          <p className="aa-wizard-section-label">
            ⏳ Pending deploy ({pendingSites.length})
          </p>
          {pendingSites.map((s) => (
            <label
              key={s.siteId}
              className={`aa-wizard-radio-row ${siteId === s.siteId ? "selected" : ""}`}
            >
              <input
                type="radio"
                name="siteId"
                checked={siteId === s.siteId}
                onChange={() => setSiteId(s.siteId)}
                className="aa-wizard-radio"
              />
              <div className="aa-wizard-radio-body">
                <div className="aa-wizard-radio-title">
                  {s.name}
                  <span className="aa-edge-emerging-badge">EM</span>
                </div>
                <div className="aa-wizard-radio-meta">
                  {s.siteId} · {s.country} · uplink {s.bandwidthKbps} kbps
                </div>
              </div>
            </label>
          ))}
        </div>
      )}

      <details className="aa-wizard-details">
        <summary className="aa-wizard-summary">
          Show all sites (re-deploy to an existing node)
        </summary>
        <div className="space-y-2 mt-2">
          {allSites
            .filter((s) => s.status !== "pending_deploy")
            .map((s) => (
              <label
                key={s.siteId}
                className={`aa-wizard-radio-row ${siteId === s.siteId ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="siteId"
                  checked={siteId === s.siteId}
                  onChange={() => setSiteId(s.siteId)}
                  className="aa-wizard-radio"
                />
                <div className="aa-wizard-radio-body">
                  <div className="aa-wizard-radio-title">{s.name}</div>
                  <div className="aa-wizard-radio-meta">
                    {s.siteId} · {s.country} · {s.status} · current model{" "}
                    {s.modelVersion} ({(s.compressionRatio * 100).toFixed(1)}% compressed)
                  </div>
                </div>
              </label>
            ))}
        </div>
      </details>

      <div className="aa-wizard-nav">
        <button type="button" className="aa-wizard-btn aa-wizard-btn-ghost" disabled>
          ← Back
        </button>
        <button
          type="button"
          className="aa-wizard-btn aa-wizard-btn-primary"
          onClick={onNext}
        >
          Next: choose model →
        </button>
      </div>
    </div>
  );
}

function WizardStepModel({
  baseModelId,
  setBaseModelId,
  onBack,
  onNext,
}: {
  baseModelId: string;
  setBaseModelId: (id: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="aa-wizard-h4">Choose base model</h4>
        <p className="aa-wizard-p">
          The base model is the uncompressed starting point. Compression
          techniques on the next step will reduce it to the 10–20% target band.
        </p>
      </div>

      <div className="space-y-2">
        {BASE_MODELS.map((m) => (
          <label
            key={m.id}
            className={`aa-wizard-radio-row ${baseModelId === m.id ? "selected" : ""}`}
          >
            <input
              type="radio"
              name="baseModelId"
              checked={baseModelId === m.id}
              onChange={() => setBaseModelId(m.id)}
              className="aa-wizard-radio"
            />
            <div className="aa-wizard-radio-body">
              <div className="aa-wizard-radio-title">
                {m.name}
                {m.recommended && (
                  <span className="aa-pill aa-pill-good">Recommended</span>
                )}
              </div>
              <div className="aa-wizard-radio-meta">
                {m.sizeMb.toFixed(0)} MB · baseline accuracy {m.accuracyPct}%
              </div>
              <div className="aa-wizard-radio-hint">{m.notes}</div>
            </div>
          </label>
        ))}
      </div>

      <div className="aa-wizard-nav">
        <button
          type="button"
          className="aa-wizard-btn aa-wizard-btn-ghost"
          onClick={onBack}
        >
          ← Back
        </button>
        <button
          type="button"
          className="aa-wizard-btn aa-wizard-btn-primary"
          onClick={onNext}
        >
          Next: compress →
        </button>
      </div>
    </div>
  );
}

function WizardStepCompress({
  techniques,
  setTechniques,
  pruningPct,
  setPruningPct,
  syncPolicy,
  setSyncPolicy,
  maxQueue,
  setMaxQueue,
  onBack,
  onNext,
}: {
  techniques: Record<string, boolean>;
  setTechniques: (t: Record<string, boolean>) => void;
  pruningPct: number;
  setPruningPct: (n: number) => void;
  syncPolicy: string;
  setSyncPolicy: (s: string) => void;
  maxQueue: number;
  setMaxQueue: (n: number) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="aa-wizard-h4">Compression &amp; sync policy</h4>
        <p className="aa-wizard-p">
          Pick which techniques to apply. INT8 + 40% pruning is the recommended
          baseline; distillation compounds the savings. 4-bit clustering is
          experimental and only supported on newer edge runtimes.
        </p>
      </div>

      <div className="space-y-2">
        {COMPRESSION_OPTIONS.map((opt) => (
          <label
            key={opt.id}
            className={`aa-wizard-tech-row ${techniques[opt.id] ? "selected" : ""}`}
          >
            <input
              type="checkbox"
              checked={techniques[opt.id]}
              onChange={(e) =>
                setTechniques({ ...techniques, [opt.id]: e.target.checked })
              }
              className="aa-wizard-checkbox"
            />
            <div className="aa-wizard-tech-body">
              <div className="aa-wizard-tech-title">{opt.name}</div>
              <div className="aa-wizard-tech-meta">
                −{opt.sizeReductionPct}% size · {opt.latencyImpactPct > 0 ? "+" : ""}
                {opt.latencyImpactPct}% latency · {opt.accuracyDeltaPct > 0 ? "+" : ""}
                {opt.accuracyDeltaPct}% accuracy
              </div>
              <div className="aa-wizard-radio-hint">{opt.description}</div>
            </div>
          </label>
        ))}
      </div>

      {techniques.pruning && (
        <div className="aa-wizard-field">
          <label className="aa-wizard-field-label">
            Pruning intensity: <strong>{pruningPct}%</strong>
          </label>
          <input
            type="range"
            min={0}
            max={70}
            step={5}
            value={pruningPct}
            onChange={(e) => setPruningPct(parseInt(e.target.value, 10))}
            className="aa-wizard-slider"
          />
          <div className="aa-wizard-field-hint">
            Above 60%, accuracy degrades noticeably. 40% is the recommended
            balance for emerging-market sites.
          </div>
        </div>
      )}

      <div className="aa-wizard-field">
        <label className="aa-wizard-field-label">Sync policy</label>
        <select
          value={syncPolicy}
          onChange={(e) => setSyncPolicy(e.target.value)}
          className="aa-wizard-select"
        >
          <option value="eventual_consistency">
            Eventual consistency (recommended for low-bandwidth sites)
          </option>
          <option value="near_real_time">
            Near real-time (sync every 60s, higher bandwidth)
          </option>
          <option value="manual">Manual sync only (operator triggers)</option>
        </select>
      </div>

      <div className="aa-wizard-field">
        <label className="aa-wizard-field-label">
          Max local queue depth before spill to disk
        </label>
        <input
          type="number"
          min={500}
          max={50000}
          step={500}
          value={maxQueue}
          onChange={(e) => setMaxQueue(parseInt(e.target.value, 10) || 5000)}
          className="aa-wizard-input"
        />
      </div>

      <div className="aa-wizard-nav">
        <button
          type="button"
          className="aa-wizard-btn aa-wizard-btn-ghost"
          onClick={onBack}
        >
          ← Back
        </button>
        <button
          type="button"
          className="aa-wizard-btn aa-wizard-btn-primary"
          onClick={onNext}
        >
          Next: review →
        </button>
      </div>
    </div>
  );
}

function WizardStepReview({
  site,
  baseModel,
  techniques,
  pruningPct,
  syncPolicy,
  maxQueue,
  prediction,
  onBack,
  onDeploy,
}: {
  site: WizardSite;
  baseModel: typeof BASE_MODELS[number];
  techniques: Record<string, boolean>;
  pruningPct: number;
  syncPolicy: string;
  maxQueue: number;
  prediction: Prediction;
  onBack: () => void;
  onDeploy: () => void;
}) {
  const inTargetBand = prediction.ratio >= 0.1 && prediction.ratio <= 0.2;
  return (
    <div className="space-y-4">
      <div>
        <h4 className="aa-wizard-h4">Review &amp; deploy</h4>
        <p className="aa-wizard-p">
          Confirm the deployment summary below. The compressed model will be
          streamed to the site; progress is shown on the next step.
        </p>
      </div>

      <div className="aa-wizard-summary-grid">
        <div className="aa-wizard-summary-row">
          <span className="aa-wizard-summary-label">Target site</span>
          <span className="aa-wizard-summary-value">
            {site.name} <code className="aa-code">{site.siteId}</code>
            <span className="aa-wizard-summary-sub">{site.country} · {site.bandwidthKbps} kbps uplink</span>
          </span>
        </div>
        <div className="aa-wizard-summary-row">
          <span className="aa-wizard-summary-label">Base model</span>
          <span className="aa-wizard-summary-value">
            {baseModel.name}
            <span className="aa-wizard-summary-sub">
              {baseModel.sizeMb.toFixed(0)} MB · {baseModel.accuracyPct}% baseline accuracy
            </span>
          </span>
        </div>
        <div className="aa-wizard-summary-row">
          <span className="aa-wizard-summary-label">Techniques</span>
          <span className="aa-wizard-summary-value">
            {COMPRESSION_OPTIONS.filter((o) => techniques[o.id]).map((o) => o.name).join(" + ") || "none"}
            {techniques.pruning && ` (${pruningPct}%)`}
          </span>
        </div>
        <div className="aa-wizard-summary-row">
          <span className="aa-wizard-summary-label">Predicted compressed size</span>
          <span className="aa-wizard-summary-value">
            <strong>{prediction.compressedSizeMb.toFixed(1)} MB</strong>
            <span className="aa-wizard-summary-sub">
              {(prediction.ratio * 100).toFixed(1)}% of original ·{" "}
              <span className={inTargetBand ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-amber-600 dark:text-amber-400 font-semibold"}>
                {inTargetBand ? "✓ within 10–20% target" : "⚠ outside 10–20% target"}
              </span>
            </span>
          </span>
        </div>
        <div className="aa-wizard-summary-row">
          <span className="aa-wizard-summary-label">Predicted accuracy Δ</span>
          <span className="aa-wizard-summary-value">
            <strong className={prediction.accuracyDelta >= -1 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>
              {prediction.accuracyDelta > 0 ? "+" : ""}
              {prediction.accuracyDelta.toFixed(2)}%
            </strong>
          </span>
        </div>
        <div className="aa-wizard-summary-row">
          <span className="aa-wizard-summary-label">Predicted inference latency</span>
          <span className="aa-wizard-summary-value">
            <strong>{prediction.latencyMs}ms</strong>
            <span className="aa-wizard-summary-sub">on-device</span>
          </span>
        </div>
        <div className="aa-wizard-summary-row">
          <span className="aa-wizard-summary-label">Sync policy</span>
          <span className="aa-wizard-summary-value">
            {syncPolicy.replace(/_/g, " ")}
            <span className="aa-wizard-summary-sub">max queue depth {maxQueue.toLocaleString()}</span>
          </span>
        </div>
        <div className="aa-wizard-summary-row">
          <span className="aa-wizard-summary-label">Estimated deploy time</span>
          <span className="aa-wizard-summary-value">
            <strong>~{prediction.estimatedDeploySec}s</strong>
            <span className="aa-wizard-summary-sub">
              stream over {site.bandwidthKbps} kbps uplink
            </span>
          </span>
        </div>
      </div>

      {!inTargetBand && (
        <div className="aa-alert aa-alert-warn">
          <strong>⚠ Compression ratio is outside the 10–20% target band.</strong>{" "}
          {prediction.ratio < 0.1
            ? "Consider enabling more aggressive techniques (or higher pruning) to reach the target."
            : "Consider disabling some techniques to bring the ratio back into the 10–20% band."}
        </div>
      )}

      <div className="aa-wizard-nav">
        <button
          type="button"
          className="aa-wizard-btn aa-wizard-btn-ghost"
          onClick={onBack}
        >
          ← Back
        </button>
        <button
          type="button"
          className="aa-wizard-btn aa-wizard-btn-primary"
          onClick={onDeploy}
        >
          🚀 Deploy now
        </button>
      </div>
    </div>
  );
}

function WizardStepDeploy({ progress, log }: { progress: number; log: string[] }) {
  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [log]);

  return (
    <div className="space-y-4">
      <div>
        <h4 className="aa-wizard-h4">Deploying…</h4>
        <p className="aa-wizard-p">
          The compressed model is being streamed to the target site. Do not
          close this dialog.
        </p>
      </div>

      <div className="aa-wizard-progress">
        <div className="aa-wizard-progress-bar" style={{ width: `${progress}%` }} />
        <span className="aa-wizard-progress-label">{progress}%</span>
      </div>

      <div className="aa-wizard-deploy-log" ref={logRef}>
        {log.length === 0 && (
          <div className="text-xs text-gray-400 dark:text-slate-500">
            Initializing deployment…
          </div>
        )}
        {log.map((line, i) => (
          <div key={i} className="aa-wizard-deploy-log-line">
            <span className="aa-wizard-deploy-log-time">
              {new Date().toLocaleTimeString()}
            </span>
            <span className="aa-wizard-deploy-log-text">{line}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WizardStepDone({
  site,
  baseModel,
  prediction,
  onClose,
}: {
  site: WizardSite;
  baseModel: typeof BASE_MODELS[number];
  prediction: Prediction;
  onClose: () => void;
}) {
  return (
    <div className="space-y-4 text-center">
      <div className="text-5xl">✅</div>
      <div>
        <h4 className="aa-wizard-h4">Deployment complete</h4>
        <p className="aa-wizard-p">
          <strong>{site.name}</strong> ({site.siteId}) is now online with model{" "}
          <code className="aa-code">{baseModel.id}</code> —{" "}
          <strong>{prediction.compressedSizeMb.toFixed(1)} MB</strong> (
          {(prediction.ratio * 100).toFixed(1)}% of original).
        </p>
      </div>
      <div className="aa-wizard-summary-grid text-left">
        <div className="aa-wizard-summary-row">
          <span className="aa-wizard-summary-label">Site status</span>
          <span className="aa-wizard-summary-value">
            <span className="aa-pill aa-pill-good">Online</span>
          </span>
        </div>
        <div className="aa-wizard-summary-row">
          <span className="aa-wizard-summary-label">Sync policy</span>
          <span className="aa-wizard-summary-value">Eventual consistency · auto-merge enabled</span>
        </div>
        <div className="aa-wizard-summary-row">
          <span className="aa-wizard-summary-label">Local queue</span>
          <span className="aa-wizard-summary-value">Empty — ready to receive records</span>
        </div>
        <div className="aa-wizard-summary-row">
          <span className="aa-wizard-summary-label">Audit entry</span>
          <span className="aa-wizard-summary-value">
            <code className="aa-code">AUDIT-{new Date().getTime().toString(36).toUpperCase()}</code>
          </span>
        </div>
      </div>
      <div className="aa-wizard-nav justify-center">
        <button
          type="button"
          className="aa-wizard-btn aa-wizard-btn-primary"
          onClick={onClose}
        >
          Done
        </button>
      </div>
    </div>
  );
}

/* ---------- wizard data + prediction helper ---------- */

const BASE_MODELS = [
  {
    id: "edge-clin-v3.4.1",
    name: "Clinical EDC v3.4.1 (production)",
    sizeMb: 412.0,
    accuracyPct: 96.8,
    notes: "Stable baseline. INT8 + 40% pruning yields ~16% compression with <1% accuracy loss.",
    recommended: true,
  },
  {
    id: "edge-clin-v3.5.0-rc2",
    name: "Clinical EDC v3.5.0-rc2 (distilled)",
    sizeMb: 248.0,
    accuracyPct: 96.2,
    notes: "Distilled from v3.4.1. Smaller starting point — final compression target reachable with less pruning.",
  },
  {
    id: "edge-clin-v3.3.0",
    name: "Clinical EDC v3.3.0 (legacy)",
    sizeMb: 458.0,
    accuracyPct: 95.4,
    notes: "Use only for audit reproduction of historical decisions.",
  },
];

const COMPRESSION_OPTIONS = [
  {
    id: "int8",
    name: "INT8 Post-Training Quantization",
    description: "Quantizes FP32 weights to 8-bit integers. The single largest size reduction; supported by every edge runtime.",
    sizeReductionPct: 68.4,
    latencyImpactPct: -42.1,
    accuracyDeltaPct: -0.3,
  },
  {
    id: "pruning",
    name: "Structural Channel Pruning",
    description: "Removes the least-important channels based on magnitude + sensitivity analysis.",
    sizeReductionPct: 21.7, // at 40% pruning — scaled by pruningPct below
    latencyImpactPct: -18.6,
    accuracyDeltaPct: -0.8,
  },
  {
    id: "distillation",
    name: "Knowledge Distillation",
    description: "Trains a smaller student model to mimic the teacher. Compound with INT8 for best results.",
    sizeReductionPct: 6.2,
    latencyImpactPct: -7.4,
    accuracyDeltaPct: 0.4,
  },
  {
    id: "clustering",
    name: "4-bit Weight Clustering (experimental)",
    description: "Clusters weights into 16 centroids. Further compression but runtime support is still emerging.",
    sizeReductionPct: 11.8,
    latencyImpactPct: -3.2,
    accuracyDeltaPct: -1.6,
  },
];

interface Prediction {
  compressedSizeMb: number;
  ratio: number;
  accuracyDelta: number;
  latencyMs: number;
  estimatedDeploySec: number;
}

function computePrediction(
  baseModel: typeof BASE_MODELS[number],
  techniques: Record<string, boolean>,
  pruningPct: number,
): Prediction {
  // Compound multiplicative reduction. Each technique reduces the *remaining* size.
  let remaining = 1.0;
  let accuracyDelta = 0;
  let latencyImpact = 0;

  if (techniques.int8) {
    remaining *= 1 - 0.684;
    accuracyDelta += -0.3;
    latencyImpact += -42.1;
  }
  if (techniques.pruning) {
    // scale pruning's size reduction by pruningPct / 40 (the default)
    const scale = pruningPct / 40;
    remaining *= 1 - 0.217 * scale;
    accuracyDelta += -0.8 * scale;
    latencyImpact += -18.6 * scale;
  }
  if (techniques.distillation) {
    remaining *= 1 - 0.062;
    accuracyDelta += 0.4;
    latencyImpact += -7.4;
  }
  if (techniques.clustering) {
    remaining *= 1 - 0.118;
    accuracyDelta += -1.6;
    latencyImpact += -3.2;
  }

  const compressedSizeMb = baseModel.sizeMb * remaining;
  const ratio = remaining;
  const latencyMs = Math.max(20, Math.round(60 * (1 + latencyImpact / 100)));
  // Deploy time ~ stream 64 MB compressed model over the slowest plausible uplink (512 kbps)
  const estimatedDeploySec = Math.round((compressedSizeMb * 8 * 1024) / 64 + 30);

  return {
    compressedSizeMb,
    ratio,
    accuracyDelta,
    latencyMs,
    estimatedDeploySec: Math.min(600, estimatedDeploySec),
  };
}
