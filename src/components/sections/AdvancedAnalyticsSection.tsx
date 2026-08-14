"use client";

import { useState } from "react";
import { SectionId } from "@/lib/trialgptbot";
import {
  advancedAnalyticsKpis,
  advancedAnalyticsFunnel,
  advancedAnalyticsKpiTree,
  advancedAnalyticsAnomalies,
  advancedAnalyticsScenarios,
  AdvancedAnalyticsKpiTree,
} from "@/lib/trialgptbot";
import { BackToDashboard } from "./_BackToDashboard";

/**
 * AdvancedAnalyticsSection — Advanced Analytics (Feature #15).
 *
 * Executive-grade analytics beyond the operational Analytics page:
 *   • KPI strip with sparklines (time saved, throughput, MTTD, etc.)
 *   • Cohort funnel (6 stages: AI gen → concur)
 *   • KPI decomposition tree (root → 4 categories → leaves)
 *   • Anomaly radar (spike / drop / drift / outlier / pattern_change)
 *   • Scenario simulator (what-if with predicted uplift)
 *
 * Tech Readiness: Production Ready | Impact: High | Complexity: Medium
 */
interface AdvancedAnalyticsSectionProps {
  onNavigate: (id: SectionId) => void;
}

const TREND_ARROW: Record<string, string> = { up: "↑", down: "↓", flat: "→" };

const ANOMALY_TYPE_COLOR: Record<string, string> = {
  spike: "#ef4444",
  drop: "#f59e0b",
  drift: "#8b5cf6",
  outlier: "#ec4899",
  pattern_change: "#06b6d4",
};

const ANOMALY_SEVERITY_COLOR: Record<string, string> = {
  low: "#94a3b8",
  medium: "#f59e0b",
  high: "#ef4444",
};

const ANOMALY_STATUS_COLOR: Record<string, string> = {
  investigating: "#3b82f6",
  false_positive: "#94a3b8",
  confirmed: "#ef4444",
  mitigated: "#10b981",
};

const KPI_TREE_CATEGORY_COLOR: Record<string, string> = {
  throughput: "#3b82f6",
  accuracy: "#10b981",
  speed: "#f59e0b",
  compliance: "#8b5cf6",
};

