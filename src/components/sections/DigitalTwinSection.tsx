"use client";

import { useState } from "react";
import { SectionId } from "@/lib/trialgptbot";
import {
  digitalTwinKpis,
  subjectTwins,
  trajectorySeries,
  whatIfScenarios,
  trialForecasts,
  midCourseCorrections,
  type MidCourseCorrection,
  type DigitalTwinKpi,
} from "@/lib/trialgptbot";

/**
 * Digital Twin Prototypes — Feature #9
 *
 *   • Subject-level computational twins (transformer + ODE hybrid)
 *   • Outcome trajectory simulation with confidence bands
 *   • "What-if" scenario analysis for protocol modifications
 *   • Trial-level predictions: enrollment, dropout, endpoint, power
 *   • Mid-course correction recommendations
 *
 * Developmental | Impact: Transformative | Complexity: Very High
 */
interface DigitalTwinSectionProps {
  onNavigate: (id: SectionId) => void;
}

export function DigitalTwinSection({ onNavigate }: DigitalTwinSectionProps) {
  const [activeSubjectId, setActiveSubjectId] = useState<string>(subjectTwins[0].subjectId);
  const [activeScenarioId, setActiveScenarioId] = useState<string>(whatIfScenarios[0].id);
  const [correctionStatuses, setCorrectionStatuses] = useState<Record<string, MidCourseCorrection["status"]>>(
    () => Object.fromEntries(midCourseCorrections.map((c) => [c.id, c.status])),
  );

  const activeSubject = subjectTwins.find((s) => s.subjectId === activeSubjectId) ?? subjectTwins[0];
  const activeScenario = whatIfScenarios.find((s) => s.id === activeScenarioId) ?? whatIfScenarios[0];

  const updateCorrection = (id: string, status: MidCourseCorrection["status"]) => {
    setCorrectionStatuses((prev) => ({ ...prev, [id]: status }));
  };

  return (
    <div className="dt-page">
      <div className="page-back-row">
        <button
          type="button"
          onClick={() => onNavigate("dashboard")}
          className="btn btn-secondary"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Hero */}
      <section className="dt-hero">
        <div className="dt-hero-content">
          <h1>🧬 Digital Twin Prototypes</h1>
          <p>
            Every enrolled subject has a continuously-retrained computational
            model — a hybrid transformer + ODE that ingests labs, imaging,
            vitals, ECG, ePROs, and neurocognitive streams. Twins project
            outcome trajectories, simulate counterfactual &quot;what-if&quot;
            protocol modifications, and surface mid-course corrections that
            maximize trial success probability without compromising safety.
          </p>
          <div className="dt-hero-toolbar">
            <span className="dt-toolbar-pill">
              <span className="dot" /> Twin engine: twin-v2.1.4 (transformer + ODE)
            </span>
            <span className="dt-toolbar-pill">Refresh cadence: 6h</span>
            <span className="dt-toolbar-pill">Counterfactual samples: 1,000/run</span>
            <span className="dt-toolbar-pill">Prediction horizon: 180 days</span>
          </div>
        </div>
      </section>

      {/* KPI grid */}
      <section>
        <div className="dt-kpi-grid">
          {digitalTwinKpis.map((kpi) => (
            <DtKpiCard key={kpi.label} kpi={kpi} />
          ))}
        </div>
      </section>

      {/* Subject twin browser + trajectory */}
      <div className="dt-grid-2">
        <section className="dt-section">
          <div className="dt-section-header">
            <div>
              <h2 className="dt-section-title">👥 Subject twins</h2>
              <p className="dt-section-subtitle">
                Click a subject to load its trajectory simulation
              </p>
            </div>
          </div>

          <div className="dt-twin-list">
            {subjectTwins.map((t) => {
              const isActive = t.subjectId === activeSubjectId;
              return (
                <button
                  key={t.subjectId}
                  type="button"
                  className={`dt-twin-row ${isActive ? "dt-twin-row-active" : ""}`}
                  onClick={() => setActiveSubjectId(t.subjectId)}
                >
                  <div className="dt-twin-row-head">
                    <span className="dt-twin-subject">{t.subjectId}</span>
                    <span className={`dt-twin-outcome dt-twin-outcome-${t.predictedOutcome}`}>
                      {t.predictedOutcome.replace("_", " ")}
                    </span>
                  </div>
                  <div className="dt-twin-indication">{t.indication}</div>
                  <div className="dt-twin-meta">
                    <span>{t.trialId}</span>
                    <span>·</span>
                    <span>{t.ageBand} {t.sex}</span>
                    <span>·</span>
                    <span>{t.modelVersion}</span>
                  </div>
                  <div className="dt-twin-fidelity">
                    <span className="dt-twin-fidelity-label">R²</span>
                    <div className="dt-twin-fidelity-bar">
                      <div
                        className="dt-twin-fidelity-fill"
                        style={{ width: `${t.fidelityScore * 100}%` }}
                      />
                    </div>
                    <span className="dt-twin-fidelity-num">{t.fidelityScore.toFixed(2)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="dt-section">
          <div className="dt-section-header">
            <div>
              <h2 className="dt-section-title">📈 Outcome trajectory</h2>
              <p className="dt-section-subtitle">
                {activeSubject.subjectId} · {activeSubject.indication} ·{" "}
                predicted <strong>{activeSubject.predictedOutcome.replace("_", " ")}</strong>{" "}
                at {activeSubject.confidencePct}% confidence
              </p>
            </div>
            <span className={`dt-pill dt-pill-${activeSubject.predictedOutcome}`}>
              {activeSubject.confidencePct}% confidence
            </span>
          </div>

          <TrajectoryChart series={trajectorySeries} />

          <div className="dt-trajectory-foot">
            <div className="dt-trajectory-streams">
              <span className="dt-trajectory-streams-label">Data streams:</span>
              {activeSubject.dataStreams.map((s) => (
                <span key={s} className="dt-trajectory-stream">{s}</span>
              ))}
            </div>
            <div className="dt-trajectory-last-update">
              Last twin refresh: {activeSubject.lastUpdated}
            </div>
          </div>
        </section>
      </div>

      {/* What-if scenario analysis */}
      <section className="dt-section">
        <div className="dt-section-header">
          <div>
            <h2 className="dt-section-title">🧪 What-if scenario analysis</h2>
            <p className="dt-section-subtitle">
              Apply a hypothetical protocol modification; the twin simulates
              the impact on endpoint sensitivity, dropout, enrollment, and
              statistical power.
            </p>
          </div>
          <span className="dt-pill dt-pill-info">
            {whatIfScenarios.filter((s) => s.recommended).length} recommended
          </span>
        </div>

        <div className="dt-whatif-layout">
          <div className="dt-whatif-list">
            {whatIfScenarios.map((s) => {
              const isActive = s.id === activeScenarioId;
              return (
                <button
                  key={s.id}
                  type="button"
                  className={`dt-whatif-row ${isActive ? "dt-whatif-row-active" : ""}`}
                  onClick={() => setActiveScenarioId(s.id)}
                >
                  <div className="dt-whatif-row-head">
                    <span className="dt-whatif-name">{s.name}</span>
                    {s.recommended && <span className="dt-whatif-rec">recommended</span>}
                  </div>
                  <div className="dt-whatif-mod">{s.modification}</div>
                </button>
              );
            })}
          </div>

          <div className="dt-whatif-detail">
            <h3 className="dt-whatif-detail-title">{activeScenario.name}</h3>
            <p className="dt-whatif-detail-mod">{activeScenario.modification}</p>

            <div className="dt-whatif-impact-grid">
              <ImpactStat
                label="Endpoint Δ"
                value={`${activeScenario.endpointDeltaPct > 0 ? "+" : ""}${activeScenario.endpointDeltaPct}%`}
                good={activeScenario.endpointDeltaPct >= 0}
              />
              <ImpactStat
                label="Dropout Δ"
                value={`${activeScenario.dropoutDeltaPct > 0 ? "+" : ""}${activeScenario.dropoutDeltaPct}%`}
                good={activeScenario.dropoutDeltaPct <= 0}
              />
              <ImpactStat
                label="Enrollment Δ"
                value={`${activeScenario.enrollmentWeeksDelta > 0 ? "+" : ""}${activeScenario.enrollmentWeeksDelta} wk`}
                good={activeScenario.enrollmentWeeksDelta <= 0}
              />
              <ImpactStat
                label="Power Δ"
                value={`${activeScenario.powerDeltaPct > 0 ? "+" : ""}${activeScenario.powerDeltaPct}%`}
                good={activeScenario.powerDeltaPct >= 0}
              />
            </div>

            {activeScenario.recommended ? (
              <div className="dt-whatif-recommend">
                <span className="dt-whatif-recommend-icon">✓</span>
                <span>
                  Twin recommends this modification — net positive on trial success probability.
                  {activeScenario.id === "wf-stratify" && " Requires IRB amendment."}
                  {activeScenario.id === "wf-site" && " Already approved by the Edge Deployment committee."}
                </span>
              </div>
            ) : activeScenario.id === "wf-base" ? (
              <div className="dt-whatif-recommend dt-whatif-recommend-neutral">
                <span className="dt-whatif-recommend-icon">○</span>
                <span>Baseline — no protocol modification. Current trajectory shown above.</span>
              </div>
            ) : (
              <div className="dt-whatif-recommend dt-whatif-recommend-warn">
                <span className="dt-whatif-recommend-icon">!</span>
                <span>Twin does not recommend this modification — net negative impact on primary endpoint.</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trial forecasts + mid-course corrections */}
      <div className="dt-grid-2">
        <section className="dt-section">
          <div className="dt-section-header">
            <div>
              <h2 className="dt-section-title">🎯 Trial-level forecasts</h2>
              <p className="dt-section-subtitle">
                Predicted enrollment pace, dropout probability, endpoint achievement, and projected power.
              </p>
            </div>
          </div>

          <div className="dt-forecast-list">
            {trialForecasts.map((f) => {
              const enrollPct = Math.min(100, (f.enrollmentForecast.current / f.enrollmentForecast.target) * 100);
              const onTrack = f.enrollmentForecast.weeksAtPace <= f.enrollmentForecast.weeksRemaining;
              return (
                <div key={f.trialId} className="dt-forecast-row">
                  <div className="dt-forecast-head">
                    <span className="dt-forecast-trial">{f.trialId}</span>
                    <span className="dt-forecast-indication">{f.indication}</span>
                    <span className={`dt-forecast-flag dt-forecast-flag-${f.flag}`}>{f.flag.replace("-", " ")}</span>
                  </div>

                  <div className="dt-forecast-enrollment">
                    <div className="dt-forecast-enroll-labels">
                      <span>
                        Enrollment: <strong>{f.enrollmentForecast.current.toLocaleString()}</strong> /{" "}
                        {f.enrollmentForecast.target.toLocaleString()}
                      </span>
                      <span className={onTrack ? "dt-forecast-ontrack" : "dt-forecast-offtrack"}>
                        {onTrack ? "on pace" : `${f.enrollmentForecast.weeksAtPace - f.enrollmentForecast.weeksRemaining} wk over`}
                      </span>
                    </div>
                    <div className="dt-forecast-enroll-bar">
                      <div
                        className={`dt-forecast-enroll-fill dt-forecast-enroll-fill-${f.flag}`}
                        style={{ width: `${enrollPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="dt-forecast-stats">
                    <ForecastStat
                      label="Dropout P"
                      value={`${(f.dropoutProbability * 100).toFixed(0)}%`}
                      good={f.dropoutProbability < 0.1}
                    />
                    <ForecastStat
                      label="Endpoint"
                      value={`${f.endpointAchievementPct}%`}
                      good={f.endpointAchievementPct >= 75}
                    />
                    <ForecastStat
                      label="Power"
                      value={`${(f.projectedPower * 100).toFixed(0)}%`}
                      good={f.projectedPower >= 0.8}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="dt-section">
          <div className="dt-section-header">
            <div>
              <h2 className="dt-section-title">🧭 Mid-course corrections</h2>
              <p className="dt-section-subtitle">
                Twin-recommended adjustments — accept, mark for review, or
                reject. IRB-bound changes are flagged.
              </p>
            </div>
          </div>

          <div className="dt-mcc-list">
            {midCourseCorrections.map((c) => {
              const status = correctionStatuses[c.id];
              return (
                <MidCourseCard
                  key={c.id}
                  correction={c}
                  status={status}
                  onStatusChange={(s) => updateCorrection(c.id, s)}
                />
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ---------- sub-components ---------- */

function DtKpiCard({ kpi }: { kpi: DigitalTwinKpi }) {
  return (
    <div className="dt-kpi-card">
      <div className="dt-kpi-label">{kpi.label}</div>
      <div className="dt-kpi-value">{kpi.value}</div>
      {kpi.deltaPct !== undefined && (
        <span className={`dt-kpi-delta ${kpi.trend}`}>
          {kpi.deltaPct > 0 ? "▲" : kpi.deltaPct < 0 ? "▼" : "■"} {Math.abs(kpi.deltaPct)}%
        </span>
      )}
      <div className="dt-kpi-hint">{kpi.hint}</div>
    </div>
  );
}

function TrajectoryChart({ series }: { series: typeof trajectorySeries }) {
  const W = 600;
  const H = 240;
  const padL = 38;
  const padR = 12;
  const padT = 12;
  const padB = 28;
  const minDay = 0;
  const maxDay = 360;
  const minY = Math.min(...series.flatMap((p) => [p.lower, p.predicted, p.upper, p.observed ?? 100]));
  const maxY = 100;
  const xFor = (day: number) => padL + ((day - minDay) / (maxDay - minDay)) * (W - padL - padR);
  const yFor = (v: number) => padT + (1 - (v - minY) / (maxY - minY)) * (H - padT - padB);

  const ciArea = `${series
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(p.day).toFixed(1)} ${yFor(p.upper).toFixed(1)}`)
    .join(" ")} L ${xFor(series[series.length - 1].day).toFixed(1)} ${yFor(series[series.length - 1].lower).toFixed(1)} ${series
    .slice()
    .reverse()
    .map((p) => `L ${xFor(p.day).toFixed(1)} ${yFor(p.lower).toFixed(1)}`)
    .join(" ")} Z`;

  const predLine = series
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(p.day).toFixed(1)} ${yFor(p.predicted).toFixed(1)}`)
    .join(" ");

  const obsPoints = series.filter((p) => p.observed !== undefined);
  const obsLine = obsPoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(p.day).toFixed(1)} ${yFor(p.observed!).toFixed(1)}`)
    .join(" ");

  const todayDay = 180;

  return (
    <div className="dt-trajectory-chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="dt-trajectory-chart" preserveAspectRatio="xMidYMid meet">
        {/* y gridlines */}
        {[100, 80, 60, 40, 20].map((v) => (
          <g key={v}>
            <line
              x1={padL}
              x2={W - padR}
              y1={yFor(v)}
              y2={yFor(v)}
              stroke="currentColor"
              strokeWidth={0.5}
              strokeDasharray="2 4"
              className="dt-trajectory-grid"
            />
            <text
              x={padL - 6}
              y={yFor(v) + 3}
              textAnchor="end"
              fontSize={9}
              className="dt-trajectory-axis"
            >
              {v}
            </text>
          </g>
        ))}

        {/* x axis labels */}
        {[0, 90, 180, 270, 360].map((d) => (
          <text
            key={d}
            x={xFor(d)}
            y={H - padB + 14}
            textAnchor="middle"
            fontSize={9}
            className="dt-trajectory-axis"
          >
            d{d}
          </text>
        ))}

        {/* "today" divider at day 180 */}
        <line
          x1={xFor(todayDay)}
          x2={xFor(todayDay)}
          y1={padT}
          y2={H - padB}
          stroke="currentColor"
          strokeWidth={1}
          strokeDasharray="4 3"
          className="dt-trajectory-today"
        />
        <text
          x={xFor(todayDay) + 4}
          y={padT + 10}
          fontSize={9}
          className="dt-trajectory-today-label"
        >
          today
        </text>

        {/* CI band */}
        <path d={ciArea} className="dt-trajectory-ci" />

        {/* predicted line */}
        <path d={predLine} className="dt-trajectory-pred" fill="none" />

        {/* observed line + dots */}
        {obsLine && <path d={obsLine} className="dt-trajectory-obs" fill="none" />}
        {obsPoints.map((p) => (
          <circle
            key={p.day}
            cx={xFor(p.day)}
            cy={yFor(p.observed!)}
            r={2.5}
            className="dt-trajectory-obs-dot"
          />
        ))}
      </svg>

      <div className="dt-trajectory-legend">
        <span className="dt-legend-item">
          <span className="dt-legend-swatch dt-legend-obs" /> Observed
        </span>
        <span className="dt-legend-item">
          <span className="dt-legend-swatch dt-legend-pred" /> Twin predicted
        </span>
        <span className="dt-legend-item">
          <span className="dt-legend-swatch dt-legend-ci" /> 95% CI
        </span>
      </div>
    </div>
  );
}

function ImpactStat({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <div className={`dt-impact-stat ${good ? "dt-impact-good" : "dt-impact-bad"}`}>
      <span className="dt-impact-label">{label}</span>
      <span className="dt-impact-value">{value}</span>
    </div>
  );
}

function ForecastStat({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <div className={`dt-forecast-stat ${good ? "dt-forecast-stat-good" : "dt-forecast-stat-warn"}`}>
      <span className="dt-forecast-stat-label">{label}</span>
      <span className="dt-forecast-stat-value">{value}</span>
    </div>
  );
}

function MidCourseCard({
  correction,
  status,
  onStatusChange,
}: {
  correction: MidCourseCorrection;
  status: MidCourseCorrection["status"];
  onStatusChange: (s: MidCourseCorrection["status"]) => void;
}) {
  return (
    <div className={`dt-mcc-card dt-mcc-status-${status}`}>
      <div className="dt-mcc-head">
        <span className={`dt-mcc-cat dt-mcc-cat-${correction.category}`}>
          {correction.category}
        </span>
        <span className="dt-mcc-id">{correction.id}</span>
        <span className={`dt-mcc-status-badge dt-mcc-status-badge-${status}`}>
          {status}
        </span>
      </div>

      <h4 className="dt-mcc-title">{correction.title}</h4>
      <p className="dt-mcc-rationale">{correction.rationale}</p>

      <div className="dt-mcc-foot">
        <div className="dt-mcc-impact">
          <span className="dt-mcc-impact-label">Expected impact:</span>
          <span className="dt-mcc-impact-value">{correction.expectedImpact}</span>
        </div>
        <div className="dt-mcc-confidence">
          <span className="dt-mcc-confidence-label">Confidence</span>
          <div className="dt-mcc-confidence-bar">
            <div
              className={`dt-mcc-confidence-fill ${
                correction.confidencePct >= 85 ? "dt-mcc-confidence-high" :
                correction.confidencePct >= 75 ? "dt-mcc-confidence-mid" :
                "dt-mcc-confidence-low"
              }`}
              style={{ width: `${correction.confidencePct}%` }}
            />
          </div>
          <span className="dt-mcc-confidence-num">{correction.confidencePct}%</span>
        </div>
      </div>

      <div className="dt-mcc-actions">
        <button
          type="button"
          className={`dt-mcc-btn ${status === "rejected" ? "dt-mcc-btn-active" : ""}`}
          onClick={() => onStatusChange("rejected")}
        >
          Reject
        </button>
        <button
          type="button"
          className={`dt-mcc-btn ${status === "review" ? "dt-mcc-btn-active" : ""}`}
          onClick={() => onStatusChange("review")}
        >
          Mark for review
        </button>
        <button
          type="button"
          className={`dt-mcc-btn dt-mcc-btn-primary ${status === "approved" ? "dt-mcc-btn-active" : ""}`}
          onClick={() => onStatusChange("approved")}
        >
          Approve
        </button>
      </div>
    </div>
  );
}

export default DigitalTwinSection;
