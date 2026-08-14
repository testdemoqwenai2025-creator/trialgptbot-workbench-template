"use client";

import { useState, useMemo } from "react";
import { SectionId } from "@/lib/trialgptbot";
import {
  autonomousKpis,
  autonomyMaturityLevels,
  autonomyDomainMaturity,
  proactiveInterventions,
  selfImprovementCycles,
  autonomousDecisionLog,
} from "@/lib/trialgptbot";
import { BackToDashboard } from "./_BackToDashboard";

/**
 * AutonomousSection — Autonomous Clinical Intelligence Systems (Feature #17).
 *
 * Genuine reasoning capabilities across regulatory, scientific, operational,
 * and safety domains. Self-improving systems progressing toward Level 5
 * autonomy maturity. Shifts risk mitigation from passive review to active
 * prevention. Continuous optimization without explicit reprogramming.
 *
 * Tech Readiness: Research | Impact: Transformative | Complexity: Very High
 */
interface AutonomousSectionProps {
  onNavigate: (id: SectionId) => void;
}

const DOMAIN_COLOR: Record<string, string> = {
  regulatory: "#3b82f6",
  scientific: "#8b5cf6",
  operational: "#10b981",
  safety: "#ef4444",
};

const DOMAIN_ICON: Record<string, string> = {
  regulatory: "⚖️",
  scientific: "🔬",
  operational: "⚙️",
  safety: "🛡️",
};

const OUTCOME_COLOR: Record<string, string> = {
  prevented: "#10b981",
  mitigated: "#3b82f6",
  escalated: "#f59e0b",
  monitoring: "#94a3b8",
};

const DECISION_COLOR: Record<string, string> = {
  deployed: "#10b981",
  rejected: "#ef4444",
  aborted: "#f59e0b",
};

const VERIFICATION_COLOR: Record<string, string> = {
  symbolic_passed: "#10b981",
  constraint_passed: "#3b82f6",
  human_reviewed: "#f59e0b",
  audit_logged: "#8b5cf6",
};

const TRIGGER_COLOR: Record<string, string> = {
  scheduled: "#3b82f6",
  drift_triggered: "#f59e0b",
  incident_triggered: "#ef4444",
  feedback_triggered: "#8b5cf6",
};

