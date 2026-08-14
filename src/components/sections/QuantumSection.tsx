"use client";

import { useState, useMemo } from "react";
import { SectionId } from "@/lib/trialgptbot";
import {
  quantumKpis,
  qpuPartners,
  quantumWorkloads,
  quantumAlgorithms,
  quantumAbstractionStack,
  quantumResearchInitiatives,
} from "@/lib/trialgptbot";
import { BackToDashboard } from "./_BackToDashboard";

/**
 * QuantumSection — Quantum Computing Partnerships (Feature #16).
 *
 * Prepares TrialGPTBot for the upcoming disruption quantum computing will
 * bring to optimization-critical clinical-trial workloads: site selection,
 * patient recruitment planning, supply-chain logistics, Bayesian adaptive
 * design. Maintains a provider-agnostic abstraction layer (Qiskit / Cirq /
 * Braket / PennyLane) so backends can be hot-swapped without application
 * code changes. Partners with free-tier offerings from IBM Q, Google
 * Quantum AI, Rigetti, IonQ, Quantinuum, and D-Wave Leap.
 *
 * Tech Readiness: Experimental | Impact: Unknown | Complexity: Very High
 */
interface QuantumSectionProps {
  onNavigate: (id: SectionId) => void;
}

const PARTNER_COLOR: Record<string, string> = {
  "IBM Q": "#1f70c1",
  "Google Q": "#4285F4",
  Rigetti: "#8b5cf6",
  IonQ: "#10b981",
  Quantinuum: "#f59e0b",
  "D-Wave (via Leap)": "#ec4899",
};

const STATUS_COLOR: Record<string, string> = {
  online: "#10b981",
  queued: "#f59e0b",
  maintenance: "#ef4444",
  limited: "#a855f7",
  running: "#3b82f6",
  solved: "#10b981",
  classical_fallback: "#f59e0b",
  failed: "#ef4444",
};

const TOPOLOGY_ICON: Record<string, string> = {
  "heavy-hex": "⬡",
  grid: "▦",
  "trapped-ion": "⬡",
  linear: "─",
  ring: "◯",
};

const FAMILY_COLOR: Record<string, string> = {
  VQA: "#3b82f6",
  annealing: "#ec4899",
  grover: "#10b981",
  HHL: "#f59e0b",
  qml: "#8b5cf6",
  shor: "#ef4444",
};

const LAYER_ROLE_COLOR: Record<string, string> = {
  application: "#3b82f6",
  compiler: "#f59e0b",
  provider: "#8b5cf6",
  hardware: "#10b981",
};

