"use client";

import { useState } from "react";
import { SectionId } from "@/lib/trialgptbot";
import {
  nlpKpis,
  nlpModels,
  nlpUseCases,
  nlpFineTuneRuns,
} from "@/lib/trialgptbot";
import { BackToDashboard } from "./_BackToDashboard";

/**
 * NlpTransformersSection — NLP Enhancement with Fine-Tuned Transformers (Feature #13).
 *
 * LLMs fine-tuned on clinical trial corpora (protocols, CRFs, regulatory
 * submissions) for:
 *   • Automated query handling for regulatory inquiries (FDA IR, EMA Day-180)
 *   • Protocol deviation risk extraction from consent-form language
 *   • First drafts of regulatory responses based on audit findings
 *   • Clinical entity extraction (drug, dose, AE, lab value)
 *   • Plain-language ICF summarization for subjects
 *
 * Tech Readiness: Production Ready | Impact: High | Complexity: High
 */
interface NlpTransformersSectionProps {
  onNavigate: (id: SectionId) => void;
}

const STATUS_COLOR: Record<string, string> = {
  production: "#10b981",
  staging: "#f59e0b",
  training: "#3b82f6",
  deprecated: "#94a3b8",
  pilot: "#a78bfa",
  experimental: "#ec4899",
};

const TREND_ARROW: Record<string, string> = { up: "↑", down: "↓", flat: "→" };

const FT_METHOD_LABEL: Record<string, string> = {
  lora: "LoRA",
  qlora: "QLoRA",
  full_ft: "Full fine-tune",
  instruction: "Instruction tuning",
};

function formatTokens(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toString();
}

