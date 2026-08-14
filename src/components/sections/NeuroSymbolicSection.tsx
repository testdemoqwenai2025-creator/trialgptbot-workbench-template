"use client";

import { useState, useMemo } from "react";
import { SectionId } from "@/lib/trialgptbot";
import {
  neuroSymbolicKpis,
  neuralComponents,
  symbolicComponents,
  knowledgeGraphNodes,
  knowledgeGraphEdges,
  hypothesisVerificationLog,
  hybridComparison,
} from "@/lib/trialgptbot";
import { BackToDashboard } from "./_BackToDashboard";

/**
 * NeuroSymbolicSection — Neuro-Symbolic AI Architecture (Feature #18).
 *
 * Hybrid approach combining the flexibility of learning (neural) with the
 * reliability of rule-based reasoning (symbolic). The neural component
 * proposes hypotheses, flags anomalies, and recognizes patterns. The
 * symbolic component verifies against constraints, regulatory rules, and
 * logical consistency. Output is explainable, verifiable, and regulator-ready.
 *
 * Tech Readiness: Research | Impact: Transformative | Complexity: Very High
 */
interface NeuroSymbolicSectionProps {
  onNavigate: (id: SectionId) => void;
}

const NEURAL_ROLE_COLOR: Record<string, string> = {
  hypothesis: "#3b82f6",
  anomaly: "#ef4444",
  pattern: "#8b5cf6",
  extraction: "#10b981",
  generation: "#f59e0b",
};

const SYMBOLIC_ROLE_COLOR: Record<string, string> = {
  constraint_check: "#3b82f6",
  regulatory_rule: "#10b981",
  logical_consistency: "#8b5cf6",
  ontology_reasoning: "#f59e0b",
  causal_inference: "#ec4899",
};

const FORMALISM_COLOR: Record<string, string> = {
  SWRL: "#3b82f6",
  "OWL-DL": "#10b981",
  FOL: "#8b5cf6",
  Prolog: "#ec4899",
  Datalog: "#f59e0b",
};

const NODE_TYPE_COLOR: Record<string, string> = {
  Protocol: "#3b82f6",
  Subject: "#10b981",
  Endpoint: "#8b5cf6",
  AdverseEvent: "#ef4444",
  Visit: "#06b6d4",
  Form: "#f59e0b",
  Drug: "#ec4899",
  Site: "#84cc16",
  RegulatoryDoc: "#6366f1",
};

const VERDICT_COLOR: Record<string, string> = {
  verified: "#10b981",
  rejected: "#ef4444",
  needs_revision: "#f59e0b",
  partial: "#3b82f6",
};

