"use client";

import { useState } from "react";
import { SectionId, settingsScenarios, SettingsScenario } from "@/lib/trialgptbot";

/**
 * Settings page — covers the operational scenarios that a TrialGPTBot
 * Enterprise admin or lead reviewer would actually need to flip:
 *
 *   • AI & Models — active model, auto-approve threshold, fallback
 *   • Edge Deployment — default compression + sync policy
 *   • Compliance & Audit — retention, e-signature, tamper-evident hashing
 *   • Notifications — email / Slack / PagerDuty / Teams routing
 *   • Security — SSO, MFA, session lifetime, IP allow-list
 *   • Developer — sandbox mode, webhooks, rate-limit tier
 *
 * Each scenario is rendered as an expandable card with typed form
 * controls. State is held locally and a "Save changes" button emits a
 * toast (no backend write in this sandbox).
 */
interface SettingsSectionProps {
  onNavigate: (id: SectionId) => void;
}

export function SettingsSection({ onNavigate }: SettingsSectionProps) {
  const [activeCat, setActiveCat] = useState<string>("All");
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);

  const categories = Array.from(
    new Set(settingsScenarios.map((s) => s.category)),
  );

  const filtered =
    activeCat === "All"
      ? settingsScenarios
      : settingsScenarios.filter((s) => s.category === activeCat);

  const showToast = (type: string, message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="st-page">
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
      <section className="st-hero">
        <h1>⚙️ Settings</h1>
        <p>
          Configure AI inference, edge deployment defaults, compliance &amp;
          audit, notifications, security, and developer options. Changes are
          audit-logged under FDA 21 CFR Part 11.
        </p>
      </section>

      {/* Category tabs */}
      <div className="st-tabs">
        <button
          type="button"
          className={`st-tab ${activeCat === "All" ? "active" : ""}`}
          onClick={() => setActiveCat("All")}
        >
          All ({settingsScenarios.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`st-tab ${activeCat === cat ? "active" : ""}`}
            onClick={() => setActiveCat(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Scenarios */}
      {filtered.map((scenario) => (
        <ScenarioCard
          key={scenario.id}
          scenario={scenario}
          onSave={() =>
            showToast("success", `${scenario.title} saved — audit entry written`)
          }
        />
      ))}

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "1.5rem",
            right: "1.5rem",
            zIndex: 10001,
            padding: "0.85rem 1.5rem",
            borderRadius: "0.6rem",
            color: "#ffffff",
            fontWeight: 600,
            fontSize: "0.875rem",
            background:
              toast.type === "success"
                ? "#059669"
                : toast.type === "warning"
                  ? "#d97706"
                  : "#2563eb",
            boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
            animation: "slideUp 0.3s ease-out",
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

function ScenarioCard({
  scenario,
  onSave,
}: {
  scenario: SettingsScenario;
  onSave: () => void;
}) {
  // local mutable copy of field values
  const [values, setValues] = useState<Record<string, string | number | boolean>>(
    () => Object.fromEntries(scenario.fields.map((f) => [f.key, f.value])),
  );
  const [dirty, setDirty] = useState(false);

  const setValue = (key: string, value: string | number | boolean) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = () => {
    setDirty(false);
    onSave();
  };

  const handleReset = () => {
    setValues(Object.fromEntries(scenario.fields.map((f) => [f.key, f.value])));
    setDirty(false);
  };

  return (
    <section className="st-scenario">
      <header className="st-scenario-header">
        <div className="st-scenario-icon">{scenario.icon}</div>
        <div style={{ flex: 1 }}>
          <div className="st-scenario-cat">{scenario.category}</div>
          <h2 className="st-scenario-title">{scenario.title}</h2>
          <p className="st-scenario-desc">{scenario.description}</p>
        </div>
      </header>

      <div className="st-field-row">
        {scenario.fields.map((field) => (
          <FieldControl
            key={field.key}
            field={field}
            value={values[field.key]}
            onChange={(v) => setValue(field.key, v)}
          />
        ))}
      </div>

      <div className="st-actions">
        <button
          type="button"
          className="st-btn st-btn-ghost"
          onClick={handleReset}
          disabled={!dirty}
        >
          Reset
        </button>
        <button
          type="button"
          className="st-btn st-btn-primary"
          onClick={handleSave}
          disabled={!dirty}
        >
          {dirty ? "Save changes" : "Saved"}
        </button>
      </div>
    </section>
  );
}

function FieldControl({
  field,
  value,
  onChange,
}: {
  field: SettingsScenario["fields"][number];
  value: string | number | boolean;
  onChange: (v: string | number | boolean) => void;
}) {
  return (
    <div className="st-field">
      <label className="st-field-label">{field.label}</label>
      <div className="st-field-control">
        {field.type === "toggle" && (
          <label className="st-toggle">
            <input
              type="checkbox"
              checked={value as boolean}
              onChange={(e) => onChange(e.target.checked)}
            />
            <span className="st-toggle-slider" />
          </label>
        )}

        {field.type === "select" && (
          <select
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
          >
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        {field.type === "number" && (
          <input
            type="number"
            value={value as number}
            min={field.min}
            max={field.max}
            step={field.step}
            onChange={(e) => onChange(parseFloat(e.target.value))}
          />
        )}

        {field.type === "text" && (
          <input
            type="text"
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
          />
        )}

        {field.type === "password" && (
          <input
            type="password"
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      </div>
      {field.help && <div className="st-field-help">{field.help}</div>}
    </div>
  );
}

export default SettingsSection;
