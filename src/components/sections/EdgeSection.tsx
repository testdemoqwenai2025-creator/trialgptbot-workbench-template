"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { SectionId, mockStats } from "@/lib/trialgptbot";
import {
  edgeBaseModels,
  compressionTechniqueOptions,
  edgeDeploymentTemplates,
  edgeHealthTimeline,
  EdgeDeploymentTemplate,
  EdgeSyncEvent,
  generateRandomSyncEvent,
} from "@/lib/trialgptbot";
import { BackToDashboard } from "./_BackToDashboard";
import { useLiveTick, formatSeconds } from "@/hooks/use-live-tick";

/**
 * EdgeSection — top-level Edge Computing page (Feature #7).
 *
 * Surfaces the same data that powers the Dashboard's Edge Computing panel,
 * but as a dedicated first-class page with:
 *
 *   • Live fleet KPIs + 24h health timeline
 *   • Site roster (filterable by status, country, market tier)
 *   • Compression technique breakdown
 *   • Live SSE sync log stream (re-uses the /api/edge/sync-stream endpoint)
 *   • Deployment wizard (6-step) — also accessible from the Dashboard
 *
 * Tech Readiness: Emerging | Impact: High | Complexity: Medium
 * Target: bandwidth-constrained environments in emerging markets.
 */
interface EdgeSectionProps {
  onNavigate: (id: SectionId) => void;
}

