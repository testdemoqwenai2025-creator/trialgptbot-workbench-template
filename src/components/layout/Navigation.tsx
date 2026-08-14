"use client";

import { useState } from "react";
import { SectionId } from "@/lib/trialgptbot";

interface NavigationProps {
  active: SectionId;
  onNavigate: (id: SectionId) => void;
}

const titles: Record<SectionId, string> = {
  dashboard: "Review Dashboard",
  trials: "Clinical Trials",
  review: "Task Review Queue",
  edc: "EDC Integration",
  compliance: "Compliance Center",
  audit: "Audit Trail",
  analytics: "Analytics",
  settings: "Settings",
  "api-docs": "API Documentation",
  "privacy-ml": "Privacy-Preserving ML",
  "digital-twin": "Digital Twin Prototypes",
  edge: "Edge Computing",
  calibration: "ML-Based Confidence Calibration",
  federated: "Federated Learning Prototype",
  "nlp-transformers": "NLP Enhancement with Fine-Tuned Transformers",
  mlops: "Comprehensive MLOps Infrastructure",
  "advanced-analytics": "Advanced Analytics",
  quantum: "Quantum Computing Partnerships",
  autonomous: "Autonomous Clinical Intelligence Systems",
  "neuro-symbolic": "Neuro-Symbolic AI Architecture",
};

export function Navigation({ active, onNavigate }: NavigationProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // No-op: just clear search
    setSearchQuery("");
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex-shrink-0 dark:bg-slate-900 dark:border-slate-800">
      <div className="flex items-center justify-between">
        {/* Left Section: Logo & Breadcrumb */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onNavigate("dashboard")}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-shadow">
              T
            </div>
            <div className="hidden md:block">
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                TrialGPTBot Enterprise
              </h1>
              <p className="text-xs text-gray-500">AI-Powered Clinical Trials</p>
            </div>
          </button>

          <nav className="hidden lg:flex items-center gap-2 text-sm">
            <span className="text-gray-400">/</span>
            <span className="text-gray-700 font-medium">{titles[active]}</span>
          </nav>
        </div>

        {/* Center: Search */}
        <form
          onSubmit={handleSearch}
          className="flex-1 max-w-xl mx-8 hidden md:block"
        >
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search trials, subjects, forms, tasks..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:focus:bg-slate-900 dark:focus:border-blue-500 dark:focus:ring-blue-900/40 dark:placeholder-slate-500"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </form>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span>Systems Online</span>
          </div>

          <button
            type="button"
            className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-lg transition-colors dark:hover:bg-slate-800"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                SC
              </div>
              <span className="hidden md:block text-sm font-medium text-slate-700 dark:text-slate-200">
                Dr. Chen
              </span>
              <svg
                className="w-4 h-4 text-slate-400 hidden md:block"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-slide-up dark:bg-slate-900 dark:border-slate-700">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Dr. Sarah Chen</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Senior Clinical Reviewer</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate("settings");
                    setShowUserMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Profile Settings
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate("settings");
                    setShowUserMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Preferences
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate("api-docs");
                    setShowUserMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  API Keys &amp; Integrations
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate("edge");
                    setShowUserMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Edge Deployment Hub
                </button>
                <div className="border-t border-slate-100 mt-2 pt-2 dark:border-slate-800">
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