export function AutonomousSection({ onNavigate }: AutonomousSectionProps) {
  const [domainFilter, setDomainFilter] = useState<string>("all");
  const [selectedCycle, setSelectedCycle] = useState<number | null>(47);

  const filteredInterventions = useMemo(() => {
    if (domainFilter === "all") return proactiveInterventions;
    return proactiveInterventions.filter((i) => i.domain === domainFilter);
  }, [domainFilter]);

  const filteredDecisions = useMemo(() => {
    if (domainFilter === "all") return autonomousDecisionLog;
    return autonomousDecisionLog.filter((d) => d.domain === domainFilter);
  }, [domainFilter]);

  const cycleDetail = selfImprovementCycles.find((c) => c.cycleId === selectedCycle);

  // Self-improvement loop SVG geometry
  const loopW = 720;
  const loopH = 360;
  const cx = loopW / 2;
  const cy = loopH / 2;
  const r = 120;
  const stages = ["Observe", "Reason", "Hypothesize", "Test", "Deploy", "Monitor"];
  const stageColors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"];

  return (
    <div className="ac-page">
      <BackToDashboard
        onNavigate={onNavigate}
        secondary={{ label: "Open Neuro-Symbolic", target: "neuro-symbolic" }}
      />

      {/* Hero */}
      <section className="ac-hero">
        <div className="ac-hero-content">
          <div className="ac-hero-title-row">
            <h1>🤖 Autonomous Clinical Intelligence Systems</h1>
            <span className="ac-hero-badge">Feature #17 · Research · Impact Transformative · Complexity Very High</span>
          </div>
          <p>
            Genuine reasoning capabilities across regulatory, scientific,
            operational, and safety domains. Self-improving systems progressing
            toward Level 5 autonomy maturity — proactive risk mitigation
            shifting from passive review to active prevention, with continuous
            optimization that does not require explicit reprogramming. The
            north-star is a system that sets its own goals within regulatory
            bounds and self-heals when environments drift.
          </p>
          <div className="ac-hero-meta">
            <span>📈 Avg maturity 3.4 / 5</span>
            <span>•</span>
            <span>🎯 Target 5.0 by Q4 2027</span>
            <span>•</span>
            <span>⏱ 847 autonomous decisions / hr</span>
            <span>•</span>
            <span>🛟 89 proactive interventions / day</span>
          </div>
        </div>
      </section>

      {/* KPI strip */}
      <section className="ac-kpi-grid">
        {autonomousKpis.map((kpi) => (
          <div key={kpi.label} className="ac-kpi-card">
            <div className="ac-kpi-label">{kpi.label}</div>
            <div className="ac-kpi-value-row">
              <span className="ac-kpi-value">{kpi.value}</span>
              {kpi.deltaPct !== undefined && (
                <span
                  className={`ac-kpi-delta ${
                    (kpi.trend === "down" && kpi.deltaPct < 0) || (kpi.trend === "up" && kpi.deltaPct > 0)
                      ? "good"
                      : "bad"
                  }`}
                >
                  {kpi.trend === "up" ? "↑" : kpi.trend === "down" ? "↓" : "→"} {Math.abs(kpi.deltaPct)}%
                </span>
              )}
            </div>
            {kpi.hint && <div className="ac-kpi-hint">{kpi.hint}</div>}
          </div>
        ))}
      </section>

      {/* Autonomy Maturity Matrix */}
      <section className="ac-section">
        <div className="ac-section-head">
          <h2>Autonomy Maturity Matrix</h2>
          <span className="ac-section-sub">
            SAE-style 5-level framework · current vs target by domain · trajectory tracked monthly
          </span>
        </div>

        {/* Level ladder */}
        <div className="ac-level-ladder">
          {autonomyMaturityLevels.map((lvl) => {
            const isCurrent = lvl.level === 3 || lvl.level === 4;
            const isTarget = lvl.level === 5;
            return (
              <div
                key={lvl.level}
                className={`ac-level-card ${isCurrent ? "current" : ""} ${isTarget ? "target" : ""}`}
              >
                <div className="ac-level-card-head">
                  <span className="ac-level-num">L{lvl.level}</span>
                  <span className="ac-level-name">{lvl.name}</span>
                  {isCurrent && <span className="ac-level-pill current">current</span>}
                  {isTarget && <span className="ac-level-pill target">target 2027</span>}
                </div>
                <p className="ac-level-desc">{lvl.description}</p>
                <div className="ac-level-cap">
                  {lvl.capabilities.map((c) => (
                    <span key={c} className="ac-level-cap-pill">{c}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Per-domain maturity tracker */}
        <div className="ac-domain-grid">
          {autonomyDomainMaturity.map((d) => {
            const color = DOMAIN_COLOR[d.domain];
            const currentPct = (d.currentLevel / 5) * 100;
            const targetPct = (d.targetLevel2027 / 5) * 100;
            return (
              <div key={d.domain} className="ac-domain-card" style={{ borderTopColor: color }}>
                <div className="ac-domain-card-head">
                  <span className="ac-domain-icon" style={{ background: color + "22", color }}>
                    {DOMAIN_ICON[d.domain]}
                  </span>
                  <div className="ac-domain-name-block">
                    <span className="ac-domain-name">{d.domain}</span>
                    <span className="ac-domain-last-transition">since {new Date(d.lastTransitionAt).toLocaleDateString()}</span>
                  </div>
                  <div className="ac-domain-level-block">
                    <span className="ac-domain-current" style={{ color }}>
                      L{d.currentLevel}
                    </span>
                    <span className="ac-domain-arrow">→</span>
                    <span className="ac-domain-target">L{d.targetLevel2027}</span>
                  </div>
                </div>
                <div className="ac-domain-bar-track">
                  <div className="ac-domain-bar-current" style={{ width: `${currentPct}%`, background: color }} />
                  <div className="ac-domain-bar-target" style={{ left: `${targetPct}%` }} />
                </div>
                <p className="ac-domain-rationale">{d.rationale}</p>
                <div className="ac-domain-blockers">
                  <span className="ac-domain-blockers-label">Blockers:</span>
                  {d.blockers.map((b) => (
                    <span key={b} className="ac-domain-blocker-pill">{b}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Self-Improvement Loop */}
      <section className="ac-section">
        <div className="ac-section-head">
          <h2>Self-Improvement Loop · Continuous Optimization Without Explicit Reprogramming</h2>
          <span className="ac-section-sub">
            Six-stage cycle · weekly cadence · cycle #47 in progress · all deployments gated by symbolic verification
          </span>
        </div>
        <div className="ac-loop-wrap">
          <svg viewBox={`0 0 ${loopW} ${loopH}`} className="ac-loop-svg">
            {/* Outer cycle arrows */}
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6 4" />

            {/* Center label */}
            <text x={cx} y={cy - 12} textAnchor="middle" fontSize="14" fontWeight="700" fill="#475569">
              Self-Improvement
            </text>
            <text x={cx} y={cy + 8} textAnchor="middle" fontSize="11" fill="#64748b">
              Cycle #47 · weekly
            </text>
            <text x={cx} y={cy + 26} textAnchor="middle" fontSize="10" fill="#94a3b8" fontStyle="italic">
              no explicit reprogramming
            </text>

            {/* Stage nodes */}
            {stages.map((stage, i) => {
              const angle = (i / stages.length) * 2 * Math.PI - Math.PI / 2;
              const x = cx + r * Math.cos(angle);
              const y = cy + r * Math.sin(angle);
              const color = stageColors[i];
              return (
                <g key={stage}>
                  <circle cx={x} cy={y} r={36} fill={color + "22"} stroke={color} strokeWidth="2.5" />
                  <text x={x} y={y - 2} textAnchor="middle" fontSize="11" fontWeight="700" fill={color}>
                    {i + 1}
                  </text>
                  <text x={x} y={y + 12} textAnchor="middle" fontSize="10" fontWeight="600" fill="#1e293b">
                    {stage}
                  </text>
                  {/* Arrow to next stage */}
                  {i < stages.length - 1 && (
                    <g>
                      <line
                        x1={x + 30 * Math.cos(angle + Math.PI / 6)}
                        y1={y + 30 * Math.sin(angle + Math.PI / 6)}
                        x2={cx + r * Math.cos(angle + (2 * Math.PI) / stages.length - Math.PI / 2) - 30 * Math.cos(angle + Math.PI / 6 + (2 * Math.PI) / stages.length)}
                        y2={cy + r * Math.sin(angle + (2 * Math.PI) / stages.length - Math.PI / 2) - 30 * Math.sin(angle + Math.PI / 6 + (2 * Math.PI) / stages.length)}
                        stroke={color}
                        strokeWidth="2"
                        markerEnd="url(#ac-arrow)"
                      />
                    </g>
                  )}
                </g>
              );
            })}

            <defs>
              <marker id="ac-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L9,3 z" fill="#94a3b8" />
              </marker>
            </defs>
          </svg>
        </div>

        {/* Recent cycles list + detail */}
        <div className="ac-cycle-two-col">
          <div className="ac-cycle-list">
            <div className="ac-cycle-list-head">
              <h3>Recent Self-Improvement Cycles</h3>
              <span className="ac-cycle-list-sub">click to inspect</span>
            </div>
            <div className="ac-cycle-rows">
              {selfImprovementCycles.map((c) => {
                const isSelected = c.cycleId === selectedCycle;
                return (
                  <button
                    key={c.cycleId}
                    type="button"
                    className={`ac-cycle-row ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelectedCycle(c.cycleId)}
                  >
                    <div className="ac-cycle-row-head">
                      <span className="ac-cycle-num">#{c.cycleId}</span>
                      <span
                        className="ac-cycle-trigger-pill"
                        style={{ background: TRIGGER_COLOR[c.trigger] }}
                      >
                        {c.trigger.replace(/_/g, " ")}
                      </span>
                      <span
                        className="ac-cycle-decision-pill"
                        style={{ background: DECISION_COLOR[c.decision] }}
                      >
                        {c.decision}
                      </span>
                    </div>
                    <div className="ac-cycle-hypothesis">{c.hypothesis}</div>
                    <div className="ac-cycle-metric-row">
                      <span className="ac-cycle-metric-label">{c.outcomeMetric}</span>
                      <span className="ac-cycle-metric-val">
                        {c.outcomeBefore.toFixed(3)} → <strong>{c.outcomeAfter.toFixed(3)}</strong>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ac-cycle-detail">
            {cycleDetail ? (
              <>
                <div className="ac-cycle-detail-head">
                  <h3>Cycle #{cycleDetail.cycleId} — Detail</h3>
                  <span
                    className="ac-cycle-detail-decision"
                    style={{ background: DECISION_COLOR[cycleDetail.decision] }}
                  >
                    {cycleDetail.decision}
                  </span>
                </div>
                <div className="ac-cycle-detail-grid">
                  <div className="ac-cycle-detail-cell">
                    <span className="ac-detail-label">Started</span>
                    <span className="ac-detail-value">{new Date(cycleDetail.startedAt).toLocaleString()}</span>
                  </div>
                  <div className="ac-cycle-detail-cell">
                    <span className="ac-detail-label">Completed</span>
                    <span className="ac-detail-value">{new Date(cycleDetail.completedAt).toLocaleString()}</span>
                  </div>
                  <div className="ac-cycle-detail-cell">
                    <span className="ac-detail-label">Trigger</span>
                    <span className="ac-detail-value">
                      <span className="ac-cycle-trigger-pill" style={{ background: TRIGGER_COLOR[cycleDetail.trigger] }}>
                        {cycleDetail.trigger.replace(/_/g, " ")}
                      </span>
                    </span>
                  </div>
                  <div className="ac-cycle-detail-cell">
                    <span className="ac-detail-label">Outcome metric</span>
                    <span className="ac-detail-value">{cycleDetail.outcomeMetric}</span>
                  </div>
                  <div className="ac-cycle-detail-cell wide">
                    <span className="ac-detail-label">Hypothesis</span>
                    <span className="ac-detail-value">{cycleDetail.hypothesis}</span>
                  </div>
                  <div className="ac-cycle-detail-cell wide">
                    <span className="ac-detail-label">Experiment</span>
                    <span className="ac-detail-value">{cycleDetail.experiment}</span>
                  </div>
                  <div className="ac-cycle-detail-cell wide">
                    <span className="ac-detail-label">Outcome</span>
                    <span className="ac-detail-value">
                      {cycleDetail.outcomeMetric}: {cycleDetail.outcomeBefore.toFixed(3)} → <strong>{cycleDetail.outcomeAfter.toFixed(3)}</strong>
                    </span>
                  </div>
                  <div className="ac-cycle-detail-cell wide">
                    <span className="ac-detail-label">Notes</span>
                    <span className="ac-detail-value">{cycleDetail.notes}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="ac-cycle-detail-empty">Select a cycle to inspect</div>
            )}
          </div>
        </div>
      </section>

      {/* Proactive Risk Mitigation */}
      <section className="ac-section">
        <div className="ac-section-head">
          <h2>Proactive Risk Mitigation — From Passive Review to Active Prevention</h2>
          <div className="ac-domain-filter">
            {["all", "regulatory", "scientific", "operational", "safety"].map((d) => (
              <button
                key={d}
                type="button"
                className={`ac-domain-chip ${domainFilter === d ? "active" : ""}`}
                onClick={() => setDomainFilter(d)}
              >
                {d === "all" ? "all domains" : `${DOMAIN_ICON[d]} ${d}`}
              </button>
            ))}
          </div>
        </div>
        <div className="ac-intervention-list">
          {filteredInterventions.map((i) => {
            const color = DOMAIN_COLOR[i.domain];
            return (
              <div key={i.interventionId} className="ac-intervention-card" style={{ borderLeftColor: color }}>
                <div className="ac-intervention-card-head">
                  <span className="ac-intervention-domain" style={{ background: color + "22", color }}>
                    {DOMAIN_ICON[i.domain]} {i.domain}
                  </span>
                  <span className="ac-intervention-category">{i.category}</span>
                  <span className="ac-intervention-lead-time">
                    ⏱ {i.leadTimeDays === 0 ? "real-time" : `${i.leadTimeDays}d lead time`}
                  </span>
                  <span
                    className="ac-intervention-outcome"
                    style={{ background: OUTCOME_COLOR[i.outcome] + "22", color: OUTCOME_COLOR[i.outcome] }}
                  >
                    {i.outcome}
                  </span>
                </div>
                <div className="ac-intervention-desc">{i.description}</div>
                <div className="ac-intervention-action-row">
                  <span className="ac-intervention-action-label">Action taken:</span>
                  <span className="ac-intervention-action-val">{i.actionTaken}</span>
                </div>
                <div className="ac-intervention-foot">
                  <span className="ac-intervention-timestamp">{new Date(i.detectedAt).toLocaleString()}</span>
                  <span className="ac-intervention-confidence">
                    Confidence: <strong>{(i.confidenceScore * 100).toFixed(1)}%</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Autonomous Decision Log */}
      <section className="ac-section">
        <div className="ac-section-head">
          <h2>Autonomous Decision Log (Last 4 Hours)</h2>
          <span className="ac-section-sub">
            Every self-executed decision is logged with rationale, verification method, and override count
          </span>
        </div>
        <div className="ac-decision-table">
          <div className="ac-decision-head">
            <span>Timestamp</span>
            <span>Domain</span>
            <span>Action</span>
            <span>Rationale</span>
            <span>Conf.</span>
            <span>Verification</span>
            <span>Overrides</span>
            <span>Lvl</span>
          </div>
          {filteredDecisions.map((d) => (
            <div key={d.decisionId} className="ac-decision-row">
              <span className="ac-decision-ts">{new Date(d.timestamp).toLocaleTimeString()}</span>
              <span>
                <span className="ac-decision-domain-pill" style={{ background: DOMAIN_COLOR[d.domain] + "22", color: DOMAIN_COLOR[d.domain] }}>
                  {DOMAIN_ICON[d.domain]} {d.domain}
                </span>
              </span>
              <span className="ac-decision-action">{d.action}</span>
              <span className="ac-decision-rationale">{d.rationale}</span>
              <span className={`ac-decision-conf ${d.confidenceScore >= 0.9 ? "high" : d.confidenceScore >= 0.8 ? "medium" : "low"}`}>
                {(d.confidenceScore * 100).toFixed(0)}%
              </span>
              <span>
                <span
                  className="ac-decision-verification-pill"
                  style={{ background: VERIFICATION_COLOR[d.verification] + "22", color: VERIFICATION_COLOR[d.verification] }}
                >
                  {d.verification.replace(/_/g, " ")}
                </span>
              </span>
              <span className={`ac-decision-override ${d.overrideCount > 0 ? "has" : ""}`}>{d.overrideCount}</span>
              <span className="ac-decision-level">L{d.autonomousLevel}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AutonomousSection;
