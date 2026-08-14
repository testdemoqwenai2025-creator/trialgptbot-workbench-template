"use client";

import { ReactNode } from "react";

interface ModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  maxWidth?: string;
}

export function Modal({ title, children, onClose, maxWidth = "max-w-md" }: ModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl p-6 w-full ${maxWidth} max-h-[90vh] overflow-y-auto animate-slide-up`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

interface ToastProps {
  type: string;
  message: string;
}

export function Toast({ type, message }: ToastProps) {
  return <div className={`toast toast-${type}`}>{message}</div>;
}

// Reusable badges
export function PriorityBadge({ priority }: { priority: string }) {
  const config: Record<string, string> = {
    critical: "bg-red-100 text-red-800",
    high: "bg-orange-100 text-orange-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
        config[priority] || config.low
      }`}
    >
      {priority.toUpperCase()}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    pending_review: "bg-slate-100 text-slate-700",
    in_progress: "bg-blue-100 text-blue-700",
    completed: "bg-emerald-100 text-emerald-700",
    escalated: "bg-purple-100 text-purple-700",
  };
  const labels: Record<string, string> = {
    pending_review: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
    escalated: "Escalated",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
        config[status] || config.pending_review
      }`}
    >
      {labels[status] || status}
    </span>
  );
}

export function ConfidenceBadge({
  level,
  score,
  color,
}: {
  level: string;
  score: number;
  color: string;
}) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    amber: "bg-amber-500",
    orange: "bg-orange-500",
    red: "bg-red-500",
  };
  const icons: Record<string, string> = {
    very_high: "✓",
    high: "↑",
    medium: "→",
    low: "↓",
    very_low: "!",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
        colors[color] || colors.blue
      } text-white`}
    >
      <span>{icons[level]}</span>
      {level
        .replace("_", " ")
        .replace(/\b\w/g, (l) => l.toUpperCase())}
      <span className="bg-white/20 px-1 rounded">{score}%</span>
    </span>
  );
}

export function RiskIndicator({
  category,
  score,
}: {
  category: string;
  score: number;
}) {
  const getColor = (s: number) =>
    s >= 80 ? "bg-red-500" : s >= 60 ? "bg-orange-500" : s >= 40 ? "bg-yellow-500" : "bg-green-500";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600 capitalize">{category.replace(/_/g, " ")}</span>
        <span className="font-semibold">{score}/100</span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor(score)} confidence-bar`}
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );
}

export function EDCBadge({
  source,
}: {
  source: { type: string; label: string; color: string };
}) {
  const colors: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
    cyan: "bg-cyan-50 text-cyan-700 border-cyan-200",
    teal: "bg-teal-50 text-teal-700 border-teal-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
        colors[source.color] || colors.indigo
      }`}
    >
      {source.label}
    </span>
  );
}
