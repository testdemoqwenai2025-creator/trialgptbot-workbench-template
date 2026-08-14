"use client";

import { useState, useMemo } from "react";
import { SectionId } from "@/lib/trialgptbot";
import {
  calibrationKpis,
  calibrationCurve,
  calibrationFeatures,
  calibrationMethods,
  calibrationThresholds,
  calibrationTrainingRuns,
} from "@/lib/trialgptbot";
import { BackToDashboard } from "./_BackToDashboard";

/**
 * CalibrationSection — ML-Based Confidence Calibration (Feature #11).
 *
 * Trains a calibration model on historical approve/reject/escalate decisions
 * so that the AI's confidence scores match the empirical reviewer agreement
 * rate. Surfaces:
 *
 *   • KPI strip (Brier, ECE, FP reduction, audit records trained)
 *   • Reliability diagram (10 bins, predicted vs observed, 95% CI bands)
 *   • Method comparison table (Platt, isotonic, temperature, beta, BBQ)
 *   • Decision threshold ladder (auto-approve → escalate → review → reject)
 *   • Top-12 permutation-importance features
 *   • Recent training-run history
 *
 * Tech Readiness: Production Ready | Impact: High | Complexity: Medium
 */
interface CalibrationSectionProps {
  onNavigate: (id: SectionId) => void;
}

const CATEGORY_COLOR: Record<string, string> = {
  field_type: "#3b82f6",
  value_magnitude: "#f59e0b",
  subject_history: "#10b981",
  site_metadata: "#8b5cf6",
  protocol_context: "#ec4899",
};

const METHOD_FAMILY_COLOR: Record<string, string> = {
  parametric: "#3b82f6",
  isotonic: "#10b981",
  temperature: "#f59e0b",
  bayesian: "#8b5cf6",
};

const TREND_ARROW: Record<string, string> = {
  up: "↑",
  down: "↓",
  flat: "→",
};