function Sparkline({ data, color = "#3b82f6" }: { data: number[]; color?: string }) {
  const W = 100;
  const H = 28;
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
  const areaPath = `${path} L ${W},${H} L 0,${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="aa-sparkline" preserveAspectRatio="none">
      <path d={areaPath} fill={color} fillOpacity="0.15" stroke="none" />
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" />
      <circle cx={W} cy={H - ((data[data.length - 1] - min) / range) * H} r="2.5" fill={color} />
    </svg>
  );
}

function KpiTreeNode({ node, depth = 0 }: { node: AdvancedAnalyticsKpiTree; depth?: number }) {
  const color = KPI_TREE_CATEGORY_COLOR[node.category] || "#3b82f6";
  const hasChildren = node.children.length > 0;
  const [expanded, setExpanded] = useState(true);
  return (
    <div className={`aa-tree-node depth-${depth}`} style={{ borderLeftColor: color }}>
      <div className="aa-tree-node-row" style={{ paddingLeft: `${depth * 20 + 12}px` }}>
        {hasChildren && (
          <button
            type="button"
            className="aa-tree-toggle"
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? "▼" : "▶"}
          </button>
        )}
        {!hasChildren && <span className="aa-tree-leaf-dot" style={{ background: color }} />}
        <span className="aa-tree-label">{node.label}</span>
        <span className="aa-tree-value" style={{ color }}>
          {node.value}{node.unit}
        </span>
        <div className="aa-tree-bar-track">
          <div className="aa-tree-bar-fill" style={{ width: `${node.value}%`, background: color }} />
        </div>
      </div>
      {hasChildren && expanded && (
        <div className="aa-tree-children">
          {node.children.map((child) => (
            <KpiTreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function AdvancedAnalyticsSection({ onNavigate }: AdvancedAnalyticsSectionProps) {
  const [scenarioSimulated, setScenarioSimulated] = useState<string | null>(null);

  // Funnel chart geometry
  const maxCount = Math.max(...advancedAnalyticsFunnel.map((s) => s.count));

  return (
    <div className="aa-page">
      <BackToDashboard
        onNavigate={onNavigate}
        secondary={{ label: "Open Analytics", target: "analytics" }}
      />

      {/* Hero */}
      <section className="aa-hero">
        <div className="aa-hero-content">
          <div className="aa-hero-title-row">
            <h1>📊 Advanced Analytics</h1>
            <span className="aa-hero-badge">Feature #15 · Production Ready · Impact High</span>
          </div>
          <p>
            Executive-grade analytics layer: cohort funnels, KPI decomposition
            trees, anomaly radar with auto-triage, and scenario simulators for
            operational forecasting. Goes beyond operational dashboards to
            surface causal drivers, projected enrollment dates, and what-if
            analyses for trial planning.
          </p>
          <div className="aa-hero-meta">
            <span>🔍 5 anomaly signals under active triage</span>
            <span>•</span>
            <span>🎯 87/100 reviewer productivity index</span>
            <span>•</span>
            <span>📅 Predicted enrollment: 11-MAR-2027 (±18d)</span>
          </div>
        </div>
      </section>

      {/* KPI strip with sparklines */}
      <section className="aa-kpi-grid">
        {advancedAnalyticsKpis.map((kpi) => {
          const color =
            kpi.trend === "up" ? "#10b981" : kpi.trend === "down" ? "#ef4444" : "#94a3b8";
          return (
            <div key={kpi.label} className="aa-kpi-card">
              <div className="aa-kpi-label">{kpi.label}</div>
              <div className="aa-kpi-value-row">
                <span className="aa-kpi-value">{kpi.value}</span>
                {kpi.deltaPct !== undefined && (
                  <span className={`aa-kpi-delta ${(kpi.trend === "up" && kpi.deltaPct > 0) || (kpi.trend === "down" && kpi.deltaPct < 0) ? "good" : "bad"}`}>
                    {TREND_ARROW[kpi.trend ?? "flat"]} {Math.abs(kpi.deltaPct)}%
                  </span>
                )}
              </div>
              <Sparkline data={kpi.sparkline} color={color} />
              {kpi.hint && <div className="aa-kpi-hint">{kpi.hint}</div>}
            </div>
          );
        })}
      </section>

      {/* Cohort funnel + KPI tree */}
      <section className="aa-section aa-two-col">
        <div className="aa-half">
          <div className="aa-section-head">
            <h2>Cohort Funnel</h2>
            <span className="aa-section-sub">AI task → reviewer concur · 6 stages</span>
          </div>
          <div className="aa-funnel">
            {advancedAnalyticsFunnel.map((stage, i) => {
              const widthPct = (stage.count / maxCount) * 100;
              const isLast = i === advancedAnalyticsFunnel.length - 1;
              return (
                <div key={stage.stageId} className="aa-funnel-row">
                  <div className="aa-funnel-stage-info">
                    <span className="aa-funnel-stage-name">{stage.stageName}</span>
                    <span className="aa-funnel-stage-count">{stage.count.toLocaleString()}</span>
                  </div>
                  <div className="aa-funnel-bar-wrap">
                    <div
                      className="aa-funnel-bar"
                      style={{
                        width: `${widthPct}%`,
                        background: `linear-gradient(90deg, hsl(${210 + i * 8}, 70%, 55%), hsl(${210 + i * 8}, 70%, 50%))`,
                      }}
                    />
                    <div className="aa-funnel-meta">
                      <span>conv: {stage.conversionPct.toFixed(1)}%</span>
                      {!isLast && stage.dropoffPct > 0 && (
                        <span className="aa-funnel-dropoff">↓ {stage.dropoffPct.toFixed(1)}% drop</span>
                      )}
                      {stage.avgDurationHr > 0 && (
                        <span className="aa-funnel-duration">⏱ {stage.avgDurationHr.toFixed(1)}h avg</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="aa-half">
          <div className="aa-section-head">
            <h2>KPI Decomposition Tree</h2>
            <span className="aa-section-sub">Reviewer productivity index → 4 categories → leaves</span>
          </div>
          <div className="aa-tree">
            <KpiTreeNode node={advancedAnalyticsKpiTree} />
          </div>
        </div>
      </section>

      {/* Anomaly radar */}
      <section className="aa-section">
        <div className="aa-section-head">
          <h2>Anomaly Radar</h2>
          <span className="aa-section-sub">
            spike / drop / drift / outlier / pattern_change · auto-detected, human-triaged
          </span>
        </div>
        <div className="aa-anomaly-grid">
          {advancedAnalyticsAnomalies.map((a) => (
            <div key={a.anomalyId} className={`aa-anomaly-card ${a.status}`}>
              <div className="aa-anomaly-head">
                <span
                  className="aa-anomaly-type-pill"
                  style={{ background: `${ANOMALY_TYPE_COLOR[a.signalType]}22`, color: ANOMALY_TYPE_COLOR[a.signalType] }}
                >
                  {a.signalType.replace(/_/g, " ")}
                </span>
                <span
                  className="aa-anomaly-severity-pill"
                  style={{ background: `${ANOMALY_SEVERITY_COLOR[a.severity]}22`, color: ANOMALY_SEVERITY_COLOR[a.severity] }}
                >
                  {a.severity}
                </span>
                <span
                  className="aa-anomaly-status-pill"
                  style={{ background: `${ANOMALY_STATUS_COLOR[a.status]}22`, color: ANOMALY_STATUS_COLOR[a.status] }}
                >
                  {a.status.replace(/_/g, " ")}
                </span>
              </div>
              <div className="aa-anomaly-metric">{a.metric}</div>
              <div className="aa-anomaly-expected">
                expected <strong>{a.expected}</strong> · observed <strong>{a.observed}</strong>
              </div>
              <div className="aa-anomaly-summary">{a.summary}</div>
              <div className="aa-anomaly-meta">
                <span><code>{a.anomalyId}</code></span>
                <span>•</span>
                <span>{new Date(a.detectedAt).toLocaleString()}</span>
                {a.siteId && (
                  <>
                    <span>•</span>
                    <span><code>{a.siteId}</code></span>
                  </>
                )}
                {a.trialId && (
                  <>
                    <span>•</span>
                    <span><code>{a.trialId}</code></span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Scenario simulator */}
      <section className="aa-section">
        <div className="aa-section-head">
          <h2>Scenario Simulator</h2>
          <span className="aa-section-sub">
            What-if analyses · predicted uplift based on historical regression coefficients
          </span>
        </div>
        <div className="aa-scenario-grid">
          {advancedAnalyticsScenarios.map((s) => {
            const isSimulated = scenarioSimulated === s.scenarioId;
            return (
              <div
                key={s.scenarioId}
                className={`aa-scenario-card ${isSimulated ? "simulated" : ""}`}
                onClick={() => setScenarioSimulated(isSimulated ? null : s.scenarioId)}
                role="button"
                tabIndex={0}
              >
                <div className="aa-scenario-head">
                  <span className="aa-scenario-name">{s.name}</span>
                  <span className={`aa-scenario-uplift ${s.upliftPct > 0 ? "good" : "bad"}`}>
                    {s.upliftPct > 0 ? "+" : ""}{s.upliftPct.toFixed(1)}%
                  </span>
                </div>
                <div className="aa-scenario-bars">
                  <div className="aa-scenario-bar-row">
                    <span className="aa-scenario-bar-label">baseline</span>
                    <div className="aa-scenario-bar-track">
                      <div className="aa-scenario-bar-fill baseline" style={{ width: `${s.baseline}%` }} />
                    </div>
                    <span className="aa-scenario-bar-val">{s.baseline}</span>
                  </div>
                  <div className="aa-scenario-bar-row">
                    <span className="aa-scenario-bar-label">predicted</span>
                    <div className="aa-scenario-bar-track">
                      <div
                        className="aa-scenario-bar-fill predicted"
                        style={{ width: `${s.predicted}%` }}
                      />
                    </div>
                    <span className="aa-scenario-bar-val">{s.predicted}</span>
                  </div>
                </div>
                <div className="aa-scenario-unit">{s.unit}</div>
                {isSimulated && (
                  <div className="aa-scenario-assumptions">
                    <div className="aa-scenario-assumptions-label">Assumptions:</div>
                    <ul>
                      {s.assumptions.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="aa-scenario-cta">
                  {isSimulated ? "▲ Hide assumptions" : "▼ Reveal assumptions"}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default AdvancedAnalyticsSection;
