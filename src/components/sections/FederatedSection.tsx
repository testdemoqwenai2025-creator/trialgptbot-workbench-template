"use client";

import { useState, useMemo } from "react";
import { SectionId } from "@/lib/trialgptbot";
import {
  federatedKpis,
  federatedNodes,
  federatedRounds,
  federatedUpliftByTa,
  federatedProtocols,
} from "@/lib/trialgptbot";
import { BackToDashboard } from "./_BackToDashboard";
import { useLiveTick, formatSeconds } from "@/hooks/use-live-tick";

/**
 * FederatedSection — Federated Learning Prototype (Feature #12).
 *
 * Cross-trial model improvement WITHOUT exposing proprietary subject data.
 * Each TrialGPTBot instance contributes encrypted gradients (CKKS / BGV) to a
 * global model; raw subject data never leaves the sponsor's on-prem cluster.
 *
 * Surfaces:
 *   • KPI strip (nodes, samples, model version, uplift, encryption, SLA)
 *   • Consortium network map (8 nodes by org type + therapeutic area)
 *   • Active round progress + last 6 rounds history
 *   • Uplift-by-therapeutic-area chart (baseline AUC → current AUC)
 *   • Federated protocol library (FedAvg, FedProx, SCAFFOLD, DP-FedAvg)
 *
 * Tech Readiness: Production Ready | Impact: Transformative | Complexity: Medium
 */
interface FederatedSectionProps {
  onNavigate: (id: SectionId) => void;
}

const ORG_TYPE_COLOR: Record<string, string> = {
  pharma: "#3b82f6",
  academic: "#10b981",
  cro: "#f59e0b",
  regulator: "#8b5cf6",
};

const NODE_STATUS_COLOR: Record<string, string> = {
  online: "#10b981",
  training: "#3b82f6",
  aggregating: "#f59e0b",
  offline: "#ef4444",
};

const TREND_ARROW: Record<string, string> = { up: "↑", down: "↓", flat: "→" };

