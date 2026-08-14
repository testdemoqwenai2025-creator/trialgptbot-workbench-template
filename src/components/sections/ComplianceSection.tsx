"use client";

import { useState, useMemo } from "react";
import { mockStats, SectionId } from "@/lib/trialgptbot";
import { Toast } from "./_shared";
import { BackToDashboard } from "./_BackToDashboard";

interface ComplianceSectionProps {
  onNavigate: (id: SectionId) => void;
}

const frameworks = [
  { key: "fda21CFR11", name: "FDA 21 CFR Part 11", icon: "🏛️", description: "Electronic records; electronic signatures", shortKey: "fda" },
  { key: "emaAnnex11", name: "EMA Annex 11", icon: "🇪🇺", description: "Computerized systems in clinical trials", shortKey: "ema" },
  { key: "gdpr", name: "GDPR", icon: "🔒", description: "General Data Protection Regulation", shortKey: "gdpr" },
  { key: "hipaa", name: "HIPAA", icon: "🏥", description: "Health Insurance Portability & Accountability Act", shortKey: "hipaa" },
];

interface AuditEntry {
  id: string;
  timestamp: Date;
  action: string;
  userId: string;
  details: string;
  category: string;
}

function generateAuditEntries(): AuditEntry[] {
  return Array.from({ length: 20 }, (_, i) => ({
    id: `audit_${Date.now()}_${i}`,
    timestamp: new Date(Date.now() - i * 3600000),
    action: ["task_approved", "task_rejected", "task_escalated", "login", "export", "config_change"][i % 6],
    userId: ["reviewer_001", "admin_user", "ai_engine"][i % 3],
    details: `Audit entry ${i + 1} for compliance tracking`,
    category: ["data_integrity", "access_control", "electronic_signature", "audit_trail"][i % 4],
  }));
}