export function CalibrationSection({ onNavigate }: CalibrationSectionProps) {
  const [selectedMethod, setSelectedMethod] = useState("platt");
  const [featureFilter, setFeatureFilter] = useState<string>("all");

  const filteredFeatures = useMemo(() => {
    if (featureFilter === "all") return calibrationFeatures;
    return calibrationFeatures.filter((f) => f.category === featureFilter);
  }, [featureFilter]);

  // Reliability diagram geometry
  const W = 540;
  const H = 360;
  const PAD = 44;
  const plotW = W - PAD * 2;
  const plotH = H - PAD * 2;
  const xScale = (v: number) => PAD + v * plotW;
  const yScale = (v: number) => H - PAD - v * plotH;

  // Build CI band path
  const ciBandPath = (() => {
    const top = calibrationCurve
      .map((p) => `${xScale(p.predicted)},${yScale(p.upper)}`)
      .join(" L ");
    const bottom = calibrationCurve
      .slice()
      .reverse()
      .map((p) => `${xScale(p.predicted)},${yScale(p.lower)}`)
      .join(" L ");
    return `M ${top} L ${bottom} Z`;
  })();

  const linePath = calibrationCurve
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(p.predicted)},${yScale(p.observed)}`)
    .join(" ");

  const maxImportance = Math.max(...calibrationFeatures.map((f) => f.importance));

  return (
    <div className="cal-page">
      <BackToDashboard
        onNavigate={onNavigate}
        secondary={{ label: "Open MLOps", target: "mlops" }}
      />

      {/* Hero */}
      <section className="cal-hero">
        <div className="cal-hero-content">
          <div className="cal-hero-title-row">
            <h1>🎯 ML-Based Confidence Calibration</h1>
            <span className="cal-hero-badge">Feature #11 · Production Ready · Impact High</span>
          </div>
          <p>
            Train a recalibration layer on the existing audit trail of reviewer
            approve/reject/escalate decisions. Raw model scores are mapped to
            calibrated probabilities so the auto-approve threshold (0.82)
            empirically corresponds to a 98.4% reviewer-concur rate. Net effect:
            false positives in the auto-approve pathway reduced by 54.2% with no
            change to the underlying classifier.
          </p>
          <div className="cal-hero-meta">
            <span>📊 Trained on 1.24M audit records</span>
            <span>•</span>
            <span>🔄 Daily retraining (drift-triggered)</span>
            <span>•</span>
            <span>✅ Method: Platt scaling (logistic)</span>
          </div>
        </div>
      </section>

      {/* KPI strip */}
      <section className="cal-kpi-grid">
        {calibrationKpis.map((kpi) => (
          <div key={kpi.label} className="cal-kpi-card">
            <div className="cal-kpi-label">{kpi.label}</div>
            <div className="cal-kpi-value-row">
              <span className="cal-kpi-value">{kpi.value}</span>
              {kpi.deltaPct !== undefined && (
                <span
                  className={`cal-kpi-delta ${
                    (kpi.trend === "down" && kpi.deltaPct < 0) || (kpi.trend === "up" && kpi.deltaPct > 0)
                      ? "good"
                      : "bad"
                  }`}
                >
                  {TREND_ARROW[kpi.trend ?? "flat"]} {Math.abs(kpi.deltaPct)}%
                </span>
              )}
            </div>
            {kpi.hint && <div className="cal-kpi-hint">{kpi.hint}</div>}
          </div>
        ))}
      </section>

      {/* Reliability diagram + method comparison */}
      <section className="cal-section">
        <div className="cal-section-head">
          <h2>Reliability Diagram</h2>
          <span className="cal-section-sub">
            Predicted probability vs empirical accuracy — 10 bins, 95% Wilson CI
          </span>
        </div>
        <div className="cal-two-col">
          <div className="cal-chart-wrap">
            <svg viewBox={`0 0 ${W} ${H}`} className="cal-chart-svg">
              {/* Axes */}
              <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#94a3b8" strokeWidth="1.5" />
              <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#94a3b8" strokeWidth="1.5" />
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((v) => (
                <g key={v}>
                  <line
                    x1={PAD}
                    y1={yScale(v)}
                    x2={W - PAD}
                    y2={yScale(v)}
                    stroke="#e2e8f0"
                    strokeDasharray="3 3"
                  />
                  <text x={PAD - 8} y={yScale(v) + 4} textAnchor="end" fontSize="11" fill="#64748b">
                    {v.toFixed(2)}
                  </text>
                </g>
              ))}
              {[0, 0.25, 0.5, 0.75, 1].map((v) => (
                <text key={v} x={xScale(v)} y={H - PAD + 18} textAnchor="middle" fontSize="11" fill="#64748b">
                  {v.toFixed(2)}
                </text>
              ))}
              {/* Perfect calibration diagonal */}
              <line
                x1={PAD}
                y1={H - PAD}
                x2={W - PAD}
                y2={PAD}
                stroke="#94a3b8"
                strokeDasharray="6 4"
                strokeWidth="1.5"
              />
              <text x={W - PAD - 4} y={PAD + 14} textAnchor="end" fontSize="10" fill="#94a3b8" fontStyle="italic">
                perfect calibration
              </text>
              {/* CI band */}
              <path d={ciBandPath} fill="#3b82f6" fillOpacity="0.15" stroke="none" />
              {/* Observed line */}
              <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="2.5" />
              {/* Observed points */}
              {calibrationCurve.map((p) => (
                <g key={p.predicted}>
                  <circle cx={xScale(p.predicted)} cy={yScale(p.observed)} r="5" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
                  <title>
                    {`Bin ${p.predicted.toFixed(2)}\nObserved: ${p.observed.toFixed(3)}\nCount: ${p.count}\n95% CI: [${p.lower.toFixed(3)}, ${p.upper.toFixed(3)}]`}
                  </title>
                </g>
              ))}
              {/* Axis labels */}
              <text x={W / 2} y={H - 4} textAnchor="middle" fontSize="12" fill="#475569" fontWeight="600">
                Predicted probability (bin midpoint)
              </text>
              <text
                x={14}
                y={H / 2}
                textAnchor="middle"
                fontSize="12"
                fill="#475569"
                fontWeight="600"
                transform={`rotate(-90 14 ${H / 2})`}
              >
                Empirical accuracy (reviewer concur)
              </text>
            </svg>
          </div>

          <div className="cal-method-compare">
            <div className="cal-method-compare-head">
              <h3>Calibration method comparison</h3>
              <span className="cal-method-compare-sub">Click a row to inspect</span>
            </div>
            <div className="cal-method-list">
              {calibrationMethods.map((m) => {
                const isSelected = m.id === selectedMethod;
                return (
                  <button
                    key={m.id}
                    type="button"
                    className={`cal-method-row ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelectedMethod(m.id)}
                  >
                    <div className="cal-method-row-head">
                      <span className="cal-method-name">
                        <span
                          className="cal-method-swatch"
                          style={{ background: METHOD_FAMILY_COLOR[m.family] }}
                          aria-hidden="true"
                        />
                        {m.name}
                        {m.selected && <span className="cal-method-selected-pill">in production</span>}
                      </span>
                      <span className="cal-method-ece">
                        ECE {m.eceBefore.toFixed(1)}% → <strong>{m.eceAfter.toFixed(1)}%</strong>
                      </span>
                    </div>
                    <div className="cal-method-bars">
                      <div className="cal-method-bar-row">
                        <span className="cal-method-bar-label">Brier</span>
                        <div className="cal-method-bar-track">
                          <div
                            className="cal-method-bar-before"
                            style={{ width: `${(m.brierBefore / 0.15) * 100}%` }}
                          />
                          <div
                            className="cal-method-bar-after"
                            style={{ width: `${(m.brierAfter / 0.15) * 100}%` }}
                          />
                        </div>
                        <span className="cal-method-bar-val">
                          {m.brierBefore.toFixed(3)} → {m.brierAfter.toFixed(3)}
                        </span>
                      </div>
                    </div>
                    <div className="cal-method-rec">{m.recommendedFor}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Decision threshold ladder */}
      <section className="cal-section">
        <div className="cal-section-head">
          <h2>Decision Threshold Ladder</h2>
          <span className="cal-section-sub">
            Calibrated probability → action mapping · false-positive rate capped at 6.1% per bucket
          </span>
        </div>
        <div className="cal-thresh-grid">
          {calibrationThresholds.map((t) => {
            const colorMap: Record<string, string> = {
              auto_approve: "#10b981",
              escalate: "#f59e0b",
              manual_review: "#3b82f6",
              auto_reject: "#ef4444",
            };
            const c = colorMap[t.bucket];
            return (
              <div key={t.bucket} className="cal-thresh-card" style={{ borderTopColor: c }}>
                <div className="cal-thresh-card-head">
                  <span className="cal-thresh-bucket" style={{ color: c }}>
                    {t.bucket.replace(/_/g, " ")}
                  </span>
                  <span className="cal-thresh-range">
                    [{t.range[0].toFixed(2)}, {t.range[1].toFixed(2)}]
                  </span>
                </div>
                <div className="cal-thresh-action">{t.action}</div>
                <div className="cal-thresh-metrics">
                  <div>
                    <span className="cal-thresh-metric-label">% of tasks</span>
                    <span className="cal-thresh-metric-val">{t.pctTasks.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="cal-thresh-metric-label">Reviewer concur</span>
                    <span className="cal-thresh-metric-val">{t.reviewerAccuracy.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="cal-thresh-metric-label">FP rate</span>
                    <span className="cal-thresh-metric-val">{t.falsePositiveRate.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="cal-thresh-bar-track">
                  <div className="cal-thresh-bar-fill" style={{ width: `${t.pctTasks}%`, background: c }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Top features + training history */}
      <section className="cal-section">
        <div className="cal-section-head">
          <h2>Top-12 Calibration Features (Permutation Importance)</h2>
          <div className="cal-feature-filter">
            {["all", "field_type", "value_magnitude", "subject_history", "site_metadata", "protocol_context"].map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`cal-feature-chip ${featureFilter === cat ? "active" : ""}`}
                  onClick={() => setFeatureFilter(cat)}
                >
                  {cat === "all" ? "all" : cat.replace(/_/g, " ")}
                </button>
              ),
            )}
          </div>
        </div>
        <div className="cal-feature-table">
          {filteredFeatures.map((f) => (
            <div key={f.name} className="cal-feature-row">
              <div className="cal-feature-name">
                <span
                  className="cal-feature-cat-swatch"
                  style={{ background: CATEGORY_COLOR[f.category] }}
                  aria-hidden="true"
                />
                <code>{f.name}</code>
                <span className="cal-feature-cat-label">{f.category.replace(/_/g, " ")}</span>
              </div>
              <div className="cal-feature-bar-wrap">
                <div className="cal-feature-bar-track">
                  <div
                    className="cal-feature-bar-fill"
                    style={{
                      width: `${(f.importance / maxImportance) * 100}%`,
                      background: CATEGORY_COLOR[f.category],
                    }}
                  />
                </div>
                <span className="cal-feature-importance">{(f.importance * 100).toFixed(1)}%</span>
              </div>
              <div className="cal-feature-coef">
                <span className="cal-feature-coef-label">β</span>
                <span
                  className={`cal-feature-coef-val ${f.coefficient >= 0 ? "pos" : "neg"}`}
                >
                  {f.coefficient >= 0 ? "+" : ""}
                  {f.coefficient.toFixed(2)}
                </span>
              </div>
              <div className="cal-feature-desc">{f.description}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Training history */}
      <section className="cal-section">
        <div className="cal-section-head">
          <h2>Recent Training Runs</h2>
          <span className="cal-section-sub">
            Audit-derived training pipeline · drift-triggered retraining threshold: PSI &gt; 0.15
          </span>
        </div>
        <div className="cal-runs-table">
          <div className="cal-runs-head">
            <span>Run ID</span>
            <span>Started</span>
            <span>Duration</span>
            <span>Records</span>
            <span>Method</span>
            <span>Brier</span>
            <span>ECE</span>
            <span>Trigger</span>
            <span>Status</span>
          </div>
          {calibrationTrainingRuns.map((r) => (
            <div key={r.runId} className="cal-runs-row">
              <span><code>{r.runId}</code></span>
              <span>{new Date(r.startedAt).toLocaleString()}</span>
              <span>{(r.durationSec / 60).toFixed(1)} min</span>
              <span>{r.recordsTrained.toLocaleString()}</span>
              <span>{r.method}</span>
              <span>{r.brierAfter.toFixed(3)}</span>
              <span>{r.eceAfter.toFixed(1)}%</span>
              <span>
                <span className={`cal-trigger-pill ${r.triggeredBy}`}>{r.triggeredBy.replace(/_/g, " ")}</span>
              </span>
              <span>
                <span className={`cal-status-pill ${r.status}`}>{r.status}</span>
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default CalibrationSection;
