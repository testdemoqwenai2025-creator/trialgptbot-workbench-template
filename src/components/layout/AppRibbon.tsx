"use client";

import { useState } from "react";
import type { SectionId } from "@/lib/trialgptbot";
import { useTheme } from "@/hooks/use-theme";

interface AppRibbonProps {
  active: SectionId;
  onNavigate: (id: SectionId) => void;
  pendingCount?: number;
  trialsCount?: number;
}

interface DropdownEntry {
  icon: string;
  label: string;
  target: SectionId;
}

interface MenuItem {
  id: SectionId;
  icon: string;
  label: string;
  caret?: boolean;
  count?: number;
  dropdown?: DropdownEntry[];
}

const MENU_ITEMS: MenuItem[] = [
  { id: "dashboard", icon: "🏠", label: "Dashboard" },
  {
    id: "trials",
    icon: "🧪",
    label: "Clinical Trials",
    caret: true,
    count: 12,
    dropdown: [
      { icon: "📋", label: "Active Protocols", target: "trials" },
      { icon: "📝", label: "Case Report Forms", target: "trials" },
      { icon: "✍️", label: "Informed Consent", target: "trials" },
      { icon: "📊", label: "Statistical Plans", target: "trials" },
    ],
  },
  {
    id: "review",
    icon: "✅",
    label: "Task Queue",
    caret: true,
    count: 23,
    dropdown: [
      { icon: "⚡", label: "Pending Review", target: "review" },
      { icon: "🔄", label: "In Progress", target: "review" },
      { icon: "🚨", label: "Escalated", target: "review" },
      { icon: "✓", label: "Auto-Approve High Conf.", target: "review" },
    ],
  },
  { id: "edc", icon: "🔗", label: "EDC Systems" },
  { id: "edge", icon: "🛰️", label: "Edge Computing" },
  {
    id: "calibration",
    icon: "🧪",
    label: "AI Lab",
    caret: true,
    dropdown: [
      { icon: "🎯", label: "Confidence Calibration", target: "calibration" },
      { icon: "🌐", label: "Federated Learning", target: "federated" },
      { icon: "🧠", label: "NLP Transformers", target: "nlp-transformers" },
      { icon: "⚙️", label: "MLOps Infrastructure", target: "mlops" },
      { icon: "📊", label: "Advanced Analytics", target: "advanced-analytics" },
      { icon: "🔐", label: "Privacy-Preserving ML", target: "privacy-ml" },
      { icon: "🧬", label: "Digital Twin Prototypes", target: "digital-twin" },
    ],
  },
  {
    id: "quantum",
    icon: "⚛️",
    label: "Frontier AI",
    caret: true,
    dropdown: [
      { icon: "⚛️", label: "Quantum Computing", target: "quantum" },
      { icon: "🤖", label: "Autonomous AI Systems", target: "autonomous" },
      { icon: "🧠", label: "Neuro-Symbolic Architecture", target: "neuro-symbolic" },
    ],
  },
  {
    id: "compliance",
    icon: "🛡️",
    label: "Compliance Hub",
    caret: true,
    dropdown: [
      { icon: "📚", label: "Regulation Library", target: "compliance" },
      { icon: "🏥", label: "HIPAA Guidelines", target: "compliance" },
      { icon: "💊", label: "FDA 21 CFR Part 11", target: "compliance" },
      { icon: "🇪🇺", label: "EMA Guidelines", target: "compliance" },
    ],
  },
  {
    id: "audit",
    icon: "🔍",
    label: "Audit Trail",
    caret: true,
    dropdown: [
      { icon: "📜", label: "Activity Logs", target: "audit" },
      { icon: "👤", label: "User Actions", target: "audit" },
      { icon: "⚙️", label: "System Changes", target: "audit" },
    ],
  },
  { id: "analytics", icon: "📈", label: "Analytics" },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

export function AppRibbon({
  active,
  onNavigate,
  pendingCount = 47,
  trialsCount = 12,
}: AppRibbonProps) {
  const [portalClicked, setPortalClicked] = useState(false);
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);
  const { theme, toggleTheme, mounted } = useTheme();

  const showToast = (type: string, message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const handlePortal = () => {
    setPortalClicked(true);
    showToast("info", "Access Portal — connect to backend for full authentication");
    setTimeout(() => setPortalClicked(false), 1500);
  };

  const handleQuickGenerate = () => {
    onNavigate("trials");
    showToast("success", "Opening Clinical Trials to create a new protocol");
  };

  const handleExport = () => {
    showToast("info", "Export: use the 📥 Export button inside Review Dashboard to choose CSV / JSON / PDF / XML");
  };

  const handleToggleTheme = () => {
    toggleTheme();
    showToast(
      "info",
      theme === "dark" ? "Switched to light mode" : "Switched to dark mode"
    );
  };

  return (
    <div className="app-ribbon" role="banner" aria-label="TrialGPTBot Enterprise ribbon">
      <div className="ribbon-content">
        {/* Top Row: Brand + Status + Stats + Portal */}
        <div className="ribbon-top-row">
          <button
            type="button"
            className="ribbon-brand"
            onClick={() => onNavigate("dashboard")}
            aria-label="TrialGPTBot home"
          >
            <div className="ribbon-logo" aria-hidden="true">T</div>
            <span className="ribbon-brand-text">TrialGPTBot</span>
            <span className="ribbon-version-pill">✨ AI Enterprise v2.5</span>
          </button>

          <div className="ribbon-badge" aria-live="polite">
            <span className="ribbon-status-dot" aria-hidden="true" />
            System Online — All Services Operational
          </div>

          <div className="ribbon-stats" aria-label="Live platform metrics">
            <div className="ribbon-stat">
              <div className="ribbon-stat-value">{pendingCount}</div>
              <div className="ribbon-stat-label">Pending</div>
            </div>
            <div className="ribbon-stat">
              <div className="ribbon-stat-value">{trialsCount}</div>
              <div className="ribbon-stat-label">Trials</div>
            </div>
            <div className="ribbon-stat">
              <div className="ribbon-stat-value">99%</div>
              <div className="ribbon-stat-label">Automated</div>
            </div>
            <div className="ribbon-stat">
              <div className="ribbon-stat-value">24/7</div>
              <div className="ribbon-stat-label">AI Active</div>
            </div>
          </div>

          <button
            type="button"
            className="ribbon-portal-btn"
            onClick={handlePortal}
            aria-label="Access portal login"
          >
            {portalClicked ? "✓ Welcome" : "🔐 Access Portal"}
          </button>

          <button
            type="button"
            className="ribbon-theme-btn"
            onClick={handleToggleTheme}
            aria-label={
              mounted
                ? theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
                : "Toggle theme"
            }
            title={
              mounted
                ? theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
                : "Toggle theme"
            }
          >
            <span className="ribbon-theme-icon" aria-hidden="true">
              {mounted ? (theme === "dark" ? "☀️" : "🌙") : "🌗"}
            </span>
            <span className="ribbon-theme-label">
              {mounted ? (theme === "dark" ? "Light" : "Dark") : "Theme"}
            </span>
          </button>
        </div>

        {/* Menu Bar — prominent navigation */}
        <nav className="ribbon-menu-bar" aria-label="Primary ribbon navigation">
          <ul className="ribbon-menu-items">
            {MENU_ITEMS.map((item) => {
              const isActive = active === item.id;
              return (
                <li key={item.id} className="ribbon-menu-item">
                  <button
                    type="button"
                    className={`ribbon-menu-link${isActive ? " active" : ""}`}
                    onClick={() => onNavigate(item.id)}
                    aria-current={isActive ? "page" : undefined}
                    aria-haspopup={item.dropdown ? "menu" : undefined}
                    aria-expanded={item.dropdown ? "false" : undefined}
                  >
                    <span className="ribbon-menu-icon" aria-hidden="true">{item.icon}</span>
                    {item.label}
                    {item.count !== undefined && (
                      <span className="ribbon-menu-count">{item.count}</span>
                    )}
                    {item.caret && <span className="ribbon-menu-caret" aria-hidden="true">▼</span>}
                  </button>

                  {item.dropdown && (
                    <ul className="ribbon-dropdown" role="menu">
                      {item.dropdown.map((entry) => (
                        <li key={entry.label} role="none">
                          <button
                            type="button"
                            className="ribbon-dropdown-item"
                            role="menuitem"
                            onClick={() => onNavigate(entry.target)}
                          >
                            <span className="ribbon-dropdown-item-icon" aria-hidden="true">{entry.icon}</span>
                            {entry.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="ribbon-menu-right">
            <button
              type="button"
              className="ribbon-quick-btn"
              onClick={handleQuickGenerate}
              aria-label="Quick generate a new trial"
            >
              ⚡ Quick Generate
            </button>
            <button
              type="button"
              className="ribbon-export-btn"
              onClick={handleExport}
              aria-label="Export report"
            >
              📥 Export
            </button>
          </div>
        </nav>
      </div>

      {toast && (
        <div
          role="status"
          aria-live="polite"
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
            maxWidth: "30rem",
            boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
            background:
              toast.type === "success"
                ? "#059669"
                : toast.type === "warning"
                  ? "#d97706"
                  : toast.type === "error"
                    ? "#dc2626"
                    : "#2563eb",
            animation: "slideUp 0.3s ease-out",
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default AppRibbon;