export function QuantumSection({ onNavigate }: QuantumSectionProps) {
  const [workloadFilter, setWorkloadFilter] = useState<string>("all");
  const [selectedPartner, setSelectedPartner] = useState<string>("qpu-ibmq");

  const filteredWorkloads = useMemo(() => {
    if (workloadFilter === "all") return quantumWorkloads;
    return quantumWorkloads.filter((w) => w.domain === workloadFilter);
  }, [workloadFilter]);

  const selectedPartnerData = qpuPartners.find((p) => p.partnerId === selectedPartner) ?? qpuPartners[0];

  // Hybrid pipeline SVG geometry
  const pipeW = 920;
  const pipeH = 220;

  return (
    <div className="qm-page">
      <BackToDashboard
        onNavigate={onNavigate}
        secondary={{ label: "Open AI Lab", target: "calibration" }}
      />

      {/* Hero */}
      <section className="qm-hero">
        <div className="qm-hero-content">
          <div className="qm-hero-title-row">
            <h1>⚛️ Quantum Computing Partnerships</h1>
            <span className="qm-hero-badge">Feature #16 · Experimental · Impact Unknown · Complexity Very High</span>
          </div>
          <p>
            Prepare for potential disruption in optimization-critical workloads
            — site selection, patient recruitment planning, supply-chain
            logistics. Maintain a provider-agnostic abstraction layer allowing
            backend swapping between IBM Q, Google Quantum AI, Rigetti, IonQ,
            Quantinuum, and D-Wave. Leverage free-tier programs aggressively
            to build quantum-ready workloads today without capex commitment.
          </p>
          <div className="qm-hero-meta">
            <span>🛡️ Abstraction Layer v0.3.1-α</span>
            <span>•</span>
            <span>🤝 5 free-tier partners live</span>
            <span>•</span>
            <span>⚡ 8.4× avg speedup on portfolio problems</span>
            <span>•</span>
            <span>🔄 Classical fallback 11.2%</span>
          </div>
        </div>
      </section>

      {/* KPI strip */}
      <section className="qm-kpi-grid">
        {quantumKpis.map((kpi) => (
          <div key={kpi.label} className="qm-kpi-card">
            <div className="qm-kpi-label">{kpi.label}</div>
            <div className="qm-kpi-value-row">
              <span className="qm-kpi-value">{kpi.value}</span>
              {kpi.deltaPct !== undefined && (
                <span
                  className={`qm-kpi-delta ${
                    (kpi.trend === "down" && kpi.deltaPct < 0) || (kpi.trend === "up" && kpi.deltaPct > 0)
                      ? "good"
                      : "bad"
                  }`}
                >
                  {kpi.trend === "up" ? "↑" : kpi.trend === "down" ? "↓" : "→"} {Math.abs(kpi.deltaPct)}%
                </span>
              )}
            </div>
            {kpi.hint && <div className="qm-kpi-hint">{kpi.hint}</div>}
          </div>
        ))}
      </section>

      {/* QPU Partner Grid */}
      <section className="qm-section">
        <div className="qm-section-head">
          <h2>Quantum Hardware Partners</h2>
          <span className="qm-section-sub">
            Free-tier programs · 5 providers · 411 qubits aggregate · click a card to inspect
          </span>
        </div>
        <div className="qm-partner-grid">
          {qpuPartners.map((p) => {
            const isSelected = p.partnerId === selectedPartner;
            return (
              <button
                key={p.partnerId}
                type="button"
                className={`qm-partner-card ${isSelected ? "selected" : ""}`}
                onClick={() => setSelectedPartner(p.partnerId)}
              >
                <div className="qm-partner-card-head">
                  <div className="qm-partner-icon" style={{ background: PARTNER_COLOR[p.shortName] ?? "#3b82f6" }}>
                    {TOPOLOGY_ICON[p.topology]}
                  </div>
                  <div className="qm-partner-name-block">
                    <span className="qm-partner-name">{p.shortName}</span>
                    <span className="qm-partner-full-name">{p.name}</span>
                  </div>
                  <span
                    className="qm-partner-status"
                    style={{ background: STATUS_COLOR[p.status] + "22", color: STATUS_COLOR[p.status] }}
                  >
                    {p.status}
                  </span>
                </div>
                <div className="qm-partner-stats">
                  <div className="qm-partner-stat">
                    <span className="qm-partner-stat-label">Qubits</span>
                    <span className="qm-partner-stat-value">{p.qubits}</span>
                  </div>
                  <div className="qm-partner-stat">
                    <span className="qm-partner-stat-label">Fidelity</span>
                    <span className="qm-partner-stat-value">{p.gateFidelity.toFixed(2)}%</span>
                  </div>
                  <div className="qm-partner-stat">
                    <span className="qm-partner-stat-label">Jobs/mo</span>
                    <span className="qm-partner-stat-value">{p.monthlyJobsRun}</span>
                  </div>
                </div>
                <div className="qm-partner-quota">
                  <span className="qm-partner-quota-label">Free tier</span>
                  <span className="qm-partner-quota-val">{p.freeTierQuota}</span>
                </div>
                <div className="qm-partner-util-row">
                  <span className="qm-partner-util-label">Utilization</span>
                  <div className="qm-partner-util-track">
                    <div
                      className="qm-partner-util-fill"
                      style={{ width: `${p.utilizationPct}%`, background: PARTNER_COLOR[p.shortName] ?? "#3b82f6" }}
                    />
                  </div>
                  <span className="qm-partner-util-val">{p.utilizationPct}%</span>
                </div>
                <div className="qm-partner-sdk">
                  <span className="qm-partner-sdk-label">SDK</span>
                  <code>{p.sdk}</code>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected partner detail */}
        <div className="qm-partner-detail">
          <div className="qm-partner-detail-head">
            <h3>{selectedPartnerData.name} — Detail</h3>
            <a
              href={selectedPartnerData.providerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="qm-partner-detail-link"
            >
              Visit provider →
            </a>
          </div>
          <div className="qm-partner-detail-grid">
            <div className="qm-partner-detail-cell">
              <span className="qm-detail-label">Topology</span>
              <span className="qm-detail-value">{selectedPartnerData.topology}</span>
            </div>
            <div className="qm-partner-detail-cell">
              <span className="qm-detail-label">Two-qubit fidelity</span>
              <span className="qm-detail-value">{selectedPartnerData.gateFidelity.toFixed(2)}%</span>
            </div>
            <div className="qm-partner-detail-cell">
              <span className="qm-detail-label">Avg queue wait</span>
              <span className="qm-detail-value">{selectedPartnerData.avgQueueWaitSec}s</span>
            </div>
            <div className="qm-partner-detail-cell">
              <span className="qm-detail-label">Free credits / mo</span>
              <span className="qm-detail-value">${selectedPartnerData.freeTierMonthlyCredits}</span>
            </div>
            <div className="qm-partner-detail-cell wide">
              <span className="qm-detail-label">Notes</span>
              <span className="qm-detail-value">{selectedPartnerData.notes}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Optimization Workloads */}
      <section className="qm-section">
        <div className="qm-section-head">
          <h2>Optimization-Critical Workloads</h2>
          <div className="qm-workload-filter">
            {["all", "site_selection", "patient_recruitment", "supply_chain", "bayesian_design", "portfolio_optimization"].map(
              (d) => (
                <button
                  key={d}
                  type="button"
                  className={`qm-workload-chip ${workloadFilter === d ? "active" : ""}`}
                  onClick={() => setWorkloadFilter(d)}
                >
                  {d === "all" ? "all" : d.replace(/_/g, " ")}
                </button>
              ),
            )}
          </div>
        </div>
        <div className="qm-workload-table">
          <div className="qm-workload-head">
            <span>Workload</span>
            <span>Domain</span>
            <span>Algorithm</span>
            <span>Classical → Quantum</span>
            <span>Speedup</span>
            <span>Quality</span>
            <span>Partner</span>
            <span>Status</span>
          </div>
          {filteredWorkloads.map((w) => (
            <div key={w.workloadId} className="qm-workload-row">
              <div className="qm-workload-name-cell">
                <span className="qm-workload-name">{w.name}</span>
                <span className="qm-workload-desc">{w.description}</span>
                <div className="qm-workload-meta">
                  <span>📦 {w.qubitsUsed} qubits</span>
                  <span>·</span>
                  <span>🧮 {w.classicalSolver}</span>
                  <span>·</span>
                  <span>{w.iterativeImprovement ? "🔄 iterative" : "⏱ one-shot"}</span>
                </div>
              </div>
              <span className="qm-workload-domain">{w.domain.replace(/_/g, " ")}</span>
              <span>
                <code className="qm-workload-algo">{w.problemType}</code>
              </span>
              <span className="qm-workload-time-cell">
                <span className="qm-workload-time-classical">{w.classicalBestSec}s</span>
                <span className="qm-workload-time-arrow">→</span>
                <span className="qm-workload-time-quantum">{w.quantumBestSec}s</span>
              </span>
              <span className={`qm-workload-speedup ${w.speedup >= 1 ? "good" : "bad"}`}>
                {w.speedup.toFixed(2)}×
              </span>
              <span className="qm-workload-quality-cell">
                <div className="qm-workload-quality-track">
                  <div
                    className="qm-workload-quality-fill"
                    style={{
                      width: `${w.solutionQuality}%`,
                      background: w.solutionQuality >= 90 ? "#10b981" : w.solutionQuality >= 80 ? "#f59e0b" : "#ef4444",
                    }}
                  />
                </div>
                <span className="qm-workload-quality-val">{w.solutionQuality.toFixed(1)}%</span>
              </span>
              <span>
                <span className="qm-workload-partner-pill" style={{ background: PARTNER_COLOR[w.partner] ?? "#3b82f6" }}>
                  {w.partner}
                </span>
              </span>
              <span>
                <span
                  className="qm-workload-status-pill"
                  style={{ background: STATUS_COLOR[w.status] + "22", color: STATUS_COLOR[w.status] }}
                >
                  {w.status.replace(/_/g, " ")}
                </span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Quantum-Classical Hybrid Pipeline */}
      <section className="qm-section">
        <div className="qm-section-head">
          <h2>Quantum-Classical Hybrid Pipeline</h2>
          <span className="qm-section-sub">
            Application API → Problem Compiler → Provider SDK Adapter → QPU Backend; classical fallback at every layer
          </span>
        </div>
        <div className="qm-pipeline-wrap">
          <svg viewBox={`0 0 ${pipeW} ${pipeH}`} className="qm-pipeline-svg">
            {/* Layer blocks */}
            {quantumAbstractionStack.map((layer, i) => {
              const blockW = 180;
              const blockH = 80;
              const x = 30 + i * (blockW + 30);
              const y = 70;
              const color = LAYER_ROLE_COLOR[layer.layerRole];
              return (
                <g key={layer.layerName}>
                  <rect
                    x={x}
                    y={y}
                    width={blockW}
                    height={blockH}
                    rx={10}
                    fill={color + "22"}
                    stroke={color}
                    strokeWidth={2}
                  />
                  <text x={x + blockW / 2} y={y + 22} textAnchor="middle" fontSize="11" fontWeight="700" fill={color}>
                    {layer.layerRole.toUpperCase()}
                  </text>
                  <text x={x + blockW / 2} y={y + 42} textAnchor="middle" fontSize="13" fontWeight="600" fill="#1e293b">
                    {layer.layerName}
                  </text>
                  <text x={x + blockW / 2} y={y + 60} textAnchor="middle" fontSize="10" fill="#64748b">
                    {layer.currentBackend}
                  </text>
                  {/* Arrow */}
                  {i < quantumAbstractionStack.length - 1 && (
                    <g>
                      <line
                        x1={x + blockW}
                        y1={y + blockH / 2}
                        x2={x + blockW + 30}
                        y2={y + blockH / 2}
                        stroke="#94a3b8"
                        strokeWidth={2}
                        markerEnd="url(#qm-arrow)"
                      />
                      <text
                        x={x + blockW + 15}
                        y={y + blockH / 2 - 8}
                        textAnchor="middle"
                        fontSize="9"
                        fill="#94a3b8"
                        fontStyle="italic"
                      >
                        {layer.hotSwappable ? "hot-swap" : "fixed"}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Fallback indicator */}
            <g>
              <text x={pipeW / 2} y={pipeH - 32} textAnchor="middle" fontSize="11" fill="#f59e0b" fontWeight="600">
                ⚠ Classical fallback at every layer — {quantumAbstractionStack[3].fallbackSec}s worst-case RTO if all QPUs unavailable
              </text>
            </g>

            <defs>
              <marker id="qm-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L9,3 z" fill="#94a3b8" />
              </marker>
            </defs>
          </svg>
        </div>

        <div className="qm-abstraction-list">
          {quantumAbstractionStack.map((layer) => (
            <div key={layer.layerName} className="qm-abstraction-row">
              <span className="qm-abstraction-role-pill" style={{ background: LAYER_ROLE_COLOR[layer.layerRole] }}>
                {layer.layerRole}
              </span>
              <div className="qm-abstraction-name-block">
                <span className="qm-abstraction-name">{layer.layerName}</span>
                <span className="qm-abstraction-desc">{layer.description}</span>
              </div>
              <div className="qm-abstraction-providers">
                {layer.providers.map((p) => (
                  <code key={p}>{p}</code>
                ))}
              </div>
              <span className="qm-abstraction-current">
                Current: <strong>{layer.currentBackend}</strong>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Algorithm Library */}
      <section className="qm-section">
        <div className="qm-section-head">
          <h2>Quantum Algorithm Library</h2>
          <span className="qm-section-sub">
            Curated set of algorithms mapped to clinical-trial problem classes · complexity & maturity noted
          </span>
        </div>
        <div className="qm-algo-grid">
          {quantumAlgorithms.map((a) => (
            <div key={a.algoId} className="qm-algo-card">
              <div className="qm-algo-card-head">
                <span className="qm-algo-swatch" style={{ background: FAMILY_COLOR[a.family] }} />
                <span className="qm-algo-name">{a.name}</span>
                <span className={`qm-algo-maturity ${a.maturity}`}>{a.maturity}</span>
              </div>
              <div className="qm-algo-meta">
                <div><span>Family</span><strong>{a.family}</strong></div>
                <div><span>Complexity</span><strong>{a.complexity}</strong></div>
                <div><span>Problem class</span><strong>{a.problemClass}</strong></div>
              </div>
              <div className="qm-algo-best-for">
                <span className="qm-algo-best-for-label">Best for</span>
                <span className="qm-algo-best-for-val">{a.bestFor}</span>
              </div>
              <p className="qm-algo-desc">{a.description}</p>
              <div className="qm-algo-available">
                <span className="qm-algo-available-label">Available on</span>
                <div className="qm-algo-available-list">
                  {a.availableOn.map((p) => (
                    <span key={p} className="qm-algo-available-pill" style={{ background: PARTNER_COLOR[p] ?? "#3b82f6" }}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Free-tier research initiatives */}
      <section className="qm-section">
        <div className="qm-section-head">
          <h2>Free-Tier Research Initiatives</h2>
          <span className="qm-section-sub">
            Aggressive leverage of free cloud-quantum programs · 0$ capex committed · 5 partnerships active
          </span>
        </div>
        <div className="qm-ri-table">
          <div className="qm-ri-head">
            <span>Partner</span>
            <span>Program</span>
            <span>Free-tier offering</span>
            <span>Monthly quota</span>
            <span>Utilization</span>
            <span>Status</span>
            <span>Action</span>
          </div>
          {quantumResearchInitiatives.map((r) => (
            <div key={r.initiativeId} className="qm-ri-row">
              <span className="qm-ri-partner">{r.partnerName}</span>
              <span className="qm-ri-program">{r.programName}</span>
              <span className="qm-ri-offering">{r.freeTierOffering}</span>
              <span className="qm-ri-quota">{r.monthlyQuota}</span>
              <span className="qm-ri-util-cell">
                <div className="qm-ri-util-track">
                  <div
                    className="qm-ri-util-fill"
                    style={{
                      width: `${r.currentUtilizationPct}%`,
                      background: r.currentUtilizationPct >= 70 ? "#10b981" : r.currentUtilizationPct >= 40 ? "#f59e0b" : "#94a3b8",
                    }}
                  />
                </div>
                <span>{r.currentUtilizationPct}%</span>
              </span>
              <span>
                <span className={`qm-ri-status ${r.enrollmentStatus}`}>{r.enrollmentStatus}</span>
              </span>
              <span>
                <a
                  href={r.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="qm-ri-link"
                >
                  {r.enrollmentStatus === "active" ? "Open console →" : r.enrollmentStatus === "waitlist" ? "Join waitlist →" : "Apply →"}
                </a>
              </span>
            </div>
          ))}
        </div>
        <div className="qm-ri-footnote">
          <span className="qm-ri-footnote-icon">💡</span>
          <span>
            Strategy: subscribe to <strong>all five</strong> free tiers concurrently. Distribute workloads by
            partner strength — IBM Q for QAOA (heavy-hex topology), Google Q for VQE research, Rigetti for
            annealing-style problems, IonQ for dense-graph QUBO, Quantinuum for highest-fidelity
            shallow circuits. Monthly aggregate cost: <strong>$0</strong>.
          </span>
        </div>
      </section>
    </div>
  );
}

export default QuantumSection;
