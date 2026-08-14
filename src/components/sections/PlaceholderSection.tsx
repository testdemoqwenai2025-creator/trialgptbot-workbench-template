"use client";

import { SectionId, formatTimeAgo } from "@/lib/trialgptbot";

interface PlaceholderSectionProps {
  title: string;
  description: string;
  icon: string;
  onNavigate: (id: SectionId) => void;
  suggestedId?: SectionId;
  suggestedLabel?: string;
  extra?: React.ReactNode;
}

export function PlaceholderSection({
  title,
  description,
  icon,
  onNavigate,
  suggestedId,
  suggestedLabel,
  extra,
}: PlaceholderSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="text-6xl mb-4">{icon}</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Module Preview</h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          This module is part of TrialGPTBot Enterprise. In a production deployment it would show
          live data and full interactivity. In this sandbox demo, navigate to the dashboard to
          explore the working review workflow.
        </p>
        {suggestedId && suggestedLabel && (
          <button
            type="button"
            onClick={() => onNavigate(suggestedId)}
            className="btn btn-primary"
          >
            {suggestedLabel}
          </button>
        )}
        {extra}
      </div>
    </div>
  );
}

export function AuditSection({ onNavigate }: { onNavigate: (id: SectionId) => void }) {
  const entries = Array.from({ length: 15 }, (_, i) => ({
    id: `audit_${Date.now()}_${i}`,
    timestamp: new Date(Date.now() - i * 3600000),
    action: ["task_approved", "task_rejected", "task_escalated", "login", "export", "config_change"][i % 6],
    userId: ["reviewer_001", "admin_user", "ai_engine", "dr_chen", "reviewer_002"][i % 5],
    details: `Sample audit event ${i + 1} — captured by the 21 CFR Part 11 compliant audit subsystem.`,
    category: ["data_integrity", "access_control", "electronic_signature", "audit_trail"][i % 4],
    severity: i % 4 === 0 ? "info" : i % 4 === 1 ? "warning" : i % 4 === 2 ? "info" : "info",
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Trail</h1>
          <p className="text-sm text-gray-500 mt-1">
            Complete, tamper-evident audit log (FDA 21 CFR §11.10)
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => onNavigate("dashboard")}
            className="btn btn-secondary"
          >
            ← Dashboard
          </button>
          <button
            type="button"
            onClick={() => onNavigate("compliance")}
            className="btn btn-secondary"
          >
            Compliance Center →
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            {entries.length} entries shown (last 15 hours)
          </span>
          <span className="text-xs text-gray-500">All times are local</span>
        </div>
        <div className="divide-y divide-slate-100">
          {entries.map((entry) => (
            <div key={entry.id} className="p-4 hover:bg-slate-50 flex items-start gap-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-emerald-500 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-mono text-xs text-gray-500">{entry.id}</span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-medium rounded">
                    {entry.action.replace(/_/g, " ")}
                  </span>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                    {entry.category.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{entry.details}</p>
                <div className="text-xs text-gray-500 mt-1">
                  {entry.userId} • {formatTimeAgo(entry.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