const STATUS_FILTERS = ["all", "online", "syncing", "degraded", "offline", "pending_deploy"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const MARKET_FILTERS = ["all", "tier1", "emerging"] as const;
type MarketFilter = (typeof MARKET_FILTERS)[number];

const STATUS_DOT_COLOR: Record<string, string> = {
  online: "#10b981",
  syncing: "#3b82f6",
  degraded: "#f59e0b",
  offline: "#ef4444",
  pending_deploy: "#9ca3af",
};

const STATUS_LABEL: Record<string, string> = {
  online: "Online",
  syncing: "Syncing",
  degraded: "Degraded",
  offline: "Offline",
  pending_deploy: "Pending deploy",
};

export function EdgeSection({ onNavigate }: EdgeSectionProps) {
  const edge = mockStats.edgeComputing!;
  const secs = useLiveTick(edge.lastUpdated);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [marketFilter, setMarketFilter] = useState<MarketFilter>("all");
  const [countryQuery, setCountryQuery] = useState("");
  const [wizardOpen, setWizardOpen] = useState(false);

  const filteredSites = useMemo(() => {
    return edge.sites.filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (marketFilter === "tier1" && s.emergingMarket) return false;
      if (marketFilter === "emerging" && !s.emergingMarket) return false;
      if (countryQuery && !s.country.toLowerCase().includes(countryQuery.toLowerCase())) return false;
      return true;
    });
  }, [edge.sites, statusFilter, marketFilter, countryQuery]);

  // Live sync log via SSE
  const { liveLog, connected } = useLiveSyncLog(edge.syncLog);

  const offlineCount = edge.sites.filter((s) => s.status === "offline").length;
  const degradedCount = edge.sites.filter((s) => s.status === "degraded").length;
  const pendingCount = edge.sites.filter((s) => s.status === "pending_deploy").length;

  return (
    <div className="eg-page">
      <BackToDashboard
        onNavigate={onNavigate}
        secondary={{ label: "Open Analytics", target: "analytics" }}
      />

      {/* Hero */}
      <section className="eg-hero">
        <div className="eg-hero-content">
          <div className="eg-hero-title-row">
            <h1>🛰️ Edge Computing</h1>
            <span className="eg-hero-badge">Feature #7 · Emerging · Impact High</span>
          </div>
          <p>
            Lightweight clinical inference models deployed directly at trial
            sites for offline-capable, low-bandwidth operation. Models are
            INT8-quantized + structurally pruned + knowledge-distilled to{" "}
            <strong>~15% of their original size</strong> while retaining{" "}
            <strong>&lt;1% accuracy loss</strong>. Local queues use eventual
            consistency with auto-merge; conflicts surface for reviewer
            resolution.
          </p>
          <div className="eg-hero-toolbar">
            <span className={`eg-toolbar-pill ${connected ? "live" : "cached"}`}>
              <span className="dot" /> {connected ? "Live SSE feed" : "Cached (reconnecting…)"}
            </span>
            <span className="eg-toolbar-pill">updated {formatSeconds(secs)}</span>
            <span className="eg-toolbar-pill">Pipeline: SSE + Kafka</span>
            <button
              type="button"
              className="eg-toolbar-cta"
              onClick={() => setWizardOpen(true)}
              title="Open the Edge Deployment wizard"
            >
              🚀 Open EDC Hub →
            </button>
          </div>
        </div>
      </section>

      {/* KPI grid */}
      <section>
        <div className="eg-kpi-grid">
          <EgKpiCard
            label="Sites deployed"
            value={`${edge.kpis.activeSites} / ${edge.kpis.totalSites}`}
            tone="good"
            hint={`${pendingCount} pending deploy`}
            icon="🏥"
          />
          <EgKpiCard
            label="Offline capable"
            value={`${edge.kpis.offlineCapablePct}%`}
            tone="good"
            hint="sites that can operate fully offline"
            icon="📴"
          />
          <EgKpiCard
            label="Avg compression"
            value={`${(edge.kpis.avgCompressionRatio * 100).toFixed(1)}%`}
            tone="good"
            hint="compressed / original model size"
            icon="📦"
          />
          <EgKpiCard
            label="Bandwidth saved"
            value={`${edge.kpis.bandwidthSavedPct}%`}
            tone="good"
            hint="vs. cloud-only operation"
            icon="📶"
          />
          <EgKpiCard
            label="Edge inference"
            value={`${edge.kpis.avgInferenceLatencyMs} ms`}
            tone="good"
            hint="mean on-device latency"
            icon="⚡"
          />
          <EgKpiCard
            label="Pending sync"
            value={edge.kpis.pendingSyncRecords.toLocaleString()}
            tone={edge.kpis.pendingSyncRecords > 1000 ? "warn" : "good"}
            hint="records queued locally"
            icon="📥"
          />
          <EgKpiCard
            label="Sync lag P95"
            value={`${edge.kpis.syncLagP95Min} min`}
            tone={edge.kpis.syncLagP95Min > 60 ? "warn" : "good"}
            hint="95th-percentile delay"
            icon="⏱️"
          />
          <EgKpiCard
            label="Conflicts"
            value={edge.sites.reduce((s, x) => s + x.conflictCount, 0).toString()}
            tone={edge.sites.some((x) => x.conflictCount > 0) ? "warn" : "good"}
            hint="eventual-consistency conflicts"
            icon="⚠️"
          />
        </div>
      </section>

      {/* Fleet health timeline */}
      <section className="eg-section">
        <div className="eg-section-header">
          <div>
            <h2 className="eg-section-title">📊 Fleet health — last 24h</h2>
            <p className="eg-section-subtitle">
              Hourly snapshot of online / syncing / degraded / offline sites
              and pending sync backlog
            </p>
          </div>
          {offlineCount + degradedCount > 0 && (
            <span className="eg-pill eg-pill-warn">
              {offlineCount} offline · {degradedCount} degraded
            </span>
          )}
        </div>
        <FleetHealthChart />
      </section>

      {/* Site roster + Compression + Sync log */}
      <div className="eg-grid-2">
        {/* Site roster */}
        <section className="eg-section eg-site-roster-section">
          <div className="eg-section-header">
            <div>
              <h2 className="eg-section-title">🏥 Site roster</h2>
              <p className="eg-section-subtitle">
                {filteredSites.length} of {edge.sites.length} sites shown ·
                click a row for details
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="eg-filters">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="eg-filter-select"
            >
              <option value="all">All statuses</option>
              <option value="online">Online</option>
              <option value="syncing">Syncing</option>
              <option value="degraded">Degraded</option>
              <option value="offline">Offline</option>
              <option value="pending_deploy">Pending deploy</option>
            </select>
            <select
              value={marketFilter}
              onChange={(e) => setMarketFilter(e.target.value as MarketFilter)}
              className="eg-filter-select"
            >
              <option value="all">All markets</option>
              <option value="tier1">Tier-1 (developed)</option>
              <option value="emerging">Emerging markets</option>
            </select>
            <input
              type="text"
              placeholder="Filter by country…"
              value={countryQuery}
              onChange={(e) => setCountryQuery(e.target.value)}
              className="eg-filter-input"
            />
          </div>

          <div className="eg-site-list">
            {filteredSites.map((site) => (
              <div key={site.siteId} className={`eg-site-row status-${site.status}`}>
                <div className="eg-site-status-col">
                  <span
                    className="eg-site-status-dot"
                    style={{ background: STATUS_DOT_COLOR[site.status] }}
                    title={STATUS_LABEL[site.status]}
                  />
                </div>
                <div className="eg-site-name-col">
                  <div className="eg-site-name">
                    {site.name}
                    {site.emergingMarket && <span className="eg-em-badge">EM</span>}
                  </div>
                  <div className="eg-site-meta">
                    {site.siteId} · {site.country} · {site.modelVersion}
                  </div>
                </div>
                <div className="eg-site-metric-col">
                  <div className="eg-site-metric-label">Bandwidth</div>
                  <div className="eg-site-metric-value">
                    {site.bandwidthKbps > 0 ? `${(site.bandwidthKbps / 1000).toFixed(1)} Mbps` : "—"}
                  </div>
                </div>
                <div className="eg-site-metric-col">
                  <div className="eg-site-metric-label">Latency</div>
                  <div className="eg-site-metric-value">
                    {site.inferenceLatencyMs > 0 ? `${site.inferenceLatencyMs} ms` : "—"}
                  </div>
                </div>
                <div className="eg-site-metric-col">
                  <div className="eg-site-metric-label">Model size</div>
                  <div className="eg-site-metric-value">
                    {site.compressedModelSizeMb > 0
                      ? `${site.compressedModelSizeMb.toFixed(1)} MB`
                      : "—"}
                  </div>
                </div>
                <div className="eg-site-metric-col">
                  <div className="eg-site-metric-label">Queue</div>
                  <div
                    className={`eg-site-metric-value ${
                      site.pendingRecords > 100 ? "warn" : ""
                    }`}
                  >
                    {site.pendingRecords.toLocaleString()}
                  </div>
                </div>
                <div className="eg-site-metric-col">
                  <div className="eg-site-metric-label">Storage</div>
                  <div className="eg-site-metric-value">
                    {site.storageUsedPct > 0 ? `${site.storageUsedPct}%` : "—"}
                  </div>
                </div>
                <div className="eg-site-metric-col">
                  <div className="eg-site-metric-label">Health</div>
                  <div
                    className={`eg-site-metric-value ${
                      site.healthScore >= 90
                        ? "good"
                        : site.healthScore >= 70
                          ? "warn"
                          : site.healthScore > 0
                            ? "bad"
                            : ""
                    }`}
                  >
                    {site.healthScore > 0 ? `${site.healthScore}` : "—"}
                  </div>
                </div>
              </div>
            ))}
            {filteredSites.length === 0 && (
              <div className="eg-empty">
                No sites match the current filters.
              </div>
            )}
          </div>
        </section>

        {/* Compression techniques + Sync log */}
        <div className="eg-narrow-col">
          <section className="eg-section">
            <div className="eg-section-header">
              <div>
                <h2 className="eg-section-title">🗜️ Compression techniques</h2>
                <p className="eg-section-subtitle">
                  Applied to the active fleet
                </p>
              </div>
            </div>
            <div className="eg-compression-list">
              {edge.compressionTechniques.map((t) => (
                <div key={t.name} className={`eg-compression-row ${t.applied ? "applied" : "disabled"}`}>
                  <div className="eg-compression-header">
                    <span className="eg-compression-name">{t.name}</span>
                    <span className={`eg-compression-state ${t.applied ? "on" : "off"}`}>
                      {t.applied ? "Applied" : "Disabled"}
                    </span>
                  </div>
                  {t.applied && (
                    <>
                      <div className="eg-compression-bars">
                        <div className="eg-compression-bar">
                          <span className="eg-compression-bar-label">Size reduction</span>
                          <div className="eg-compression-bar-track">
                            <div
                              className="eg-compression-bar-fill size"
                              style={{ width: `${t.sizeReductionPct}%` }}
                            />
                          </div>
                          <span className="eg-compression-bar-val">{t.sizeReductionPct}%</span>
                        </div>
                        <div className="eg-compression-bar">
                          <span className="eg-compression-bar-label">Latency impact</span>
                          <div className="eg-compression-bar-track">
                            <div
                              className={`eg-compression-bar-fill ${t.latencyImpactPct < 0 ? "good" : "bad"}`}
                              style={{ width: `${Math.abs(t.latencyImpactPct)}%` }}
                            />
                          </div>
                          <span className="eg-compression-bar-val">
                            {t.latencyImpactPct > 0 ? "+" : ""}
                            {t.latencyImpactPct}%
                          </span>
                        </div>
                        <div className="eg-compression-bar">
                          <span className="eg-compression-bar-label">Accuracy delta</span>
                          <div className="eg-compression-bar-track">
                            <div
                              className={`eg-compression-bar-fill ${t.accuracyDeltaPct >= 0 ? "good" : "warn"}`}
                              style={{ width: `${Math.min(100, Math.abs(t.accuracyDeltaPct) * 50)}%` }}
                            />
                          </div>
                          <span className="eg-compression-bar-val">
                            {t.accuracyDeltaPct > 0 ? "+" : ""}
                            {t.accuracyDeltaPct}%
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="eg-section">
            <div className="eg-section-header">
              <div>
                <h2 className="eg-section-title">🌊 Live sync log</h2>
                <p className="eg-section-subtitle">
                  Eventual-consistency events across the fleet
                </p>
              </div>
              <span className={`eg-pill ${connected ? "eg-pill-good" : "eg-pill-warn"}`}>
                {connected ? "● streaming" : "● cached"}
              </span>
            </div>
            <div className="eg-sync-log">
              {liveLog.slice(0, 14).map((evt, i) => (
                <SyncLogRow key={`${evt.ts}-${i}`} evt={evt} />
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Deployment templates */}
      <section className="eg-section">
        <div className="eg-section-header">
          <div>
            <h2 className="eg-section-title">🎛️ Deployment templates</h2>
            <p className="eg-section-subtitle">
              Pre-baked compression profiles for common site archetypes.
              Click a template to start a wizard with these settings pre-filled.
            </p>
          </div>
        </div>
        <div className="eg-template-grid">
          {edgeDeploymentTemplates.map((tpl) => (
            <DeploymentTemplateCard
              key={tpl.id}
              template={tpl}
              onUse={() => setWizardOpen(true)}
            />
          ))}
        </div>
      </section>

      {wizardOpen && (
        <EdgeDeploymentWizardModal onClose={() => setWizardOpen(false)} />
      )}
    </div>
  );
}

/* ============================================================ */

function EgKpiCard({
  label,
  value,
  hint,
  tone = "good",
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "good" | "warn" | "bad";
  icon?: string;
}) {
  return (
    <div className={`eg-kpi-card tone-${tone}`}>
      {icon && <div className="eg-kpi-icon">{icon}</div>}
      <div className="eg-kpi-label">{label}</div>
      <div className="eg-kpi-value">{value}</div>
      {hint && <div className="eg-kpi-hint">{hint}</div>}
    </div>
  );
}

function FleetHealthChart() {
  const data = edgeHealthTimeline;
  const hours = data.length;
  const maxPending = Math.max(...data.map((d) => d.pendingSyncRecords));

  return (
    <div className="eg-fleet-chart">
      <div className="eg-fleet-chart-bars">
        {data.map((snap, h) => {
          const total = snap.onlineSites + snap.syncingSites + snap.degradedSites + snap.offlineSites;
          const onlineH = (snap.onlineSites / total) * 100;
          const syncingH = (snap.syncingSites / total) * 100;
          const degradedH = (snap.degradedSites / total) * 100;
          const offlineH = (snap.offlineSites / total) * 100;
          return (
            <div key={h} className="eg-fleet-bar-group" title={`${new Date(snap.ts).getHours()}:00 — online ${snap.onlineSites}, syncing ${snap.syncingSites}, degraded ${snap.degradedSites}, offline ${snap.offlineSites}, pending ${snap.pendingSyncRecords}`}>
              <div className="eg-fleet-bar-stack">
                <div className="eg-fleet-bar-seg online" style={{ height: `${onlineH}%` }} />
                <div className="eg-fleet-bar-seg syncing" style={{ height: `${syncingH}%` }} />
                <div className="eg-fleet-bar-seg degraded" style={{ height: `${degradedH}%` }} />
                <div className="eg-fleet-bar-seg offline" style={{ height: `${offlineH}%` }} />
              </div>
              <div
                className="eg-fleet-bar-pending"
                style={{ height: `${(snap.pendingSyncRecords / maxPending) * 100}%` }}
                title={`${snap.pendingSyncRecords} pending`}
              />
              {h % 3 === 0 && (
                <div className="eg-fleet-bar-label">
                  {new Date(snap.ts).getHours()}h
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="eg-fleet-legend">
        <span className="eg-legend-item"><span className="eg-legend-dot online" /> Online</span>
        <span className="eg-legend-item"><span className="eg-legend-dot syncing" /> Syncing</span>
        <span className="eg-legend-item"><span className="eg-legend-dot degraded" /> Degraded</span>
        <span className="eg-legend-item"><span className="eg-legend-dot offline" /> Offline</span>
        <span className="eg-legend-item"><span className="eg-legend-bar" /> Pending sync</span>
      </div>
    </div>
  );
}

function SyncLogRow({ evt }: { evt: EdgeSyncEvent }) {
  const colorMap: Record<string, string> = {
    queue: "#9ca3af",
    sync_started: "#3b82f6",
    sync_completed: "#10b981",
    conflict: "#ef4444",
    merged: "#8b5cf6",
  };
  const time = new Date(evt.ts).toLocaleTimeString("en-US", { hour12: false });
  return (
    <div className="eg-sync-row">
      <span className="eg-sync-time">{time}</span>
      <span
        className="eg-sync-event-dot"
        style={{ background: colorMap[evt.event] || "#9ca3af" }}
      />
      <span className={`eg-sync-event ${evt.event}`}>{evt.event}</span>
      <span className="eg-sync-site">{evt.siteId}</span>
      <span className="eg-sync-records">{evt.records} rec</span>
      {evt.detail && <span className="eg-sync-detail">{evt.detail}</span>}
    </div>
  );
}

function DeploymentTemplateCard({
  template,
  onUse,
}: {
  template: EdgeDeploymentTemplate;
  onUse: () => void;
}) {
  return (
    <div className="eg-template-card">
      <div className="eg-template-header">
        <h3 className="eg-template-name">{template.name}</h3>
        <span className="eg-template-archetype">{template.archetype.replace(/_/g, " ")}</span>
      </div>
      <p className="eg-template-desc">{template.description}</p>
      <div className="eg-template-stats">
        <div className="eg-template-stat">
          <span className="eg-template-stat-label">Est. size</span>
          <span className="eg-template-stat-value">{template.estimatedSizeMb} MB</span>
        </div>
        <div className="eg-template-stat">
          <span className="eg-template-stat-label">Compression</span>
          <span className="eg-template-stat-value">{(template.estimatedCompressionRatio * 100).toFixed(1)}%</span>
        </div>
        <div className="eg-template-stat">
          <span className="eg-template-stat-label">Latency</span>
          <span className="eg-template-stat-value">{template.estimatedLatencyMs} ms</span>
        </div>
        <div className="eg-template-stat">
          <span className="eg-template-stat-label">Δ Accuracy</span>
          <span className={`eg-template-stat-value ${template.accuracyDeltaPct >= -1 ? "good" : "warn"}`}>
            {template.accuracyDeltaPct > 0 ? "+" : ""}
            {template.accuracyDeltaPct}%
          </span>
        </div>
      </div>
      <div className="eg-template-actions">
        <button type="button" className="eg-template-btn" onClick={onUse}>
          Use template →
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   Live sync log hook — consumes the SSE endpoint at /api/edge/sync-stream
   ============================================================ */

function useLiveSyncLog(seed: EdgeSyncEvent[]) {
  const [liveLog, setLiveLog] = useState<EdgeSyncEvent[]>(seed);
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let disposed = false;

    const connect = () => {
      if (disposed) return;
      try {
        const es = new EventSource("/api/edge/sync-stream");
        esRef.current = es;

        es.addEventListener("ready", () => {
          if (!disposed) setConnected(true);
        });

        es.addEventListener("sync", (e: MessageEvent) => {
          if (disposed) return;
          try {
            const evt = JSON.parse(e.data) as EdgeSyncEvent;
            setLiveLog((prev) => [evt, ...prev].slice(0, 50));
          } catch {
            /* swallow malformed event */
          }
        });

        es.onerror = () => {
          if (disposed) return;
          setConnected(false);
          es.close();
          esRef.current = null;
          // Reconnect with backoff
          if (!reconnectRef.current) {
            reconnectRef.current = setTimeout(() => {
              reconnectRef.current = null;
              connect();
            }, 4000 + Math.random() * 3000);
          }
        };
      } catch {
        if (!disposed) setConnected(false);
      }
    };

    connect();

    return () => {
      disposed = true;
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
    };
  }, [seed]);

  return { liveLog, connected };
}

/* ============================================================
   Edge Deployment Wizard — modal wrapper
   ============================================================ */

function EdgeDeploymentWizardModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<"intro" | "model" | "compress" | "review" | "deploy" | "done">("intro");

  return (
    <div className="eg-wizard-overlay" onClick={onClose}>
      <div
        className="eg-wizard-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="eg-wizard-title"
      >
        <div className="eg-wizard-header">
          <div>
            <div className="eg-wizard-eyebrow">Edge Deployment Wizard</div>
            <h2 id="eg-wizard-title">🚀 Deploy compressed model to edge site</h2>
          </div>
          <button
            type="button"
            className="eg-wizard-close"
            onClick={onClose}
            aria-label="Close wizard"
          >
            ×
          </button>
        </div>

        <div className="eg-wizard-stepper">
          {[
            { id: "intro", label: "Select site" },
            { id: "model", label: "Choose model" },
            { id: "compress", label: "Compression" },
            { id: "review", label: "Review" },
            { id: "deploy", label: "Deploy" },
            { id: "done", label: "Done" },
          ].map((s, i) => (
            <div
              key={s.id}
              className={`eg-wizard-step ${step === s.id ? "active" : ""}`}
            >
              <div className="eg-wizard-step-circle">{i + 1}</div>
              <div className="eg-wizard-step-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="eg-wizard-body">
          {step === "intro" && (
            <div>
              <p className="eg-wizard-intro">
                This wizard walks you through deploying a freshly compressed
                model to an edge site. Pick a pending_deploy site below, or
                skip to deploy to an existing site as a model refresh.
              </p>
              <div className="eg-wizard-site-list">
                {mockStats.edgeComputing!.sites
                  .filter((s) => s.status === "pending_deploy")
                  .map((s) => (
                    <div key={s.siteId} className="eg-wizard-site-card">
                      <div className="eg-wizard-site-name">{s.name}</div>
                      <div className="eg-wizard-site-meta">
                        {s.siteId} · {s.country} · {(s.bandwidthKbps / 1000).toFixed(1)} Mbps
                      </div>
                    </div>
                  ))}
              </div>
              <div className="eg-wizard-actions">
                <button type="button" className="eg-wizard-btn-primary" onClick={() => setStep("model")}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {step === "model" && (
            <div>
              <p className="eg-wizard-intro">Choose the base model to compress and deploy.</p>
              <div className="eg-wizard-model-list">
                {edgeBaseModels.map((m) => (
                  <div key={m.id} className={`eg-wizard-model-card ${m.recommended ? "recommended" : ""}`}>
                    <div className="eg-wizard-model-name">
                      {m.name}
                      {m.recommended && <span className="eg-wizard-tag">Recommended</span>}
                    </div>
                    <div className="eg-wizard-model-meta">
                      {m.sizeMb} MB · {m.accuracyPct}% accuracy
                    </div>
                    <div className="eg-wizard-model-notes">{m.notes}</div>
                  </div>
                ))}
              </div>
              <div className="eg-wizard-actions">
                <button type="button" className="eg-wizard-btn-ghost" onClick={() => setStep("intro")}>← Back</button>
                <button type="button" className="eg-wizard-btn-primary" onClick={() => setStep("compress")}>Continue →</button>
              </div>
            </div>
          )}

          {step === "compress" && (
            <div>
              <p className="eg-wizard-intro">Toggle compression techniques. Predicted outcome is shown in the next step.</p>
              <div className="eg-wizard-compress-list">
                {compressionTechniqueOptions.map((c) => (
                  <div key={c.id} className={`eg-wizard-compress-row ${c.defaultApplied ? "on" : "off"}`}>
                    <div>
                      <div className="eg-wizard-compress-name">{c.name}</div>
                      <div className="eg-wizard-compress-desc">{c.description}</div>
                    </div>
                    <span className={`eg-wizard-toggle ${c.defaultApplied ? "on" : "off"}`}>
                      {c.defaultApplied ? "ON" : "OFF"}
                    </span>
                  </div>
                ))}
              </div>
              <div className="eg-wizard-actions">
                <button type="button" className="eg-wizard-btn-ghost" onClick={() => setStep("model")}>← Back</button>
                <button type="button" className="eg-wizard-btn-primary" onClick={() => setStep("review")}>Continue →</button>
              </div>
            </div>
          )}

          {step === "review" && (
            <div>
              <p className="eg-wizard-intro">Review the predicted deploy outcome.</p>
              <div className="eg-wizard-review-grid">
                <div className="eg-wizard-review-cell">
                  <span className="eg-wizard-review-label">Base model</span>
                  <span className="eg-wizard-review-value">edge-clin-v3.4.1 (412 MB)</span>
                </div>
                <div className="eg-wizard-review-cell">
                  <span className="eg-wizard-review-label">Predicted size</span>
                  <span className="eg-wizard-review-value">62.8 MB</span>
                </div>
                <div className="eg-wizard-review-cell">
                  <span className="eg-wizard-review-label">Compression ratio</span>
                  <span className="eg-wizard-review-value">15.3%</span>
                </div>
                <div className="eg-wizard-review-cell">
                  <span className="eg-wizard-review-label">Predicted latency</span>
                  <span className="eg-wizard-review-value">42 ms</span>
                </div>
                <div className="eg-wizard-review-cell">
                  <span className="eg-wizard-review-label">Accuracy delta</span>
                  <span className="eg-wizard-review-value warn">-0.7%</span>
                </div>
                <div className="eg-wizard-review-cell">
                  <span className="eg-wizard-review-label">Est. deploy time</span>
                  <span className="eg-wizard-review-value">~7 min</span>
                </div>
              </div>
              <div className="eg-wizard-actions">
                <button type="button" className="eg-wizard-btn-ghost" onClick={() => setStep("compress")}>← Back</button>
                <button type="button" className="eg-wizard-btn-primary" onClick={() => setStep("deploy")}>Deploy now →</button>
              </div>
            </div>
          )}

          {step === "deploy" && (
            <div>
              <p className="eg-wizard-intro">Deploying… do not close this window.</p>
              <div className="eg-wizard-progress">
                <div className="eg-wizard-progress-bar" style={{ width: "68%" }} />
              </div>
              <div className="eg-wizard-deploy-log">
                <div>[14:32:08] Resolving site endpoint…</div>
                <div>[14:32:09] Pushing model blob (62.8 MB)…</div>
                <div>[14:32:42] Verifying checksum…</div>
                <div>[14:32:43] Starting edge runtime…</div>
                <div>[14:33:01] Health check passed (latency 42 ms)</div>
                <div>[14:33:02] Marking site ONLINE in fleet registry…</div>
                <div className="active">[14:33:03] Writing audit entry…</div>
              </div>
              <div className="eg-wizard-actions">
                <button type="button" className="eg-wizard-btn-primary" onClick={() => setStep("done")}>Simulate completion →</button>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="eg-wizard-done">
              <div className="eg-wizard-done-icon">✅</div>
              <h3>Deploy complete</h3>
              <p>
                The site is now <strong>online</strong> with the new model.
                Sync events should appear in the live sync log within 60 seconds.
              </p>
              <div className="eg-wizard-actions">
                <button type="button" className="eg-wizard-btn-ghost" onClick={onClose}>Close</button>
                <button type="button" className="eg-wizard-btn-primary" onClick={() => setStep("intro")}>Deploy to another site →</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EdgeSection;
