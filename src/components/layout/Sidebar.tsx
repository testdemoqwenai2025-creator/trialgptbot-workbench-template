"use client";

import { SectionId } from "@/lib/trialgptbot";

interface NavItem {
  id: SectionId;
  label: string;
  icon: string;
  badge?: string;
  description: string;
}

const mainNavItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Review Dashboard",
    icon: "📊",
    badge: "47",
    description: "AI-powered task review queue",
  },
  {
    id: "trials",
    label: "Clinical Trials",
    icon: "🧪",
    badge: "12",
    description: "Manage trial protocols and data",
  },
  {
    id: "review",
    label: "Task Queue",
    icon: "✅",
    badge: "23",
    description: "Boolean confirmation workflow",
  },
  {
    id: "edc",
    label: "EDC Systems",
    icon: "🔗",
    description: "External system integrations",
  },
  {
    id: "edge",
    label: "Edge Computing",
    icon: "🛰️",
    description: "Offline-capable fleet + wizard",
  },
];

const secondaryNavItems: NavItem[] = [
  {
    id: "compliance",
    label: "Compliance Center",
    icon: "🛡️",
    description: "Regulatory compliance status",
  },
  {
    id: "audit",
    label: "Audit Trail",
    icon: "📋",
    description: "Complete audit log",
  },
  {
    id: "privacy-ml",
    label: "Privacy-Preserving ML",
    icon: "🔐",
    description: "Differential privacy + SMPC",
  },
  {
    id: "digital-twin",
    label: "Digital Twin Prototypes",
    icon: "🧬",
    description: "Subject simulation & what-if",
  },
  {
    id: "calibration",
    label: "Confidence Calibration",
    icon: "🎯",
    description: "ML recalibration on audit trail",
  },
  {
    id: "federated",
    label: "Federated Learning",
    icon: "🌐",
    description: "Cross-trial encrypted gradients",
  },
  {
    id: "nlp-transformers",
    label: "NLP Transformers",
    icon: "🧠",
    description: "Fine-tuned clinical LLMs",
  },
  {
    id: "mlops",
    label: "MLOps Infrastructure",
    icon: "⚙️",
    description: "Versioning + A/B + monitoring",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: "📈",
    description: "Performance insights",
  },
  {
    id: "advanced-analytics",
    label: "Advanced Analytics",
    icon: "📊",
    description: "Funnels · KPI tree · anomalies",
  },
  {
    id: "quantum",
    label: "Quantum Computing",
    icon: "⚛️",
    description: "IBM Q · Google · free-tier QPU",
  },
  {
    id: "autonomous",
    label: "Autonomous AI Systems",
    icon: "🤖",
    description: "Level 5 autonomy · self-improving",
  },
  {
    id: "neuro-symbolic",
    label: "Neuro-Symbolic AI",
    icon: "🧠",
    description: "Neural + symbolic hybrid",
  },
];

const settingsNavItems: NavItem[] = [
  {
    id: "settings",
    label: "Settings",
    icon: "⚙️",
    description: "Application configuration",
  },
  {
    id: "api-docs",
    label: "API Documentation",
    icon: "📖",
    description: "Developer resources",
  },
];

interface SidebarProps {
  active: SectionId;
  onNavigate: (id: SectionId) => void;
}

export function Sidebar({ active, onNavigate }: SidebarProps) {
  const renderItem = (item: NavItem) => {
    const isActive = active === item.id;
    return (
      <li key={item.id}>
        <button
          type="button"
          onClick={() => onNavigate(item.id)}
          className={`sidebar-nav-item group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full text-left ${
            isActive
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
              : "text-slate-300 hover:bg-slate-800 hover:text-white dark:hover:bg-slate-800/60"
          }`}
          aria-current={isActive ? "page" : undefined}
        >
          <span className="text-xl">{item.icon}</span>
          <div className="flex-1 min-w-0">
            <span className="block text-sm font-medium truncate">{item.label}</span>
            <span
              className={`block text-xs truncate ${
                isActive ? "text-blue-200" : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {item.description}
            </span>
          </div>
          {item.badge && (
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                isActive ? "bg-white/20 text-white" : "bg-slate-700 text-slate-300 dark:bg-slate-700/80"
              }`}
            >
              {item.badge}
            </span>
          )}
        </button>
      </li>
    );
  };

  return (
    <aside
      className="sidebar-shell w-64 bg-slate-900 text-white flex flex-col flex-shrink-0 dark:bg-slate-950 dark:border-r dark:border-slate-800"
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-slate-800 dark:border-slate-800">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
            T
          </div>
          <div>
            <h2 className="font-bold text-sm">TrialGPTBot</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">Enterprise v2.5</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        <div>
          <p className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-500">
            Main
          </p>
          <ul className="space-y-1">{mainNavItems.map(renderItem)}</ul>
        </div>

        <div>
          <p className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-500">
            Governance
          </p>
          <ul className="space-y-1">{secondaryNavItems.map(renderItem)}</ul>
        </div>

        <div>
          <p className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-500">
            System
          </p>
          <ul className="space-y-1">{settingsNavItems.map(renderItem)}</ul>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800 dark:border-slate-800">
        <div className="mb-4 p-3 bg-slate-800 rounded-lg dark:bg-slate-900/80">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400 dark:text-slate-500">System Health</span>
            <span className="text-emerald-400 font-medium">98.7%</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden dark:bg-slate-700/60">
            <div className="h-full w-[98.7%] bg-emerald-500 rounded-full"></div>
          </div>
        </div>

        <div className="space-y-2 text-xs text-slate-400 dark:text-slate-500">
          <a href="#" className="block hover:text-white transition-colors">
            Documentation
          </a>
          <a href="#" className="block hover:text-white transition-colors">
            Support Portal
          </a>
          <a href="#" className="block hover:text-white transition-colors">
            What&apos;s New v2.5
          </a>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-600">
          <span>FDA 21 CFR 11</span>
          <span>•</span>
          <span>EMA Annex 11</span>
          <span>•</span>
          <span>GDP</span>
        </div>
      </div>
    </aside>
  );
}