export function NlpTransformersSection({ onNavigate }: NlpTransformersSectionProps) {
  const [selectedUseCase, setSelectedUseCase] = useState(nlpUseCases[0].useCaseId);
  const activeUseCase = nlpUseCases.find((u) => u.useCaseId === selectedUseCase) ?? nlpUseCases[0];

  return (
    <div className="nlp-page">
      <BackToDashboard
        onNavigate={onNavigate}
        secondary={{ label: "Open MLOps", target: "mlops" }}
      />

      {/* Hero */}
      <section className="nlp-hero">
        <div className="nlp-hero-content">
          <div className="nlp-hero-title-row">
            <h1>🧠 NLP Enhancement with Fine-Tuned Transformers</h1>
            <span className="nlp-hero-badge">Feature #13 · Production Ready · Impact High</span>
          </div>
          <p>
            Fine-tune large language models on clinical trial corpora
            (protocols, CRFs, regulatory submissions, EPARs) to enable automated
            query handling for regulatory inquiries, protocol deviation risk
            extraction from consent-form language, and first drafts of regulatory
            responses based on audit findings. All outputs are tagged with a
            provenance chain back to the source corpus.
          </p>
          <div className="nlp-hero-meta">
            <span>📚 37M training documents</span>
            <span>•</span>
            <span>🔧 QLoRA + LoRA fine-tuning (parameter-efficient)</span>
            <span>•</span>
            <span>✅ 93.4% clinical accuracy (expert-validated)</span>
          </div>
        </div>
      </section>

      {/* KPI strip */}
      <section className="nlp-kpi-grid">
        {nlpKpis.map((kpi) => (
          <div key={kpi.label} className="nlp-kpi-card">
            <div className="nlp-kpi-label">{kpi.label}</div>
            <div className="nlp-kpi-value-row">
              <span className="nlp-kpi-value">{kpi.value}</span>
              {kpi.deltaPct !== undefined && (
                <span className={`nlp-kpi-delta ${kpi.trend === "up" ? "good" : ""}`}>
                  {TREND_ARROW[kpi.trend ?? "flat"]} {Math.abs(kpi.deltaPct)}%
                </span>
              )}
            </div>
            {kpi.hint && <div className="nlp-kpi-hint">{kpi.hint}</div>}
          </div>
        ))}
      </section>

      {/* Model registry */}
      <section className="nlp-section">
        <div className="nlp-section-head">
          <h2>Model Registry</h2>
          <span className="nlp-section-sub">
            5 fine-tuned clinical LLMs + NER models · champion = clin-llm-7b-v3
          </span>
        </div>
        <div className="nlp-model-grid">
          {nlpModels.map((m) => (
            <div key={m.modelId} className={`nlp-model-card ${m.status}`}>
              <div className="nlp-model-head">
                <div>
                  <div className="nlp-model-id"><code>{m.modelId}</code></div>
                  <div className="nlp-model-base">on {m.baseModel} · {m.parameters}</div>
                </div>
                <span
                  className="nlp-model-status-pill"
                  style={{ background: `${STATUS_COLOR[m.status]}22`, color: STATUS_COLOR[m.status] }}
                >
                  {m.status}
                </span>
              </div>
              <div className="nlp-model-corpus">{m.domainCorpus}</div>
              <div className="nlp-model-method-row">
                <span className="nlp-model-method-pill">{FT_METHOD_LABEL[m.fineTuneMethod]}</span>
                <span className="nlp-model-tokens">{formatTokens(m.trainedOnTokens)} tokens</span>
                <span className="nlp-model-ctx">{(m.contextWindow / 1024).toFixed(0)}K ctx</span>
              </div>
              <div className="nlp-model-metrics">
                <div>
                  <span className="nlp-metric-label">Clinical acc</span>
                  <span className="nlp-metric-val">{(m.evalClinicalAccuracy * 100).toFixed(1)}%</span>
                </div>
                <div>
                  <span className="nlp-metric-label">Entity F1</span>
                  <span className="nlp-metric-val">{(m.evalF1 * 100).toFixed(1)}%</span>
                </div>
                <div>
                  <span className="nlp-metric-label">ROUGE-L</span>
                  <span className="nlp-metric-val">{m.evalRougeL > 0 ? m.evalRougeL.toFixed(3) : "—"}</span>
                </div>
                <div>
                  <span className="nlp-metric-label">P95 latency</span>
                  <span className="nlp-metric-val">{m.latencyP95Ms}ms</span>
                </div>
              </div>
              {m.deployedAt && (
                <div className="nlp-model-deployed">deployed {new Date(m.deployedAt).toLocaleDateString()}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Use case explorer */}
      <section className="nlp-section">
        <div className="nlp-section-head">
          <h2>Use Case Explorer</h2>
          <span className="nlp-section-sub">
            Select a use case to see sample input/output
          </span>
        </div>
        <div className="nlp-usecase-layout">
          <div className="nlp-usecase-list">
            {nlpUseCases.map((u) => (
              <button
                key={u.useCaseId}
                type="button"
                className={`nlp-usecase-item ${selectedUseCase === u.useCaseId ? "active" : ""}`}
                onClick={() => setSelectedUseCase(u.useCaseId)}
              >
                <div className="nlp-usecase-item-head">
                  <span className="nlp-usecase-name">{u.name}</span>
                  <span
                    className="nlp-usecase-status-dot"
                    style={{ background: STATUS_COLOR[u.status] }}
                    aria-hidden="true"
                  />
                </div>
                <div className="nlp-usecase-item-meta">
                  <span><code>{u.modelId}</code></span>
                  <span>•</span>
                  <span>{u.throughputPerDay.toLocaleString()}/day</span>
                  <span>•</span>
                  <span>{(u.accuracy * 100).toFixed(1)}% acc</span>
                </div>
              </button>
            ))}
          </div>
          <div className="nlp-usecase-detail">
            <div className="nlp-usecase-detail-head">
              <h3>{activeUseCase.name}</h3>
              <span
                className="nlp-usecase-detail-status"
                style={{ background: `${STATUS_COLOR[activeUseCase.status]}22`, color: STATUS_COLOR[activeUseCase.status] }}
              >
                {activeUseCase.status}
              </span>
            </div>
            <p className="nlp-usecase-desc">{activeUseCase.description}</p>
            <div className="nlp-usecase-stats">
              <div>
                <span className="nlp-stat-label">Throughput</span>
                <span className="nlp-stat-val">{activeUseCase.throughputPerDay.toLocaleString()}/day</span>
              </div>
              <div>
                <span className="nlp-stat-label">Accuracy</span>
                <span className="nlp-stat-val">{(activeUseCase.accuracy * 100).toFixed(1)}%</span>
              </div>
              <div>
                <span className="nlp-stat-label">Model</span>
                <span className="nlp-stat-val"><code>{activeUseCase.modelId}</code></span>
              </div>
            </div>
            <div className="nlp-sample-row">
              <div className="nlp-sample-label">Sample input</div>
              <pre className="nlp-sample-input">{activeUseCase.sampleInput}</pre>
            </div>
            <div className="nlp-sample-row">
              <div className="nlp-sample-label">Sample output</div>
              <pre className="nlp-sample-output">{activeUseCase.sampleOutput}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* Fine-tune runs */}
      <section className="nlp-section">
        <div className="nlp-section-head">
          <h2>Fine-Tune Run History</h2>
          <span className="nlp-section-sub">
            4 recent runs · GPU budget: 8x A100 80GB · 1,760 GPU-hours this month
          </span>
        </div>
        <div className="nlp-runs-table">
          <div className="nlp-runs-head">
            <span>Run ID</span>
            <span>Model</span>
            <span>Started</span>
            <span>Duration</span>
            <span>GPU-hours</span>
            <span>Tokens</span>
            <span>Eval loss</span>
            <span>Trigger</span>
            <span>Status</span>
          </div>
          {nlpFineTuneRuns.map((r) => (
            <div key={r.runId} className="nlp-runs-row">
              <span><code>{r.runId}</code></span>
              <span><code>{r.modelId}</code></span>
              <span>{new Date(r.startedAt).toLocaleString()}</span>
              <span>{r.durationHr > 0 ? `${r.durationHr.toFixed(1)}h` : "—"}</span>
              <span>{r.gpuHours > 0 ? r.gpuHours.toLocaleString() : "—"}</span>
              <span>{r.trainTokens > 0 ? formatTokens(r.trainTokens) : "—"}</span>
              <span>{r.evalLoss > 0 ? r.evalLoss.toFixed(3) : "—"}</span>
              <span>
                <span className={`nlp-trigger-pill ${r.triggeredBy}`}>{r.triggeredBy.replace(/_/g, " ")}</span>
              </span>
              <span>
                <span className={`nlp-status-pill ${r.status}`}>{r.status}</span>
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default NlpTransformersSection;
