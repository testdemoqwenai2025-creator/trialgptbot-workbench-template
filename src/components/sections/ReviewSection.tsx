"use client";

import { useState, useMemo } from "react";
import { Task, generateMockTasks, formatTimeAgo, SectionId } from "@/lib/trialgptbot";
import { Toast, PriorityBadge, ConfidenceBadge, EDCBadge } from "./_shared";
import { BackToDashboard } from "./_BackToDashboard";

interface ReviewSectionProps {
  onNavigate: (id: SectionId) => void;
}

export function ReviewSection({ onNavigate }: ReviewSectionProps) {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const all = generateMockTasks(40);
    return all.filter((t) => t.status === "pending_review" || t.status === "in_progress");
  });
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);

  const handleDecision = (taskId: string, decision: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: "completed",
              decision: decision === "approve" ? "approved" : "rejected",
            }
          : t,
      ),
    );
    showToast("success", `Task ${taskId} ${decision}d`);
    if (selectedTask?.id === taskId) setSelectedTask(null);
  };

  const handleBulkDecision = (action: string) => {
    setTimeout(() => {
      const ids = Array.from(selectedIds);
      setTasks((prev) =>
        prev.map((t) => {
          if (!ids.includes(t.id)) return t;
          if (action === "escalate") return { ...t, status: "escalated" };
          return {
            ...t,
            status: "completed",
            decision: action === "approve" ? "approved" : "rejected",
          };
        }),
      );
      showToast("success", `${ids.length} tasks ${action}ed`);
      setSelectedIds(new Set());
    }, 400);
  };

  const toggleSelection = (taskId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  const showToast = (type: string, message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const pendingCount = tasks.filter((t) => t.status !== "completed").length;

  return (
    <div className="space-y-6">
      <BackToDashboard onNavigate={onNavigate} />
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Review Queue</h1>
          <p className="text-sm text-gray-500 mt-1">
            {pendingCount} tasks awaiting Boolean confirmation
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setBatchMode(!batchMode)}
            className={`btn ${batchMode ? "btn-primary" : "btn-secondary"}`}
          >
            {batchMode ? "✓ Batch Mode On" : "Batch Mode"}
          </button>
          <button
            type="button"
            onClick={() => onNavigate("dashboard")}
            className="btn btn-secondary"
          >
            ← Dashboard
          </button>
        </div>
      </div>

      {/* Batch Mode Bar */}
      {batchMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 animate-slide-up">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
            <span className="font-medium text-blue-800">
              {selectedIds.size} tasks selected
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedIds(new Set(tasks.map((t) => t.id)))}
                className="px-3 py-1.5 bg-white text-blue-700 text-sm rounded-lg border border-blue-200 hover:bg-blue-50"
              >
                Select All ({pendingCount})
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="px-3 py-1.5 bg-white text-red-600 text-sm rounded-lg border border-red-200 hover:bg-red-50"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleBulkDecision("approve")}
              disabled={selectedIds.size === 0}
              className="flex-1 btn btn-success disabled:opacity-50"
            >
              ✓ Approve Selected ({selectedIds.size})
            </button>
            <button
              type="button"
              onClick={() => handleBulkDecision("reject")}
              disabled={selectedIds.size === 0}
              className="flex-1 btn btn-danger disabled:opacity-50"
            >
              ✗ Reject Selected ({selectedIds.size})
            </button>
            <button
              type="button"
              onClick={() => handleBulkDecision("escalate")}
              disabled={selectedIds.size === 0}
              className="flex-1 btn btn-warning disabled:opacity-50"
            >
              ↑ Escalate ({selectedIds.size})
            </button>
          </div>
        </div>
      )}

      {/* Task List */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading review queue...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`bg-white rounded-xl border-2 p-5 transition-all ${
                selectedTask?.id === task.id
                  ? "border-blue-500 ring-2 ring-blue-200"
                  : batchMode && selectedIds.has(task.id)
                    ? "border-blue-400 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-start gap-4">
                {batchMode && (
                  <input
                    type="checkbox"
                    checked={selectedIds.has(task.id)}
                    onChange={() => toggleSelection(task.id)}
                    className="mt-1 w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-mono font-semibold text-gray-900">{task.id}</span>
                    <PriorityBadge priority={task.priority} />
                    <ConfidenceBadge
                      level={task.confidence.level}
                      score={task.confidence.score}
                      color={task.confidence.color}
                    />
                    {task.isOverdue && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded animate-pulse">
                        OVERDUE
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-700 mb-2">
                    <strong>{task.formId}</strong> • Subject: {task.subjectId} • Trial:{" "}
                    {task.trialId}
                  </p>

                  <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg mb-3">
                    <div>
                      <span className="text-xs text-gray-500 block">Original Value</span>
                      <span className="font-mono text-sm text-gray-800">
                        {task.originalValue || "(empty/null)"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block">AI Suggestion</span>
                      <span className="font-mono text-sm text-blue-600 font-semibold">
                        {task.aiSuggestedValue}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                    <EDCBadge source={task.edcSource} />
                    <span>Risk: {task.riskScore}/100</span>
                    <span>Due: {task.dueDate.toLocaleDateString()}</span>
                    <span>Updated: {formatTimeAgo(task.updatedAt)}</span>
                  </div>
                </div>

                {task.status !== "completed" && (
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => handleDecision(task.id, "approve")}
                      className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      ✓ Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDecision(task.id, "reject")}
                      className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
                    >
                      ✗ Reject
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedTask(selectedTask?.id === task.id ? null : task)
                      }
                      className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      👁 Details
                    </button>
                  </div>
                )}

                {task.status === "completed" && (
                  <div
                    className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                      task.decision === "approved"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {task.decision === "approved" ? "✓ Approved" : "✗ Rejected"}
                  </div>
                )}
              </div>

              {selectedTask?.id === task.id && (
                <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                  <h4 className="font-semibold text-gray-900">Task Details</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Field ID:</span>{" "}
                      <span className="font-mono">{task.fieldId}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Risk Category:</span>{" "}
                      {task.riskCategory.replace(/_/g, " ")}
                    </div>
                    <div>
                      <span className="text-gray-500">Confidence:</span>{" "}
                      {task.confidence.score}% ({task.confidence.level})
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-amber-800 mb-1">
                      ⚠️ Reviewer Guidance
                    </p>
                    <p className="text-sm text-amber-700">
                      This task has {task.confidence.level.replace(/_/g, " ")} confidence.{" "}
                      {task.confidence.score >= 85
                        ? "AI suggestion can be accepted with minimal review."
                        : task.confidence.score >= 70
                          ? "Review suggested values carefully before deciding."
                          : "Manual verification strongly recommended."}
                    </p>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleDecision(task.id, "approve")}
                      className="btn btn-success flex-1"
                    >
                      Confirm Approval
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDecision(task.id, "reject")}
                      className="btn btn-danger flex-1"
                    >
                      Confirm Rejection
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedTask(null)}
                      className="btn btn-secondary flex-1"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {toast && <Toast type={toast.type} message={toast.message} />}
    </div>
  );
}