export function NeuroSymbolicSection({ onNavigate }: NeuroSymbolicSectionProps) {
  const [selectedNode, setSelectedNode] = useState<string>("p-onco-204");
  const [verdictFilter, setVerdictFilter] = useState<string>("all");

  const filteredLog = useMemo(() => {
    if (verdictFilter === "all") return hypothesisVerificationLog;
    return hypothesisVerificationLog.filter((l) => l.symbolicVerdict === verdictFilter);
  }, [verdictFilter]);

  const selectedNodeData = knowledgeGraphNodes.find((n) => n.nodeId === selectedNode);
  const connectedEdges = knowledgeGraphEdges.filter(
    (e) => e.source === selectedNode || e.target === selectedNode,
  );
  const connectedNodeIds = new Set<string>();
  connectedEdges.forEach((e) => {
    connectedNodeIds.add(e.source);
    connectedNodeIds.add(e.target);
  });

  // Knowledge graph layout — manual positions for clarity
  const kgPositions: Record<string, { x: number; y: number }> = {
    "p-onco-204":    { x: 400, y: 80  },
    "p-cv-118":      { x: 120, y: 80  },
    "s-04-014":      { x: 250, y: 200 },
    "s-04-022":      { x: 550, y: 200 },
    "ep-os":         { x: 280, y: 40  },
    "ep-pfs":        { x: 520, y: 40  },
    "ae-hepatitis":  { x: 130, y: 320 },
    "ae-neutropenia":{ x: 670, y: 320 },
    "v-cycle1-d1":   { x: 400, y: 320 },
    "f-icf-v4":      { x: 730, y: 80  },
    "d-pembro":      { x: 80,  y: 200 },
    "d-tucatinib":   { x: 730, y: 200 },
    "site-nbo-09":   { x: 250, y: 380 },
    "rd-21cfr11":    { x: 730, y: 320 },
  };

  const kgW = 840;
  const kgH = 440;

  return (
    <div className="ns-page">
      <BackToDashboard
        onNavigate={onNavigate}
        secondary={{ label: "Open Autonomous AI", target: "autonomous" }}
      />

      {/* Hero */}
      <section className="ns-hero">
        <div className="ns-hero-content">
          <div className="ns-hero-title-row">
            <h1>🧠⚛️ Neuro-Symbolic AI Architecture</h1>
            <span className="ns-hero-badge">Feature #18 · Research · Impact Transformative · Complexity Very High</span>
          </div>
          <p>
            Hybrid approach combining the flexibility of learning with the
            reliability of rule-based reasoning. The neural component proposes
            hypotheses, flags anomalies, and recognizes patterns. The symbolic
            component verifies against constraints, regulatory rules, and
            logical consistency. The two halves run in a tight verify-and-revise
            loop — neural outputs become actions only after symbolic verification,
            and symbolic gaps trigger neural re-hypothesization.
          </p>
          <div className="ns-hero-meta">
            <span>🧠 5 neural components</span>
            <span>•</span>
            <span>⚛️ 5 symbolic reasoners</span>
            <span>•</span>
            <span>📚 2,847 rules</span>
            <span>•</span>
            <span>🕸️ 1.4M KG triples</span>
            <span>•</span>
            <span>✅ 94.1% verification pass rate</span>
          </div>
        </div>
      </section>

      {/* KPI strip */}
      <section className="ns-kpi-grid">
        {neuroSymbolicKpis.map((kpi) => (
          <div key={kpi.label} className="ns-kpi-card">
            <div className="ns-kpi-label">{kpi.label}</div>
            <div className="ns-kpi-value-row">
              <span className="ns-kpi-value">{kpi.value}</span>
              {kpi.deltaPct !== undefined && (
                <span
                  className={`ns-kpi-delta ${
                    (kpi.trend === "down" && kpi.deltaPct < 0) || (kpi.trend === "up" && kpi.deltaPct > 0)
                      ? "good"
                      : "bad"
                  }`}
                >
                  {kpi.trend === "up" ? "↑" : kpi.trend === "down" ? "↓" : "→"} {Math.abs(kpi.deltaPct)}%
                </span>
              )}
            </div>
            {kpi.hint && <div className="ns-kpi-hint">{kpi.hint}</div>}
          </div>
        ))}
      </section>

      {/* Hybrid Pipeline Diagram */}
      <section className="ns-section">
        <div className="ns-section-head">
          <h2>Hybrid Verify-and-Revise Pipeline</h2>
          <span className="ns-section-sub">
            Neural hypothesizes → symbolic verifies → action only on pass; on fail, neural re-hypothesizes
          </span>
        </div>
        <div className="ns-pipeline-wrap">
          <svg viewBox="0 0 920 320" className="ns-pipeline-svg">
            {/* Input */}
            <rect x="20" y="120" width="120" height="80" rx="10" fill="#94a3b8" fillOpacity="0.15" stroke="#64748b" strokeWidth="2" />
            <text x="80" y="155" textAnchor="middle" fontSize="12" fontWeight="700" fill="#475569">INPUT</text>
            <text x="80" y="173" textAnchor="middle" fontSize="10" fill="#64748b">trial data</text>
            <text x="80" y="187" textAnchor="middle" fontSize="10" fill="#64748b">regulatory docs</text>

            {/* Neural */}
            <rect x="180" y="60" width="200" height="200" rx="12" fill="#3b82f6" fillOpacity="0.08" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="4 2" />
            <text x="280" y="85" textAnchor="middle" fontSize="13" fontWeight="700" fill="#3b82f6">🧠 NEURAL COMPONENT</text>
            <text x="280" y="103" textAnchor="middle" fontSize="10" fill="#3b82f6" fontStyle="italic">flexibility · learning</text>
            <rect x="200" y="120" width="160" height="32" rx="6" fill="#3b82f6" fillOpacity="0.2" stroke="#3b82f6" />
            <text x="280" y="141" textAnchor="middle" fontSize="11" fontWeight="600" fill="#1e293b">Hypothesis generation</text>
            <rect x="200" y="158" width="160" height="32" rx="6" fill="#ef4444" fillOpacity="0.2" stroke="#ef4444" />
            <text x="280" y="179" textAnchor="middle" fontSize="11" fontWeight="600" fill="#1e293b">Anomaly detection</text>
            <rect x="200" y="196" width="160" height="32" rx="6" fill="#8b5cf6" fillOpacity="0.2" stroke="#8b5cf6" />
            <text x="280" y="217" textAnchor="middle" fontSize="11" fontWeight="600" fill="#1e293b">Pattern recognition</text>

            {/* Symbolic */}
            <rect x="440" y="60" width="200" height="200" rx="12" fill="#10b981" fillOpacity="0.08" stroke="#10b981" strokeWidth="2.5" strokeDasharray="4 2" />
            <text x="540" y="85" textAnchor="middle" fontSize="13" fontWeight="700" fill="#10b981">⚛️ SYMBOLIC COMPONENT</text>
            <text x="540" y="103" textAnchor="middle" fontSize="10" fill="#10b981" fontStyle="italic">reliability · verification</text>
            <rect x="460" y="120" width="160" height="32" rx="6" fill="#3b82f6" fillOpacity="0.2" stroke="#3b82f6" />
            <text x="540" y="141" textAnchor="middle" fontSize="11" fontWeight="600" fill="#1e293b">Constraint check</text>
            <rect x="460" y="158" width="160" height="32" rx="6" fill="#10b981" fillOpacity="0.2" stroke="#10b981" />
            <text x="540" y="179" textAnchor="middle" fontSize="11" fontWeight="600" fill="#1e293b">Regulatory rule</text>
            <rect x="460" y="196" width="160" height="32" rx="6" fill="#8b5cf6" fillOpacity="0.2" stroke="#8b5cf6" />
            <text x="540" y="217" textAnchor="middle" fontSize="11" fontWeight="600" fill="#1e293b">Logical consistency</text>

            {/* Decision diamond */}
            <polygon points="740,80 820,160 740,240 660,160" fill="#f59e0b" fillOpacity="0.15" stroke="#f59e0b" strokeWidth="2.5" />
            <text x="740" y="155" textAnchor="middle" fontSize="11" fontWeight="700" fill="#f59e0b">VERIFIED?</text>
            <text x="740" y="172" textAnchor="middle" fontSize="10" fill="#475569">pass?</text>

            {/* Action (pass) */}
            <rect x="830" y="60" width="80" height="60" rx="8" fill="#10b981" fillOpacity="0.18" stroke="#10b981" strokeWidth="2" />
            <text x="870" y="85" textAnchor="middle" fontSize="10" fontWeight="700" fill="#10b981">ACTION</text>
            <text x="870" y="102" textAnchor="middle" fontSize="9" fill="#475569">auto-execute</text>

            {/* Re-hypothesis (fail) */}
            <rect x="830" y="200" width="80" height="60" rx="8" fill="#ef4444" fillOpacity="0.18" stroke="#ef4444" strokeWidth="2" />
            <text x="870" y="225" textAnchor="middle" fontSize="10" fontWeight="700" fill="#ef4444">RE-TRY</text>
            <text x="870" y="242" textAnchor="middle" fontSize="9" fill="#475569">re-hypothesize</text>

            {/* Arrows */}
            <line x1="140" y1="160" x2="180" y2="160" stroke="#475569" strokeWidth="2" markerEnd="url(#ns-arrow)" />
            <line x1="380" y1="160" x2="440" y2="160" stroke="#475569" strokeWidth="2" markerEnd="url(#ns-arrow)" />
            <line x1="640" y1="160" x2="660" y2="160" stroke="#475569" strokeWidth="2" markerEnd="url(#ns-arrow)" />
            <line x1="820" y1="140" x2="830" y2="100" stroke="#10b981" strokeWidth="2" markerEnd="url(#ns-arrow)" />
            <text x="830" y="125" fontSize="10" fontWeight="700" fill="#10b981">yes</text>
            <line x1="820" y1="180" x2="830" y2="220" stroke="#ef4444" strokeWidth="2" markerEnd="url(#ns-arrow)" />
            <text x="830" y="208" fontSize="10" fontWeight="700" fill="#ef4444">no</text>

            {/* Loop back arrow (re-hypothesis → neural) */}
            <path
              d={`M 870 200 Q 870 20, 540 20 T 280 60`}
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeDasharray="5 3"
              markerEnd="url(#ns-arrow-red)"
            />
            <text x="540" y="14" textAnchor="middle" fontSize="10" fontStyle="italic" fill="#ef4444">
              re-hypothesis loop · max 3 retries before human escalation
            </text>

            <defs>
              <marker id="ns-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L9,3 z" fill="#475569" />
              </marker>
              <marker id="ns-arrow-red" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L9,3 z" fill="#ef4444" />
              </marker>
            </defs>
          </svg>
        </div>
      </section>

      {/* Neural Components */}
      <section className="ns-section">
        <div className="ns-section-head">
          <h2>Neural Components — Hypothesize · Anomaly · Pattern · Extract · Generate</h2>
          <span className="ns-section-sub">
            5 specialized neural models · outputs feed symbolic verifier · top-k hypotheses passed downstream
          </span>
        </div>
        <div className="ns-neural-grid">
          {neuralComponents.map((nc) => {
            const color = NEURAL_ROLE_COLOR[nc.role];
            return (
              <div key={nc.componentId} className="ns-neural-card" style={{ borderTopColor: color }}>
                <div className="ns-neural-card-head">
                  <span className="ns-neural-role-pill" style={{ background: color + "22", color }}>
                    {nc.role}
                  </span>
                  <span className="ns-neural-name">{nc.name}</span>
                </div>
                <div className="ns-neural-meta">
                  <div><span>Model</span><strong>{nc.modelFamily}</strong></div>
                  <div><span>Params</span><strong>{nc.parameters}</strong></div>
                </div>
                <div className="ns-neural-io">
                  <div className="ns-neural-io-block">
                    <span className="ns-neural-io-label">Inputs</span>
                    <div className="ns-neural-io-list">
                      {nc.inputModalities.map((m) => <span key={m} className="ns-io-pill input">{m}</span>)}
                    </div>
                  </div>
                  <div className="ns-neural-io-block">
                    <span className="ns-neural-io-label">Outputs → symbolic</span>
                    <div className="ns-neural-io-list">
                      {nc.outputsForSymbolic.map((o) => <span key={o} className="ns-io-pill output">{o}</span>)}
                    </div>
                  </div>
                </div>
                <div className="ns-neural-acc">
                  <span className="ns-neural-acc-label">{nc.accuracyMetric}</span>
                  <div className="ns-neural-acc-track">
                    <div className="ns-neural-acc-fill" style={{ width: `${nc.accuracyValue * 100}%`, background: color }} />
                  </div>
                  <span className="ns-neural-acc-val">{(nc.accuracyValue * 100).toFixed(1)}%</span>
                </div>
                <p className="ns-neural-notes">{nc.notes}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Symbolic Components */}
      <section className="ns-section">
        <div className="ns-section-head">
          <h2>Symbolic Components — Constraint · Regulatory · Logical · Ontology · Causal</h2>
          <span className="ns-section-sub">
            5 reasoners · 2,847 rules total · formalisms: SWRL · OWL-DL · FOL · Prolog · Datalog
          </span>
        </div>
        <div className="ns-symbolic-grid">
          {symbolicComponents.map((sc) => {
            const color = SYMBOLIC_ROLE_COLOR[sc.role];
            return (
              <div key={sc.componentId} className="ns-symbolic-card" style={{ borderLeftColor: color }}>
                <div className="ns-symbolic-card-head">
                  <span className="ns-symbolic-role-pill" style={{ background: color + "22", color }}>
                    {sc.role.replace(/_/g, " ")}
                  </span>
                  <span
                    className="ns-symbolic-formalism-pill"
                    style={{ background: FORMALISM_COLOR[sc.formalism] + "22", color: FORMALISM_COLOR[sc.formalism] }}
                  >
                    {sc.formalism}
                  </span>
                </div>
                <h4 className="ns-symbolic-name">{sc.name}</h4>
                <p className="ns-symbolic-desc">{sc.description}</p>
                <div className="ns-symbolic-rule">
                  <span className="ns-symbolic-rule-label">Example rule</span>
                  <code className="ns-symbolic-rule-code">{sc.exampleRule}</code>
                </div>
                <div className="ns-symbolic-stats">
                  <div><span>Rules</span><strong>{sc.ruleCount.toLocaleString()}</strong></div>
                  <div><span>Fired/day</span><strong>{sc.firedPerDay.toLocaleString()}</strong></div>
                  <div><span>Pass rate</span><strong>{(sc.passRate * 100).toFixed(1)}%</strong></div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Knowledge Graph Viewer */}
      <section className="ns-section">
        <div className="ns-section-head">
          <h2>Knowledge Graph — 1.4M Triples · 14 Entities Visible</h2>
          <span className="ns-section-sub">
            Click a node to inspect · edges show typed relations · OWL-DL reasoned live
          </span>
        </div>
        <div className="ns-kg-two-col">
          <div className="ns-kg-wrap">
            <svg viewBox={`0 0 ${kgW} ${kgH}`} className="ns-kg-svg">
              {/* Edges */}
              {knowledgeGraphEdges.map((e, i) => {
                const from = kgPositions[e.source];
                const to = kgPositions[e.target];
                if (!from || !to) return null;
                const midX = (from.x + to.x) / 2;
                const midY = (from.y + to.y) / 2;
                const isHighlighted = selectedNode === e.source || selectedNode === e.target;
                return (
                  <g key={i}>
                    <line
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke={isHighlighted ? "#3b82f6" : "#cbd5e1"}
                      strokeWidth={isHighlighted ? 2 : 1}
                    />
                    <text
                      x={midX}
                      y={midY - 4}
                      textAnchor="middle"
                      fontSize="8"
                      fill={isHighlighted ? "#3b82f6" : "#94a3b8"}
                      fontStyle="italic"
                      style={{ pointerEvents: "none" }}
                    >
                      {e.relation.replace(/_/g, " ")}
                    </text>
                  </g>
                );
              })}

              {/* Nodes */}
              {knowledgeGraphNodes.map((n) => {
                const pos = kgPositions[n.nodeId];
                if (!pos) return null;
                const color = NODE_TYPE_COLOR[n.type] ?? "#64748b";
                const isSelected = n.nodeId === selectedNode;
                const isConnected = connectedNodeIds.has(n.nodeId) && !isSelected;
                const r = isSelected ? 26 : 20;
                return (
                  <g
                    key={n.nodeId}
                    onClick={() => setSelectedNode(n.nodeId)}
                    style={{ cursor: "pointer" }}
                  >
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={r}
                      fill={color + (isSelected ? "FF" : isConnected ? "AA" : "66")}
                      stroke={isSelected ? "#1e293b" : color}
                      strokeWidth={isSelected ? 3 : 1.5}
                    />
                    <text
                      x={pos.x}
                      y={pos.y - r - 4}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight={isSelected ? 700 : 500}
                      fill="#1e293b"
                    >
                      {n.label.length > 22 ? n.label.slice(0, 20) + "…" : n.label}
                    </text>
                    <text
                      x={pos.x}
                      y={pos.y + 3}
                      textAnchor="middle"
                      fontSize="9"
                      fill="#ffffff"
                      fontWeight="700"
                    >
                      {n.type.slice(0, 3).toUpperCase()}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="ns-kg-detail">
            {selectedNodeData && (
              <>
                <div className="ns-kg-detail-head">
                  <span
                    className="ns-kg-type-pill"
                    style={{ background: NODE_TYPE_COLOR[selectedNodeData.type] }}
                  >
                    {selectedNodeData.type}
                  </span>
                  <h3>{selectedNodeData.label}</h3>
                </div>
                <div className="ns-kg-properties">
                  <h4>Properties</h4>
                  <div className="ns-kg-prop-list">
                    {selectedNodeData.properties.map((p) => (
                      <div key={p.key} className="ns-kg-prop-row">
                        <span className="ns-kg-prop-key">{p.key}</span>
                        <span className="ns-kg-prop-val">{p.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="ns-kg-relations">
                  <h4>Relations ({connectedEdges.length})</h4>
                  <div className="ns-kg-rel-list">
                    {connectedEdges.map((e, i) => {
                      const other = e.source === selectedNode ? e.target : e.source;
                      const otherNode = knowledgeGraphNodes.find((n) => n.nodeId === other);
                      const direction = e.source === selectedNode ? "→" : "←";
                      return (
                        <button
                          key={i}
                          type="button"
                          className="ns-kg-rel-row"
                          onClick={() => setSelectedNode(other)}
                        >
                          <span className="ns-kg-rel-direction">{direction}</span>
                          <span className="ns-kg-rel-name">{e.relation.replace(/_/g, " ")}</span>
                          <span className="ns-kg-rel-target">{otherNode?.label ?? other}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Hypothesis Verification Log */}
      <section className="ns-section">
        <div className="ns-section-head">
          <h2>Hypothesis Verification Log — Neural Proposes, Symbolic Disposes</h2>
          <div className="ns-verdict-filter">
            {["all", "verified", "rejected", "needs_revision", "partial"].map((v) => (
              <button
                key={v}
                type="button"
                className={`ns-verdict-chip ${verdictFilter === v ? "active" : ""}`}
                onClick={() => setVerdictFilter(v)}
              >
                {v === "all" ? "all" : v.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>
        <div className="ns-hv-list">
          {filteredLog.map((l) => {
            const color = VERDICT_COLOR[l.symbolicVerdict];
            return (
              <div key={l.logId} className="ns-hv-card" style={{ borderLeftColor: color }}>
                <div className="ns-hv-card-head">
                  <span className="ns-hv-ts">{new Date(l.timestamp).toLocaleString()}</span>
                  <span
                    className="ns-hv-verdict"
                    style={{ background: color + "22", color }}
                  >
                    {l.symbolicVerdict.replace(/_/g, " ")}
                  </span>
                  {l.reHypothesisNeeded && (
                    <span className="ns-hv-retry-pill">↻ re-hypothesized</span>
                  )}
                </div>
                <div className="ns-hv-hypothesis">
                  <span className="ns-hv-label">Hypothesis (neural)</span>
                  <span className="ns-hv-text">{l.hypothesis}</span>
                </div>
                <div className="ns-hv-confidence-row">
                  <span className="ns-hv-label">Neural confidence</span>
                  <div className="ns-hv-conf-track">
                    <div
                      className="ns-hv-conf-fill"
                      style={{
                        width: `${l.neuralConfidence * 100}%`,
                        background: l.neuralConfidence >= 0.85 ? "#3b82f6" : "#f59e0b",
                      }}
                    />
                  </div>
                  <span className="ns-hv-conf-val">{(l.neuralConfidence * 100).toFixed(0)}%</span>
                  <span className="ns-hv-conf-delta" style={{ color: l.confidenceDelta >= 0 ? "#10b981" : "#ef4444" }}>
                    {l.confidenceDelta >= 0 ? "+" : ""}{(l.confidenceDelta * 100).toFixed(1)}pp
                  </span>
                </div>
                <div className="ns-hv-symbolic-reason">
                  <span className="ns-hv-label">Symbolic verdict</span>
                  <code className="ns-hv-reason-code">{l.symbolicReason}</code>
                </div>
                <div className="ns-hv-action">
                  <span className="ns-hv-label">Final action</span>
                  <span className="ns-hv-action-val">{l.finalAction}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="ns-section">
        <div className="ns-section-head">
          <h2>Pure Neural vs Pure Symbolic vs Hybrid — Comparative Analysis</h2>
          <span className="ns-section-sub">
            Hybrid dominates on accuracy, explainability, novelty, regulatory compliance, and graceful failure
          </span>
        </div>
        <div className="ns-comparison-table">
          <div className="ns-comparison-head">
            <span>Dimension</span>
            <span>Pure Neural</span>
            <span>Pure Symbolic</span>
            <span className="hybrid-col">Hybrid (this system)</span>
          </div>
          {hybridComparison.map((c) => (
            <div key={c.dimension} className="ns-comparison-row">
              <span className="ns-comp-dim">{c.dimension}</span>
              <span className="ns-comp-cell">{c.pureNeural}</span>
              <span className="ns-comp-cell">{c.pureSymbolic}</span>
              <span className="ns-comp-cell hybrid">{c.hybrid}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default NeuroSymbolicSection;