export function ComplianceSection({ onNavigate }: ComplianceSectionProps) {
  const [complianceData] = useState(mockStats.complianceStatus);
  const [recentAudits] = useState<AuditEntry[]>(generateAuditEntries());
  const [selectedFramework, setSelectedFramework] = useState<string>("fda");
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);

  const showToast = (type: string, message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleGenerateReport = (framework: string) => {
    showToast("info", `Generating ${framework.toUpperCase()} compliance report...`);
    setTimeout(() => {
      showToast("success", `${framework.toUpperCase()} report ready for download`);
    }, 1800);
  };

  const handleRunAudit = () => {
    showToast("info", "Running comprehensive compliance audit...");
    setTimeout(() => {
      showToast("success", "Audit complete • All systems compliant");
    }, 2800);
  };

  const averageScore = useMemo(() => {
    const values = Object.values(complianceData);
    if (values.length === 0) return 0;
    return Math.round(values.reduce((s, d) => s + d.score, 0) / values.length);
  }, [complianceData]);

  const compliantCount = useMemo(
    () => Object.values(complianceData).filter((d) => d.status === "compliant").length,
    [complianceData],
  );

  const totalOpenIssues = useMemo(
    () => Object.values(complianceData).reduce((s, d) => s + d.openIssues, 0),
    [complianceData],
  );

  const nextAuditDate = useMemo(() => {
    const dates = Object.values(complianceData).map((d) => new Date(d.nextAudit).getTime());
    return dates.length > 0 ? new Date(Math.min(...dates)).toLocaleDateString() : "—";
  }, [complianceData]);

  return (
    <div className="space-y-6">
      <BackToDashboard onNavigate={onNavigate} />
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compliance Center</h1>
          <p className="text-sm text-gray-500 mt-1">
            Regulatory compliance monitoring and reporting
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
          <button type="button" onClick={handleRunAudit} className="btn btn-primary">
            🔍 Run Full Audit
          </button>
        </div>
      </div>

      {/* Framework Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {frameworks.map((fw) => {
          const data = complianceData[fw.key];
          const isSelected = selectedFramework === fw.shortKey;
          return (
            <button
              key={fw.key}
              type="button"
              onClick={() => setSelectedFramework(fw.shortKey)}
              className={`text-left bg-white rounded-xl border-2 p-5 cursor-pointer transition-all ${
                isSelected
                  ? "border-blue-500 ring-2 ring-blue-200"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{fw.icon}</span>
                <div>
                  <h3 className="font-semibold text-sm text-gray-900">{fw.name}</h3>
                  <p className="text-xs text-gray-500">{fw.description}</p>
                </div>
              </div>

              {data ? (
                <>
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">Compliance Score</span>
                      <span
                        className={`text-lg font-bold ${
                          data.score >= 98
                            ? "text-emerald-600"
                            : data.score >= 95
                              ? "text-blue-600"
                              : data.score >= 90
                                ? "text-amber-600"
                                : "text-red-600"
                        }`}
                      >
                        {data.score}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          data.score >= 98
                            ? "bg-emerald-500"
                            : data.score >= 95
                              ? "bg-blue-500"
                              : data.score >= 90
                                ? "bg-amber-500"
                                : "bg-red-500"
                        }`}
                        style={{ width: `${data.score}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status</span>
                      <span
                        className={`font-medium px-2 py-0.5 rounded ${
                          data.status === "compliant"
                            ? "bg-emerald-100 text-emerald-700"
                            : data.status === "warning"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {data.status.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Findings</span>
                      <span
                        className={
                          data.findings > 0
                            ? "text-red-600 font-medium"
                            : "text-gray-700"
                        }
                      >
                        {data.findings}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Next Audit</span>
                      <span className="text-gray-700">
                        {new Date(data.nextAudit).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center text-gray-400">
                  <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-xs">Loading...</p>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Detailed View */}
      {selectedFramework && complianceData[frameworks.find((f) => f.shortKey === selectedFramework)!.key] && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 animate-slide-up">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {frameworks.find((f) => f.shortKey === selectedFramework)?.name} Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Requirements Status</h3>
              <div className="space-y-2">
                {getRequirements(selectedFramework).map((req, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50"
                  >
                    <span
                      className={`w-5 h-5 flex items-center justify-center rounded ${
                        req.compliant
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {req.compliant ? "✓" : "✗"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700">{req.name}</p>
                      <p className="text-xs text-gray-500">{req.section}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        req.compliant
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {req.compliant ? "Pass" : "Fail"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Recent Audit Trail</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recentAudits.slice(0, 10).map((entry) => (
                  <div key={entry.id} className="p-2 bg-slate-50 rounded text-sm">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-xs text-gray-500">{entry.id}</span>
                      <span className="text-xs text-gray-400">
                        {formatTimeAgo(entry.timestamp)}
                      </span>
                    </div>
                    <p className="text-gray-700 mt-1">{entry.details}</p>
                    <div className="flex gap-2 mt-1 text-xs text-gray-500">
                      <span>{entry.action.replace(/_/g, " ")}</span>
                      <span>•</span>
                      <span>{entry.userId}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 flex gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => handleGenerateReport(selectedFramework)}
              className="btn btn-primary"
            >
              📄 Generate Report
            </button>
            <button
              type="button"
              onClick={() => onNavigate("audit")}
              className="btn btn-secondary"
            >
              📋 Full Audit Trail →
            </button>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 text-white">
        <h3 className="font-semibold mb-4">Overall Compliance Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-slate-400 mb-1">Average Score</p>
            <p className="text-2xl font-bold">{averageScore}%</p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Frameworks Compliant</p>
            <p className="text-2xl font-bold text-emerald-400">
              {compliantCount}/{Object.keys(complianceData).length}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Open Issues</p>
            <p className="text-2xl font-bold text-amber-400">{totalOpenIssues}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Next Audit</p>
            <p className="text-lg font-bold">{nextAuditDate}</p>
          </div>
        </div>
      </div>

      {toast && <Toast type={toast.type} message={toast.message} />}
    </div>
  );
}

function getRequirements(
  framework: string,
): Array<{ name: string; section: string; compliant: boolean }> {
  const requirements: Record<
    string,
    Array<{ name: string; section: string; compliant: boolean }>
  > = {
    fda: [
      { name: "Electronic Signatures", section: "§11.50", compliant: true },
      { name: "Audit Trail", section: "§11.10", compliant: true },
      { name: "System Validation", section: "§11.10(a)", compliant: true },
      { name: "Access Controls", section: "§11.10(d)", compliant: true },
      { name: "Electronic Records", section: "§11.1", compliant: true },
      { name: "Operator Training", section: "§11.5(i)", compliant: true },
    ],
    ema: [
      { name: "Risk Assessment", section: "Annex 11.1", compliant: true },
      { name: "Data Integrity", section: "Annex 11.3", compliant: true },
      { name: "Audit Trail", section: "Annex 11.9", compliant: true },
      { name: "Backup & Recovery", section: "Annex 11.12", compliant: true },
      { name: "Access Control", section: "Annex 11.7", compliant: true },
    ],
    gdpr: [
      { name: "Lawful Basis", section: "Art. 6", compliant: true },
      { name: "Data Subject Rights", section: "Art. 15-22", compliant: true },
      { name: "Data Protection Officer", section: "Art. 37", compliant: true },
      { name: "Breach Notification", section: "Art. 33-34", compliant: true },
      { name: "International Transfers", section: "Ch. V", compliant: true },
    ],
    hipaa: [
      { name: "Privacy Rule", section: "164.502", compliant: false },
      { name: "Security Rule", section: "164.308", compliant: true },
      { name: "Breach Notification", section: "164.408", compliant: true },
      { name: "Minimum Necessary", section: "164.502(b)", compliant: true },
      { name: "Administrative Safeguards", section: "164.308(a)(1)", compliant: true },
    ],
  };
  return requirements[framework] || [];
}

function formatTimeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
}
