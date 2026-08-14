"use client";

import { useState } from "react";
import { SectionId } from "@/lib/trialgptbot";
import {
  privacyPostureKpis,
  differentialPrivacyConfig,
  privacyBudgetUsage,
  smpcSessions,
  consortiumAccessMatrix,
  privacyAuditFeed,
  type SmpcSession,
  type PrivacyAuditEvent,
  type PrivacyPostureKpi,
} from "@/lib/trialgptbot";

/**
 * Privacy-Preserving ML — Feature #8
 *
 *   • Differential Privacy — calibrated noise, epsilon budget tracking
 *   • Secure Multi-Party Computation — joint training across competing
 *     pharma consortia with zero raw-data exposure
 *   • Cross-organizational access matrix
 *   • Live privacy audit feed (every query, every epsilon spend)
 *
 * Production Ready | Impact: Transformative | Complexity: High
 */
interface PrivacyMLSectionProps {
  onNavigate: (id: SectionId) => void;
}

export function PrivacyMLSection({ onNavigate }: PrivacyMLSectionProps) {
  const [activeSession, setActiveSession] = useState<SmpcSession>(smpcSessions[0]);

  return (
    <div className="pm-page">
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
      <section className="pm-hero">
        <div className="pm-hero-content">
          <h1>🔐 Privacy-Preserving ML</h1>
          <p>
            Mathematical privacy guarantees for clinical AI. Every query against
            patient-level data is bounded by a differential-privacy budget, every
            cross-organizational computation runs through secure multi-party
            protocols (SPDZ / BGW / GMW / Falcon), and every event is written
            to a tamper-evident audit chain. Population-level insights flow;
            individual records never move.
          </p>
          <div className="pm-hero-toolbar">
            <span className="pm-toolbar-pill">
              <span className="dot" /> DP engine: Opacus + TF-Privacy
            </span>
            <span className="pm-toolbar-pill">SMPC: MP-SPDZ 2.4</span>
            <span className="pm-toolbar-pill">Federated: Flower + DP-FedAvg</span>
            <span className="pm-toolbar-pill">Audit: SHA-256 hash chain</span>
          </div>
        </div>
      </section>

      {/* KPI grid */}
      <section>
        <div className="pm-kpi-grid">
          {privacyPostureKpis.map((kpi) => (
            <PmKpiCard key={kpi.label} kpi={kpi} />
          ))}
        </div>
      </section>

      {/* Differential Privacy + Budget tracker */}
      <div className="pm-grid-2">
        <section className="pm-section">
          <div className="pm-section-header">
            <div>
              <h2 className="pm-section-title">🎲 Differential Privacy</h2>
              <p className="pm-section-subtitle">
                Gaussian mechanism — calibrated noise added to every released
                computation
              </p>
            </div>
            <span className="pm-pill pm-pill-info">NIST SP 800-188</span>
          </div>

          <div className="pm-dp-grid">
            <DPStat label="Mechanism" value={differentialPrivacyConfig.mechanism} />
            <DPStat label="ε (epsilon)" value={differentialPrivacyConfig.epsilon.toFixed(2)} />
            <DPStat label="δ (delta)" value={differentialPrivacyConfig.delta.toExponential(0)} />
            <DPStat label="Sensitivity" value={differentialPrivacyConfig.sensitivity.toFixed(1)} />
            <DPStat
              label="Noise σ"
              value={differentialPrivacyConfig.noiseStdDev.toFixed(2)}
            />
            <DPStat label="Composition" value={differentialPrivacyConfig.composition} />
          </div>

          <div className="pm-budget-bar-wrap">
            <div className="pm-budget-bar-header">
              <span>Quarterly ε budget — consumed vs. allocated</span>
              <span className="pm-budget-bar-numbers">
                <strong>{differentialPrivacyConfig.consumedBudget.toFixed(2)}</strong>
                {" / "}
                {differentialPrivacyConfig.allocatedBudget.toFixed(2)}
                {"  ·  "}
                <span className="pm-budget-remaining">
                  {differentialPrivacyConfig.remainingBudget.toFixed(2)} remaining
                </span>
              </span>
            </div>
            <div className="pm-budget-bar">
              <div
                className="pm-budget-bar-fill"
                style={{
                  width: `${(differentialPrivacyConfig.consumedBudget / differentialPrivacyConfig.allocatedBudget) * 100}%`,
                }}
              />
              <div
                className="pm-budget-bar-tick"
                style={{
                  left: `${(differentialPrivacyConfig.consumedBudget / differentialPrivacyConfig.allocatedBudget) * 100}%`,
                }}
                title="Current consumption"
              />
            </div>
            <div className="pm-budget-bar-legend">
              <span className="pm-legend-item">
                <span className="pm-legend-swatch pm-sw-fill" /> Consumed
              </span>
              <span className="pm-legend-item">
                <span className="pm-legend-swatch pm-sw-remaining" /> Remaining
              </span>
              <span className="pm-legend-item">
                <span className="pm-legend-swatch pm-sw-tick" /> Today
              </span>
            </div>
          </div>
        </section>

        <section className="pm-section">
          <div className="pm-section-header">
            <div>
              <h2 className="pm-section-title">📊 Per-dataset budget usage</h2>
              <p className="pm-section-subtitle">
                Each dataset has its own ε allocation — depleted datasets are
                automatically throttled.
              </p>
            </div>
          </div>

          <div className="pm-budget-table">
            <div className="pm-budget-row pm-budget-row-head">
              <span>Dataset</span>
              <span>ε used / alloc</span>
              <span>Queries</span>
              <span>Status</span>
            </div>
            {privacyBudgetUsage.map((row) => {
              const pct = (row.consumedEpsilon / row.allocatedEpsilon) * 100;
              return (
                <div key={row.dataset} className="pm-budget-row pm-budget-row-data">
                  <div className="pm-budget-cell-main">
                    <span className="pm-budget-dataset">{row.dataset}</span>
                    <span className="pm-budget-owner">{row.owner}</span>
                  </div>
                  <div className="pm-budget-cell-bar">
                    <div className="pm-budget-mini-bar">
                      <div
                        className={`pm-budget-mini-fill pm-budget-mini-fill-${row.status}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="pm-budget-mini-num">
                      {row.consumedEpsilon.toFixed(2)} / {row.allocatedEpsilon.toFixed(2)}
                    </span>
                  </div>
                  <span className="pm-budget-queries">{row.queries}</span>
                  <span
                    className={`pm-budget-status pm-budget-status-${row.status}`}
                  >
                    {row.status}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* SMPC sessions */}
      <section className="pm-section">
        <div className="pm-section-header">
          <div>
            <h2 className="pm-section-title">🤝 Secure Multi-Party Computation</h2>
            <p className="pm-section-subtitle">
              Joint computation across competing pharma companies without data
              exposure. Each party contributes encrypted shards; only the
              aggregated result is revealed.
            </p>
          </div>
          <span className="pm-pill pm-pill-good">
            {smpcSessions.filter((s) => s.status !== "completed" && s.status !== "failed").length} active sessions
          </span>
        </div>

        <div className="pm-smpc-layout">
          {/* Session list */}
          <div className="pm-smpc-list">
            {smpcSessions.map((s) => {
              const isActive = s.id === activeSession.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  className={`pm-smpc-row ${isActive ? "pm-smpc-row-active" : ""}`}
                  onClick={() => setActiveSession(s)}
                >
                  <div className="pm-smpc-row-head">
                    <span className={`pm-smpc-protocol pm-smpc-protocol-${s.protocol.toLowerCase()}`}>
                      {s.protocol}
                    </span>
                    <span className="pm-smpc-id">{s.id}</span>
                  </div>
                  <div className="pm-smpc-consortium">{s.consortium}</div>
                  <div className="pm-smpc-computation">{s.computation}</div>
                  <div className="pm-smpc-progress">
                    <div
                      className={`pm-smpc-progress-fill pm-smpc-progress-fill-${s.status}`}
                      style={{ width: `${s.progressPct}%` }}
                    />
                  </div>
                  <div className="pm-smpc-meta">
                    <span className={`pm-smpc-status pm-smpc-status-${s.status}`}>
                      {s.status.replace("_", " ")}
                    </span>
                    <span className="pm-smpc-started">{s.startedAt}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Session detail */}
          <div className="pm-smpc-detail">
            <div className="pm-smpc-detail-head">
              <div>
                <div className="pm-smpc-detail-id">{activeSession.id}</div>
                <h3 className="pm-smpc-detail-title">{activeSession.consortium}</h3>
                <p className="pm-smpc-detail-computation">{activeSession.computation}</p>
              </div>
              <span className={`pm-smpc-status pm-smpc-status-${activeSession.status} pm-smpc-status-lg`}>
                {activeSession.status.replace("_", " ")}
              </span>
            </div>

            <div className="pm-smpc-detail-stats">
              <DetailStat label="Protocol" value={activeSession.protocol} />
              <DetailStat label="Parties" value={String(activeSession.parties.length)} />
              <DetailStat label="Started" value={activeSession.startedAt} />
              <DetailStat label="Progress" value={`${activeSession.progressPct}%`} />
              {activeSession.jointAccuracyPct !== undefined && (
                <DetailStat
                  label="Joint accuracy"
                  value={`${activeSession.jointAccuracyPct.toFixed(1)}%`}
                />
              )}
              {activeSession.outputHash && (
                <DetailStat label="Output hash" value={activeSession.outputHash} mono />
              )}
            </div>

            <h4 className="pm-smpc-detail-subhead">Parties</h4>
            <div className="pm-smpc-parties">
              {activeSession.parties.map((p) => (
                <div key={p.id} className="pm-smpc-party">
                  <div className="pm-smpc-party-head">
                    <span
                      className={`pm-smpc-party-online ${
                        p.online ? "pm-online-yes" : "pm-online-no"
                      }`}
                    >
                      <span className="dot" /> {p.online ? "online" : "offline"}
                    </span>
                    <span className={`pm-smpc-party-role pm-smpc-party-role-${p.role}`}>
                      {p.role}
                    </span>
                  </div>
                  <div className="pm-smpc-party-name">{p.name}</div>
                  <div className="pm-smpc-party-meta">
                    <span>{p.dataShards > 0 ? `${p.dataShards.toLocaleString()} shards` : "aggregator only"}</span>
                  </div>
                  <div className="pm-smpc-party-hash">
                    commitment:{" "}
                    <code>{p.encryptedCommitmentHash}</code>
                  </div>
                </div>
              ))}
            </div>

            <div className="pm-smpc-detail-foot">
              <span className="pm-foot-note">
                Raw data never leaves any party. Only encrypted additive shares
                and the final aggregated result are exchanged.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Consortium access matrix + audit feed */}
      <div className="pm-grid-2">
        <section className="pm-section">
          <div className="pm-section-header">
            <div>
              <h2 className="pm-section-title">🏛️ Cross-org access matrix</h2>
              <p className="pm-section-subtitle">
                Who can compute on what — enforced cryptographically by the SMPC layer.
              </p>
            </div>
          </div>

          <div className="pm-matrix">
            <div className="pm-matrix-head">
              <span className="pm-matrix-cell pm-matrix-corner">Org →</span>
              {consortiumAccessMatrix[0].datasets.map((d) => (
                <span key={d.name} className="pm-matrix-cell pm-matrix-col-head">
                  {d.name}
                </span>
              ))}
            </div>
            {consortiumAccessMatrix.map((row) => (
              <div key={row.org} className="pm-matrix-row">
                <span className="pm-matrix-cell pm-matrix-row-head">{row.org}</span>
                {row.datasets.map((d) => (
                  <span
                    key={d.name}
                    className={`pm-matrix-cell pm-matrix-access pm-matrix-access-${d.access}`}
                  >
                    {d.access === "compute" && "⊕ compute"}
                    {d.access === "aggregate" && "∑ aggregate"}
                    {d.access === "denied" && "✕ denied"}
                  </span>
                ))}
              </div>
            ))}
          </div>

          <div className="pm-matrix-legend">
            <span className="pm-legend-item">
              <span className="pm-legend-swatch pm-sw-compute" /> compute
            </span>
            <span className="pm-legend-item">
              <span className="pm-legend-swatch pm-sw-aggregate" /> aggregate only
            </span>
            <span className="pm-legend-item">
              <span className="pm-legend-swatch pm-sw-denied" /> denied
            </span>
          </div>
        </section>

        <section className="pm-section">
          <div className="pm-section-header">
            <div>
              <h2 className="pm-section-title">📜 Privacy audit feed</h2>
              <p className="pm-section-subtitle">
                Every query, every ε spend, every denial — appended to the
                tamper-evident hash chain in real time.
              </p>
            </div>
            <span className="pm-pill pm-pill-live">
              <span className="dot" /> streaming
            </span>
          </div>

          <div className="pm-audit-feed">
            {privacyAuditFeed.map((e, i) => (
              <AuditRow key={i} event={e} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ---------- sub-components ---------- */

function PmKpiCard({ kpi }: { kpi: PrivacyPostureKpi }) {
  return (
    <div className="pm-kpi-card">
      <div className="pm-kpi-label">{kpi.label}</div>
      <div className="pm-kpi-value">{kpi.value}</div>
      {kpi.deltaPct !== undefined && (
        <span className={`pm-kpi-delta ${kpi.trend}`}>
          {kpi.deltaPct > 0 ? "▲" : kpi.deltaPct < 0 ? "▼" : "■"} {Math.abs(kpi.deltaPct)}%
        </span>
      )}
      <div className="pm-kpi-hint">{kpi.hint}</div>
    </div>
  );
}

function DPStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="pm-dp-stat">
      <span className="pm-dp-stat-label">{label}</span>
      <span className="pm-dp-stat-value">{value}</span>
    </div>
  );
}

function DetailStat({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="pm-detail-stat">
      <span className="pm-detail-stat-label">{label}</span>
      <span className={`pm-detail-stat-value ${mono ? "pm-mono" : ""}`}>{value}</span>
    </div>
  );
}

function AuditRow({ event }: { event: PrivacyAuditEvent }) {
  const resultClass = `pm-audit-result-${event.result}`;
  const resultLabel =
    event.result === "released" ? "released" :
    event.result === "denied" ? "denied" : "throttled";
  return (
    <div className="pm-audit-row">
      <span className="pm-audit-ts">{event.ts}</span>
      <div className="pm-audit-body">
        <div className="pm-audit-actor">{event.actor}</div>
        <div className="pm-audit-query">{event.query}</div>
        <div className="pm-audit-meta">
          <span className="pm-audit-mechanism">{event.mechanism}</span>
          {event.epsilonCost > 0 && (
            <span className="pm-audit-epsilon">ε cost: {event.epsilonCost.toFixed(2)}</span>
          )}
        </div>
      </div>
      <span className={`pm-audit-result ${resultClass}`}>{resultLabel}</span>
    </div>
  );
}

export default PrivacyMLSection;
