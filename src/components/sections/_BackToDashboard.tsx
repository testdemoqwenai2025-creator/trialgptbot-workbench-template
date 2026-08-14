"use client";

import { SectionId } from "@/lib/trialgptbot";

/**
 * BackToDashboard — shared "← Back to Dashboard" pill button rendered
 * at the top of every secondary section page. Provides a consistent
 * escape hatch back to the dashboard from anywhere in the app.
 *
 * The Dashboard section itself never renders this (you're already there).
 */
interface BackToDashboardProps {
  onNavigate: (id: SectionId) => void;
  /** Optional label override. Default "← Back to Dashboard". */
  label?: string;
  /** Optional secondary action — typically a quick-jump to a related section. */
  secondary?: { label: string; target: SectionId };
}

export function BackToDashboard({
  onNavigate,
  label = "← Back to Dashboard",
  secondary,
}: BackToDashboardProps) {
  return (
    <div className="page-back-row">
      <button
        type="button"
        onClick={() => onNavigate("dashboard")}
        className="btn btn-secondary back-to-dashboard-btn"
        aria-label="Back to Dashboard"
      >
        {label}
      </button>
      {secondary && (
        <button
          type="button"
          onClick={() => onNavigate(secondary.target)}
          className="btn btn-ghost back-to-dashboard-btn-secondary"
        >
          {secondary.label} →
        </button>
      )}
    </div>
  );
}

export default BackToDashboard;