export function FederatedSection({ onNavigate }: FederatedSectionProps) {
  const latestRound = federatedRounds[0];
  const secs = useLiveTick(latestRound.startedAt);

  const [orgFilter, setOrgFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredNodes = useMemo(() => {
    return federatedNodes.filter((n) => {
      if (orgFilter !== "all" && n.orgType !== orgFilter) return false;
      if (statusFilter !== "all" && n.status !== statusFilter) return false;
      return true;
    });
  }, [orgFilter, statusFilter]);

  const totalSamplesShared = federatedRounds
    .filter((r) => r.status === "completed")
    .reduce((sum, r) => sum + r.totalSamples, 0);

  const totalContributed = federatedNodes.reduce((s, n) => s + n.samplesContributed, 0);

  // Uplift-by-TA bar chart geometry
  const W = 720;
  const H = 320;
  const PAD_L = 200;
  const PAD_R = 80;
  const PAD_T = 24;
  const PAD_B = 40;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;
  const rowH = plotH / federatedUpliftByTa.length;
  const maxAuc = 1.0;
  const xScale = (v: number) => PAD_L + (v / maxAuc) * plotW;

  return (
    <div className="fed-page">
      <BackToDashboard
        onNavigate={onNavigate}
        secondary={{ label: "Open Privacy ML", target: "privacy-ml" }}
      />

      {/* Hero */}
      <section className="fed-hero">
        <div className="fed-hero-content">
          <div className="fed-hero-title-row">
            <h1>🌐 Federated Learning Prototype</h1>
            <span className="fed-hero-badge">Feature #12 · Production Ready · Impact Transformative</span>
          </div>
          <p>
            Enable cross-trial model improvement without exposing proprietary
            data. Each TrialGPTBot instance contributes CKKS-encrypted gradient
            updates to a global model hosted by the consortium; raw subject data
            stays on-prem at each sponsor. Pharmaceutical companies running
            oncology trials contribute patterns that enhance cardiovascular
            studies — a network effect where every deployment benefits from
            collective experience.
          </p>
          <div className="fed-hero-meta">
            <span>🔐 CKKS-128 homomorphic encryption</span>
            <span>•</span>
            <span>🔄 Round 47 in progress (started {formatSeconds(secs)} ago)</span>
            <span>•</span>
            <span>📊 {(totalSamplesShared / 1000).toFixed(0)}k cumulative samples</span>
          </div>
        </div>
      </section>

      {/* KPI strip */}
      <section className="fed-kpi-grid">
        {federatedKpis.map((kpi) => {
          const displayValue =
            kpi.label === "Cumulative samples shared"
              ? totalSamplesShared.toLocaleString()
              : kpi.value;
          return (
            <div key={kpi.label} className="fed-kpi-card">
              <div className="fed-kpi-label">{kpi.label}</div>
              <div className="fed-kpi-value">{displayValue}</div>
              {kpi.hint && <div className="fed-kpi-hint">{kpi.hint}</div>}
              {kpi.deltaPct !== undefined && (
                <div className={`fed-kpi-delta ${kpi.trend === "up" ? "good" : ""}`}>
                  {TREND_ARROW[kpi.trend ?? "flat"]} {Math.abs(kpi.deltaPct)}%
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* Active round progress */}
      <section className="fed-section">
        <div className="fed-section-head">
          <h2>Active Round #{latestRound.roundId}</h2>
          <span className="fed-section-sub">
            {latestRound.notes}
          </span>
        </div>
        <div className="fed-active-round">
          <div className="fed-active-round-stats">
            <div className="fed-stat">
              <span className="fed-stat-label">Status</span>
              <span className={`fed-stat-val fed-status-pill ${latestRound.status}`}>
                {latestRound.status}
              </span>
            </div>
            <div className="fed-stat">
              <span className="fed-stat-label">Nodes participating</span>
              <span className="fed-stat-val">
                {latestRound.nodesParticipating} / {federatedNodes.length}
              </span>
            </div>
            <div className="fed-stat">
              <span className="fed-stat-label">Total samples (round)</span>
              <span className="fed-stat-val">{latestRound.totalSamples.toLocaleString()}</span>
            </div>
            <div className="fed-stat">
              <span className="fed-stat-label">Avg gradient norm</span>
              <span className="fed-stat-val">{latestRound.avgGradientNorm.toFixed(4)}</span>
            </div>
            <div className="fed-stat">
              <span className="fed-stat-label">Global model version</span>
              <span className="fed-stat-val"><code>{latestRound.globalModelVersion}</code></span>
            </div>
            <div className="fed-stat">
              <span className="fed-stat-label">Started</span>
              <span className="fed-stat-val">{formatSeconds(secs)} ago</span>
            </div>
          </div>
          <div className="fed-active-round-progress">
            <div className="fed-progress-label">
              <span>Round progress (estimated)</span>
              <span>62%</span>
            </div>
            <div className="fed-progress-track">
              <div className="fed-progress-fill" style={{ width: "62%" }} />
            </div>
            <div className="fed-progress-steps">
              <span className="done">✓ Local training</span>
              <span className="done">✓ Gradient encryption</span>
              <span className="active">→ Secure aggregation</span>
              <span className="pending">○ Distribution</span>
              <span className="pending">○ Validation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Consortium nodes */}
      <section className="fed-section">
        <div className="fed-section-head">
          <h2>Consortium Nodes</h2>
          <div className="fed-filter-row">
            <div className="fed-filter-group">
              <span className="fed-filter-label">Org type:</span>
              {["all", "pharma", "academic", "cro", "regulator"].map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`fed-filter-chip ${orgFilter === t ? "active" : ""}`}
                  onClick={() => setOrgFilter(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="fed-filter-group">
              <span className="fed-filter-label">Status:</span>
              {["all", "online", "training", "aggregating", "offline"].map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`fed-filter-chip ${statusFilter === t ? "active" : ""}`}
                  onClick={() => setStatusFilter(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="fed-node-grid">
          {filteredNodes.map((n) => (
            <div key={n.nodeId} className="fed-node-card">
              <div className="fed-node-head">
                <span
                  className="fed-node-status-dot"
                  style={{ background: NODE_STATUS_COLOR[n.status] }}
                  aria-hidden="true"
                />
                <span className="fed-node-id"><code>{n.nodeId}</code></span>
                <span
                  className="fed-node-type-pill"
                  style={{ background: `${ORG_TYPE_COLOR[n.orgType]}22`, color: ORG_TYPE_COLOR[n.orgType] }}
                >
                  {n.orgType}
                </span>
              </div>
              <div className="fed-node-org">{n.org}</div>
              <div className="fed-node-ta">{n.therapeuticArea}</div>
              <div className="fed-node-stats">
                <div>
                  <span className="fed-node-stat-label">Trials</span>
                  <span className="fed-node-stat-val">{n.trialsContributing}</span>
                </div>
                <div>
                  <span className="fed-node-stat-label">Samples</span>
                  <span className="fed-node-stat-val">{n.samplesContributed.toLocaleString()}</span>
                </div>
                <div>
                  <span className="fed-node-stat-label">Bandwidth</span>
                  <span className="fed-node-stat-val">{n.bandwidthMbps} Mbps</span>
                </div>
              </div>
              <div className="fed-node-encryption">
                <span className="fed-node-enc-label">Encryption:</span>
                <code>{n.encryptionScheme}</code>
              </div>
              <div className="fed-node-last">
                Last round: {new Date(n.lastRoundAt).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Uplift by therapeutic area */}
      <section className="fed-section">
        <div className="fed-section-head">
          <h2>Model Uplift by Therapeutic Area</h2>
          <span className="fed-section-sub">
            Baseline AUC (single-org training) vs current AUC after 47 federated rounds
          </span>
        </div>
        <div className="fed-uplift-chart-wrap">
          <svg viewBox={`0 0 ${W} ${H}`} className="fed-uplift-svg">
            {/* Axis */}
            <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={H - PAD_B} stroke="#94a3b8" strokeWidth="1.5" />
            <line x1={PAD_L} y1={H - PAD_B} x2={W - PAD_R} y2={H - PAD_B} stroke="#94a3b8" strokeWidth="1.5" />
            {/* Gridlines */}
            {[0.85, 0.90, 0.95, 1.0].map((v) => (
              <g key={v}>
                <line
                  x1={PAD_L}
                  y1={PAD_T + (1 - (v - 0.85) / 0.15) * plotH}
                  x2={W - PAD_R}
                  y2={PAD_T + (1 - (v - 0.85) / 0.15) * plotH}
                  stroke="#e2e8f0"
                  strokeDasharray="3 3"
                />
                <text
                  x={PAD_L - 8}
                  y={PAD_T + (1 - (v - 0.85) / 0.15) * plotH + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#64748b"
                >
                  {v.toFixed(2)}
                </text>
              </g>
            ))}
            {/* Bars */}
            {federatedUpliftByTa.map((ta, i) => {
              const yCenter = PAD_T + i * rowH + rowH / 2;
              const yBaseline = yCenter - 14;
              const yCurrent = yCenter + 4;
              const baselineW = (ta.baselineAuc - 0.85) / 0.15 * plotW;
              const currentW = (ta.currentAuc - 0.85) / 0.15 * plotW;
              return (
                <g key={ta.therapeuticArea}>
                  <text x={PAD_L - 12} y={yCenter + 4} textAnchor="end" fontSize="11" fill="#475569" fontWeight="600">
                    {ta.therapeuticArea}
                  </text>
                  <text x={PAD_L - 12} y={yCenter + 16} textAnchor="end" fontSize="9" fill="#94a3b8">
                    {ta.consortium}
                  </text>
                  {/* Baseline bar */}
                  <rect x={PAD_L} y={yBaseline} width={baselineW} height={10} fill="#94a3b8" rx="2" />
                  <text x={PAD_L + baselineW + 4} y={yBaseline + 9} fontSize="10" fill="#64748b">
                    {ta.baselineAuc.toFixed(3)}
                  </text>
                  {/* Current bar */}
                  <rect x={PAD_L} y={yCurrent} width={currentW} height={10} fill="#10b981" rx="2" />
                  <text x={PAD_L + currentW + 4} y={yCurrent + 9} fontSize="10" fill="#10b981" fontWeight="700">
                    {ta.currentAuc.toFixed(3)} (+{ta.upliftPct.toFixed(1)}%)
                  </text>
                </g>
              );
            })}
            <text x={W / 2} y={H - 4} textAnchor="middle" fontSize="11" fill="#475569" fontWeight="600">
              AUC (area under ROC)
            </text>
          </svg>
        </div>
      </section>

      {/* Round history + protocols */}
      <section className="fed-section fed-two-col">
        <div className="fed-half">
          <div className="fed-section-head">
            <h2>Recent Rounds</h2>
            <span className="fed-section-sub">Last 6 federated rounds</span>
          </div>
          <div className="fed-rounds-list">
            {federatedRounds.map((r) => (
              <div key={r.roundId} className={`fed-round-row ${r.status}`}>
                <div className="fed-round-row-head">
                  <span className="fed-round-id">Round #{r.roundId}</span>
                  <span className={`fed-status-pill ${r.status}`}>{r.status}</span>
                </div>
                <div className="fed-round-meta">
                  <span>{new Date(r.startedAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{r.nodesParticipating} nodes</span>
                  <span>•</span>
                  <span>{r.totalSamples.toLocaleString()} samples</span>
                  {r.upliftPctVsBaseline > 0 && (
                    <>
                      <span>•</span>
                      <span className="fed-uplift-tag">+{r.upliftPctVsBaseline.toFixed(1)}% uplift</span>
                    </>
                  )}
                </div>
                <div className="fed-round-notes">{r.notes}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="fed-half">
          <div className="fed-section-head">
            <h2>Federated Protocols</h2>
            <span className="fed-section-sub">Approved + experimental algorithms</span>
          </div>
          <div className="fed-protocol-list">
            {federatedProtocols.map((p) => (
              <div key={p.protocolId} className={`fed-protocol-card ${p.approved ? "approved" : "experimental"}`}>
                <div className="fed-protocol-head">
                  <span className="fed-protocol-name">{p.name}</span>
                  <span className={`fed-protocol-pill ${p.approved ? "approved" : "experimental"}`}>
                    {p.approved ? "approved" : "experimental"}
                  </span>
                </div>
                <div className="fed-protocol-desc">{p.description}</div>
                <div className="fed-protocol-meta">
                  <span>{p.roundsCompleted} rounds completed</span>
                  <span>•</span>
                  <span><code>{p.protocolId}</code></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="fed-section fed-footer-card">
        <div className="fed-footer-stats">
          <div>
            <span className="fed-footer-label">Total contributed samples</span>
            <span className="fed-footer-val">{totalContributed.toLocaleString()}</span>
          </div>
          <div>
            <span className="fed-footer-label">Total rounds completed</span>
            <span className="fed-footer-val">
              {federatedRounds.filter((r) => r.status === "completed").length}
            </span>
          </div>
          <div>
            <span className="fed-footer-label">Avg uplift across all TAs</span>
            <span className="fed-footer-val">
              +{(
                federatedUpliftByTa.reduce((s, t) => s + t.upliftPct, 0) / federatedUpliftByTa.length
              ).toFixed(1)}
              %
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default FederatedSection;
