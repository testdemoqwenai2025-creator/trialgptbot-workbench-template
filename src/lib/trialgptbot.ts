// Shared types for TrialGPTBot Enterprise

export type SectionId =
  | "dashboard"
  | "trials"
  | "review"
  | "edc"
  | "compliance"
  | "audit"
  | "analytics"
  | "settings"
  | "api-docs"
  | "privacy-ml"
  | "digital-twin"
  | "edge"
  | "calibration"
  | "federated"
  | "nlp-transformers"
  | "mlops"
  | "advanced-analytics"
  | "quantum"
  | "autonomous"
  | "neuro-symbolic";

export interface Task {
  id: string;
  trialId: string;
  siteId?: string;
  subjectId: string;
  formId: string;
  fieldId: string;
  originalValue: string | null;
  aiSuggestedValue: string;
  confidence: { level: string; score: number; color: string };
  priority: string;
  status: string;
  riskCategory: string;
  riskScore: number;
  edcSource: { type: string; label: string; color: string };
  createdAt: Date;
  updatedAt: Date;
  dueDate: Date;
  isOverdue: boolean;
  decision?: string;
  modelVersion?: string;
  processingTime?: number;
}

export interface Stats {
  totalTasks: number;
  pendingReview: number;
  inProgress: number;
  completed: number;
  escalated: number;
  criticalCount: number;
  overdueCount: number;
  avgConfidence: number;
  reviewerStats: {
    tasksToday: number;
    avgReviewTime: number;
    approvalRate: number;
    accuracy: number;
    streak: number;
    totalReviewed?: number;
    teamRank?: number;
    percentileRank?: number;
  };
  edcStatus: Array<{
    system: string;
    status: string;
    uptime: number;
    latency: number;
    recordsProcessed: number;
  }>;
  complianceStatus: Record<
    string,
    {
      score: number;
      status: "compliant" | "warning" | "non_compliant" | "pending_review";
      lastAudit?: string;
      nextAudit: string;
      findings: number;
      openIssues: number;
    }
  >;
  systemHealth?: { overall: number; apiLatency: number; memoryUsage: number; cpuUsage: number };
  /**
   * AI confidence calibration metrics — computed from the production model's
   * recent predictions vs. reviewer ground truth. Used by the Advanced
   * Analytics dashboard panel.
   */
  calibration?: {
    modelVersion: string;
    brierScore: number;          // 0 = perfect, 1 = worst
    ece: number;                 // Expected Calibration Error, %
    logLoss: number;
    samples: number;
    driftDetected: boolean;
    driftMagnitude: number;      // % shift vs. baseline
    lastUpdated: string;         // ISO timestamp
    buckets: Array<{
      range: string;             // e.g. "80-90%"
      predicted: number;         // avg confidence in this bucket
      observed: number;          // actual approval rate in this bucket
      count: number;
    }>;
    trend: Array<{ ts: string; ece: number }>;
  };
  /**
   * Reviewer cognitive profile — derived from decision velocity, dwell time,
   * and decision-pattern analysis. Surfaced on the Advanced Analytics panel.
   */
  reviewerProfile?: {
    decisionVelocity: number;       // decisions per hour
    avgDwellMs: number;             // avg time on a task before deciding
    attentionScore: number;         // 0-100, higher = better sustained focus
    cognitiveLoadIndex: number;     // 0-100, higher = more taxed
    bias: {
      approveRatio: number;         // 0-1
      rejectRatio: number;          // 0-1
      escalationRatio: number;      // 0-1
      biasLabel: "balanced" | "approval-leaning" | "rejection-leaning" | "escalation-prone";
    };
    outlierDecisions: number;       // count of decisions that broke pattern
    fatigueRisk: "low" | "moderate" | "high";
    peakHours: string[];            // e.g. ["09:00-11:00", "14:00-16:00"]
  };
  /**
   * EDC predictive maintenance — derived from uptime trend, latency drift,
   * error rate, and MTBF. Powers the predictive alerts panel.
   */
  edcPredictive?: Array<{
    system: string;
    mtbfHours: number;              // mean time between failures
    degradationTrend: number;       // slope of latency drift, ms/week
    predictedFailureWindow: string; // e.g. "14-21 days" or "stable"
    healthScore: number;            // 0-100
    alertLevel: "none" | "advisory" | "warning" | "critical";
    alertMessage?: string;
    errorRate: number;              // %
    syncLag: number;                 // minutes since last successful sync
  }>;
  /**
   * Edge computing capabilities — lightweight inference models deployed
   * at trial sites for offline operation. Powers the Edge Computing
   * panel on the Advanced Analytics dashboard.
   *
   * Tech Readiness: Emerging | Impact: High | Complexity: Medium
   * Target: bandwidth-constrained environments in emerging markets.
   */
  edgeComputing?: {
    /** Aggregated KPIs across all edge deployments */
    kpis: {
      activeSites: number;             // sites running an edge inference model
      totalSites: number;              // sites targeted for edge rollout
      offlineCapablePct: number;       // % of sites that can operate fully offline, 0-100
      avgCompressionRatio: number;     // compressed/original model size, 0-1 (0.10-0.20 target)
      avgInferenceLatencyMs: number;   // mean on-device inference latency
      pendingSyncRecords: number;      // records queued locally awaiting cloud sync
      syncLagP95Min: number;           // 95th percentile sync delay in minutes
      bandwidthSavedPct: number;       // % bandwidth reduction vs. cloud-only operation
    };
    /** Per-site edge deployment status */
    sites: Array<{
      siteId: string;
      name: string;
      country: string;
      emergingMarket: boolean;         // true if bandwidth-constrained market
      status: "online" | "offline" | "degraded" | "syncing" | "pending_deploy";
      modelVersion: string;            // deployed edge model version
      originalModelSizeMb: number;
      compressedModelSizeMb: number;   // after quantization/pruning
      compressionRatio: number;        // 0-1
      inferenceLatencyMs: number;
      lastSyncIso: string;             // ISO timestamp of last successful sync
      pendingRecords: number;          // local queue depth awaiting sync
      conflictCount: number;           // eventual-consistency conflicts detected
      bandwidthKbps: number;           // observed uplink bandwidth
      storageUsedPct: number;          // 0-100, local storage utilisation
      healthScore: number;             // 0-100
    }>;
    /** Compression-technique breakdown for the deployed models */
    compressionTechniques: Array<{
      name: string;                    // e.g. "INT8 Quantization", "Structural Pruning"
      applied: boolean;
      sizeReductionPct: number;        // contribution to size reduction, 0-100
      latencyImpactPct: number;        // inference latency delta, negative = faster
      accuracyDeltaPct: number;        // accuracy change vs. baseline, can be negative
    }>;
    /** Local queue / eventual-consistency sync log */
    syncLog: Array<{
      ts: string;                      // ISO timestamp
      siteId: string;
      event: "queue" | "sync_started" | "sync_completed" | "conflict" | "merged";
      records: number;
      detail?: string;
    }>;
    lastUpdated: string;               // ISO timestamp
  };
}

export interface Trial {
  nctId: string;
  title: string;
  status: string;
  phase: string[];
  conditions: string[];
  interventions?: Array<{ type: string; name: string }>;
  locations?: Array<{ facility: string; city: string; country: string; status: string }>;
  hasResults: boolean;
}

export interface EDCSystem {
  id: string;
  name: string;
  type: string;
  status: "connected" | "degraded" | "disconnected" | "configuring";
  latency: number;
  lastSync: string;
  recordsProcessed: number;
  pendingRecords: number;
  version: string;
}

// ============ Mock data generators ============

const confidences = [
  { level: "very_high", score: 98, color: "emerald" },
  { level: "high", score: 89, color: "blue" },
  { level: "medium", score: 76, color: "amber" },
  { level: "low", score: 58, color: "orange" },
  { level: "very_low", score: 42, color: "red" },
] as const;

const priorities = ["critical", "high", "medium", "low"];
const statuses = ["pending_review", "in_progress", "completed", "escalated"];
const forms = ["ICF", "CRF", "AE", "CM", "DV", "LB", "VS", "ECG"];
const edcSystems = [
  { type: "medidata_rave", label: "Medidata Rave", color: "indigo" },
  { type: "oracle_clinical_one", label: "Oracle Clinical One", color: "cyan" },
  { type: "veeva_vault", label: "Veeva Vault", color: "teal" },
] as const;
const riskCategories = [
  "Data Integrity",
  "Patient Safety",
  "Regulatory Compliance",
  "Protocol Deviation",
  "Adverse Event",
  "Consent Issue",
];

// Deterministic seed-based generator for stable initial render
let seedCounter = 1000;
function seededRandom() {
  // simple LCG
  seedCounter = (seedCounter * 9301 + 49297) % 233280;
  return seedCounter / 233280;
}

export function generateMockTasks(count = 24): Task[] {
  const tasks: Task[] = [];
  for (let i = 0; i < count; i++) {
    const conf = confidences[Math.floor(seededRandom() * confidences.length)];
    const priority = priorities[Math.floor(seededRandom() * priorities.length)];
    const status = statuses[Math.floor(seededRandom() * statuses.length)];
    const edc = edcSystems[Math.floor(seededRandom() * edcSystems.length)];
    const riskScore = Math.floor(seededRandom() * 100);
    const isOverdue = seededRandom() > 0.85 && status !== "completed";

    tasks.push({
      id: `TASK-${String(1001 + i).padStart(4, "0")}`,
      trialId: `TRIAL-${Math.floor(seededRandom() * 900) + 100}`,
      siteId: `SITE-${String(Math.floor(seededRandom() * 50) + 1).padStart(3, "0")}`,
      subjectId: `SUBJ-${String(Math.floor(seededRandom() * 1000) + 1).padStart(4, "0")}`,
      formId: `${forms[Math.floor(seededRandom() * forms.length)]}-${Math.floor(seededRandom() * 999) + 1}`,
      fieldId: `field_${(seededRandom().toString(36).substring(2, 8))}`,
      originalValue: i % 4 === 0 ? null : `Original_Value_${i + 1}`,
      aiSuggestedValue: `AI_Suggestion_${i + 1}`,
      confidence: { ...conf },
      priority,
      status,
      riskCategory: riskCategories[Math.floor(seededRandom() * riskCategories.length)],
      riskScore,
      edcSource: { ...edc },
      createdAt: new Date(Date.now() - seededRandom() * 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - seededRandom() * 2 * 24 * 60 * 60 * 1000),
      dueDate: isOverdue
        ? new Date(Date.now() - seededRandom() * 2 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + seededRandom() * 3 * 24 * 60 * 60 * 1000),
      isOverdue,
      decision:
        status === "completed" ? (seededRandom() > 0.3 ? "approved" : "rejected") : undefined,
      modelVersion: `v${Math.floor(seededRandom() * 5) + 1}.2.1`,
      processingTime: Math.floor(seededRandom() * 4500) + 150,
    });
  }
  return tasks;
}

export const mockStats: Stats = {
  totalTasks: 47,
  pendingReview: 23,
  inProgress: 8,
  completed: 12,
  escalated: 4,
  criticalCount: 5,
  overdueCount: 3,
  avgConfidence: 84,
  reviewerStats: {
    tasksToday: 23,
    avgReviewTime: 45,
    approvalRate: 0.72,
    accuracy: 0.97,
    streak: 12,
    totalReviewed: 1247,
    teamRank: 3,
    percentileRank: 94,
  },
  edcStatus: [
    { system: "Medidata Rave", status: "healthy", uptime: 99.97, latency: 45, recordsProcessed: 15420 },
    { system: "Oracle Clinical One", status: "healthy", uptime: 99.85, latency: 128, recordsProcessed: 8934 },
    { system: "Veeva Vault EDC", status: "degraded", uptime: 98.92, latency: 256, recordsProcessed: 6789 },
  ],
  complianceStatus: {
    fda21CFR11: {
      score: 98.5,
      status: "compliant",
      lastAudit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      nextAudit: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      findings: 0,
      openIssues: 0,
    },
    emaAnnex11: {
      score: 97.2,
      status: "compliant",
      lastAudit: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      nextAudit: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      findings: 0,
      openIssues: 0,
    },
    gdpr: {
      score: 99.1,
      status: "compliant",
      lastAudit: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      nextAudit: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString(),
      findings: 0,
      openIssues: 0,
    },
    hipaa: {
      score: 94.8,
      status: "warning",
      lastAudit: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      nextAudit: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      findings: 2,
      openIssues: 1,
    },
  },
  systemHealth: { overall: 98.7, apiLatency: 45, memoryUsage: 67, cpuUsage: 34 },
  calibration: {
    modelVersion: "v3.4.1-clinical-edc",
    brierScore: 0.087,
    ece: 4.2,
    logLoss: 0.234,
    samples: 18432,
    driftDetected: false,
    driftMagnitude: 1.8,
    lastUpdated: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    buckets: [
      { range: "0-20%",  predicted: 12, observed: 14,  count: 842 },
      { range: "20-40%", predicted: 31, observed: 28,  count: 1247 },
      { range: "40-60%", predicted: 51, observed: 49,  count: 2104 },
      { range: "60-80%", predicted: 71, observed: 74,  count: 3892 },
      { range: "80-90%", predicted: 85, observed: 86,  count: 5218 },
      { range: "90-100%",predicted: 96, observed: 95,  count: 5129 },
    ],
    trend: [
      { ts: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), ece: 5.1 },
      { ts: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), ece: 4.8 },
      { ts: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), ece: 4.6 },
      { ts: new Date(Date.now() - 6  * 60 * 60 * 1000).toISOString(), ece: 4.3 },
      { ts: new Date(Date.now() -      60 * 60 * 1000).toISOString(), ece: 4.2 },
      { ts: new Date(Date.now() -       2 * 60 * 1000).toISOString(), ece: 4.2 },
    ],
  },
  reviewerProfile: {
    decisionVelocity: 32,
    avgDwellMs: 18500,
    attentionScore: 87,
    cognitiveLoadIndex: 42,
    bias: {
      approveRatio: 0.72,
      rejectRatio: 0.18,
      escalationRatio: 0.10,
      biasLabel: "approval-leaning",
    },
    outlierDecisions: 3,
    fatigueRisk: "moderate",
    peakHours: ["09:00-11:00", "14:00-16:00"],
  },
  edcPredictive: [
    {
      system: "Medidata Rave",
      mtbfHours: 2184,
      degradationTrend: 1.2,
      predictedFailureWindow: "stable",
      healthScore: 96,
      alertLevel: "none",
      errorRate: 0.04,
      syncLag: 8,
    },
    {
      system: "Oracle Clinical One",
      mtbfHours: 1428,
      degradationTrend: 4.8,
      predictedFailureWindow: "21-35 days",
      healthScore: 78,
      alertLevel: "advisory",
      alertMessage: "Latency trending +4.8ms/week — schedule preventive restart within 3 weeks",
      errorRate: 0.31,
      syncLag: 14,
    },
    {
      system: "Veeva Vault EDC",
      mtbfHours: 612,
      degradationTrend: 18.6,
      predictedFailureWindow: "5-9 days",
      healthScore: 51,
      alertLevel: "warning",
      alertMessage: "Latency drift +18.6ms/week with rising error rate — failover recommended within 7 days",
      errorRate: 1.42,
      syncLag: 47,
    },
  ],
  edgeComputing: {
    kpis: {
      activeSites: 13,
      totalSites: 18,
      offlineCapablePct: 88.9,
      avgCompressionRatio: 0.154,
      avgInferenceLatencyMs: 42,
      pendingSyncRecords: 612,
      syncLagP95Min: 38,
      bandwidthSavedPct: 78.4,
    },
    sites: [
      // --- Tier-1 reference sites (developed markets, used as baseline) ---
      {
        siteId: "SITE-001",
        name: "Massachusetts General Hospital",
        country: "United States",
        emergingMarket: false,
        status: "online",
        modelVersion: "edge-clin-v3.4.1-int8",
        originalModelSizeMb: 412.0,
        compressedModelSizeMb: 58.4,
        compressionRatio: 0.142,
        inferenceLatencyMs: 28,
        lastSyncIso: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
        pendingRecords: 0,
        conflictCount: 0,
        bandwidthKbps: 8420,
        storageUsedPct: 32,
        healthScore: 98,
      },
      {
        siteId: "SITE-007",
        name: "Karolinska University Hospital",
        country: "Sweden",
        emergingMarket: false,
        status: "online",
        modelVersion: "edge-clin-v3.4.1-int8",
        originalModelSizeMb: 412.0,
        compressedModelSizeMb: 60.1,
        compressionRatio: 0.146,
        inferenceLatencyMs: 31,
        lastSyncIso: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
        pendingRecords: 4,
        conflictCount: 0,
        bandwidthKbps: 6240,
        storageUsedPct: 38,
        healthScore: 96,
      },

      // --- Emerging-market deployment targets (real rollout pipeline) ---

      // Lagos, Nigeria — sub-2 Mbps cellular uplink, intermittent power
      {
        siteId: "SITE-LAG-01",
        name: "Lagos University Teaching Hospital (LUTH)",
        country: "Nigeria",
        emergingMarket: true,
        status: "online",
        modelVersion: "edge-clin-v3.4.1-int8",
        originalModelSizeMb: 412.0,
        compressedModelSizeMb: 64.2,
        compressionRatio: 0.156,
        inferenceLatencyMs: 44,
        lastSyncIso: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        pendingRecords: 18,
        conflictCount: 0,
        bandwidthKbps: 1180,
        storageUsedPct: 51,
        healthScore: 89,
      },

      // Nairobi, Kenya — kept (already a real deployment target)
      {
        siteId: "SITE-NBO-02",
        name: "Aga Khan University Hospital, Nairobi",
        country: "Kenya",
        emergingMarket: true,
        status: "syncing",
        modelVersion: "edge-clin-v3.4.1-int8",
        originalModelSizeMb: 412.0,
        compressedModelSizeMb: 66.8,
        compressionRatio: 0.162,
        inferenceLatencyMs: 47,
        lastSyncIso: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
        pendingRecords: 84,
        conflictCount: 1,
        bandwidthKbps: 620,
        storageUsedPct: 68,
        healthScore: 81,
      },

      // Jakarta, Indonesia — 4G LTE with frequent drops
      {
        siteId: "SITE-JKT-03",
        name: "Cipto Mangunkusumo Hospital (RSCM), Jakarta",
        country: "Indonesia",
        emergingMarket: true,
        status: "degraded",
        modelVersion: "edge-clin-v3.4.1-int8",
        originalModelSizeMb: 412.0,
        compressedModelSizeMb: 67.4,
        compressionRatio: 0.164,
        inferenceLatencyMs: 88,
        lastSyncIso: new Date(Date.now() - 71 * 60 * 1000).toISOString(),
        pendingRecords: 132,
        conflictCount: 2,
        bandwidthKbps: 410,
        storageUsedPct: 79,
        healthScore: 67,
      },

      // Manila, Philippines — typhoon-prone, multi-day outages expected
      {
        siteId: "SITE-MNL-04",
        name: "Philippine General Hospital, Manila",
        country: "Philippines",
        emergingMarket: true,
        status: "offline",
        modelVersion: "edge-clin-v3.4.1-int8",
        originalModelSizeMb: 412.0,
        compressedModelSizeMb: 65.5,
        compressionRatio: 0.159,
        inferenceLatencyMs: 38,
        lastSyncIso: new Date(Date.now() - 184 * 60 * 1000).toISOString(),
        pendingRecords: 96,
        conflictCount: 0,
        bandwidthKbps: 0,
        storageUsedPct: 88,
        healthScore: 74,
      },

      // Dhaka, Bangladesh — extremely bandwidth-constrained, dense urban
      {
        siteId: "SITE-DAC-05",
        name: "Bangabandhu Sheikh Mujib Medical University, Dhaka",
        country: "Bangladesh",
        emergingMarket: true,
        status: "syncing",
        modelVersion: "edge-clin-v3.4.1-int8",
        originalModelSizeMb: 412.0,
        compressedModelSizeMb: 62.7,
        compressionRatio: 0.152,
        inferenceLatencyMs: 52,
        lastSyncIso: new Date(Date.now() - 38 * 60 * 1000).toISOString(),
        pendingRecords: 211,
        conflictCount: 4,
        bandwidthKbps: 240,
        storageUsedPct: 83,
        healthScore: 58,
      },

      // Accra, Ghana — newly online, stable 3G/4G
      {
        siteId: "SITE-ACC-06",
        name: "Korle-Bu Teaching Hospital, Accra",
        country: "Ghana",
        emergingMarket: true,
        status: "online",
        modelVersion: "edge-clin-v3.4.1-int8",
        originalModelSizeMb: 412.0,
        compressedModelSizeMb: 63.9,
        compressionRatio: 0.155,
        inferenceLatencyMs: 49,
        lastSyncIso: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        pendingRecords: 9,
        conflictCount: 0,
        bandwidthKbps: 940,
        storageUsedPct: 44,
        healthScore: 91,
      },

      // Cairo, Egypt — Mediterranean gateway, mid-bandwidth
      {
        siteId: "SITE-CAI-07",
        name: "Ain Shams University Hospital, Cairo",
        country: "Egypt",
        emergingMarket: true,
        status: "online",
        modelVersion: "edge-clin-v3.4.1-int8",
        originalModelSizeMb: 412.0,
        compressedModelSizeMb: 65.0,
        compressionRatio: 0.158,
        inferenceLatencyMs: 41,
        lastSyncIso: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        pendingRecords: 23,
        conflictCount: 0,
        bandwidthKbps: 1620,
        storageUsedPct: 56,
        healthScore: 87,
      },

      // Ho Chi Minh City, Vietnam — strong rollout candidate, awaiting hardware
      {
        siteId: "SITE-SGN-08",
        name: "Cho Ray Hospital, Ho Chi Minh City",
        country: "Vietnam",
        emergingMarket: true,
        status: "pending_deploy",
        modelVersion: "—",
        originalModelSizeMb: 412.0,
        compressedModelSizeMb: 0,
        compressionRatio: 0,
        inferenceLatencyMs: 0,
        lastSyncIso: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        pendingRecords: 0,
        conflictCount: 0,
        bandwidthKbps: 740,
        storageUsedPct: 0,
        healthScore: 0,
      },

      // Karachi, Pakistan — large urban population, intermittent fiber
      {
        siteId: "SITE-KHI-09",
        name: "Aga Khan University Hospital, Karachi",
        country: "Pakistan",
        emergingMarket: true,
        status: "pending_deploy",
        modelVersion: "—",
        originalModelSizeMb: 412.0,
        compressedModelSizeMb: 0,
        compressionRatio: 0,
        inferenceLatencyMs: 0,
        lastSyncIso: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
        pendingRecords: 0,
        conflictCount: 0,
        bandwidthKbps: 520,
        storageUsedPct: 0,
        healthScore: 0,
      },

      // Kampala, Uganda — satellite backup link, very low bandwidth
      {
        siteId: "SITE-KLA-10",
        name: "Makerere University / Mulago Hospital, Kampala",
        country: "Uganda",
        emergingMarket: true,
        status: "pending_deploy",
        modelVersion: "—",
        originalModelSizeMb: 412.0,
        compressedModelSizeMb: 0,
        compressionRatio: 0,
        inferenceLatencyMs: 0,
        lastSyncIso: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
        pendingRecords: 0,
        conflictCount: 0,
        bandwidthKbps: 180,
        storageUsedPct: 0,
        healthScore: 0,
      },

      // --- New emerging-market deployments: India, Brazil, Colombia, UAE ---

      // Mumbai, India — Apollo Hospitals, fiber + 4G backup, large volume
      {
        siteId: "SITE-BOM-11",
        name: "Apollo Hospitals, Navi Mumbai",
        country: "India",
        emergingMarket: true,
        status: "online",
        modelVersion: "edge-clin-v3.4.1-int8",
        originalModelSizeMb: 412.0,
        compressedModelSizeMb: 61.8,
        compressionRatio: 0.150,
        inferenceLatencyMs: 36,
        lastSyncIso: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        pendingRecords: 6,
        conflictCount: 0,
        bandwidthKbps: 2840,
        storageUsedPct: 41,
        healthScore: 94,
      },

      // Delhi NCR, India — AIIMS, dual-stack fiber, high throughput
      {
        siteId: "SITE-DEL-12",
        name: "All India Institute of Medical Sciences (AIIMS), New Delhi",
        country: "India",
        emergingMarket: true,
        status: "online",
        modelVersion: "edge-clin-v3.4.1-int8",
        originalModelSizeMb: 412.0,
        compressedModelSizeMb: 60.9,
        compressionRatio: 0.148,
        inferenceLatencyMs: 33,
        lastSyncIso: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        pendingRecords: 2,
        conflictCount: 0,
        bandwidthKbps: 4120,
        storageUsedPct: 38,
        healthScore: 96,
      },

      // São Paulo, Brazil — Hospital das Clínicas (USP), fiber primary
      {
        siteId: "SITE-SAO-13",
        name: "Hospital das Clínicas, Universidade de São Paulo (USP)",
        country: "Brazil",
        emergingMarket: true,
        status: "syncing",
        modelVersion: "edge-clin-v3.4.1-int8",
        originalModelSizeMb: 412.0,
        compressedModelSizeMb: 62.4,
        compressionRatio: 0.151,
        inferenceLatencyMs: 42,
        lastSyncIso: new Date(Date.now() - 17 * 60 * 1000).toISOString(),
        pendingRecords: 47,
        conflictCount: 1,
        bandwidthKbps: 1980,
        storageUsedPct: 58,
        healthScore: 88,
      },

      // Bogotá, Colombia — Instituto Nacional de Cancerología, 4G LTE
      {
        siteId: "SITE-BOG-14",
        name: "Instituto Nacional de Cancerología, Bogotá",
        country: "Colombia",
        emergingMarket: true,
        status: "online",
        modelVersion: "edge-clin-v3.4.1-int8",
        originalModelSizeMb: 412.0,
        compressedModelSizeMb: 64.1,
        compressionRatio: 0.156,
        inferenceLatencyMs: 48,
        lastSyncIso: new Date(Date.now() - 11 * 60 * 1000).toISOString(),
        pendingRecords: 14,
        conflictCount: 0,
        bandwidthKbps: 1240,
        storageUsedPct: 52,
        healthScore: 90,
      },

      // Abu Dhabi, UAE — Cleveland Clinic Abu Dhabi, premium fiber (not truly EMR but bandwidth-diverse)
      {
        siteId: "SITE-AUH-15",
        name: "Cleveland Clinic Abu Dhabi",
        country: "United Arab Emirates",
        emergingMarket: true,
        status: "online",
        modelVersion: "edge-clin-v3.4.1-int8",
        originalModelSizeMb: 412.0,
        compressedModelSizeMb: 59.6,
        compressionRatio: 0.145,
        inferenceLatencyMs: 29,
        lastSyncIso: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
        pendingRecords: 1,
        conflictCount: 0,
        bandwidthKbps: 8600,
        storageUsedPct: 27,
        healthScore: 97,
      },

      // Dubai, UAE — Dubai Healthcare City, Al Jalila Children's Hospital, fiber
      {
        siteId: "SITE-DXB-16",
        name: "Al Jalila Children's Specialty Hospital, Dubai Healthcare City",
        country: "United Arab Emirates",
        emergingMarket: true,
        status: "pending_deploy",
        modelVersion: "—",
        originalModelSizeMb: 412.0,
        compressedModelSizeMb: 0,
        compressionRatio: 0,
        inferenceLatencyMs: 0,
        lastSyncIso: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        pendingRecords: 0,
        conflictCount: 0,
        bandwidthKbps: 5200,
        storageUsedPct: 0,
        healthScore: 0,
      },
    ],
    compressionTechniques: [
      {
        name: "INT8 Post-Training Quantization",
        applied: true,
        sizeReductionPct: 68.4,
        latencyImpactPct: -42.1,
        accuracyDeltaPct: -0.3,
      },
      {
        name: "Structured Channel Pruning (40%)",
        applied: true,
        sizeReductionPct: 21.7,
        latencyImpactPct: -18.6,
        accuracyDeltaPct: -0.8,
      },
      {
        name: "Knowledge Distillation",
        applied: true,
        sizeReductionPct: 6.2,
        latencyImpactPct: -7.4,
        accuracyDeltaPct: 0.4,
      },
      {
        name: "Weight Clustering (4-bit)",
        applied: false,
        sizeReductionPct: 0,
        latencyImpactPct: 0,
        accuracyDeltaPct: 0,
      },
    ],
    syncLog: [
      { ts: new Date(Date.now() -       2 * 60 * 1000).toISOString(), siteId: "SITE-001",     event: "sync_completed", records: 38,  detail: "incremental push to cloud" },
      { ts: new Date(Date.now() -       7 * 60 * 1000).toISOString(), siteId: "SITE-NBO-02",  event: "conflict",       records: 3,   detail: "concurrent edit on CRF-VS-1024 — auto-merged" },
      { ts: new Date(Date.now() -      11 * 60 * 1000).toISOString(), siteId: "SITE-NBO-02",  event: "merged",         records: 3,   detail: "merged using last-writer-wins + reviewer override" },
      { ts: new Date(Date.now() -      18 * 60 * 1000).toISOString(), siteId: "SITE-LAG-01",  event: "sync_started",   records: 12,  detail: "delta sync over 1.18 Mbps cellular uplink" },
      { ts: new Date(Date.now() -      25 * 60 * 1000).toISOString(), siteId: "SITE-MNL-04",  event: "queue",          records: 41,  detail: "offline — queued locally, will sync on reconnect" },
      { ts: new Date(Date.now() -      33 * 60 * 1000).toISOString(), siteId: "SITE-DAC-05",  event: "queue",          records: 211, detail: "240 kbps uplink saturated — queueing in foreground" },
      { ts: new Date(Date.now() -      44 * 60 * 1000).toISOString(), siteId: "SITE-JKT-03",  event: "sync_completed", records: 96,  detail: "backfill completed; 2 conflicts flagged for review" },
      { ts: new Date(Date.now() -      58 * 60 * 1000).toISOString(), siteId: "SITE-ACC-06",  event: "sync_completed", records: 19,  detail: "delta sync over 940 kbps 4G uplink" },
      { ts: new Date(Date.now() -     1 * 60 * 60 * 1000).toISOString(), siteId: "SITE-CAI-07",  event: "sync_started",   records: 23,  detail: "delta sync over 1.62 Mbps fiber" },
      { ts: new Date(Date.now() -     3 * 60 * 60 * 1000).toISOString(), siteId: "SITE-DAC-05",  event: "conflict",       records: 4,   detail: "concurrent edits on AE-LOG-204 — reviewer override required" },
    ],
    lastUpdated: new Date(Date.now() - 45 * 1000).toISOString(),
  },
};

export const mockEDCSystems: EDCSystem[] = [
  {
    id: "medidata_rave",
    name: "Medidata Rave",
    type: "medidata_rave",
    status: "connected",
    latency: 45,
    lastSync: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    recordsProcessed: 15420,
    pendingRecords: 12,
    version: "2024.1.0",
  },
  {
    id: "oracle_clinical_one",
    name: "Oracle Clinical One",
    type: "oracle_clinical_one",
    status: "connected",
    latency: 128,
    lastSync: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    recordsProcessed: 8934,
    pendingRecords: 47,
    version: "23.4.2",
  },
  {
    id: "veeva_vault",
    name: "Veeva Vault EDC",
    type: "veeva_vault",
    status: "degraded",
    latency: 256,
    lastSync: new Date(Date.now() - 47 * 60 * 1000).toISOString(),
    recordsProcessed: 6789,
    pendingRecords: 134,
    version: "24R1.2",
  },
];

export const mockTrials: Trial[] = [
  {
    nctId: "NCT04584710",
    title: "Phase 3 Trial of Novel CAR-T Cell Therapy in Relapsed B-Cell Lymphoma",
    status: "RECRUITING",
    phase: ["PHASE3"],
    conditions: ["Diffuse Large B-Cell Lymphoma", "Non-Hodgkin Lymphoma"],
    interventions: [
      { type: "BIOLOGICAL", name: "AXI-CEL CAR-T Therapy" },
      { type: "DRUG", name: "Lymphodepleting Chemotherapy" },
    ],
    locations: [
      { facility: "Massachusetts General Hospital", city: "Boston", country: "United States", status: "RECRUITING" },
      { facility: "MD Anderson Cancer Center", city: "Houston", country: "United States", status: "RECRUITING" },
      { facility: "Mayo Clinic Rochester", city: "Rochester", country: "United States", status: "RECRUITING" },
    ],
    hasResults: false,
  },
  {
    nctId: "NCT04890224",
    title: "Efficacy and Safety of mRNA-1273 Vaccine in Adolescents (TeenCOVE)",
    status: "COMPLETED",
    phase: ["PHASE2", "PHASE3"],
    conditions: ["COVID-19", "SARS-CoV-2 Infection"],
    interventions: [{ type: "BIOLOGICAL", name: "mRNA-1273 Vaccine" }],
    locations: [
      { facility: "Kaiser Permanente Northern California", city: "Oakland", country: "United States", status: "COMPLETED" },
      { facility: "Cincinnati Children's Hospital", city: "Cincinnati", country: "United States", status: "COMPLETED" },
    ],
    hasResults: true,
  },
  {
    nctId: "NCT05231427",
    title: "Novel GLP-1 Receptor Agonist for Type 2 Diabetes Management in Older Adults",
    status: "RECRUITING",
    phase: ["PHASE3"],
    conditions: ["Type 2 Diabetes Mellitus", "Obesity"],
    interventions: [
      { type: "DRUG", name: "Semaglutide (oral)" },
      { type: "DRUG", name: "Placebo" },
    ],
    locations: [
      { facility: "Joslin Diabetes Center", city: "Boston", country: "United States", status: "RECRUITING" },
      { facility: "University of Miami Diabetes Research Institute", city: "Miami", country: "United States", status: "RECRUITING" },
      { facility: "Barbara Davis Center for Diabetes", city: "Denver", country: "United States", status: "RECRUITING" },
      { facility: "Karolinska University Hospital", city: "Stockholm", country: "Sweden", status: "RECRUITING" },
    ],
    hasResults: false,
  },
  {
    nctId: "NCT04127384",
    title: "Combination Immunotherapy for Advanced Melanoma: Nivolumab + Ipilimumab vs Nivolumab Alone",
    status: "COMPLETED",
    phase: ["PHASE3"],
    conditions: ["Melanoma", "Skin Cancer"],
    interventions: [
      { type: "BIOLOGICAL", name: "Nivolumab" },
      { type: "BIOLOGICAL", name: "Ipilimumab" },
    ],
    locations: [
      { facility: "Memorial Sloan Kettering", city: "New York", country: "United States", status: "COMPLETED" },
      { facility: "Dana-Farber Cancer Institute", city: "Boston", country: "United States", status: "COMPLETED" },
      { facility: "Royal Marsden Hospital", city: "London", country: "United Kingdom", status: "COMPLETED" },
    ],
    hasResults: true,
  },
  {
    nctId: "NCT03892738",
    title: "Long-term Safety Extension Study of JAK Inhibitor in Rheumatoid Arthritis",
    status: "TERMINATED",
    phase: ["PHASE3"],
    conditions: ["Rheumatoid Arthritis"],
    interventions: [{ type: "DRUG", name: "Tofacitinib" }],
    locations: [
      { facility: "Cleveland Clinic Rheumatology", city: "Cleveland", country: "United States", status: "TERMINATED" },
    ],
    hasResults: true,
  },
  {
    nctId: "NCT04730142",
    title: "Gene Therapy for Inherited Retinal Dystrophy (RPGR Mutation)",
    status: "RECRUITING",
    phase: ["PHASE1", "PHASE2"],
    conditions: ["Retinitis Pigmentosa", "X-Linked Inherited Retinal Dystrophy"],
    interventions: [{ type: "GENETIC", name: "AAV5-RPGR Gene Therapy" }],
    locations: [
      { facility: "Bascom Palmer Eye Institute", city: "Miami", country: "United States", status: "RECRUITING" },
      { facility: "Moorfields Eye Hospital", city: "London", country: "United Kingdom", status: "RECRUITING" },
    ],
    hasResults: false,
  },
  {
    nctId: "NCT04983214",
    title: "Subcutaneous Administration of PCSK9 Inhibitor for Familial Hypercholesterolemia",
    status: "RECRUITING",
    phase: ["PHASE2"],
    conditions: ["Familial Hypercholesterolemia", "Cardiovascular Disease"],
    interventions: [
      { type: "DRUG", name: "Inclisiran" },
      { type: "DRUG", name: "Evolocumab" },
    ],
    locations: [
      { facility: "Cleveland Clinic Heart Center", city: "Cleveland", country: "United States", status: "RECRUITING" },
      { facility: "Cleveland Clinic Abu Dhabi", city: "Abu Dhabi", country: "United Arab Emirates", status: "RECRUITING" },
    ],
    hasResults: false,
  },
  {
    nctId: "NCT05384710",
    title: "Tau-Targeting Monoclonal Antibody in Early Alzheimer's Disease",
    status: "RECRUITING",
    phase: ["PHASE2"],
    conditions: ["Alzheimer Disease", "Mild Cognitive Impairment"],
    interventions: [{ type: "BIOLOGICAL", name: "Gosuranemab" }],
    locations: [
      { facility: "Mayo Clinic Alzheimer's Disease Research Center", city: "Rochester", country: "United States", status: "RECRUITING" },
      { facility: "UCSF Memory and Aging Center", city: "San Francisco", country: "United States", status: "RECRUITING" },
    ],
    hasResults: false,
  },
];

export function formatTimeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

/* ============================================================
   ANALYTICS PAGE — extended types & mock data
   ============================================================ */

export interface AnalyticsKpi {
  label: string;
  value: string;
  deltaPct: number; // positive = improving (or "good" direction)
  deltaGoodDirection: "up" | "down"; // which direction is the good one
  spark: number[]; // last N points
  hint?: string;
  tone?: "good" | "warn" | "bad" | "neutral";
}

export interface AnalyticsSeries {
  label: string;
  color: string;
  data: Array<{ ts: string; value: number }>;
}

export interface AnalyticsPanel {
  id: string;
  title: string;
  description: string;
  kpis: AnalyticsKpi[];
  series?: AnalyticsSeries[];
}

export const analyticsKpis: AnalyticsKpi[] = [
  {
    label: "Reviewer Throughput",
    value: "32.4 /h",
    deltaPct: 8.2,
    deltaGoodDirection: "up",
    spark: [22, 24, 27, 26, 30, 31, 29, 32, 33, 32, 34, 32],
    hint: "decisions per active reviewer hour",
    tone: "good",
  },
  {
    label: "Auto-Approval Rate",
    value: "61.3%",
    deltaPct: 4.1,
    deltaGoodDirection: "up",
    spark: [48, 50, 52, 55, 57, 58, 60, 59, 61, 60, 62, 61],
    hint: "high-confidence tasks auto-approved (no human touch)",
    tone: "good",
  },
  {
    label: "Avg Decision Latency",
    value: "18.4s",
    deltaPct: -12.7,
    deltaGoodDirection: "down",
    spark: [32, 28, 26, 24, 22, 21, 20, 19, 18, 19, 18, 18],
    hint: "median reviewer dwell time per task",
    tone: "good",
  },
  {
    label: "AI Brier Score",
    value: "0.087",
    deltaPct: -3.2,
    deltaGoodDirection: "down",
    spark: [0.12, 0.11, 0.10, 0.095, 0.092, 0.09, 0.089, 0.088, 0.087, 0.087, 0.087, 0.087],
    hint: "lower = better calibrated model (0 = perfect)",
    tone: "good",
  },
  {
    label: "Cost / Decision",
    value: "$0.043",
    deltaPct: -18.4,
    deltaGoodDirection: "down",
    spark: [0.08, 0.075, 0.07, 0.065, 0.06, 0.055, 0.052, 0.05, 0.048, 0.045, 0.044, 0.043],
    hint: "inference + reviewer time amortized",
    tone: "good",
  },
  {
    label: "Model Drift",
    value: "1.8%",
    deltaPct: 0.4,
    deltaGoodDirection: "down",
    spark: [1.2, 1.3, 1.5, 1.4, 1.6, 1.7, 1.5, 1.6, 1.8, 1.7, 1.8, 1.8],
    hint: "PSI vs. baseline distribution (last 24h)",
    tone: "warn",
  },
  {
    label: "Compliance Score",
    value: "97.4%",
    deltaPct: 0.6,
    deltaGoodDirection: "up",
    spark: [94, 95, 95, 96, 96, 97, 97, 97, 97, 97, 97, 97],
    hint: "FDA / EMA / GDPR / HIPAA composite",
    tone: "good",
  },
  {
    label: "Edge Sync Lag (P95)",
    value: "42m",
    deltaPct: -6.7,
    deltaGoodDirection: "down",
    spark: [62, 58, 55, 52, 50, 48, 46, 45, 44, 43, 42, 42],
    hint: "95th-percentile sync delay across edge sites",
    tone: "warn",
  },
];

export const analyticsThroughputSeries: AnalyticsSeries[] = [
  {
    label: "AI auto-approve",
    color: "#10b981",
    data: Array.from({ length: 24 }, (_, h) => ({
      ts: new Date(Date.now() - (23 - h) * 60 * 60 * 1000).toISOString(),
      value: Math.round(180 + Math.sin(h / 3) * 40 + Math.random() * 30),
    })),
  },
  {
    label: "Human-reviewed",
    color: "#3b82f6",
    data: Array.from({ length: 24 }, (_, h) => ({
      ts: new Date(Date.now() - (23 - h) * 60 * 60 * 1000).toISOString(),
      value: Math.round(120 + Math.cos(h / 4) * 30 + Math.random() * 20),
    })),
  },
  {
    label: "Escalated",
    color: "#a855f7",
    data: Array.from({ length: 24 }, (_, h) => ({
      ts: new Date(Date.now() - (23 - h) * 60 * 60 * 1000).toISOString(),
      value: Math.round(20 + Math.sin(h / 2) * 8 + Math.random() * 6),
    })),
  },
];

export const analyticsRiskDistribution = [
  { label: "Data Integrity", value: 32, color: "#3b82f6" },
  { label: "Patient Safety", value: 18, color: "#ef4444" },
  { label: "Regulatory", value: 21, color: "#f59e0b" },
  { label: "Protocol Deviation", value: 14, color: "#8b5cf6" },
  { label: "Adverse Event", value: 9, color: "#ec4899" },
  { label: "Consent Issue", value: 6, color: "#06b6d4" },
];

export const analyticsReviewerLeaderboard = [
  { rank: 1, name: "Dr. Sarah Chen", decisions: 1247, accuracy: 97.2, avgTime: 42, trend: "up" as const },
  { rank: 2, name: "Dr. James Okafor", decisions: 1182, accuracy: 96.8, avgTime: 48, trend: "up" as const },
  { rank: 3, name: "Dr. Maria Santos", decisions: 1094, accuracy: 95.9, avgTime: 51, trend: "down" as const },
  { rank: 4, name: "Dr. Wei Zhang", decisions: 982, accuracy: 96.4, avgTime: 55, trend: "up" as const },
  { rank: 5, name: "Dr. Aisha Rahman", decisions: 901, accuracy: 97.5, avgTime: 49, trend: "up" as const },
  { rank: 6, name: "Dr. Lukas Müller", decisions: 856, accuracy: 95.1, avgTime: 62, trend: "down" as const },
  { rank: 7, name: "Dr. Priya Iyer", decisions: 812, accuracy: 96.7, avgTime: 53, trend: "up" as const },
  { rank: 8, name: "Dr. Carlos Vega", decisions: 774, accuracy: 95.4, avgTime: 58, trend: "down" as const },
];

export const analyticsExplainabilitySamples = [
  {
    taskId: "TASK-1042",
    prediction: "approve",
    confidence: 0.92,
    topFeatures: [
      { name: "field_concordance_score", weight: 0.38, value: "0.94" },
      { name: "historical_approval_rate", weight: 0.24, value: "0.81" },
      { name: "site_reputation_index", weight: 0.18, value: "0.96" },
      { name: "form_completeness", weight: 0.12, value: "1.00" },
      { name: "subject_enrollment_age", weight: -0.08, value: "62y" },
    ],
  },
  {
    taskId: "TASK-1043",
    prediction: "escalate",
    confidence: 0.61,
    topFeatures: [
      { name: "field_concordance_score", weight: -0.32, value: "0.42" },
      { name: "site_reputation_index", weight: 0.21, value: "0.78" },
      { name: "ae_severity_proxy", weight: -0.19, value: "Grade 3" },
      { name: "historical_approval_rate", weight: 0.14, value: "0.55" },
      { name: "subject_enrollment_age", weight: -0.10, value: "71y" },
    ],
  },
];

export const analyticsCostBreakdown = [
  { label: "Inference (cloud GPU)", value: 42, color: "#3b82f6" },
  { label: "Edge inference (amortized)", value: 12, color: "#10b981" },
  { label: "Reviewer time", value: 28, color: "#f59e0b" },
  { label: "Storage & sync", value: 8, color: "#8b5cf6" },
  { label: "Audit & logging", value: 6, color: "#06b6d4" },
  { label: "Other", value: 4, color: "#94a3b8" },
];

/* ============================================================
   API DOCUMENTATION PAGE — endpoint catalog
   ============================================================ */

export interface ApiEndpoint {
  id: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "WS" | "SSE";
  path: string;
  title: string;
  description: string;
  category: "Tasks" | "Trials" | "EDC" | "Compliance" | "Edge" | "Analytics" | "Auth" | "Webhooks";
  requestSchema?: string;
  responseSchema?: string;
  tags?: string[];
  rateLimit?: string;
}

export const apiEndpoints: ApiEndpoint[] = [
  {
    id: "ep-tasks-list",
    method: "GET",
    path: "/api/v1/tasks",
    title: "List review tasks",
    description:
      "Returns a paginated list of AI-generated review tasks, optionally filtered by trial, site, status, confidence band, or EDC source. Supports cursor-based pagination for streaming large queues.",
    category: "Tasks",
    rateLimit: "600 req/min per token",
    tags: ["paginated", "filterable"],
    responseSchema: `{
  "data": [
    {
      "id": "TASK-1042",
      "trialId": "NCT04584710",
      "subjectId": "SUBJ-0042",
      "formId": "CRF-VS-1024",
      "fieldId": "field_bp_systolic",
      "aiSuggestedValue": "118",
      "confidence": { "level": "very_high", "score": 0.92 },
      "priority": "high",
      "status": "pending_review",
      "riskScore": 24,
      "edcSource": "medidata_rave",
      "createdAt": "2026-08-14T08:24:11.000Z",
      "dueDate": "2026-08-15T17:00:00.000Z"
    }
  ],
  "pagination": { "cursor": "eyJpZCI6IlRBU0stMTA0MiJ9", "hasMore": true }
}`,
  },
  {
    id: "ep-tasks-decide",
    method: "POST",
    path: "/api/v1/tasks/{taskId}/decision",
    title: "Submit reviewer decision",
    description:
      "Records the reviewer's approve / reject / escalate decision on a task. Captures e-signature, reason codes, and optional override rationale. Triggers downstream EDC write-back and audit-log entry.",
    category: "Tasks",
    rateLimit: "120 req/min per token",
    tags: ["e-signature", "audit-logged"],
    requestSchema: `{
  "decision": "approved" | "rejected" | "escalated",
  "reasonCode": "string",
  "comment": "string (optional)",
  "signature": {
    "meaning": "I have reviewed this data point and approve the AI suggestion.",
    "signedAt": "2026-08-14T08:30:42.000Z",
    "signer": { "userId": "u_drchen", "name": "Dr. Sarah Chen" }
  }
}`,
    responseSchema: `{
  "taskId": "TASK-1042",
  "status": "completed",
  "decision": "approved",
  "auditId": "AUD-2026-08-14-009871",
  "edcWritebackId": "EDC-WB-4471"
}`,
  },
  {
    id: "ep-tasks-bulk",
    method: "POST",
    path: "/api/v1/tasks/bulk-action",
    title: "Bulk action on tasks",
    description:
      "Applies a single decision to a batch of up to 500 tasks. Useful for bulk-approving high-confidence tasks or escalating a cohort for supervisor review.",
    category: "Tasks",
    rateLimit: "30 req/min per token",
    tags: ["batch", "audit-logged"],
  },
  {
    id: "ep-tasks-auto",
    method: "POST",
    path: "/api/v1/tasks/auto-approve",
    title: "Auto-approve high-confidence tasks",
    description:
      "Triggers an asynchronous job that auto-approves all tasks above the configured confidence threshold (default 0.85). Returns a job ID that can be polled via the jobs endpoint.",
    category: "Tasks",
    rateLimit: "10 req/min per token",
    tags: ["async", "background-job"],
  },
  {
    id: "ep-trials-search",
    method: "GET",
    path: "/api/v1/trials",
    title: "Search clinical trials",
    description:
      "Full-text search across the trial registry (mirrored from ClinicalTrials.gov). Supports filtering by phase, condition, intervention, status, and location.",
    category: "Trials",
    rateLimit: "600 req/min per token",
    tags: ["search", "filterable"],
  },
  {
    id: "ep-trials-get",
    method: "GET",
    path: "/api/v1/trials/{nctId}",
    title: "Get trial by NCT ID",
    description: "Returns full metadata for a single trial, including locations, interventions, and inclusion criteria.",
    category: "Trials",
  },
  {
    id: "ep-edc-list",
    method: "GET",
    path: "/api/v1/edc/systems",
    title: "List EDC integrations",
    description: "Returns the configured EDC connections (Medidata Rave, Oracle Clinical One, Veeva Vault, etc.) with health metrics.",
    category: "EDC",
  },
  {
    id: "ep-edc-sync",
    method: "POST",
    path: "/api/v1/edc/{systemId}/sync",
    title: "Trigger EDC sync",
    description: "Kicks off an incremental sync from the specified EDC system. Returns a job ID; sync results are emitted over the WebSocket sync stream.",
    category: "EDC",
    tags: ["async"],
  },
  {
    id: "ep-compliance-status",
    method: "GET",
    path: "/api/v1/compliance/status",
    title: "Get compliance posture",
    description: "Returns live compliance scores across FDA 21 CFR Part 11, EMA Annex 11, GDPR, and HIPAA, with open findings and upcoming audit dates.",
    category: "Compliance",
  },
  {
    id: "ep-edge-sites",
    method: "GET",
    path: "/api/v1/edge/sites",
    title: "List edge deployment sites",
    description:
      "Returns the roster of edge-deployed clinical sites, including model version, compression ratio, sync lag, and queue depth. Use this to identify sites requiring attention.",
    category: "Edge",
  },
  {
    id: "ep-edge-deploy",
    method: "POST",
    path: "/api/v1/edge/sites/{siteId}/deploy",
    title: "Deploy compressed model to edge site",
    description:
      "Pushes a freshly compressed model (INT8 quantization + structural pruning) to a pending_deploy edge site. Returns a job ID; progress is streamed over the WebSocket edge channel.",
    category: "Edge",
    rateLimit: "5 req/min per token",
    tags: ["async", "background-job"],
    requestSchema: `{
  "baseModel": "edge-clin-v3.4.1",
  "compression": {
    "int8Quantization": true,
    "structuralPruningPct": 0.40,
    "knowledgeDistillation": true,
    "weightClustering4Bit": false
  },
  "syncPolicy": {
    "mode": "eventual_consistency",
    "maxQueueDepth": 5000,
    "autoMergeStrategy": "last_writer_wins"
  }
}`,
    responseSchema: `{
  "siteId": "SITE-SGN-08",
  "jobId": "EDGE-DEPLOY-2026-08-14-0042",
  "status": "queued",
  "estimatedSizeMb": 64.8,
  "estimatedCompressionRatio": 0.157,
  "estimatedDeploySeconds": 412
}`,
  },
  {
    id: "ep-edge-stream",
    method: "WS",
    path: "wss://api.trialgptbot.ai/v1/edge/sync-stream",
    title: "Edge sync log stream",
    description:
      "WebSocket channel that emits a live stream of edge sync events (queue, sync_started, sync_completed, conflict, merged) as they happen across all sites. Use this to drive real-time operational dashboards.",
    category: "Edge",
    tags: ["real-time", "websocket"],
  },
  {
    id: "ep-analytics-kpis",
    method: "GET",
    path: "/api/v1/analytics/kpis",
    title: "Get platform KPIs",
    description: "Returns the headline KPIs (throughput, auto-approval rate, cost/decision, Brier score, drift, etc.) with sparkline time-series.",
    category: "Analytics",
  },
  {
    id: "ep-analytics-reviewer",
    method: "GET",
    path: "/api/v1/analytics/reviewers",
    title: "Reviewer leaderboard",
    description: "Returns reviewer productivity metrics (decisions, accuracy, avg dwell time, trend) ranked by composite score.",
    category: "Analytics",
  },
  {
    id: "ep-auth-token",
    method: "POST",
    path: "/api/v1/auth/token",
    title: "Exchange credentials for API token",
    description:
      "Authenticates a user with username + password (or SSO assertion) and returns a scoped JWT bearer token valid for 1 hour. Refresh tokens are issued for offline access.",
    category: "Auth",
    tags: ["jwt", "scoped"],
  },
  {
    id: "ep-webhooks-register",
    method: "POST",
    path: "/api/v1/webhooks",
    title: "Register webhook",
    description:
      "Registers an HTTPS endpoint to receive event notifications (task.created, task.decided, edc.sync_completed, edge.conflict, compliance.drift_detected). HMAC-signed payloads.",
    category: "Webhooks",
    tags: ["hmac", "retry"],
  },
];

export const apiSdks = [
  {
    id: "sdk-js",
    name: "JavaScript / TypeScript",
    install: "npm install @trialgptbot/sdk",
    repo: "github.com/trialgptbot/sdk-js",
    example: `import { TrialGPTBot } from "@trialgptbot/sdk";

const client = new TrialGPTBot({
  apiKey: process.env.TRIALGPTBOT_API_KEY,
  environment: "production",
});

// List pending tasks for the CAR-T trial
const tasks = await client.tasks.list({
  trialId: "NCT04584710",
  status: "pending_review",
  limit: 50,
});

// Submit a decision with an e-signature
await client.tasks.decide("TASK-1042", {
  decision: "approved",
  reasonCode: "RC_DATA_CONCORDANT",
  signature: {
    meaning: "I have reviewed this data point and approve the AI suggestion.",
    signedAt: new Date().toISOString(),
  },
});`,
  },
  {
    id: "sdk-py",
    name: "Python",
    install: "pip install trialgptbot",
    repo: "github.com/trialgptbot/sdk-py",
    example: `from trialgptbot import TrialGPTBot
from datetime import datetime, timezone

client = TrialGPTBot(
    api_key=os.environ["TRIALGPTBOT_API_KEY"],
    environment="production",
)

# Auto-approve high-confidence tasks
job = client.tasks.auto_approve(threshold=0.85)
print(f"Job started: {job.id}")

# Wait for completion and fetch results
result = client.jobs.wait(job.id, timeout=60)
print(f"Auto-approved {result.approved_count} tasks")`,
  },
  {
    id: "sdk-curl",
    name: "cURL (no SDK)",
    install: "—",
    repo: "—",
    example: `# Exchange credentials for a bearer token
curl -X POST https://api.trialgptbot.ai/v1/auth/token \\
  -H "Content-Type: application/json" \\
  -d '{"username":"dr_chen","password":"***"}'

# List pending tasks
curl https://api.trialgptbot.ai/v1/tasks?status=pending_review \\
  -H "Authorization: Bearer $TOKEN"`,
  },
];

export const apiErrorCodes = [
  { code: "400", name: "bad_request", description: "The request body or query parameters are malformed." },
  { code: "401", name: "unauthorized", description: "Missing or invalid API token." },
  { code: "403", name: "forbidden", description: "Token lacks the required scope for this endpoint." },
  { code: "404", name: "not_found", description: "The referenced resource (task, trial, site, etc.) does not exist." },
  { code: "409", name: "conflict", description: "Concurrent modification — typically an eventual-consistency conflict on an edge sync." },
  { code: "422", name: "validation_error", description: "Request body failed schema validation. The response includes field-level error details." },
  { code: "429", name: "rate_limited", description: "Token exceeded its rate limit. Back off using the Retry-After header." },
  { code: "500", name: "internal_error", description: "Unexpected server error. The audit log captures the request ID for support." },
  { code: "503", name: "edc_unavailable", description: "An upstream EDC system is unavailable. The request will be queued and retried." },
];

/* ============================================================
   SETTINGS PAGE — scenarios
   ============================================================ */

export interface SettingsScenario {
  id: string;
  category: string;
  title: string;
  description: string;
  icon: string;
  fields: Array<{
    key: string;
    label: string;
    type: "toggle" | "select" | "number" | "text" | "password";
    value: string | number | boolean;
    options?: Array<{ value: string; label: string }>;
    min?: number;
    max?: number;
    step?: number;
    help?: string;
  }>;
}

export const settingsScenarios: SettingsScenario[] = [
  {
    id: "ai-model",
    category: "AI & Models",
    title: "AI Inference Preferences",
    description: "Control which model version is used for new tasks, the confidence threshold for auto-approval, and the fallback behavior when the model is unavailable.",
    icon: "🧠",
    fields: [
      {
        key: "activeModel",
        label: "Active model version",
        type: "select",
        value: "edge-clin-v3.4.1",
        options: [
          { value: "edge-clin-v3.4.1", label: "v3.4.1 — Clinical EDC (stable, recommended)" },
          { value: "edge-clin-v3.5.0-rc2", label: "v3.5.0-rc2 — Distilled + INT4 (faster, slight accuracy trade-off)" },
          { value: "edge-clin-v3.3.0", label: "v3.3.0 — Legacy (for audit reproduction only)" },
        ],
        help: "Changing the active model triggers a staged rollout. In-flight tasks remain on the previous version until they are decided.",
      },
      {
        key: "autoApproveThreshold",
        label: "Auto-approve confidence threshold",
        type: "number",
        value: 0.85,
        min: 0.5,
        max: 0.99,
        step: 0.01,
        help: "Tasks predicted at or above this confidence are auto-approved unless they fall into a critical risk category.",
      },
      {
        key: "fallbackBehavior",
        label: "Model-unavailable fallback",
        type: "select",
        value: "queue",
        options: [
          { value: "queue", label: "Queue for later (preserve decisions)" },
          { value: "human", label: "Route 100% to human review" },
          { value: "edge", label: "Fall back to on-site edge model" },
        ],
      },
      {
        key: "explainabilityShap",
        label: "Generate SHAP explanations for every decision",
        type: "toggle",
        value: true,
        help: "Adds ~80ms of latency per decision but is required for some regulatory filings.",
      },
    ],
  },
  {
    id: "edge-defaults",
    category: "Edge Deployment",
    title: "Edge Deployment Defaults",
    description: "Default compression and sync policy applied when pushing a new edge model to a site. Per-site overrides are available in the Edge Deployment wizard.",
    icon: "🛰️",
    fields: [
      {
        key: "int8Quantization",
        label: "INT8 post-training quantization",
        type: "toggle",
        value: true,
        help: "Largest single size reduction (~68%). Recommended for all sites.",
      },
      {
        key: "structuralPruningPct",
        label: "Structural channel pruning (%)",
        type: "number",
        value: 40,
        min: 0,
        max: 70,
        step: 5,
        help: "Removes the least-important 40% of channels. Higher = smaller model but accuracy degrades past 60%.",
      },
      {
        key: "knowledgeDistillation",
        label: "Knowledge distillation",
        type: "toggle",
        value: true,
      },
      {
        key: "weightClustering",
        label: "4-bit weight clustering (experimental)",
        type: "toggle",
        value: false,
        help: "Further compression but edge runtime support is still emerging.",
      },
      {
        key: "syncPolicy",
        label: "Sync policy",
        type: "select",
        value: "eventual_consistency",
        options: [
          { value: "eventual_consistency", label: "Eventual consistency (recommended for low-bandwidth sites)" },
          { value: "near_real_time", label: "Near real-time (sync every 60s, higher bandwidth)" },
          { value: "manual", label: "Manual sync only (operator triggers)" },
        ],
      },
      {
        key: "maxQueueDepth",
        label: "Max local queue depth before spill to disk",
        type: "number",
        value: 5000,
        min: 500,
        max: 50000,
        step: 500,
      },
    ],
  },
  {
    id: "compliance-retention",
    category: "Compliance & Audit",
    title: "Audit Trail & Data Retention",
    description: "Configures how long audit entries and source data are retained, and which e-signature meaning is presented to reviewers by default.",
    icon: "🛡️",
    fields: [
      {
        key: "auditRetentionYears",
        label: "Audit trail retention (years)",
        type: "number",
        value: 7,
        min: 3,
        max: 25,
        step: 1,
        help: "FDA 21 CFR Part 11 mandates a minimum of 7 years post-study closure.",
      },
      {
        key: "eSignatureMeaning",
        label: "Default e-signature meaning",
        type: "text",
        value: "I have reviewed this data point and approve the AI suggestion.",
      },
      {
        key: "tamperEvidentHashing",
        label: "Tamper-evident hash chain (SHA-256)",
        type: "toggle",
        value: true,
      },
      {
        key: "automaticExport",
        label: "Quarterly audit export to secure cold storage",
        type: "toggle",
        value: true,
      },
    ],
  },
  {
    id: "notifications",
    category: "Notifications",
    title: "Notification Routing",
    description: "Where and how reviewers, supervisors, and compliance officers are notified of new tasks, escalations, drift events, and sync conflicts.",
    icon: "🔔",
    fields: [
      {
        key: "emailNotifications",
        label: "Email notifications",
        type: "toggle",
        value: true,
      },
      {
        key: "slackWebhook",
        label: "Slack webhook URL",
        type: "text",
        value: "https://hooks.slack.com/services/T000/B000/XXXX",
      },
      {
        key: "escalationChannel",
        label: "Escalation channel",
        type: "select",
        value: "slack",
        options: [
          { value: "email", label: "Email only" },
          { value: "slack", label: "Slack #clinical-escalations" },
          { value: "pagerduty", label: "PagerDuty (critical only)" },
          { value: "teams", label: "Microsoft Teams" },
        ],
      },
      {
        key: "driftAlertThreshold",
        label: "Drift alert threshold (PSI)",
        type: "number",
        value: 2.5,
        min: 0.5,
        max: 10,
        step: 0.1,
        help: "Triggers a model-drift notification when PSI crosses this threshold.",
      },
      {
        key: "quietHoursStart",
        label: "Quiet hours start (local)",
        type: "text",
        value: "22:00",
      },
      {
        key: "quietHoursEnd",
        label: "Quiet hours end (local)",
        type: "text",
        value: "07:00",
      },
    ],
  },
  {
    id: "security",
    category: "Security",
    title: "Security & Authentication",
    description: "SSO provider, MFA enforcement, session lifetime, and IP allow-listing for production tokens.",
    icon: "🔐",
    fields: [
      {
        key: "ssoProvider",
        label: "SSO provider",
        type: "select",
        value: "okta",
        options: [
          { value: "okta", label: "Okta (SAML 2.0)" },
          { value: "azuread", label: "Azure AD (OIDC)" },
          { value: "google", label: "Google Workspace" },
          { value: "internal", label: "Internal (username + password)" },
        ],
      },
      {
        key: "mfaRequired",
        label: "Require MFA for all reviewers",
        type: "toggle",
        value: true,
      },
      {
        key: "sessionLifetimeMin",
        label: "Session lifetime (minutes)",
        type: "number",
        value: 60,
        min: 15,
        max: 480,
        step: 15,
      },
      {
        key: "ipAllowlist",
        label: "Production token IP allow-list (CIDR, comma-separated)",
        type: "text",
        value: "10.0.0.0/8, 192.168.0.0/16",
      },
      {
        key: "apiTokenRotationDays",
        label: "API token rotation (days)",
        type: "number",
        value: 90,
        min: 30,
        max: 365,
        step: 1,
      },
    ],
  },
  {
    id: "developer",
    category: "Developer",
    title: "Developer & API Tokens",
    description: "Issue and rotate API tokens, register webhook endpoints, and toggle sandbox mode for testing without writing back to EDC systems.",
    icon: "🛠️",
    fields: [
      {
        key: "sandboxMode",
        label: "Sandbox mode (no EDC write-back)",
        type: "toggle",
        value: false,
        help: "When enabled, all decisions are logged but never written back to the EDC. Use for UAT.",
      },
      {
        key: "webhookUrl",
        label: "Default webhook URL",
        type: "text",
        value: "https://hooks.example.com/trialgptbot",
      },
      {
        key: "webhookHmacSecret",
        label: "Webhook HMAC secret",
        type: "password",
        value: "whsec_••••••••••••••••",
      },
      {
        key: "rateLimitTier",
        label: "Rate-limit tier",
        type: "select",
        value: "enterprise",
        options: [
          { value: "free", label: "Free — 60 req/min" },
          { value: "pro", label: "Pro — 300 req/min" },
          { value: "enterprise", label: "Enterprise — 1200 req/min" },
          { value: "custom", label: "Custom SLA" },
        ],
      },
    ],
  },
  {
    id: "privacy-ml-config",
    category: "Privacy-Preserving ML",
    title: "Differential Privacy & SMPC",
    description: "Quarterly epsilon budget, default DP mechanism, and SMPC protocol policy. Changes here apply to every new privacy-preserving query and consortium computation.",
    icon: "🔐",
    fields: [
      {
        key: "dpMechanism",
        label: "Default DP mechanism",
        type: "select",
        value: "gaussian",
        options: [
          { value: "gaussian", label: "Gaussian (better for high-dimensional)" },
          { value: "laplace", label: "Laplace (simpler, single-query)" },
          { value: "exponential", label: "Exponential (for non-numerical)" },
        ],
      },
      {
        key: "epsilonBudget",
        label: "Quarterly ε budget (per dataset)",
        type: "number",
        value: 2.5,
        min: 0.1,
        max: 10,
        step: 0.1,
        help: "Lower = more private, noisier. ε ≤ 2.5 is considered strong privacy per NIST SP 800-188.",
      },
      {
        key: "deltaValue",
        label: "δ (failure probability)",
        type: "text",
        value: "1e-9",
        help: "Should be ≤ 1/n where n is dataset size.",
      },
      {
        key: "compositionMethod",
        label: "Composition accounting",
        type: "select",
        value: "advanced",
        options: [
          { value: "advanced", label: "Advanced ( moments accountant — recommended)" },
          { value: "basic", label: "Basic (sequential composition)" },
          { value: "rzK", label: "Rényi DP (zCDP, tighter)" },
        ],
      },
      {
        key: "smpcProtocol",
        label: "Default SMPC protocol",
        type: "select",
        value: "spdz",
        options: [
          { value: "spdz", label: "SPDZ (malicious-secure, recommended)" },
          { value: "bgw", label: "BGW (semi-honest, faster)" },
          { value: "gmw", label: "GMW (good for boolean circuits)" },
          { value: "falcon", label: "Falcon (4-party, honest-majority)" },
        ],
      },
      {
        key: "federatedAveraging",
        label: "Enable DP-FedAvg for federated rounds",
        type: "toggle",
        value: true,
        help: "Combines federated learning with differential privacy at each round.",
      },
      {
        key: "kAnonymityMin",
        label: "Minimum k-anonymity",
        type: "number",
        value: 5,
        min: 2,
        max: 50,
        step: 1,
        help: "Any released group must contain at least this many subjects.",
      },
    ],
  },
  {
    id: "digital-twin-config",
    category: "Digital Twin Prototypes",
    title: "Twin Modeling & Simulation Policy",
    description: "Controls how subject digital twins are trained, refreshed, and used for counterfactual 'what-if' simulations and mid-course correction recommendations.",
    icon: "🧬",
    fields: [
      {
        key: "activeTwinModel",
        label: "Active twin model version",
        type: "select",
        value: "twin-v2.1.4",
        options: [
          { value: "twin-v2.1.4", label: "twin-v2.1.4 (production — transformer + ODE)" },
          { value: "twin-v2.1.0", label: "twin-v2.1.0 (transformer only)" },
          { value: "twin-v1.4.2-ped", label: "twin-v1.4.2-ped (pediatric specialist)" },
        ],
        help: "Pediatric subjects automatically use the -ped variant regardless of this setting.",
      },
      {
        key: "refreshCadenceHours",
        label: "Twin refresh cadence (hours)",
        type: "number",
        value: 6,
        min: 1,
        max: 72,
        step: 1,
        help: "How often each twin is retrained on new subject data.",
      },
      {
        key: "minFidelityForRecommendation",
        label: "Minimum R² to issue recommendations",
        type: "number",
        value: 0.75,
        min: 0.5,
        max: 0.95,
        step: 0.05,
        help: "Below this fidelity, twin simulations are surfaced as informational only.",
      },
      {
        key: "predictionHorizonDays",
        label: "Prediction horizon (days)",
        type: "number",
        value: 180,
        min: 30,
        max: 365,
        step: 30,
      },
      {
        key: "counterfactualSamples",
        label: "Counterfactual samples per what-if run",
        type: "number",
        value: 1000,
        min: 100,
        max: 10000,
        step: 100,
        help: "More samples = tighter confidence intervals but longer run time.",
      },
      {
        key: "autoIssueCorrections",
        label: "Auto-issue mid-course corrections above 85% confidence",
        type: "toggle",
        value: false,
        help: "When off, corrections are surfaced for human review regardless of confidence.",
      },
      {
        key: "irbApprovalRequired",
        label: "Require IRB approval for protocol-modifying recommendations",
        type: "toggle",
        value: true,
      },
    ],
  },
];

/* ============================================================
   EDGE DEPLOYMENT WIZARD — model catalog
   ============================================================ */

export interface EdgeBaseModel {
  id: string;
  name: string;
  sizeMb: number;
  accuracyPct: number;
  notes: string;
  recommended?: boolean;
}

export const edgeBaseModels: EdgeBaseModel[] = [
  {
    id: "edge-clin-v3.4.1",
    name: "Clinical EDC v3.4.1 (production)",
    sizeMb: 412.0,
    accuracyPct: 96.8,
    notes: "Stable baseline. INT8 + 40% pruning yields ~16% compression with <1% accuracy loss.",
    recommended: true,
  },
  {
    id: "edge-clin-v3.5.0-rc2",
    name: "Clinical EDC v3.5.0-rc2 (distilled)",
    sizeMb: 248.0,
    accuracyPct: 96.2,
    notes: "Distilled from v3.4.1. Smaller starting point — final compression target reachable with less pruning.",
  },
  {
    id: "edge-clin-v3.3.0",
    name: "Clinical EDC v3.3.0 (legacy)",
    sizeMb: 458.0,
    accuracyPct: 95.4,
    notes: "Use only for audit reproduction of historical decisions.",
  },
];

export interface CompressionTechniqueOption {
  id: string;
  name: string;
  description: string;
  sizeReductionPct: number;
  latencyImpactPct: number;
  accuracyDeltaPct: number;
  defaultApplied: boolean;
}

export const compressionTechniqueOptions: CompressionTechniqueOption[] = [
  {
    id: "int8",
    name: "INT8 Post-Training Quantization",
    description: "Quantizes FP32 weights to 8-bit integers. The single largest size reduction; supported by every edge runtime.",
    sizeReductionPct: 68.4,
    latencyImpactPct: -42.1,
    accuracyDeltaPct: -0.3,
    defaultApplied: true,
  },
  {
    id: "pruning",
    name: "Structural Channel Pruning (40%)",
    description: "Removes the least-important 40% of channels based on magnitude + sensitivity analysis.",
    sizeReductionPct: 21.7,
    latencyImpactPct: -18.6,
    accuracyDeltaPct: -0.8,
    defaultApplied: true,
  },
  {
    id: "distillation",
    name: "Knowledge Distillation",
    description: "Trains a smaller student model to mimic the teacher. Compound with INT8 for best results.",
    sizeReductionPct: 6.2,
    latencyImpactPct: -7.4,
    accuracyDeltaPct: 0.4,
    defaultApplied: true,
  },
  {
    id: "clustering",
    name: "4-bit Weight Clustering (experimental)",
    description: "Clusters weights into 16 centroids. Further compression but runtime support is still emerging.",
    sizeReductionPct: 11.8,
    latencyImpactPct: -3.2,
    accuracyDeltaPct: -1.6,
    defaultApplied: false,
  },
];

/* ============================================================
   LIVE SYNC STREAM — server-side SSE event generator
   ============================================================ */

export interface EdgeSyncEvent {
  ts: string;
  siteId: string;
  event: "queue" | "sync_started" | "sync_completed" | "conflict" | "merged";
  records: number;
  detail?: string;
}

/** Sites that are actively syncing (i.e. not pending_deploy / offline-with-zero-queue). */
export const liveSyncSiteIds = [
  "SITE-001",
  "SITE-007",
  "SITE-LAG-01",
  "SITE-NBO-02",
  "SITE-JKT-03",
  "SITE-DAC-05",
  "SITE-ACC-06",
  "SITE-CAI-07",
  // New emerging-market deployments (India, Brazil, Colombia, UAE)
  "SITE-BOM-11",
  "SITE-DEL-12",
  "SITE-SAO-13",
  "SITE-BOG-14",
  "SITE-AUH-15",
];

const SYNC_EVENT_TEMPLATES: Array<Omit<EdgeSyncEvent, "ts" | "siteId">> = [
  { event: "sync_completed", records: 0, detail: "no pending records — heartbeat" },
  { event: "sync_started",   records: 0, detail: "delta sync started" },
  { event: "queue",          records: 0, detail: "new record queued locally" },
  { event: "sync_completed", records: 0, detail: "incremental push to cloud" },
  { event: "sync_completed", records: 0, detail: "incremental push to cloud" },
  { event: "conflict",       records: 0, detail: "concurrent edit detected — auto-merge attempted" },
  { event: "merged",         records: 0, detail: "merged using last-writer-wins + reviewer override" },
  { event: "queue",          records: 0, detail: "low uplink — record held in local queue" },
  { event: "sync_completed", records: 0, detail: "backfill completed" },
];

/**
 * Generate a single random sync event. Used by the SSE endpoint to
 * simulate a live WebSocket feed without requiring a custom server.
 */
export function generateRandomSyncEvent(): EdgeSyncEvent {
  const siteId = liveSyncSiteIds[Math.floor(Math.random() * liveSyncSiteIds.length)];
  const template = SYNC_EVENT_TEMPLATES[Math.floor(Math.random() * SYNC_EVENT_TEMPLATES.length)];
  const records =
    template.event === "queue"
      ? 1 + Math.floor(Math.random() * 8)
      : template.event === "sync_completed" || template.event === "merged"
        ? 3 + Math.floor(Math.random() * 60)
        : template.event === "sync_started"
          ? 5 + Math.floor(Math.random() * 40)
          : 1 + Math.floor(Math.random() * 4);
  return {
    ts: new Date().toISOString(),
    siteId,
    event: template.event,
    records,
    detail: template.detail,
  };
}

/* ============================================================
   FEATURE #8 — PRIVACY-PRESERVING ML
   Differential Privacy + Secure Multi-Party Computation
   ============================================================ */

export interface PrivacyPostureKpi {
  label: string;
  value: string;
  hint: string;
  deltaPct?: number;
  trend: "up-good" | "down-good" | "up-bad" | "down-bad" | "flat";
}

export const privacyPostureKpis: PrivacyPostureKpi[] = [
  {
    label: "Epsilon budget remaining",
    value: "ε 1.84",
    hint: "of ε 2.50 quarterly allocation",
    deltaPct: -8.2,
    trend: "down-bad",
  },
  {
    label: "Active SMPC sessions",
    value: "7",
    hint: "across 4 consortia",
    deltaPct: 16.6,
    trend: "up-good",
  },
  {
    label: "Federated rounds this week",
    value: "23",
    hint: "avg 4.6 sites/round",
    deltaPct: 12.0,
    trend: "up-good",
  },
  {
    label: "Re-identification risk",
    value: "0.014%",
    hint: "k-anonymity = 11 (target ≥ 5)",
    deltaPct: -3.1,
    trend: "down-good",
  },
  {
    label: "Privacy audit events (24h)",
    value: "1,284",
    hint: "100% written to tamper-evident chain",
    trend: "flat",
  },
];

export interface DifferentialPrivacyConfig {
  mechanism: "Gaussian" | "Laplace" | "Exponential";
  epsilon: number;
  delta: number;
  sensitivity: number;
  noiseStdDev: number;
  composition: "advanced" | "basic" | "rzK";
  allocatedBudget: number;
  consumedBudget: number;
  remainingBudget: number;
}

export const differentialPrivacyConfig: DifferentialPrivacyConfig = {
  mechanism: "Gaussian",
  epsilon: 2.5,
  delta: 1e-9,
  sensitivity: 1.0,
  noiseStdDev: 0.49,
  composition: "advanced",
  allocatedBudget: 2.5,
  consumedBudget: 0.66,
  remainingBudget: 1.84,
};

export interface PrivacyBudgetRow {
  dataset: string;
  owner: string;
  allocatedEpsilon: number;
  consumedEpsilon: number;
  queries: number;
  lastUsed: string;
  status: "healthy" | "watch" | "depleted";
}

export const privacyBudgetUsage: PrivacyBudgetRow[] = [
  {
    dataset: "ONCO-2024-PRINCIPAL",
    owner: "Principal Pharma",
    allocatedEpsilon: 1.0,
    consumedEpsilon: 0.41,
    queries: 847,
    lastUsed: "12 min ago",
    status: "healthy",
  },
  {
    dataset: "CARDIO-NORDIC-ARM",
    owner: "Nordic Trial Group",
    allocatedEpsilon: 0.6,
    consumedEpsilon: 0.39,
    queries: 412,
    lastUsed: "1 hr ago",
    status: "watch",
  },
  {
    dataset: "PEDIATRIC-RARE-DISEASE",
    owner: "Rare Disease Consortium",
    allocatedEpsilon: 0.4,
    consumedEpsilon: 0.38,
    queries: 196,
    lastUsed: "44 min ago",
    status: "watch",
  },
  {
    dataset: "VACCINE-PHASE-III",
    owner: "Global Health Initiative",
    allocatedEpsilon: 0.5,
    consumedEpsilon: 0.12,
    queries: 89,
    lastUsed: "3 hr ago",
    status: "healthy",
  },
  {
    dataset: "NEURO-EARLY-PARKINSONS",
    owner: "Academic Coalition",
    allocatedEpsilon: 0.3,
    consumedEpsilon: 0.27,
    queries: 64,
    lastUsed: "8 hr ago",
    status: "depleted",
  },
];

export interface SmpcParty {
  id: string;
  name: string;
  role: "initiator" | "contributor" | "aggregator";
  dataShards: number;
  encryptedCommitmentHash: string;
  online: boolean;
}

export interface SmpcSession {
  id: string;
  consortium: string;
  computation: string;
  protocol: "BGW" | "SPDZ" | "GMW" | "Falcon";
  parties: SmpcParty[];
  status: "key_exchange" | "computing" | "verification" | "completed" | "failed";
  startedAt: string;
  progressPct: number;
  outputHash?: string;
  jointAccuracyPct?: number;
}

export const smpcSessions: SmpcSession[] = [
  {
    id: "SMPC-2026-0214",
    consortium: "Pan-Oncology Survival Model",
    computation: "Cox proportional hazards — joint training on 14,200 subjects",
    protocol: "SPDZ",
    status: "computing",
    startedAt: "14:02 UTC",
    progressPct: 67,
    parties: [
      { id: "p1", name: "Principal Pharma", role: "initiator", dataShards: 4200, encryptedCommitmentHash: "0x9af3…be21", online: true },
      { id: "p2", name: "MerckSharpeDohme", role: "contributor", dataShards: 3800, encryptedCommitmentHash: "0xc12d…7733", online: true },
      { id: "p3", name: "Roche-Genentech", role: "contributor", dataShards: 3100, encryptedCommitmentHash: "0x4fae…991c", online: true },
      { id: "p4", name: "Academic Coalition", role: "aggregator", dataShards: 0, encryptedCommitmentHash: "0x88b1…2e0a", online: true },
    ],
  },
  {
    id: "SMPC-2026-0213",
    consortium: "Cardiovascular Endpoint Aggregation",
    computation: "Kaplan-Meier aggregate — 3-trial meta-analysis",
    protocol: "BGW",
    status: "verification",
    startedAt: "11:48 UTC",
    progressPct: 88,
    jointAccuracyPct: 94.7,
    parties: [
      { id: "p1", name: "Nordic Trial Group", role: "initiator", dataShards: 2900, encryptedCommitmentHash: "0x1c4f…8e02", online: true },
      { id: "p2", name: "UK Biobank Affiliate", role: "contributor", dataShards: 2400, encryptedCommitmentHash: "0xb729…aa44", online: true },
      { id: "p3", name: "Stanford Cardio", role: "aggregator", dataShards: 0, encryptedCommitmentHash: "0xf2a8…101c", online: true },
    ],
  },
  {
    id: "SMPC-2026-0212",
    consortium: "Rare Disease Genomic Joint Inference",
    computation: "Variant pathogenicity scoring — homozygous rare variants",
    protocol: "Falcon",
    status: "completed",
    startedAt: "Yesterday 18:14 UTC",
    progressPct: 100,
    jointAccuracyPct: 91.2,
    outputHash: "0x4d2f…8c11",
    parties: [
      { id: "p1", name: "Rare Disease Consortium", role: "initiator", dataShards: 1100, encryptedCommitmentHash: "0x7e21…d4f8", online: false },
      { id: "p2", name: "Broad Institute", role: "contributor", dataShards: 950, encryptedCommitmentHash: "0x291a…7b3c", online: false },
      { id: "p3", name: "NIH Rare Diseases", role: "aggregator", dataShards: 0, encryptedCommitmentHash: "0xa220…cc91", online: false },
    ],
  },
  {
    id: "SMPC-2026-0211",
    consortium: "Vaccine Safety Signal Detection",
    computation: "Adverse-event rate comparison across 5 sponsors",
    protocol: "GMW",
    status: "key_exchange",
    startedAt: "5 min ago",
    progressPct: 9,
    parties: [
      { id: "p1", name: "Global Health Initiative", role: "initiator", dataShards: 5800, encryptedCommitmentHash: "0xa7d9…b1f2", online: true },
      { id: "p2", name: "Pfizer Clinical", role: "contributor", dataShards: 4100, encryptedCommitmentHash: "—", online: true },
      { id: "p3", name: "Moderna Research", role: "contributor", dataShards: 3600, encryptedCommitmentHash: "—", online: true },
      { id: "p4", name: "Janssen R&D", role: "contributor", dataShards: 2900, encryptedCommitmentHash: "—", online: false },
      { id: "p5", name: "EMA Joint", role: "aggregator", dataShards: 0, encryptedCommitmentHash: "—", online: true },
    ],
  },
];

export interface ConsortiumAccessMatrix {
  org: string;
  datasets: { name: string; access: "compute" | "aggregate" | "denied" }[];
}

export const consortiumAccessMatrix: ConsortiumAccessMatrix[] = [
  {
    org: "Principal Pharma",
    datasets: [
      { name: "ONCO-2024", access: "compute" },
      { name: "CARDIO-NORDIC", access: "aggregate" },
      { name: "PEDIATRIC-RARE", access: "denied" },
      { name: "VACCINE-III", access: "compute" },
    ],
  },
  {
    org: "Nordic Trial Group",
    datasets: [
      { name: "ONCO-2024", access: "aggregate" },
      { name: "CARDIO-NORDIC", access: "compute" },
      { name: "PEDIATRIC-RARE", access: "denied" },
      { name: "VACCINE-III", access: "aggregate" },
    ],
  },
  {
    org: "Rare Disease Consortium",
    datasets: [
      { name: "ONCO-2024", access: "denied" },
      { name: "CARDIO-NORDIC", access: "denied" },
      { name: "PEDIATRIC-RARE", access: "compute" },
      { name: "VACCINE-III", access: "denied" },
    ],
  },
  {
    org: "Global Health Initiative",
    datasets: [
      { name: "ONCO-2024", access: "aggregate" },
      { name: "CARDIO-NORDIC", access: "compute" },
      { name: "PEDIATRIC-RARE", access: "aggregate" },
      { name: "VACCINE-III", access: "compute" },
    ],
  },
];

export interface PrivacyAuditEvent {
  ts: string;
  actor: string;
  query: string;
  mechanism: string;
  epsilonCost: number;
  result: "released" | "denied" | "throttled";
}

export const privacyAuditFeed: PrivacyAuditEvent[] = [
  { ts: "14:31:08", actor: "dr.kapoor@principal", query: "Cox survival on ONCO arm B", mechanism: "Gaussian DP (ε=0.12)", epsilonCost: 0.12, result: "released" },
  { ts: "14:30:42", actor: "SMPC-2026-0214", query: "joint gradient round 41", mechanism: "SPDZ + DP-FedAvg", epsilonCost: 0.04, result: "released" },
  { ts: "14:29:55", actor: "researcher@nordic", query: "Kaplan-Meier on cardio sub-group", mechanism: "Gaussian DP (ε=0.08)", epsilonCost: 0.08, result: "released" },
  { ts: "14:28:11", actor: "dr.osei@ghp", query: "AE rate comparison — vaccine arms", mechanism: "SMPC-GMW (ε=0.0)", epsilonCost: 0.0, result: "released" },
  { ts: "14:27:33", actor: "intern@academic", query: "raw record export — PEDIATRIC-RARE", mechanism: "—", epsilonCost: 0.0, result: "denied" },
  { ts: "14:26:48", actor: "dr.kapoor@principal", query: "individual re-identification scan", mechanism: "—", epsilonCost: 0.0, result: "denied" },
  { ts: "14:25:30", actor: "researcher@nordic", query: "sub-group survival query (3rd today)", mechanism: "Gaussian DP (ε=0.10)", epsilonCost: 0.0, result: "throttled" },
];

/* ============================================================
   FEATURE #9 — DIGITAL TWIN PROTOTYPES
   Subject-level computational models for trial simulation
   ============================================================ */

export interface DigitalTwinKpi {
  label: string;
  value: string;
  hint: string;
  deltaPct?: number;
  trend: "up-good" | "down-good" | "up-bad" | "down-bad" | "flat";
}

export const digitalTwinKpis: DigitalTwinKpi[] = [
  {
    label: "Subjects modeled",
    value: "1,842",
    hint: "of 2,140 enrolled (86.1%)",
    deltaPct: 4.2,
    trend: "up-good",
  },
  {
    label: "Trajectory fidelity",
    value: "0.91",
    hint: "mean R² vs. observed outcomes",
    deltaPct: 1.8,
    trend: "up-good",
  },
  {
    label: "Active simulations",
    value: "37",
    hint: "across 11 trials",
    deltaPct: 12.1,
    trend: "up-good",
  },
  {
    label: "What-if runs (30d)",
    value: "286",
    hint: "118 mid-course recommendations issued",
    deltaPct: -2.4,
    trend: "down-bad",
  },
  {
    label: "Prediction horizon",
    value: "180 days",
    hint: "validated up to 6 months forward",
    trend: "flat",
  },
];

export interface SubjectTwin {
  subjectId: string;
  trialId: string;
  ageBand: string;
  sex: "F" | "M" | "U";
  indication: string;
  modelVersion: string;
  fidelityScore: number;
  lastUpdated: string;
  dataStreams: string[];
  predictedOutcome: "responder" | "stable" | "progressor" | "adverse_event";
  confidencePct: number;
}

export const subjectTwins: SubjectTwin[] = [
  {
    subjectId: "SUBJ-0042",
    trialId: "ONCO-2024",
    ageBand: "55-64",
    sex: "F",
    indication: "NSCLC — Stage IIIA",
    modelVersion: "twin-v2.1.4",
    fidelityScore: 0.94,
    lastUpdated: "2 hr ago",
    dataStreams: ["labs", "imaging", "vitals", "PROs"],
    predictedOutcome: "responder",
    confidencePct: 87,
  },
  {
    subjectId: "SUBJ-0117",
    trialId: "ONCO-2024",
    ageBand: "65-74",
    sex: "M",
    indication: "NSCLC — Stage IIIB",
    modelVersion: "twin-v2.1.4",
    fidelityScore: 0.88,
    lastUpdated: "5 hr ago",
    dataStreams: ["labs", "imaging", "vitals"],
    predictedOutcome: "progressor",
    confidencePct: 72,
  },
  {
    subjectId: "SUBJ-0301",
    trialId: "CARDIO-NORDIC",
    ageBand: "45-54",
    sex: "F",
    indication: "HFrEF — NYHA III",
    modelVersion: "twin-v2.0.9",
    fidelityScore: 0.91,
    lastUpdated: "1 hr ago",
    dataStreams: ["labs", "ecg", "echo", "vitals", "PROs"],
    predictedOutcome: "stable",
    confidencePct: 81,
  },
  {
    subjectId: "SUBJ-0588",
    trialId: "CARDIO-NORDIC",
    ageBand: "65-74",
    sex: "M",
    indication: "HFrEF — NYHA IV",
    modelVersion: "twin-v2.0.9",
    fidelityScore: 0.79,
    lastUpdated: "3 hr ago",
    dataStreams: ["labs", "ecg", "vitals"],
    predictedOutcome: "adverse_event",
    confidencePct: 64,
  },
  {
    subjectId: "SUBJ-0903",
    trialId: "PEDIATRIC-RARE",
    ageBand: "08-12",
    sex: "U",
    indication: "MPS II (Hunter)",
    modelVersion: "twin-v1.4.2-ped",
    fidelityScore: 0.86,
    lastUpdated: "30 min ago",
    dataStreams: ["labs", "imaging", "neurocog"],
    predictedOutcome: "stable",
    confidencePct: 78,
  },
  {
    subjectId: "SUBJ-1204",
    trialId: "VACCINE-III",
    ageBand: "25-34",
    sex: "F",
    indication: "Phase III — prophylactic",
    modelVersion: "twin-v2.1.0",
    fidelityScore: 0.93,
    lastUpdated: "12 min ago",
    dataStreams: ["labs", "vitals", "PROs"],
    predictedOutcome: "responder",
    confidencePct: 91,
  },
];

export interface OutcomeTrajectoryPoint {
  day: number;
  observed?: number;
  predicted: number;
  lower: number;
  upper: number;
}

/** Trajectory series for the currently selected twin (SUBJ-0042). */
export const trajectorySeries: OutcomeTrajectoryPoint[] = [
  { day: 0,   observed: 100, predicted: 100, lower: 100,  upper: 100 },
  { day: 30,  observed: 96,  predicted: 96.4, lower: 92,  upper: 99 },
  { day: 60,  observed: 91,  predicted: 90.2, lower: 84,  upper: 95 },
  { day: 90,  observed: 84,  predicted: 84.6, lower: 76,  upper: 91 },
  { day: 120, observed: 77,  predicted: 78.1, lower: 67,  upper: 87 },
  { day: 150, observed: 72,  predicted: 71.8, lower: 59,  upper: 82 },
  { day: 180, observed: 68,  predicted: 66.3, lower: 52,  upper: 78 },
  { day: 210,                  predicted: 61.0, lower: 45,  upper: 74 },
  { day: 240,                  predicted: 56.2, lower: 38,  upper: 71 },
  { day: 270,                  predicted: 52.1, lower: 31,  upper: 69 },
  { day: 300,                  predicted: 48.4, lower: 25,  upper: 68 },
  { day: 330,                  predicted: 45.1, lower: 20,  upper: 67 },
  { day: 360,                  predicted: 42.0, lower: 16,  upper: 66 },
];

export interface WhatIfScenario {
  id: string;
  name: string;
  modification: string;
  endpointDeltaPct: number;
  dropoutDeltaPct: number;
  enrollmentWeeksDelta: number;
  powerDeltaPct: number;
  recommended: boolean;
}

export const whatIfScenarios: WhatIfScenario[] = [
  {
    id: "wf-base",
    name: "Baseline (current protocol)",
    modification: "No change.",
    endpointDeltaPct: 0,
    dropoutDeltaPct: 0,
    enrollmentWeeksDelta: 0,
    powerDeltaPct: 0,
    recommended: false,
  },
  {
    id: "wf-dose",
    name: "Reduce dose by 25%",
    modification: "Lower dose in cycle 2-4 to mitigate Grade ≥3 neutropenia.",
    endpointDeltaPct: -3.2,
    dropoutDeltaPct: -8.1,
    enrollmentWeeksDelta: 0,
    powerDeltaPct: -1.4,
    recommended: false,
  },
  {
    id: "wf-window",
    name: "Widen visit window ±5 days",
    modification: "Allow ±5-day visit window to reduce protocol deviations.",
    endpointDeltaPct: 0.4,
    dropoutDeltaPct: -2.3,
    enrollmentWeeksDelta: -1,
    powerDeltaPct: 0.2,
    recommended: true,
  },
  {
    id: "wf-stratify",
    name: "Add PD-L1 stratification",
    modification: "Re-stratify randomization by PD-L1 ≥ 50%.",
    endpointDeltaPct: 6.8,
    dropoutDeltaPct: 0,
    enrollmentWeeksDelta: 2,
    powerDeltaPct: 4.1,
    recommended: true,
  },
  {
    id: "wf-site",
    name: "Open 3 additional sites (emerging mkts)",
    modification: "Add sites in Lagos, Nairobi, Jakarta to accelerate enrollment.",
    endpointDeltaPct: 0,
    dropoutDeltaPct: 1.1,
    enrollmentWeeksDelta: -6,
    powerDeltaPct: 0.0,
    recommended: true,
  },
  {
    id: "wf-ai",
    name: "AI-assisted adherence nudges",
    modification: "Daily AI SMS/WhatsApp reminders + ePRO coaching.",
    endpointDeltaPct: 1.6,
    dropoutDeltaPct: -5.4,
    enrollmentWeeksDelta: 0,
    powerDeltaPct: 0.8,
    recommended: true,
  },
];

export interface TrialForecast {
  trialId: string;
  indication: string;
  enrollmentForecast: { current: number; target: number; weeksRemaining: number; weeksAtPace: number };
  dropoutProbability: number;
  endpointAchievementPct: number;
  projectedPower: number;
  flag: "on-track" | "watch" | "at-risk";
}

export const trialForecasts: TrialForecast[] = [
  {
    trialId: "ONCO-2024",
    indication: "NSCLC — Stage III",
    enrollmentForecast: { current: 412, target: 600, weeksRemaining: 22, weeksAtPace: 19 },
    dropoutProbability: 0.11,
    endpointAchievementPct: 78,
    projectedPower: 0.84,
    flag: "on-track",
  },
  {
    trialId: "CARDIO-NORDIC",
    indication: "HFrEF — NYHA III-IV",
    enrollmentForecast: { current: 287, target: 480, weeksRemaining: 18, weeksAtPace: 24 },
    dropoutProbability: 0.18,
    endpointAchievementPct: 64,
    projectedPower: 0.71,
    flag: "at-risk",
  },
  {
    trialId: "PEDIATRIC-RARE",
    indication: "MPS II (Hunter)",
    enrollmentForecast: { current: 38, target: 60, weeksRemaining: 14, weeksAtPace: 16 },
    dropoutProbability: 0.06,
    endpointAchievementPct: 81,
    projectedPower: 0.78,
    flag: "watch",
  },
  {
    trialId: "VACCINE-III",
    indication: "Phase III prophylactic",
    enrollmentForecast: { current: 4820, target: 6000, weeksRemaining: 6, weeksAtPace: 5 },
    dropoutProbability: 0.04,
    endpointAchievementPct: 92,
    projectedPower: 0.96,
    flag: "on-track",
  },
];

export interface MidCourseCorrection {
  id: string;
  trialId: string;
  category: "enrollment" | "retention" | "endpoint" | "operational" | "safety";
  title: string;
  rationale: string;
  expectedImpact: string;
  confidencePct: number;
  status: "proposed" | "review" | "approved" | "rejected";
}

export const midCourseCorrections: MidCourseCorrection[] = [
  {
    id: "MCC-2026-0091",
    trialId: "CARDIO-NORDIC",
    category: "enrollment",
    title: "Open 3 sites in emerging markets (Lagos, Nairobi, Jakarta)",
    rationale:
      "At current enrollment pace (16 subjects/wk) the trial will miss its target by 6 weeks. The digital twin projects that opening these 3 sites — which already have edge models deployed — closes the gap within 4.5 weeks at 95% confidence.",
    expectedImpact: "+6 weeks faster enrollment, +0.02 projected power",
    confidencePct: 92,
    status: "review",
  },
  {
    id: "MCC-2026-0090",
    trialId: "CARDIO-NORDIC",
    category: "retention",
    title: "Deploy AI adherence nudges for subjects 60+ with PRO < 70",
    rationale:
      "Twin simulations identify 47 subjects at >30% dropout probability in the next 90 days. AI-assisted SMS/WhatsApp coaching + ePRO reminders reduced dropout by 5.4% in 6 historical analogs.",
    expectedImpact: "-5.4% dropout, +0.04 projected power",
    confidencePct: 87,
    status: "proposed",
  },
  {
    id: "MCC-2026-0089",
    trialId: "ONCO-2024",
    category: "endpoint",
    title: "Add PD-L1 ≥ 50% stratification factor",
    rationale:
      "Twin counterfactuals show that PD-L1 high subjects are 2.3× more likely to respond. Re-stratifying reduces variance on the primary endpoint and adds 4.1% to projected power.",
    expectedImpact: "+6.8% endpoint sensitivity, +4.1% power",
    confidencePct: 81,
    status: "approved",
  },
  {
    id: "MCC-2026-0088",
    trialId: "PEDIATRIC-RARE",
    category: "safety",
    title: "Tighten AST/ALT monitoring cadence to weekly for first 8 weeks",
    rationale:
      "Twin simulations flag 2 subjects projected to cross Hy's law threshold by week 6 with 70% probability. Weekly LFTs detect the trajectory 14 days earlier than the current biweekly schedule.",
    expectedImpact: "Earlier signal detection, ~0 subjects at risk",
    confidencePct: 74,
    status: "review",
  },
  {
    id: "MCC-2026-0087",
    trialId: "VACCINE-III",
    category: "operational",
    title: "Widen visit window ±5 days for booster dose",
    rationale:
      "Twins predict 312 subjects will miss their strict booster window due to logistical friction. A ±5-day window preserves immunogenicity capture while reducing protocol deviations by 78%.",
    expectedImpact: "-78% protocol deviations, +0.4% endpoint fidelity",
    confidencePct: 89,
    status: "approved",
  },
];

/* ============================================================
   ENHANCED ANALYTICS — extended visualizations
   AUC/ROC, cohort analytics, fairness heatmap, geography map,
   drift heatmap, time-range-aware throughput series.
   ============================================================ */

export interface AnalyticsRocPoint {
  fpr: number; // false positive rate, 0..1
  tpr: number; // true positive rate, 0..1
}

export interface AnalyticsRocCurve {
  modelId: string;
  auc: number;
  points: AnalyticsRocPoint[];
  /** Operating point shown as a marker on the curve */
  operatingPoint?: { threshold: number; tpr: number; fpr: number };
}

/** ROC curves for the active model + 2 baselines (for comparison). */
export const analyticsRocCurves: AnalyticsRocCurve[] = [
  {
    modelId: "edge-clin-v3.4.1",
    auc: 0.964,
    points: [
      { fpr: 0.0, tpr: 0.0 },
      { fpr: 0.02, tpr: 0.42 },
      { fpr: 0.04, tpr: 0.61 },
      { fpr: 0.06, tpr: 0.74 },
      { fpr: 0.08, tpr: 0.82 },
      { fpr: 0.1, tpr: 0.87 },
      { fpr: 0.14, tpr: 0.91 },
      { fpr: 0.18, tpr: 0.94 },
      { fpr: 0.22, tpr: 0.96 },
      { fpr: 0.28, tpr: 0.97 },
      { fpr: 0.36, tpr: 0.98 },
      { fpr: 0.5, tpr: 0.99 },
      { fpr: 1.0, tpr: 1.0 },
    ],
    operatingPoint: { threshold: 0.85, tpr: 0.91, fpr: 0.06 },
  },
  {
    modelId: "edge-clin-v3.3.0 (legacy)",
    auc: 0.932,
    points: [
      { fpr: 0.0, tpr: 0.0 },
      { fpr: 0.05, tpr: 0.38 },
      { fpr: 0.1, tpr: 0.55 },
      { fpr: 0.15, tpr: 0.68 },
      { fpr: 0.2, tpr: 0.76 },
      { fpr: 0.25, tpr: 0.82 },
      { fpr: 0.32, tpr: 0.87 },
      { fpr: 0.4, tpr: 0.91 },
      { fpr: 0.5, tpr: 0.94 },
      { fpr: 0.65, tpr: 0.97 },
      { fpr: 0.8, tpr: 0.99 },
      { fpr: 1.0, tpr: 1.0 },
    ],
  },
  {
    modelId: "Random baseline",
    auc: 0.5,
    points: [
      { fpr: 0.0, tpr: 0.0 },
      { fpr: 0.5, tpr: 0.5 },
      { fpr: 1.0, tpr: 1.0 },
    ],
  },
];

export interface AnalyticsCohort {
  name: string;
  subjects: number;
  approvalRate: number; // 0..100
  escalationRate: number; // 0..100
  rejectionRate: number; // 0..100
  avgConfidence: number; // 0..1
  brierScore: number; // 0..1
}

/** Cohort breakdown by trial arm + demographic slice. */
export const analyticsCohorts: AnalyticsCohort[] = [
  { name: "ONCO-2024 / Arm A (test)", subjects: 208, approvalRate: 71.2, escalationRate: 18.4, rejectionRate: 10.4, avgConfidence: 0.86, brierScore: 0.091 },
  { name: "ONCO-2024 / Arm B (control)", subjects: 204, approvalRate: 64.8, escalationRate: 22.7, rejectionRate: 12.5, avgConfidence: 0.82, brierScore: 0.108 },
  { name: "CARDIO-NORDIC / NYHA III", subjects: 162, approvalRate: 58.6, escalationRate: 26.8, rejectionRate: 14.6, avgConfidence: 0.79, brierScore: 0.124 },
  { name: "CARDIO-NORDIC / NYHA IV", subjects: 125, approvalRate: 49.4, escalationRate: 31.2, rejectionRate: 19.4, avgConfidence: 0.74, brierScore: 0.142 },
  { name: "PEDIATRIC-RARE / <12y", subjects: 18, approvalRate: 81.3, escalationRate: 11.8, rejectionRate: 6.9, avgConfidence: 0.88, brierScore: 0.072 },
  { name: "PEDIATRIC-RARE / 12-17y", subjects: 20, approvalRate: 78.5, escalationRate: 14.2, rejectionRate: 7.3, avgConfidence: 0.86, brierScore: 0.079 },
  { name: "VACCINE-III / 18-64y", subjects: 3120, approvalRate: 84.6, escalationRate: 9.4, rejectionRate: 6.0, avgConfidence: 0.91, brierScore: 0.062 },
  { name: "VACCINE-III / 65+y", subjects: 1700, approvalRate: 76.2, escalationRate: 15.8, rejectionRate: 8.0, avgConfidence: 0.85, brierScore: 0.084 },
];

export interface AnalyticsFairnessCell {
  group: string;
  metric: string;
  value: number; // 0..100
  parity: "fair" | "watch" | "unfair";
}

/** Fairness heatmap — demographic group × evaluation metric. */
export const analyticsFairnessMatrix: AnalyticsFairnessCell[] = (() => {
  const groups = ["Female", "Male", "65+", "Under 65", "Asian", "Black", "Hispanic", "White"];
  const metrics = ["Approval Parity", "False Positive Rate", "False Negative Rate", "Calibration"];
  const cells: AnalyticsFairnessCell[] = [];
  for (const g of groups) {
    for (const m of metrics) {
      const base = 88 + Math.floor(Math.random() * 12);
      const parity: AnalyticsFairnessCell["parity"] =
        base >= 92 ? "fair" : base >= 86 ? "watch" : "unfair";
      cells.push({ group: g, metric: m, value: base, parity });
    }
  }
  return cells;
})();

export interface AnalyticsGeoSite {
  siteId: string;
  country: string;
  city: string;
  lat: number;
  lng: number;
  tasks: number;
  approvalRate: number;
  emergingMarket: boolean;
}

/** Geographic distribution of edge-deployed sites with task volume. */
export const analyticsGeoSites: AnalyticsGeoSite[] = [
  { siteId: "SITE-001", country: "United States", city: "Boston", lat: 42.36, lng: -71.06, tasks: 4120, approvalRate: 84.2, emergingMarket: false },
  { siteId: "SITE-007", country: "Sweden", city: "Stockholm", lat: 59.33, lng: 18.07, tasks: 2840, approvalRate: 81.6, emergingMarket: false },
  { siteId: "SITE-LAG-01", country: "Nigeria", city: "Lagos", lat: 6.52, lng: 3.38, tasks: 1180, approvalRate: 76.3, emergingMarket: true },
  { siteId: "SITE-NBO-02", country: "Kenya", city: "Nairobi", lat: -1.29, lng: 36.82, tasks: 940, approvalRate: 74.8, emergingMarket: true },
  { siteId: "SITE-JKT-03", country: "Indonesia", city: "Jakarta", lat: -6.21, lng: 106.85, tasks: 1420, approvalRate: 72.4, emergingMarket: true },
  { siteId: "SITE-MNL-04", country: "Philippines", city: "Manila", lat: 14.6, lng: 120.98, tasks: 870, approvalRate: 70.9, emergingMarket: true },
  { siteId: "SITE-DAC-05", country: "Bangladesh", city: "Dhaka", lat: 23.81, lng: 90.41, tasks: 1620, approvalRate: 68.2, emergingMarket: true },
  { siteId: "SITE-ACC-06", country: "Ghana", city: "Accra", lat: 5.6, lng: -0.19, tasks: 690, approvalRate: 75.1, emergingMarket: true },
  { siteId: "SITE-CAI-07", country: "Egypt", city: "Cairo", lat: 30.04, lng: 31.24, tasks: 1240, approvalRate: 77.8, emergingMarket: true },
  { siteId: "SITE-BOM-11", country: "India", city: "Mumbai", lat: 19.08, lng: 72.88, tasks: 2860, approvalRate: 80.4, emergingMarket: true },
  { siteId: "SITE-DEL-12", country: "India", city: "New Delhi", lat: 28.61, lng: 77.21, tasks: 3120, approvalRate: 82.1, emergingMarket: true },
  { siteId: "SITE-SAO-13", country: "Brazil", city: "São Paulo", lat: -23.55, lng: -46.63, tasks: 2180, approvalRate: 78.6, emergingMarket: true },
  { siteId: "SITE-BOG-14", country: "Colombia", city: "Bogotá", lat: 4.71, lng: -74.07, tasks: 1340, approvalRate: 76.9, emergingMarket: true },
  { siteId: "SITE-AUH-15", country: "UAE", city: "Abu Dhabi", lat: 24.45, lng: 54.38, tasks: 1980, approvalRate: 83.7, emergingMarket: true },
];

export interface AnalyticsDriftCell {
  week: string;
  feature: string;
  psi: number; // population stability index, 0 = no drift
}

/** Drift heatmap — feature × week PSI matrix. */
export const analyticsDriftMatrix: AnalyticsDriftCell[] = (() => {
  const features = [
    "subject_age",
    "enrollment_site",
    "trial_arm",
    "ae_severity",
    "lab_value_range",
    "concomitant_meds",
    "ecog_status",
    "pd_l1_expression",
  ];
  const weeks = ["W-12", "W-10", "W-8", "W-6", "W-4", "W-2", "W0"];
  const cells: AnalyticsDriftCell[] = [];
  for (const f of features) {
    for (const w of weeks) {
      const psi = Math.round((0.05 + Math.random() * 0.4) * 100) / 100;
      cells.push({ feature: f, week: w, psi });
    }
  }
  return cells;
})();

/** Confidence-distribution histogram bins (for the model's predictions). */
export const analyticsConfidenceHistogram = [
  { bin: "0.0-0.1", count: 14 },
  { bin: "0.1-0.2", count: 22 },
  { bin: "0.2-0.3", count: 38 },
  { bin: "0.3-0.4", count: 64 },
  { bin: "0.4-0.5", count: 88 },
  { bin: "0.5-0.6", count: 142 },
  { bin: "0.6-0.7", count: 196 },
  { bin: "0.7-0.8", count: 284 },
  { bin: "0.8-0.9", count: 412 },
  { bin: "0.9-1.0", count: 678 },
];

/** Range multipliers — scale throughput series values for 7d / 30d views. */
export const analyticsRangeMultipliers: Record<"24h" | "7d" | "30d", number> = {
  "24h": 1,
  "7d": 6.8,
  "30d": 28.4,
};

/* ============================================================
   ENHANCED API DOCUMENTATION — more endpoints, SDKs, error codes,
   interactive playground mock, changelog, OpenAPI spec
   ============================================================ */

export const apiEndpointsEnhanced: ApiEndpoint[] = [
  {
    id: "ep-auth-refresh",
    method: "POST",
    path: "/api/v1/auth/refresh",
    title: "Refresh access token",
    description:
      "Exchanges a valid refresh token for a new access token. Refresh tokens are single-use and rotated on every call.",
    category: "Auth",
    rateLimit: "60 req/min per token",
    tags: ["jwt", "rotating"],
    requestSchema: `{
  "refresh_token": "rft_..."
}`,
    responseSchema: `{
  "access_token": "eyJhbGciOi...",
  "refresh_token": "rft_...",
  "token_type": "Bearer",
  "expires_in": 3600
}`,
  },
  {
    id: "ep-auth-whoami",
    method: "GET",
    path: "/api/v1/auth/whoami",
    title: "Get current user & scopes",
    description:
      "Returns the authenticated user's profile, organization, role, and the scopes granted to the current token. Useful for permission checks before performing privileged actions.",
    category: "Auth",
    responseSchema: `{
  "userId": "u_drchen",
  "name": "Dr. Sarah Chen",
  "email": "s.chen@trialgptbot.ai",
  "role": "senior_reviewer",
  "org": "TrialGPTBot Enterprise",
  "scopes": ["read:tasks", "write:decisions", "read:analytics"],
  "tokenExpiresAt": "2026-08-14T09:24:11.000Z"
}`,
  },
  {
    id: "ep-tasks-stream",
    method: "WS",
    path: "wss://api.trialgptbot.ai/v1/tasks/stream",
    title: "Live task review queue stream",
    description:
      "WebSocket channel emitting task.created, task.decided, and task.escalated events in real time. Use this to drive a live review queue UI without polling.",
    category: "Tasks",
    tags: ["real-time", "websocket"],
  },
  {
    id: "ep-trials-enrollment",
    method: "GET",
    path: "/api/v1/trials/{nctId}/enrollment-forecast",
    title: "Trial enrollment forecast",
    description:
      "Returns the digital-twin-projected enrollment forecast for a trial, including weeksRemaining, weeksAtPace, dropout probability, and projected power.",
    category: "Trials",
    responseSchema: `{
  "trialId": "ONCO-2024",
  "current": 412,
  "target": 600,
  "weeksRemaining": 22,
  "weeksAtPace": 19,
  "dropoutProbability": 0.11,
  "projectedPower": 0.84,
  "flag": "on-track"
}`,
  },
  {
    id: "ep-edc-fields",
    method: "GET",
    path: "/api/v1/edc/{systemId}/fields",
    title: "List EDC form fields",
    description:
      "Returns the schema of all CRF form fields synced from the specified EDC system. Useful for building dynamic field-mapping UIs.",
    category: "EDC",
  },
  {
    id: "ep-compliance-audit-export",
    method: "POST",
    path: "/api/v1/compliance/audit-export",
    title: "Export tamper-evident audit chain",
    description:
      "Generates an immutable archive of the audit log for a date range, signed with the platform's hash chain root. Returns a pre-signed S3 URL when generation completes.",
    category: "Compliance",
    rateLimit: "2 req/hour per token",
    tags: ["async", "background-job", "signed"],
    requestSchema: `{
  "from": "2026-01-01T00:00:00Z",
  "to": "2026-06-30T23:59:59Z",
  "format": "jsonl" | "csv"
}`,
  },
  {
    id: "ep-edge-conflicts",
    method: "GET",
    path: "/api/v1/edge/conflicts",
    title: "List unresolved edge sync conflicts",
    description:
      "Returns the queue of eventual-consistency conflicts that require reviewer resolution, sorted by age. Each conflict includes the conflicting records, the auto-merge attempt, and the suggested resolution.",
    category: "Edge",
    responseSchema: `{
  "conflicts": [
    {
      "conflictId": "CNF-2026-08-14-0042",
      "siteId": "SITE-DAC-05",
      "formId": "AE-LOG-204",
      "fieldId": "ae_severity",
      "localValue": "Grade 3",
      "remoteValue": "Grade 2",
      "detectedAt": "2026-08-14T13:42:11.000Z",
      "autoMergeStrategy": "last_writer_wins",
      "suggestedResolution": "escalate"
    }
  ]
}`,
  },
  {
    id: "ep-edge-rollback",
    method: "POST",
    path: "/api/v1/edge/sites/{siteId}/rollback",
    title: "Rollback edge model to previous version",
    description:
      "Reverts the edge model on the specified site to the previously deployed version. Used when a fresh deploy causes accuracy regression or runtime errors.",
    category: "Edge",
    rateLimit: "2 req/min per token",
    tags: ["async"],
    responseSchema: `{
  "siteId": "SITE-JKT-03",
  "rolledBackTo": "edge-clin-v3.3.0-int8",
  "jobId": "EDGE-ROLLBACK-2026-08-14-0007"
}`,
  },
  {
    id: "ep-analytics-explain",
    method: "POST",
    path: "/api/v1/analytics/explain",
    title: "Generate SHAP explanation for a prediction",
    description:
      "Returns a SHAP-style feature attribution for a single decision. Useful for surfacing 'why did the model decide this?' to reviewers and compliance officers.",
    category: "Analytics",
    rateLimit: "60 req/min per token",
    tags: ["explainability", "shap"],
    requestSchema: `{
  "taskId": "TASK-1042",
  "topK": 5
}`,
    responseSchema: `{
  "taskId": "TASK-1042",
  "prediction": "approve",
  "confidence": 0.92,
  "topFeatures": [
    { "name": "field_concordance_score", "weight": 0.38, "value": "0.94" },
    { "name": "historical_approval_rate", "weight": 0.24, "value": "0.81" }
  ]
}`,
  },
  {
    id: "ep-analytics-fairness",
    method: "GET",
    path: "/api/v1/analytics/fairness",
    title: "Get fairness audit report",
    description:
      "Returns the latest fairness audit across demographic groups (sex, age band, race/ethnicity) for the active model, including parity deltas and confidence intervals.",
    category: "Analytics",
    responseSchema: `{
  "modelId": "edge-clin-v3.4.1",
  "auditedAt": "2026-08-14T08:00:00Z",
  "groups": [
    { "group": "Female", "approvalParity": 0.94, "fprDelta": 0.012 },
    { "group": "Male", "approvalParity": 0.96, "fprDelta": -0.008 }
  ]
}`,
  },
  {
    id: "ep-webhooks-list",
    method: "GET",
    path: "/api/v1/webhooks",
    title: "List registered webhooks",
    description:
      "Returns all webhook endpoints registered for the current organization, including last delivery status, failure count, and HMAC secret fingerprint.",
    category: "Webhooks",
  },
  {
    id: "ep-webhooks-test",
    method: "POST",
    path: "/api/v1/webhooks/{webhookId}/test",
    title: "Send test event to webhook",
    description:
      "Sends a ping event to the registered webhook URL and returns the HTTP status, response time, and HMAC verification result. Useful for debugging delivery issues.",
    category: "Webhooks",
    rateLimit: "10 req/min per token",
  },
];

/** Append enhanced endpoints to the main apiEndpoints array at module load. */
apiEndpoints.push(...apiEndpointsEnhanced);

export const apiSdksEnhanced = [
  {
    id: "sdk-go",
    name: "Go",
    install: "go get github.com/trialgptbot/sdk-go",
    repo: "github.com/trialgptbot/sdk-go",
    example: `package main

import (
    "context"
    "fmt"
    "log"

    "github.com/trialgptbot/sdk-go/trialgptbot"
)

func main() {
    client := trialgptbot.New("production", os.Getenv("TRIALGPTBOT_API_KEY"))

    tasks, err := client.Tasks.List(context.Background(), &trialgptbot.TaskListParams{
        TrialID: "NCT04584710",
        Status:  "pending_review",
        Limit:   50,
    })
    if err != nil {
        log.Fatal(err)
    }

    for _, t := range tasks.Data {
        fmt.Printf("%s  confidence=%.2f  risk=%d\\n", t.ID, t.Confidence.Score, t.RiskScore)
    }
}`,
  },
  {
    id: "sdk-java",
    name: "Java",
    install: "implementation 'ai.trialgptbot:sdk-java:2.5.0'",
    repo: "github.com/trialgptbot/sdk-java",
    example: `import ai.trialgptbot.sdk.TrialGPTBot;
import ai.trialgptbot.sdk.api.TasksApi;
import ai.trialgptbot.sdk.model.*;

public class Example {
    public static void main(String[] args) {
        TrialGPTBot client = TrialGPTBot.builder()
            .environment("production")
            .apiKey(System.getenv("TRIALGPTBOT_API_KEY"))
            .build();

        TasksApi tasks = client.tasks();
        TaskListResponse resp = tasks.list(b -> b
            .trialId("NCT04584710")
            .status("pending_review")
            .limit(50));

        resp.getData().forEach(t -> System.out.printf(
            "%s  confidence=%.2f%n", t.getId(), t.getConfidence().getScore()));
    }
}`,
  },
  {
    id: "sdk-rust",
    name: "Rust",
    install: 'cargo add trialgptbot',
    repo: "github.com/trialgptbot/sdk-rust",
    example: `use trialgptbot::{Client, ListTasksParams};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::new("production", std::env::var("TRIALGPTBOT_API_KEY")?)?;

    let resp = client
        .tasks()
        .list(&ListTasksParams {
            trial_id: Some("NCT04584710".into()),
            status: Some("pending_review".into()),
            limit: 50,
        })
        .await?;

    for t in &resp.data {
        println!("{}  confidence={:.2}", t.id, t.confidence.score);
    }
    Ok(())
}`,
  },
];

apiSdks.push(...apiSdksEnhanced);

export const apiErrorCodesEnhanced = [
  { code: "408", name: "request_timeout", description: "The request took longer than the configured timeout. Retry with exponential backoff." },
  { code: "413", name: "payload_too_large", description: "Request body exceeded the 10MB limit. For bulk operations, use the batch endpoint with chunks of ≤500 items." },
  { code: "451", name: "data_residency_violation", description: "The request would access data stored in a jurisdiction not permitted by the token's data-residency policy." },
  { code: "504", name: "edge_timeout", description: "An edge site did not respond within the 30s window. The request will be retried against a failover site." },
];

apiErrorCodes.push(...apiErrorCodesEnhanced);

/** API changelog — surfaced in the docs page. */
export interface ApiChangelogEntry {
  version: string;
  date: string;
  changes: Array<{ type: "added" | "changed" | "deprecated" | "removed" | "fixed"; description: string }>;
}

export const apiChangelog: ApiChangelogEntry[] = [
  {
    version: "v1.4.0",
    date: "2026-08-12",
    changes: [
      { type: "added", description: "GET /api/v1/analytics/fairness — fairness audit report endpoint" },
      { type: "added", description: "POST /api/v1/analytics/explain — SHAP explanation generator" },
      { type: "added", description: "GET /api/v1/edge/conflicts — unresolved sync conflict queue" },
      { type: "added", description: "POST /api/v1/edge/sites/{siteId}/rollback — model version rollback" },
      { type: "changed", description: "GET /api/v1/tasks now supports cursor pagination (was offset-based)" },
      { type: "changed", description: "Rate limit for /tasks/bulk-action raised from 20 to 30 req/min" },
    ],
  },
  {
    version: "v1.3.2",
    date: "2026-07-28",
    changes: [
      { type: "added", description: "WebSocket /v1/tasks/stream — live review queue stream" },
      { type: "added", description: "POST /api/v1/webhooks/{id}/test — webhook test ping" },
      { type: "fixed", description: "Race condition in audit-hash chain on concurrent decisions" },
      { type: "deprecated", description: "GET /api/v1/tasks?offset= (use cursor param instead) — removal slated for v1.5.0" },
    ],
  },
  {
    version: "v1.3.0",
    date: "2026-07-10",
    changes: [
      { type: "added", description: "SSE /api/edge/sync-stream — edge sync log live stream" },
      { type: "added", description: "POST /api/v1/edge/sites/{siteId}/deploy — push compressed model to site" },
      { type: "added", description: "POST /api/v1/compliance/audit-export — signed audit chain archive" },
      { type: "changed", description: "JWT refresh tokens are now single-use and rotated on every call" },
    ],
  },
  {
    version: "v1.2.0",
    date: "2026-06-15",
    changes: [
      { type: "added", description: "POST /api/v1/tasks/auto-approve — async high-confidence auto-approval job" },
      { type: "added", description: "GET /api/v1/trials/{nctId}/enrollment-forecast — twin-projected forecast" },
      { type: "removed", description: "DELETE /api/v1/tasks/{taskId} — never implemented; use /decision instead" },
    ],
  },
];

/* ============================================================
   ENHANCED SETTINGS — additional scenarios
   Data residency, integrations, reviewer workflows, mobile ePRO,
   accessibility, custom reason codes, model retraining
   ============================================================ */

export const settingsScenariosEnhanced: SettingsScenario[] = [
  {
    id: "data-residency",
    category: "Data Residency",
    title: "Data Residency & Cross-Border Transfer",
    description:
      "Controls where subject data is stored, which jurisdictions can compute on it, and under what legal basis cross-border transfers occur. Required for GDPR Article 44-49 and China PIPL compliance.",
    icon: "🌍",
    fields: [
      {
        key: "primaryRegion",
        label: "Primary storage region",
        type: "select",
        value: "eu-west-1",
        options: [
          { value: "us-east-1", label: "US East (N. Virginia) — HIPAA" },
          { value: "us-west-2", label: "US West (Oregon) — HIPAA" },
          { value: "eu-west-1", label: "EU West (Ireland) — GDPR" },
          { value: "eu-central-1", label: "EU Central (Frankfurt) — GDPR" },
          { value: "ap-south-1", label: "Asia Pacific (Mumbai) — DPDP" },
          { value: "ap-southeast-1", label: "Asia Pacific (Singapore) — PDPA" },
          { value: "me-central-1", label: "Middle East (UAE) — UAE PDPL" },
        ],
        help: "Primary storage region for newly enrolled subjects. Existing subjects remain in their original region.",
      },
      {
        key: "crossBorderTransfer",
        label: "Allow cross-border compute (SMPC-protected)",
        type: "toggle",
        value: true,
        help: "When on, SMPC enables compute on data without exposing raw records to the remote jurisdiction.",
      },
      {
        key: "dataLocalizationRequired",
        label: "Require strict data localization (no transfer)",
        type: "toggle",
        value: false,
        help: "Required for Russia, China, and certain Indonesian protocols.",
      },
      {
        key: "retentionAfterClosure",
        label: "Retention post-study closure (years)",
        type: "number",
        value: 7,
        min: 1,
        max: 25,
        step: 1,
        help: "Varies by jurisdiction — FDA mandates 7y, EMA 25y for some trial types.",
      },
      {
        key: "subjectRightToErasure",
        label: "Honor GDPR right-to-erasure requests",
        type: "toggle",
        value: true,
        help: "When on, subjects can request deletion of their identifiable data (audit trail retained).",
      },
    ],
  },
  {
    id: "integrations",
    category: "Integrations",
    title: "Third-Party Integrations",
    description:
      "Configure connections to Slack, Microsoft Teams, PagerDuty, Jira, ServiceNow, and SigmaPlot for export. Each integration can be scoped to specific event types.",
    icon: "🔌",
    fields: [
      {
        key: "slackWebhook",
        label: "Slack incoming webhook URL",
        type: "text",
        value: "https://hooks.slack.com/services/T000/B000/XXXX",
      },
      {
        key: "slackChannels",
        label: "Slack channel routing (JSON)",
        type: "text",
        value: '{"escalations":"#clinical-escalations","drift":"#ml-ops","sync_conflicts":"#edge-ops"}',
        help: "Map event types to channels. Falls back to the default channel if no mapping is found.",
      },
      {
        key: "teamsAppId",
        label: "Microsoft Teams app ID",
        type: "text",
        value: "00000000-0000-0000-0000-000000000000",
      },
      {
        key: "pagerdutyIntegrationKey",
        label: "PagerDuty integration key",
        type: "password",
        value: "pdkey_••••••••••••••••",
      },
      {
        key: "jiraCloudUrl",
        label: "Jira Cloud URL (for protocol deviations)",
        type: "text",
        value: "https://trialgptbot.atlassian.net",
      },
      {
        key: "servicenowInstance",
        label: "ServiceNow instance (for audit tickets)",
        type: "text",
        value: "trialgptbot.service-now.com",
      },
    ],
  },
  {
    id: "reviewer-workflows",
    category: "Reviewer Workflows",
    title: "Reviewer Routing & Escalation Policy",
    description:
      "Controls how tasks are routed to reviewers, including specialty matching, load balancing, escalation thresholds, and quiet-hours handling.",
    icon: "👥",
    fields: [
      {
        key: "routingStrategy",
        label: "Task routing strategy",
        type: "select",
        value: "specialty_then_load",
        options: [
          { value: "specialty_then_load", label: "Specialty match → load balance (recommended)" },
          { value: "round_robin", label: "Round-robin across on-call reviewers" },
          { value: "sticky_reviewer", label: "Sticky reviewer (subject's primary reviewer)" },
          { value: "skill_weighted", label: "Skill-weighted (reviewer expertise score)" },
        ],
      },
      {
        key: "maxTasksPerReviewer",
        label: "Max concurrent tasks per reviewer",
        type: "number",
        value: 12,
        min: 1,
        max: 50,
        step: 1,
      },
      {
        key: "escalationTimeoutMin",
        label: "Auto-escalation timeout (minutes)",
        type: "number",
        value: 240,
        min: 30,
        max: 1440,
        step: 15,
        help: "Tasks not decided within this window are escalated to the supervisor queue.",
      },
      {
        key: "fatigueDetection",
        label: "Enable reviewer fatigue detection",
        type: "toggle",
        value: true,
        help: "Uses dwell-time + decision-velocity patterns to detect fatigue; auto-routes to fresh reviewer when threshold crossed.",
      },
      {
        key: "crossCoverageBackup",
        label: "Cross-coverage backup reviewer",
        type: "toggle",
        value: true,
        help: "When a reviewer is offline >2h, their queue is auto-reassigned to a backup.",
      },
    ],
  },
  {
    id: "mobile-epro",
    category: "Mobile ePRO",
    title: "Mobile ePRO & Subject App",
    description:
      "Configuration for the subject-facing mobile app (electronic Patient-Reported Outcomes). Controls reminder cadence, offline mode, and data sync.",
    icon: "📱",
    fields: [
      {
        key: "reminderCadence",
        label: "Reminder cadence",
        type: "select",
        value: "smart_adaptive",
        options: [
          { value: "smart_adaptive", label: "Smart adaptive (AI-tuned per subject)" },
          { value: "fixed_daily", label: "Fixed daily at 09:00 local" },
          { value: "twice_daily", label: "Twice daily (09:00 + 18:00 local)" },
          { value: "no_reminders", label: "No reminders (compliance-officer only)" },
        ],
      },
      {
        key: "offlineMode",
        label: "Allow offline mode (local cache)",
        type: "toggle",
        value: true,
        help: "Subjects can submit ePRO entries without connectivity; sync happens on reconnect.",
      },
      {
        key: "reminderChannel",
        label: "Reminder channel",
        type: "select",
        value: "whatsapp_sms",
        options: [
          { value: "push_only", label: "Push notification only" },
          { value: "sms", label: "SMS (works on feature phones)" },
          { value: "whatsapp_sms", label: "WhatsApp + SMS fallback" },
          { value: "teams", label: "Microsoft Teams (caregivers)" },
        ],
      },
      {
        key: "minBatteryPct",
        label: "Min battery % for sync",
        type: "number",
        value: 15,
        min: 5,
        max: 50,
        step: 5,
        help: "Below this threshold, the app waits to sync to avoid stranding the subject without a phone.",
      },
    ],
  },
  {
    id: "accessibility",
    category: "Accessibility",
    title: "Accessibility & Inclusive Design",
    description:
      "Configures reviewer and subject UI accessibility: screen-reader support, color contrast, motion reduction, and language preferences. Follows WCAG 2.2 AA.",
    icon: "♿",
    fields: [
      {
        key: "highContrastMode",
        label: "High contrast mode (reviewer UI)",
        type: "toggle",
        value: false,
      },
      {
        key: "reduceMotion",
        label: "Reduce motion (disable transitions)",
        type: "toggle",
        value: false,
      },
      {
        key: "screenReaderOptimized",
        label: "Screen-reader optimized layout",
        type: "toggle",
        value: true,
        help: "Adds ARIA live regions and removes decorative animations that confuse SR navigation.",
      },
      {
        key: "defaultLanguage",
        label: "Default UI language",
        type: "select",
        value: "en-US",
        options: [
          { value: "en-US", label: "English (US)" },
          { value: "en-GB", label: "English (UK)" },
          { value: "es-ES", label: "Spanish (Spain)" },
          { value: "pt-BR", label: "Portuguese (Brazil)" },
          { value: "fr-FR", label: "French (France)" },
          { value: "de-DE", label: "German" },
          { value: "ar-SA", label: "Arabic (RTL)" },
          { value: "hi-IN", label: "Hindi" },
          { value: "zh-CN", label: "Chinese (Simplified)" },
          { value: "ja-JP", label: "Japanese" },
        ],
      },
      {
        key: "textScale",
        label: "Text scale",
        type: "select",
        value: "1.0",
        options: [
          { value: "0.85", label: "Compact (0.85×)" },
          { value: "1.0", label: "Default (1.0×)" },
          { value: "1.15", label: "Large (1.15×)" },
          { value: "1.3", label: "Extra large (1.3×)" },
        ],
      },
    ],
  },
  {
    id: "reason-codes",
    category: "Reason Codes",
    title: "Custom Decision Reason Codes",
    description:
      "Manage the controlled vocabulary of reason codes that reviewers can attach to decisions. Drives downstream analytics and FDA-mandated coding (MedDRA).",
    icon: "🏷️",
    fields: [
      {
        key: "defaultCodeSet",
        label: "Default code set",
        type: "select",
        value: "meddra_26_0",
        options: [
          { value: "meddra_26_0", label: "MedDRA 26.0 (recommended)" },
          { value: "meddra_25_1", label: "MedDRA 25.1 (legacy)" },
          { value: "snomed_ct", label: "SNOMED CT" },
          { value: "custom", label: "Custom (define below)" },
        ],
      },
      {
        key: "customCodes",
        label: "Custom reason codes (CSV)",
        type: "text",
        value: "RC_DATA_CONCORDANT,RC_SITE_OVERRIDE,RC_SPONSOR_AMENDMENT,RC_SAFETY_PAUSE",
        help: "Comma-separated list of custom codes. Will appear alongside the default code set.",
      },
      {
        key: "requireReasonOnReject",
        label: "Require reason code on rejection",
        type: "toggle",
        value: true,
      },
      {
        key: "requireReasonOnEscalate",
        label: "Require reason code on escalation",
        type: "toggle",
        value: true,
      },
    ],
  },
  {
    id: "model-retraining",
    category: "AI & Models",
    title: "Model Retraining & MLOps",
    description:
      "Configures the automated retraining pipeline: trigger conditions, validation gates, shadow deployment, and rollback thresholds.",
    icon: "🔄",
    fields: [
      {
        key: "retrainingTrigger",
        label: "Retraining trigger",
        type: "select",
        value: "drift_threshold",
        options: [
          { value: "scheduled_weekly", label: "Scheduled (weekly)" },
          { value: "scheduled_monthly", label: "Scheduled (monthly)" },
          { value: "drift_threshold", label: "Drift threshold (PSI > 2.5)" },
          { value: "manual_only", label: "Manual only" },
        ],
      },
      {
        key: "validationGateBrier",
        label: "Validation gate — max Brier score",
        type: "number",
        value: 0.12,
        min: 0.05,
        max: 0.3,
        step: 0.01,
        help: "A retrained model must beat this Brier score on the holdout set to be promoted.",
      },
      {
        key: "validationGateAuc",
        label: "Validation gate — min AUC",
        type: "number",
        value: 0.95,
        min: 0.8,
        max: 1.0,
        step: 0.01,
      },
      {
        key: "shadowDeploymentPct",
        label: "Shadow deployment traffic %",
        type: "number",
        value: 10,
        min: 0,
        max: 100,
        step: 5,
        help: "Percentage of production traffic scored by the candidate model in shadow mode (decisions not used).",
      },
      {
        key: "autoRollbackOnRegression",
        label: "Auto-rollback on accuracy regression > 1%",
        type: "toggle",
        value: true,
      },
      {
        key: "maxModelVersions",
        label: "Max model versions retained",
        type: "number",
        value: 12,
        min: 3,
        max: 50,
        step: 1,
        help: "Older versions are archived to cold storage for audit reproducibility.",
      },
    ],
  },
  {
    id: "edge-orchestration",
    category: "Edge Deployment",
    title: "Edge Fleet Orchestration",
    description:
      "Controls how the edge fleet is orchestrated: rolling deploy windows, canary percentages, automatic rollback, and per-region model pinning.",
    icon: "🛰️",
    fields: [
      {
        key: "rollingDeployWindow",
        label: "Rolling deploy window",
        type: "select",
        value: "off_hours_local",
        options: [
          { value: "immediate", label: "Immediate (all sites at once)" },
          { value: "off_hours_local", label: "Off-hours local (02:00-05:00 site time)" },
          { value: "weekend_only", label: "Weekend only" },
          { value: "manual_schedule", label: "Manual schedule (per-site)" },
        ],
      },
      {
        key: "canaryPct",
        label: "Canary traffic % (per region)",
        type: "number",
        value: 20,
        min: 0,
        max: 100,
        step: 5,
        help: "Percentage of sites in each region that receive the new model first.",
      },
      {
        key: "canaryObservationHours",
        label: "Canary observation window (hours)",
        type: "number",
        value: 24,
        min: 1,
        max: 168,
        step: 1,
      },
      {
        key: "autoRollbackConflictThreshold",
        label: "Auto-rollback — conflict rate threshold (%)",
        type: "number",
        value: 5,
        min: 0,
        max: 50,
        step: 1,
        help: "If conflicts exceed this rate during the canary window, the deploy is automatically rolled back.",
      },
      {
        key: "regionalModelPinning",
        label: "Allow regional model pinning",
        type: "toggle",
        value: true,
        help: "When on, specific regions can be pinned to an older model version (e.g. for regulatory review).",
      },
    ],
  },
];

settingsScenarios.push(...settingsScenariosEnhanced);

/* ============================================================
   EDGE DEPLOYMENT WIZARD — deployment templates
   Pre-baked compression profiles for common site archetypes
   ============================================================ */

export interface EdgeDeploymentTemplate {
  id: string;
  name: string;
  description: string;
  archetype: "fiber_premium" | "4g_stable" | "3g_challenged" | "satellite_backup" | "offline_clinic";
  recommendedCompression: {
    int8Quantization: boolean;
    structuralPruningPct: number;
    knowledgeDistillation: boolean;
    weightClustering: boolean;
  };
  syncPolicy: "eventual_consistency" | "near_real_time" | "manual";
  maxQueueDepth: number;
  estimatedSizeMb: number;
  estimatedCompressionRatio: number;
  estimatedLatencyMs: number;
  accuracyDeltaPct: number;
}

export const edgeDeploymentTemplates: EdgeDeploymentTemplate[] = [
  {
    id: "tpl-fiber",
    name: "Fiber Premium (Tier-1 hospital)",
    description:
      "For sites with reliable ≥5 Mbps fiber uplink and stable power. Prioritizes accuracy over compression.",
    archetype: "fiber_premium",
    recommendedCompression: {
      int8Quantization: true,
      structuralPruningPct: 20,
      knowledgeDistillation: true,
      weightClustering: false,
    },
    syncPolicy: "near_real_time",
    maxQueueDepth: 1000,
    estimatedSizeMb: 78.4,
    estimatedCompressionRatio: 0.190,
    estimatedLatencyMs: 24,
    accuracyDeltaPct: -0.2,
  },
  {
    id: "tpl-4g",
    name: "4G Stable (urban emerging market)",
    description:
      "For sites on stable 4G LTE with occasional drops. Balanced compression + queue depth.",
    archetype: "4g_stable",
    recommendedCompression: {
      int8Quantization: true,
      structuralPruningPct: 40,
      knowledgeDistillation: true,
      weightClustering: false,
    },
    syncPolicy: "eventual_consistency",
    maxQueueDepth: 5000,
    estimatedSizeMb: 62.8,
    estimatedCompressionRatio: 0.153,
    estimatedLatencyMs: 42,
    accuracyDeltaPct: -0.7,
  },
  {
    id: "tpl-3g",
    name: "3G Challenged (rural / sub-bandwidth)",
    description:
      "For sites on 3G or congested 4G with frequent drops. Aggressive compression + deep queue.",
    archetype: "3g_challenged",
    recommendedCompression: {
      int8Quantization: true,
      structuralPruningPct: 55,
      knowledgeDistillation: true,
      weightClustering: true,
    },
    syncPolicy: "eventual_consistency",
    maxQueueDepth: 10000,
    estimatedSizeMb: 41.6,
    estimatedCompressionRatio: 0.101,
    estimatedLatencyMs: 58,
    accuracyDeltaPct: -2.1,
  },
  {
    id: "tpl-satellite",
    name: "Satellite Backup (extreme low bandwidth)",
    description:
      "For sites where the only uplink is satellite (e.g. MSF field clinics). Maximum compression; offline-first.",
    archetype: "satellite_backup",
    recommendedCompression: {
      int8Quantization: true,
      structuralPruningPct: 60,
      knowledgeDistillation: true,
      weightClustering: true,
    },
    syncPolicy: "manual",
    maxQueueDepth: 25000,
    estimatedSizeMb: 38.2,
    estimatedCompressionRatio: 0.093,
    estimatedLatencyMs: 71,
    accuracyDeltaPct: -3.4,
  },
  {
    id: "tpl-offline",
    name: "Offline Clinic (no uplink expected)",
    description:
      "For sites that operate fully offline and sync via courier/sneakernet. Maximum compression; large local store.",
    archetype: "offline_clinic",
    recommendedCompression: {
      int8Quantization: true,
      structuralPruningPct: 50,
      knowledgeDistillation: true,
      weightClustering: true,
    },
    syncPolicy: "manual",
    maxQueueDepth: 50000,
    estimatedSizeMb: 47.9,
    estimatedCompressionRatio: 0.116,
    estimatedLatencyMs: 49,
    accuracyDeltaPct: -2.4,
  },
];

/* ============================================================
   EDGE HEALTH TIMELINE — for the top-level Edge page
   ============================================================ */

export interface EdgeHealthSnapshot {
  ts: string;
  onlineSites: number;
  syncingSites: number;
  degradedSites: number;
  offlineSites: number;
  pendingSyncRecords: number;
  avgInferenceLatencyMs: number;
}

/** Last 24 hourly snapshots of fleet health (mocked deterministically). */
export const edgeHealthTimeline: EdgeHealthSnapshot[] = Array.from(
  { length: 24 },
  (_, h) => {
    const online = 11 + Math.round(Math.sin(h / 4) * 1.5);
    const syncing = 1 + Math.round(Math.random() * 2);
    const degraded = Math.random() > 0.6 ? 1 : 0;
    const offline = Math.random() > 0.8 ? 1 : 0;
    return {
      ts: new Date(Date.now() - (23 - h) * 60 * 60 * 1000).toISOString(),
      onlineSites: online,
      syncingSites: syncing,
      degradedSites: degraded,
      offlineSites: offline,
      pendingSyncRecords: 480 + Math.round(Math.random() * 280),
      avgInferenceLatencyMs: 38 + Math.round(Math.sin(h / 3) * 6 + Math.random() * 4),
    };
  },
);


/* ============================================================
   FEATURE #11 — ML-BASED CONFIDENCE CALIBRATION
   Train prediction models on historical approve/reject/escalate decisions
   to recalibrate raw model scores into calibrated probabilities.
   ============================================================ */

export interface CalibrationKpi {
  label: string;
  value: string;
  deltaPct?: number;
  trend?: "up" | "down" | "flat";
  hint?: string;
}

export const calibrationKpis: CalibrationKpi[] = [
  { label: "Brier score", value: "0.087", deltaPct: -22.3, trend: "down", hint: "Lower is better. Baseline 0.112 -> 0.087 after Platt recalibration." },
  { label: "ECE (Expected Calibration Error)", value: "3.4%", deltaPct: -57.5, trend: "down", hint: "10-min bins; threshold <=8% for clinical auto-approve pathway." },
  { label: "False positives reduced", value: "-54.2%", trend: "down", hint: "Net reduction in auto-approve pathway after recalibration threshold = 0.82." },
  { label: "Audit records trained", value: "1.24M", trend: "up", hint: "Last 18 months of reviewer decisions across 12 trials." },
];

export interface CalibrationCurvePoint {
  predicted: number; // bin midpoint, 0..1
  observed: number;  // empirical accuracy in that bin
  count: number;     // number of decisions in bin
  lower: number;     // 95% CI lower
  upper: number;     // 95% CI upper
}

/** Reliability diagram — 10 bins from 0.0 to 1.0 */
export const calibrationCurve: CalibrationCurvePoint[] = [
  { predicted: 0.05, observed: 0.04, count: 4123, lower: 0.032, upper: 0.048 },
  { predicted: 0.15, observed: 0.13, count: 5821, lower: 0.118, upper: 0.142 },
  { predicted: 0.25, observed: 0.27, count: 6710, lower: 0.252, upper: 0.288 },
  { predicted: 0.35, observed: 0.38, count: 7842, lower: 0.362, upper: 0.398 },
  { predicted: 0.45, observed: 0.46, count: 8965, lower: 0.442, upper: 0.478 },
  { predicted: 0.55, observed: 0.54, count: 9120, lower: 0.521, upper: 0.559 },
  { predicted: 0.65, observed: 0.67, count: 9984, lower: 0.651, upper: 0.689 },
  { predicted: 0.75, observed: 0.74, count: 11205, lower: 0.722, upper: 0.758 },
  { predicted: 0.85, observed: 0.86, count: 12842, lower: 0.843, upper: 0.877 },
  { predicted: 0.95, observed: 0.94, count: 15623, lower: 0.927, upper: 0.953 },
];

export interface CalibrationFeature {
  name: string;
  category: "field_type" | "value_magnitude" | "subject_history" | "site_metadata" | "protocol_context";
  importance: number;     // 0..1, model-derived
  coefficient: number;    // standardized logistic coefficient
  description: string;
}

/** Top-12 features ranked by permutation importance. */
export const calibrationFeatures: CalibrationFeature[] = [
  { name: "field_type_lab_vital",       category: "field_type",        importance: 0.187, coefficient:  1.42, description: "Lab vital signs field — strongest single predictor of reviewer approve." },
  { name: "subject_prior_ae_count",     category: "subject_history",   importance: 0.154, coefficient:  0.91, description: "Subject's prior adverse-event count in this trial." },
  { name: "value_delta_from_baseline",  category: "value_magnitude",   importance: 0.142, coefficient: -0.78, description: "Absolute change from subject's baseline; large deltas escalate." },
  { name: "site_query_rate_30d",        category: "site_metadata",     importance: 0.118, coefficient:  0.65, description: "Site's recent query rate — proxy for site data quality." },
  { name: "protocol_phase",             category: "protocol_context",  importance: 0.103, coefficient: -0.58, description: "Phase I/II/III — phase III subjects get more conservative thresholds." },
  { name: "field_type_ae_narrative",    category: "field_type",        importance: 0.097, coefficient:  1.31, description: "AE narrative fields — high escalation rate." },
  { name: "subject_age_bucket",         category: "subject_history",   importance: 0.082, coefficient:  0.43, description: "Age bucket (>65 escalates more often)." },
  { name: "value_outside_normal_range", category: "value_magnitude",   importance: 0.078, coefficient:  0.88, description: "Boolean: value falls outside protocol normal range." },
  { name: "site_activation_age_days",   category: "site_metadata",     importance: 0.061, coefficient: -0.32, description: "Days since site was activated — newer sites get more reviews." },
  { name: "enrollment_pct_of_target",   category: "protocol_context",  importance: 0.043, coefficient:  0.21, description: "Trial enrollment progress — early-stage data is scrutinized more." },
  { name: "subject_visit_number",       category: "subject_history",   importance: 0.038, coefficient: -0.18, description: "Visit # in subject's schedule; later visits have lower escalation." },
  { name: "field_type_consent_sig",     category: "field_type",        importance: 0.024, coefficient:  0.62, description: "Consent signature fields — high auto-approve rate." },
];

export interface CalibrationMethod {
  id: string;
  name: string;
  family: "parametric" | "isotonic" | "temperature" | "bayesian";
  brierBefore: number;
  brierAfter: number;
  eceBefore: number;
  eceAfter: number;
  recommendedFor: string;
  selected: boolean;
}

export const calibrationMethods: CalibrationMethod[] = [
  { id: "platt",        name: "Platt scaling (logistic)",       family: "parametric",  brierBefore: 0.112, brierAfter: 0.087, eceBefore: 8.0, eceAfter: 3.4, recommendedFor: "Mid-sized datasets (>=10k samples); smooth distortion.", selected: true },
  { id: "isotonic",     name: "Isotonic regression",            family: "isotonic",    brierBefore: 0.112, brierAfter: 0.082, eceBefore: 8.0, eceAfter: 2.9, recommendedFor: "Large datasets (>=50k); non-monotonic distortion.", selected: false },
  { id: "temperature",  name: "Temperature scaling",            family: "temperature", brierBefore: 0.112, brierAfter: 0.094, eceBefore: 8.0, eceAfter: 4.1, recommendedFor: "Neural classifiers; preserves ranking, only softens.", selected: false },
  { id: "beta",         name: "Beta calibration",               family: "parametric",  brierBefore: 0.112, brierAfter: 0.089, eceBefore: 8.0, eceAfter: 3.7, recommendedFor: "Sigmoid-shaped distortions common in tabular models.", selected: false },
  { id: "bayesian",     name: "Bayesian Binning into Quantiles",family: "bayesian",    brierBefore: 0.112, brierAfter: 0.085, eceBefore: 8.0, eceAfter: 3.1, recommendedFor: "Small datasets; gives posterior credible intervals.", selected: false },
];

export interface CalibrationThreshold {
  bucket: "auto_approve" | "escalate" | "manual_review" | "auto_reject";
  range: [number, number];
  action: string;
  pctTasks: number;
  reviewerAccuracy: number;
  falsePositiveRate: number;
}

export const calibrationThresholds: CalibrationThreshold[] = [
  { bucket: "auto_approve",  range: [0.82, 1.00], action: "Auto-approve (reviewer monitors feed)",         pctTasks: 41.2, reviewerAccuracy: 98.4, falsePositiveRate: 1.2 },
  { bucket: "escalate",      range: [0.55, 0.82], action: "Route to senior reviewer within 4h SLA",        pctTasks: 22.7, reviewerAccuracy: 95.1, falsePositiveRate: 3.8 },
  { bucket: "manual_review", range: [0.25, 0.55], action: "Standard reviewer queue (24h SLA)",             pctTasks: 28.4, reviewerAccuracy: 92.8, falsePositiveRate: 6.1 },
  { bucket: "auto_reject",   range: [0.00, 0.25], action: "Auto-reject with mandatory audit-trail entry",  pctTasks:  7.7, reviewerAccuracy: 96.6, falsePositiveRate: 2.4 },
];

export interface CalibrationTrainingRun {
  runId: string;
  startedAt: string;
  durationSec: number;
  recordsTrained: number;
  featuresUsed: number;
  method: string;
  brierAfter: number;
  eceAfter: number;
  status: "completed" | "running" | "failed";
  triggeredBy: "scheduled" | "manual" | "drift_detected";
}

export const calibrationTrainingRuns: CalibrationTrainingRun[] = [
  { runId: "cal-2025-08-14-T03", startedAt: "2026-08-14T03:14:22Z", durationSec: 842,  recordsTrained: 84521,  featuresUsed: 12, method: "platt",    brierAfter: 0.087, eceAfter: 3.4, status: "completed", triggeredBy: "scheduled" },
  { runId: "cal-2025-08-13-T03", startedAt: "2026-08-13T03:11:08Z", durationSec: 921,  recordsTrained: 84211,  featuresUsed: 12, method: "platt",    brierAfter: 0.088, eceAfter: 3.5, status: "completed", triggeredBy: "scheduled" },
  { runId: "cal-2025-08-12-T15", startedAt: "2026-08-12T15:42:11Z", durationSec: 1104, recordsTrained: 102445, featuresUsed: 12, method: "isotonic", brierAfter: 0.082, eceAfter: 2.9, status: "completed", triggeredBy: "drift_detected" },
  { runId: "cal-2025-08-12-T03", startedAt: "2026-08-12T03:09:55Z", durationSec: 884,  recordsTrained: 83992,  featuresUsed: 12, method: "platt",    brierAfter: 0.089, eceAfter: 3.6, status: "completed", triggeredBy: "scheduled" },
  { runId: "cal-2025-08-11-T03", startedAt: "2026-08-11T03:12:42Z", durationSec: 892,  recordsTrained: 83765,  featuresUsed: 11, method: "platt",    brierAfter: 0.090, eceAfter: 3.7, status: "completed", triggeredBy: "scheduled" },
  { runId: "cal-2025-08-10-T03", startedAt: "2026-08-10T03:08:01Z", durationSec: 901,  recordsTrained: 83508,  featuresUsed: 11, method: "platt",    brierAfter: 0.091, eceAfter: 3.8, status: "completed", triggeredBy: "scheduled" },
];

/* ============================================================
   FEATURE #12 — FEDERATED LEARNING PROTOTYPE
   Cross-trial model improvement without exposing proprietary data.
   Each TrialGPTBot instance shares learned gradients (encrypted)
   while raw subject data stays on-prem at each sponsor.
   ============================================================ */

export interface FederatedNode {
  nodeId: string;
  org: string;
  orgType: "pharma" | "academic" | "cro" | "regulator";
  therapeuticArea: string;
  trialsContributing: number;
  samplesContributed: number;
  status: "online" | "training" | "aggregating" | "offline";
  lastRoundAt: string;
  encryptionScheme: string;
  bandwidthMbps: number;
}

export const federatedNodes: FederatedNode[] = [
  { nodeId: "node-pfz-01", org: "Pfizer Oncology",                orgType: "pharma",   therapeuticArea: "Oncology",          trialsContributing: 3, samplesContributed: 18421, status: "online",      lastRoundAt: "2026-08-14T07:12:00Z", encryptionScheme: "CKKS-128", bandwidthMbps: 92 },
  { nodeId: "node-nov-02", org: "Novartis Cardiovascular",        orgType: "pharma",   therapeuticArea: "Cardiovascular",    trialsContributing: 2, samplesContributed: 12410, status: "training",    lastRoundAt: "2026-08-14T07:09:00Z", encryptionScheme: "CKKS-128", bandwidthMbps: 78 },
  { nodeId: "node-mdf-03", org: "MSD Vaccines",                   orgType: "pharma",   therapeuticArea: "Vaccines",          trialsContributing: 1, samplesContributed:  9842, status: "online",      lastRoundAt: "2026-08-14T07:14:00Z", encryptionScheme: "CKKS-128", bandwidthMbps: 64 },
  { nodeId: "node-mem-04", org: "Memorial Sloan Kettering",       orgType: "academic", therapeuticArea: "Oncology",          trialsContributing: 2, samplesContributed:  7821, status: "aggregating", lastRoundAt: "2026-08-14T07:10:00Z", encryptionScheme: "BGV-128",  bandwidthMbps: 41 },
  { nodeId: "node-may-05", org: "Mayo Clinic",                    orgType: "academic", therapeuticArea: "Cardiovascular",    trialsContributing: 2, samplesContributed: 11032, status: "online",      lastRoundAt: "2026-08-14T07:08:00Z", encryptionScheme: "BGV-128",  bandwidthMbps: 88 },
  { nodeId: "node-icon-06",org: "ICON Clinical Research",         orgType: "cro",      therapeuticArea: "Multi-TA",         trialsContributing: 4, samplesContributed: 21403, status: "training",    lastRoundAt: "2026-08-14T07:11:00Z", encryptionScheme: "CKKS-128", bandwidthMbps: 120 },
  { nodeId: "node-fda-07", org: "FDA Sentinel Initiative",        orgType: "regulator",therapeuticArea: "Pharmacovigilance", trialsContributing: 1, samplesContributed: 32104, status: "online",      lastRoundAt: "2026-08-14T07:13:00Z", encryptionScheme: "BGV-128",  bandwidthMbps: 200 },
  { nodeId: "node-astr-08",org: "AstraZeneca Respiratory",        orgType: "pharma",   therapeuticArea: "Respiratory",       trialsContributing: 2, samplesContributed:  9124, status: "offline",     lastRoundAt: "2026-08-14T05:58:00Z", encryptionScheme: "CKKS-128", bandwidthMbps: 0 },
];

export interface FederatedRound {
  roundId: number;
  startedAt: string;
  completedAt: string | null;
  nodesParticipating: number;
  totalSamples: number;
  avgGradientNorm: number;
  globalModelVersion: string;
  status: "running" | "completed" | "failed" | "scheduled";
  upliftPctVsBaseline: number;
  notes: string;
}

export const federatedRounds: FederatedRound[] = [
  { roundId: 47, startedAt: "2026-08-14T07:00:00Z", completedAt: null,                  nodesParticipating: 7, totalSamples: 122833, avgGradientNorm: 0.0421, globalModelVersion: "fedclin-v0.7.42-rc", status: "running",   upliftPctVsBaseline: 0.0,  notes: "Active round — 7 of 8 nodes contributing gradients." },
  { roundId: 46, startedAt: "2026-08-13T07:00:00Z", completedAt: "2026-08-13T07:18:42Z", nodesParticipating: 8, totalSamples: 142031, avgGradientNorm: 0.0484, globalModelVersion: "fedclin-v0.7.41",     status: "completed", upliftPctVsBaseline: 3.8,  notes: "Stable convergence; oncology TA gained most uplift." },
  { roundId: 45, startedAt: "2026-08-12T07:00:00Z", completedAt: "2026-08-12T07:21:11Z", nodesParticipating: 8, totalSamples: 141988, avgGradientNorm: 0.0521, globalModelVersion: "fedclin-v0.7.40",     status: "completed", upliftPctVsBaseline: 3.1,  notes: "MSK node added — first oncology academic contribution." },
  { roundId: 44, startedAt: "2026-08-11T07:00:00Z", completedAt: "2026-08-11T07:24:51Z", nodesParticipating: 7, totalSamples: 134167, avgGradientNorm: 0.0578, globalModelVersion: "fedclin-v0.7.39",     status: "completed", upliftPctVsBaseline: 2.4,  notes: "AstraZeneca offline for maintenance window." },
  { roundId: 43, startedAt: "2026-08-10T07:00:00Z", completedAt: "2026-08-10T07:22:38Z", nodesParticipating: 8, totalSamples: 142031, avgGradientNorm: 0.0612, globalModelVersion: "fedclin-v0.7.38",     status: "completed", upliftPctVsBaseline: 2.1,  notes: "First round after FDA Sentinel joined — TSP validation passed." },
  { roundId: 42, startedAt: "2026-08-09T07:00:00Z", completedAt: "2026-08-09T07:19:21Z", nodesParticipating: 7, totalSamples: 109927, avgGradientNorm: 0.0687, globalModelVersion: "fedclin-v0.7.37",     status: "completed", upliftPctVsBaseline: 1.7,  notes: "Pre-FDA baseline; vaccination data not yet included." },
];

export interface FederatedUpliftByTa {
  therapeuticArea: string;
  baselineAuc: number;
  currentAuc: number;
  upliftPct: number;
  samplesShared: number;
  consortium: string;
}

export const federatedUpliftByTa: FederatedUpliftByTa[] = [
  { therapeuticArea: "Oncology",            baselineAuc: 0.912, currentAuc: 0.951, upliftPct: 4.3, samplesShared: 26242, consortium: "Oncology Consortium (4 nodes)" },
  { therapeuticArea: "Cardiovascular",      baselineAuc: 0.931, currentAuc: 0.954, upliftPct: 2.5, samplesShared: 23442, consortium: "CV Consortium (3 nodes)" },
  { therapeuticArea: "Vaccines",            baselineAuc: 0.884, currentAuc: 0.918, upliftPct: 3.8, samplesShared:  9842, consortium: "Vaccines Consortium (2 nodes)" },
  { therapeuticArea: "Respiratory",         baselineAuc: 0.901, currentAuc: 0.922, upliftPct: 2.3, samplesShared:  9124, consortium: "Respiratory Consortium (2 nodes)" },
  { therapeuticArea: "Pharmacovigilance",   baselineAuc: 0.872, currentAuc: 0.924, upliftPct: 6.0, samplesShared: 32104, consortium: "FDA Sentinel (1 node, large dataset)" },
];

export interface FederatedProtocol {
  protocolId: string;
  name: string;
  description: string;
  roundsCompleted: number;
  approved: boolean;
}

export const federatedProtocols: FederatedProtocol[] = [
  { protocolId: "fp-fedavg-ckks",  name: "FedAvg + CKKS encryption",          description: "Classical federated averaging with CKKS homomorphic aggregation. Round size 7d, gradient clipping at 1.0.", roundsCompleted: 47, approved: true },
  { protocolId: "fp-fedprox",      name: "FedProx with proximal term",        description: "Adds mu-proximal term to handle heterogeneous node datasets; mu=0.01 tuned empirically.", roundsCompleted: 12, approved: true },
  { protocolId: "fp-scafold",      name: "SCAFFOLD (variance reduction)",     description: "Control variates to correct client-drift in heterogeneous federations. Experimental.", roundsCompleted: 4, approved: false },
  { protocolId: "fp-dp-fm",        name: "Differentially-Private FedAvg",    description: "Per-sample gradient clipping (C=1.0) + Gaussian noise (sigma=0.5) for epsilon=2.0 DP guarantee.", roundsCompleted: 9, approved: true },
];

export interface FederatedKpi {
  label: string;
  value: string;
  hint?: string;
  trend?: "up" | "down" | "flat";
  deltaPct?: number;
}

export const federatedKpis: FederatedKpi[] = [
  { label: "Active consortium nodes",     value: "8",    hint: "5 pharma + 2 academic + 1 regulator",        trend: "up", deltaPct: 14.3 },
  { label: "Cumulative samples shared",   value: "0",    hint: "Computed below from rounds array",            trend: "up" },
  { label: "Global model version",        value: "v0.7.42-rc", hint: "Currently in round 47 (running)",       trend: "up" },
  { label: "Avg uplift vs baseline",      value: "+3.8%", hint: "Across all participating therapeutic areas", trend: "up", deltaPct: 12.0 },
  { label: "Encryption scheme",           value: "CKKS-128", hint: "All gradients encrypted client-side; plaintext never leaves node", trend: "flat" },
  { label: "Round completion SLA",        value: "<= 25 min", hint: "Network-aggregation-write budget per round", trend: "flat" },
];

/* ============================================================
   FEATURE #13 — NLP ENHANCEMENT WITH FINE-TUNED TRANSFORMS
   LLMs fine-tuned on clinical trial corpora for query handling,
   protocol deviation extraction, and regulatory response drafting.
   ============================================================ */

export interface NlpModel {
  modelId: string;
  baseModel: string;
  fineTuneMethod: "lora" | "qlora" | "full_ft" | "instruction";
  parameters: string;
  domainCorpus: string;
  trainedOnTokens: number;
  evalRougeL: number;
  evalBleu: number;
  evalF1: number;
  evalClinicalAccuracy: number;
  latencyP95Ms: number;
  contextWindow: number;
  status: "production" | "staging" | "training" | "deprecated";
  deployedAt: string | null;
}

export const nlpModels: NlpModel[] = [
  { modelId: "clin-llm-7b-v3",   baseModel: "Llama-3.1-7B",        fineTuneMethod: "qlora",      parameters: "7B",  domainCorpus: "Protocols + CRFs + FDA submissions (12M docs)",      trainedOnTokens: 8.4e9,  evalRougeL: 0.842, evalBleu: 0.412, evalF1: 0.918, evalClinicalAccuracy: 0.934, latencyP95Ms: 412,  contextWindow: 32768, status: "production", deployedAt: "2026-07-22" },
  { modelId: "clin-llm-13b-v2",  baseModel: "Llama-3.1-13B",       fineTuneMethod: "lora",       parameters: "13B", domainCorpus: "Protocols + CRFs + EMA EPARs (8M docs)",             trainedOnTokens: 5.1e9,  evalRougeL: 0.868, evalBleu: 0.438, evalF1: 0.931, evalClinicalAccuracy: 0.947, latencyP95Ms: 684,  contextWindow: 32768, status: "staging",    deployedAt: "2026-08-08" },
  { modelId: "clin-ner-deberta", baseModel: "DeBERTa-v3-large",    fineTuneMethod: "full_ft",    parameters: "435M",domainCorpus: "Annotated CRFs (1.2M docs, 8.4M entities)",          trainedOnTokens: 6.2e8,  evalRougeL: 0.000, evalBleu: 0.000, evalF1: 0.963, evalClinicalAccuracy: 0.963, latencyP95Ms: 88,   contextWindow: 8192,  status: "production", deployedAt: "2026-06-15" },
  { modelId: "clin-llm-70b-v1",  baseModel: "Llama-3.1-70B",       fineTuneMethod: "qlora",      parameters: "70B", domainCorpus: "Multi-region submissions (24M docs)",                trainedOnTokens: 1.4e10, evalRougeL: 0.881, evalBleu: 0.451, evalF1: 0.942, evalClinicalAccuracy: 0.954, latencyP95Ms: 1240, contextWindow: 32768, status: "training",   deployedAt: null },
  { modelId: "clin-llm-7b-v2",   baseModel: "Llama-3-7B",          fineTuneMethod: "qlora",      parameters: "7B",  domainCorpus: "Protocols + CRFs (6M docs)",                         trainedOnTokens: 4.8e9,  evalRougeL: 0.811, evalBleu: 0.394, evalF1: 0.902, evalClinicalAccuracy: 0.918, latencyP95Ms: 398,  contextWindow: 8192,  status: "deprecated", deployedAt: "2026-04-02" },
];

export interface NlpUseCase {
  useCaseId: string;
  name: string;
  modelId: string;
  description: string;
  throughputPerDay: number;
  accuracy: number;
  sampleInput: string;
  sampleOutput: string;
  status: "production" | "pilot" | "experimental";
}

export const nlpUseCases: NlpUseCase[] = [
  {
    useCaseId: "reg-query",
    name: "Regulatory Inquiry Auto-Response",
    modelId: "clin-llm-7b-v3",
    description: "Generates first drafts of responses to regulatory inquiries (FDA Information Requests, EMA Day-180 Questions).",
    throughputPerDay: 142,
    accuracy: 0.918,
    sampleInput: "FDA IR #2026-0811-042: Please provide a listing of all SAEs occurring within 30 days of dosing for subjects enrolled at sites 04, 11, and 18.",
    sampleOutput: "Per your request, please find attached the SAE listing for subjects enrolled at sites 04 (n=3), 11 (n=2), and 18 (n=4) within 30 days of dosing. All events were previously reported in the DSUR dated 31-JUL-2026. We are available for a teleconference to review any specific event.",
    status: "production",
  },
  {
    useCaseId: "deviation-extract",
    name: "Protocol Deviation Risk Extraction",
    modelId: "clin-llm-7b-v3",
    description: "Extracts protocol deviation risk signals from informed consent form language and protocol amendments.",
    throughputPerDay: 84,
    accuracy: 0.934,
    sampleInput: "Protocol Section 4.2.3: Subjects who miss more than 2 consecutive doses will be withdrawn from the study.",
    sampleOutput: "{ deviation_type: 'withdrawal_criteria', risk_score: 0.71, risk_factors: ['binary_threshold', 'no_grace_period', 'no_re_enrollment'], recommendation: 'Consider 3-miss threshold with PI discretion for re-enrollment' }",
    status: "production",
  },
  {
    useCaseId: "audit-draft",
    name: "Audit Finding Draft Response",
    modelId: "clin-llm-7b-v3",
    description: "Generates first drafts of CAPA (Corrective and Preventive Action) responses based on audit findings.",
    throughputPerDay: 38,
    accuracy: 0.902,
    sampleInput: "Finding: Site 04 failed to obtain IRB approval for protocol amendment 3 prior to enrollment of subject 04-014.",
    sampleOutput: "CAPA-2026-0811-018:\n1. Root cause: Site staff turnover resulted in missed notification of amendment 3 to IRB.\n2. Corrective: Subject 04-014 enrollment paused; IRB approval obtained 12-AUG-2026.\n3. Preventive: Re-training of site staff on amendment-to-IRB workflow; addition of eCRF gate that blocks enrollment when pending amendment approval is detected.",
    status: "production",
  },
  {
    useCaseId: "ner-clinical",
    name: "Clinical Entity Extraction",
    modelId: "clin-ner-deberta",
    description: "Extracts clinical entities (drug, dose, AE, lab value, anatomical site) from CRF narratives.",
    throughputPerDay: 9421,
    accuracy: 0.963,
    sampleInput: "Subject 04-014 reported moderate nausea 3 days after first dose of 400mg pembrolizumab; treated with 4mg ondansetron PRN.",
    sampleOutput: "{ drugs: ['pembrolizumab', 'ondansetron'], doses: ['400mg', '4mg'], adverse_events: ['nausea (moderate)'], onset: '3 days post-dose', treatment: 'PRN ondansetron' }",
    status: "production",
  },
  {
    useCaseId: "consent-summary",
    name: "Informed Consent Summarization",
    modelId: "clin-llm-13b-v2",
    description: "Generates plain-language summaries of ICF documents for subjects (8th-grade reading level).",
    throughputPerDay: 21,
    accuracy: 0.887,
    sampleInput: "[12-page ICF document with risks, benefits, procedures, alternatives, confidentiality...]",
    sampleOutput: "What is this study? This study tests whether a new drug (pembrolizumab) helps people with advanced lung cancer live longer.\n\nWhat will happen to me? You will receive the drug through a vein in your arm every 3 weeks for up to 2 years. You will visit the clinic about 30 times.\n\nWhat are the risks? The most common side effects are tiredness, rash, and diarrhea. Rare but serious risks include lung inflammation.",
    status: "pilot",
  },
];

export interface NlpFineTuneRun {
  runId: string;
  modelId: string;
  startedAt: string;
  durationHr: number;
  gpuHours: number;
  trainTokens: number;
  evalLoss: number;
  status: "completed" | "running" | "failed" | "queued";
  triggeredBy: "scheduled" | "manual" | "data_refresh";
}

export const nlpFineTuneRuns: NlpFineTuneRun[] = [
  { runId: "ft-clin-7b-v3-r12",  modelId: "clin-llm-7b-v3",   startedAt: "2026-08-12T04:00:00Z", durationHr: 18.4, gpuHours: 442,  trainTokens: 8.4e9, evalLoss: 0.742, status: "completed", triggeredBy: "data_refresh" },
  { runId: "ft-clin-13b-v2-r4",  modelId: "clin-llm-13b-v2",  startedAt: "2026-08-08T02:00:00Z", durationHr: 32.1, gpuHours: 1284, trainTokens: 5.1e9, evalLoss: 0.694, status: "completed", triggeredBy: "manual" },
  { runId: "ft-clin-ner-r21",    modelId: "clin-ner-deberta", startedAt: "2026-06-15T01:00:00Z", durationHr: 4.2,  gpuHours: 34,   trainTokens: 6.2e8, evalLoss: 0.142, status: "completed", triggeredBy: "scheduled" },
  { runId: "ft-clin-70b-v1-r1",  modelId: "clin-llm-70b-v1",  startedAt: "2026-08-14T01:00:00Z", durationHr: 0,    gpuHours: 0,    trainTokens: 0,    evalLoss: 0,     status: "running",   triggeredBy: "manual" },
];

export interface NlpKpi {
  label: string;
  value: string;
  hint?: string;
  trend?: "up" | "down" | "flat";
  deltaPct?: number;
}

export const nlpKpis: NlpKpi[] = [
  { label: "Models in production",          value: "3",      hint: "+1 in staging, +1 in training",            trend: "up",   deltaPct: 50.0 },
  { label: "Daily NLP inferences",          value: "9,706",  hint: "Across 5 use cases",                       trend: "up",   deltaPct: 18.4 },
  { label: "Avg clinical accuracy",         value: "93.4%",  hint: "Expert-validated across use cases",        trend: "up",   deltaPct: 2.1 },
  { label: "P95 latency",                   value: "412ms",  hint: "7B model on A10G; 70B at 1.2s",             trend: "flat", deltaPct: -0.3 },
  { label: "Training corpus size",          value: "37M docs", hint: "Protocols + CRFs + submissions + EPARs", trend: "up",   deltaPct: 8.7 },
  { label: "GPU hours this month",          value: "1,760",  hint: "Across 4 active fine-tune runs",           trend: "up",   deltaPct: 22.5 },
];

/* ============================================================
   FEATURE #14 — COMPREHENSIVE MLOPS INFRASTRUCTURE
   Model versioning, A/B testing, automated retraining, monitoring,
   bias detection, and drift alerting.
   ============================================================ */

export interface MlopsModelVersion {
  versionId: string;
  modelId: string;
  parentVersion: string | null;
  status: "champion" | "challenger" | "shadow" | "archived";
  promotedAt: string;
  trafficPct: number;
  auc: number;
  calibrationErrorPct: number;
  driftPsi: number;
  biasMaxDisparity: number;
  notes: string;
}

export const mlopsModelVersions: MlopsModelVersion[] = [
  { versionId: "clin-v3.4.1", modelId: "clinical-reviewer", parentVersion: "clin-v3.4.0", status: "champion",   promotedAt: "2026-08-01T10:00:00Z", trafficPct: 90, auc: 0.964, calibrationErrorPct: 3.4, driftPsi: 0.082, biasMaxDisparity: 2.1, notes: "Champion model in production for 13 days." },
  { versionId: "clin-v3.4.2-rc", modelId: "clinical-reviewer", parentVersion: "clin-v3.4.1", status: "challenger", promotedAt: "2026-08-11T14:00:00Z", trafficPct: 10, auc: 0.968, calibrationErrorPct: 3.1, driftPsi: 0.078, biasMaxDisparity: 1.8, notes: "Challenger A/B — 10% traffic, +0.4 AUC." },
  { versionId: "clin-v3.5.0-shadow", modelId: "clinical-reviewer", parentVersion: "clin-v3.4.1", status: "shadow",    promotedAt: "2026-08-12T09:00:00Z", trafficPct: 0,  auc: 0.971, calibrationErrorPct: 2.9, driftPsi: 0.074, biasMaxDisparity: 1.6, notes: "Shadow mode — predictions logged but not surfaced." },
  { versionId: "clin-v3.4.0",   modelId: "clinical-reviewer", parentVersion: "clin-v3.3.9",   status: "archived",  promotedAt: "2026-07-15T10:00:00Z", trafficPct: 0,  auc: 0.958, calibrationErrorPct: 3.9, driftPsi: 0.124, biasMaxDisparity: 3.1, notes: "Replaced by v3.4.1 after PSI crossed 0.15." },
];

export interface MlopsAbTest {
  testId: string;
  name: string;
  championVersion: string;
  challengerVersion: string;
  startedAt: string;
  trafficSplit: { champion: number; challenger: number };
  primaryMetric: string;
  championMetric: number;
  challengerMetric: number;
  upliftPct: number;
  status: "running" | "completed" | "stopped_early";
  decision: string | null;
  samplesCollected: number;
  samplesTarget: number;
}

export const mlopsAbTests: MlopsAbTest[] = [
  { testId: "ab-2026-08-cal-thresh", name: "Calibration threshold optimization",     championVersion: "clin-v3.4.1", challengerVersion: "clin-v3.4.2-rc", startedAt: "2026-08-11T14:00:00Z", trafficSplit: { champion: 90, challenger: 10 }, primaryMetric: "False positive rate", championMetric: 1.4, challengerMetric: 0.8, upliftPct: -42.9, status: "running",      decision: null,                     samplesCollected: 18421, samplesTarget: 50000 },
  { testId: "ab-2026-07-onco-model", name: "Oncology-specific fine-tune",          championVersion: "clin-v3.3.9",  challengerVersion: "clin-v3.4.0",   startedAt: "2026-07-08T10:00:00Z", trafficSplit: { champion: 50, challenger: 50 }, primaryMetric: "AUC",                 championMetric: 0.952, challengerMetric: 0.958, upliftPct: 0.6,  status: "completed",     decision: "Promote challenger -> v3.4.0",  samplesCollected: 50124, samplesTarget: 50000 },
  { testId: "ab-2026-06-multilingual",name: "Multilingual embedding upgrade",      championVersion: "clin-v3.3.8",  challengerVersion: "clin-v3.3.9",   startedAt: "2026-06-12T10:00:00Z", trafficSplit: { champion: 50, challenger: 50 }, primaryMetric: "Non-English F1",       championMetric: 0.872, challengerMetric: 0.901, upliftPct: 3.3,  status: "completed",     decision: "Promote challenger -> v3.3.9",  samplesCollected: 32021, samplesTarget: 30000 },
  { testId: "ab-2026-06-ner-head",   name: "NER head architecture swap",          championVersion: "clin-v3.3.7",  challengerVersion: "clin-v3.3.8",   startedAt: "2026-06-01T10:00:00Z", trafficSplit: { champion: 50, challenger: 50 }, primaryMetric: "Entity F1",           championMetric: 0.918, challengerMetric: 0.914, upliftPct: -0.4, status: "stopped_early", decision: "Insufficient uplift; revert",  samplesCollected: 12048, samplesTarget: 30000 },
];

export interface MlopsPipelineRun {
  runId: string;
  pipeline: "retrain" | "evaluate" | "deploy" | "rollback" | "drift_check";
  triggeredBy: "scheduled" | "manual" | "alert" | "ab_completion";
  startedAt: string;
  durationSec: number;
  stepsCompleted: number;
  stepsTotal: number;
  status: "succeeded" | "running" | "failed" | "cancelled";
  artifact: string;
}

export const mlopsPipelineRuns: MlopsPipelineRun[] = [
  { runId: "pipe-2026-08-14-T03", pipeline: "drift_check", triggeredBy: "scheduled", startedAt: "2026-08-14T03:00:00Z", durationSec: 248,  stepsCompleted: 4, stepsTotal: 4, status: "succeeded", artifact: "drift-report-2026-08-14.json" },
  { runId: "pipe-2026-08-13-T03", pipeline: "retrain",     triggeredBy: "scheduled", startedAt: "2026-08-13T03:00:00Z", durationSec: 4281, stepsCompleted: 7, stepsTotal: 7, status: "succeeded", artifact: "clin-v3.4.3-rc.tar.gz" },
  { runId: "pipe-2026-08-12-T15", pipeline: "retrain",     triggeredBy: "alert",     startedAt: "2026-08-12T15:42:00Z", durationSec: 4421, stepsCompleted: 7, stepsTotal: 7, status: "succeeded", artifact: "clin-v3.4.2-rc.tar.gz" },
  { runId: "pipe-2026-08-12-T11", pipeline: "deploy",      triggeredBy: "manual",    startedAt: "2026-08-12T11:08:00Z", durationSec: 612,  stepsCompleted: 5, stepsTotal: 5, status: "succeeded", artifact: "deploy-clin-v3.4.2-rc.k8s.yaml" },
  { runId: "pipe-2026-08-11-T14", pipeline: "deploy",      triggeredBy: "manual",    startedAt: "2026-08-11T14:00:00Z", durationSec: 588,  stepsCompleted: 5, stepsTotal: 5, status: "succeeded", artifact: "deploy-clin-v3.4.2-rc.k8s.yaml" },
  { runId: "pipe-2026-08-10-T22", pipeline: "rollback",    triggeredBy: "alert",     startedAt: "2026-08-10T22:14:00Z", durationSec: 184,  stepsCompleted: 3, stepsTotal: 3, status: "succeeded", artifact: "rollback-clin-v3.4.0.k8s.yaml" },
];

export interface MlopsMonitoringMetric {
  metricId: string;
  name: string;
  category: "performance" | "drift" | "bias" | "calibration" | "latency" | "throughput";
  value: number;
  threshold: number;
  unit: string;
  status: "healthy" | "warning" | "critical";
  trend7d: number[];
  description: string;
}

export const mlopsMonitoringMetrics: MlopsMonitoringMetric[] = [
  { metricId: "m-auc",        name: "AUC",                          category: "performance",  value: 0.964, threshold: 0.940, unit: "",      status: "healthy",  trend7d: [0.963, 0.962, 0.964, 0.963, 0.964, 0.964, 0.964], description: "Area under ROC curve on held-out validation set." },
  { metricId: "m-drift-psi",  name: "Feature drift (PSI)",          category: "drift",        value: 0.082, threshold: 0.150, unit: "",      status: "healthy",  trend7d: [0.071, 0.074, 0.078, 0.079, 0.080, 0.081, 0.082], description: "Population Stability Index; >0.15 triggers retrain." },
  { metricId: "m-bias",       name: "Bias disparity (max)",         category: "bias",         value: 2.1,   threshold: 5.0,   unit: "%",     status: "healthy",  trend7d: [2.3, 2.2, 2.2, 2.1, 2.1, 2.1, 2.1], description: "Max approval-rate disparity across 8 demographic groups." },
  { metricId: "m-cal-ece",    name: "Calibration error (ECE)",      category: "calibration",  value: 3.4,   threshold: 8.0,   unit: "%",     status: "healthy",  trend7d: [3.6, 3.5, 3.5, 3.4, 3.4, 3.4, 3.4], description: "Expected Calibration Error on 10-bin reliability diagram." },
  { metricId: "m-latency",    name: "Inference latency (P95)",      category: "latency",      value: 412,   threshold: 800,   unit: "ms",    status: "healthy",  trend7d: [398, 402, 408, 411, 414, 412, 412], description: "P95 latency on A10G GPU." },
  { metricId: "m-throughput", name: "Throughput",                   category: "throughput",   value: 9706,  threshold: 5000,  unit: "/day",  status: "healthy",  trend7d: [8421, 8810, 9012, 9204, 9484, 9612, 9706], description: "Daily inference volume across all use cases." },
  { metricId: "m-fp-rate",    name: "False positive rate",          category: "performance",  value: 1.2,   threshold: 3.0,   unit: "%",     status: "healthy",  trend7d: [1.8, 1.6, 1.4, 1.3, 1.3, 1.2, 1.2], description: "Auto-approve pathway false positive rate." },
  { metricId: "m-data-stale", name: "Days since last training",     category: "drift",        value: 1,     threshold: 7,     unit: "days",  status: "healthy",  trend7d: [3, 2, 1, 0, 0, 1, 1], description: "Staleness counter; >7d triggers scheduled retrain." },
];

export interface MlopsKpi {
  label: string;
  value: string;
  hint?: string;
  trend?: "up" | "down" | "flat";
  deltaPct?: number;
}

export const mlopsKpis: MlopsKpi[] = [
  { label: "Models in registry",      value: "47",     hint: "12 production, 8 staging, 27 archived",        trend: "up",   deltaPct: 9.3 },
  { label: "Active A/B tests",        value: "1",      hint: "+2 completed this month",                     trend: "flat", deltaPct: 0.0 },
  { label: "Avg retrain frequency",   value: "Daily",  hint: "Drift-triggered retrain threshold: PSI 0.15", trend: "flat", deltaPct: 0.0 },
  { label: "Avg deploy time",         value: "9.8 min",hint: "From commit to canary",                       trend: "down", deltaPct: -14.2 },
  { label: "Monitoring alerts (7d)",  value: "0",      hint: "All 8 metrics healthy",                       trend: "down", deltaPct: -100.0 },
  { label: "Bias checks passed",      value: "8 / 8",  hint: "Across 8 demographic groups",                 trend: "flat", deltaPct: 0.0 },
];

/* ============================================================
   FEATURE #15 — ADVANCED ANALYTICS (extending existing Analytics)
   Cohort funnel, KPI tree, predictive enrollment, anomaly radar,
   scenario simulator.
   ============================================================ */

export interface AdvancedAnalyticsKpi {
  label: string;
  value: string;
  hint?: string;
  trend?: "up" | "down" | "flat";
  deltaPct?: number;
  sparkline: number[];
}

export const advancedAnalyticsKpis: AdvancedAnalyticsKpi[] = [
  { label: "Net reviewer time saved",     value: "1,842 hr",  hint: "Last 30 days across 12 trials",      trend: "up",   deltaPct: 18.2, sparkline: [120, 134, 142, 158, 171, 184, 201] },
  { label: "Auto-approve throughput",     value: "94.2%",     hint: "Of total reviewer decisions",        trend: "up",   deltaPct: 3.4,  sparkline: [88, 89, 91, 90, 92, 93, 94] },
  { label: "Mean time-to-decision",       value: "3.4 min",   hint: "Per task; P95 = 12 min",             trend: "down", deltaPct: -22.1,sparkline: [5.2, 4.8, 4.4, 4.1, 3.8, 3.6, 3.4] },
  { label: "Predicted enrollment date",   value: "11-MAR-2027",hint: "Forecast +/- 18 days (80% CI)",     trend: "down", deltaPct: -4.2, sparkline: [42, 38, 36, 34, 32, 30, 28] },
  { label: "Anomaly signals (7d)",        value: "3",         hint: "All triaged; 2 confirmed false pos", trend: "down", deltaPct: -40.0,sparkline: [8, 6, 5, 7, 4, 4, 3] },
  { label: "Query resolution velocity",   value: "1.8x",      hint: "vs pre-AI baseline (1.0x)",           trend: "up",   deltaPct: 12.5, sparkline: [1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8] },
];

export interface AdvancedAnalyticsFunnelStage {
  stageId: string;
  stageName: string;
  count: number;
  conversionPct: number;
  dropoffPct: number;
  avgDurationHr: number;
}

export const advancedAnalyticsFunnel: AdvancedAnalyticsFunnelStage[] = [
  { stageId: "s1", stageName: "Task generated by AI",       count: 42510, conversionPct: 100.0, dropoffPct:  0.0, avgDurationHr:  0.0 },
  { stageId: "s2", stageName: "Passed auto-validation",     count: 39842, conversionPct:  93.7, dropoffPct:  6.3, avgDurationHr:  0.1 },
  { stageId: "s3", stageName: "Auto-approved (>=0.82)",     count: 17501, conversionPct:  43.9, dropoffPct: 56.1, avgDurationHr:  0.2 },
  { stageId: "s4", stageName: "Routed to reviewer queue",   count: 22341, conversionPct:  56.1, dropoffPct:  0.0, avgDurationHr:  0.4 },
  { stageId: "s5", stageName: "Reviewer decision made",     count: 21887, conversionPct:  98.0, dropoffPct:  2.0, avgDurationHr:  3.4 },
  { stageId: "s6", stageName: "Reviewer decision concurs",  count: 20793, conversionPct:  95.0, dropoffPct:  5.0, avgDurationHr:  0.2 },
];

export interface AdvancedAnalyticsKpiTree {
  id: string;
  label: string;
  value: number;
  unit: string;
  category: "throughput" | "accuracy" | "speed" | "compliance";
  children: AdvancedAnalyticsKpiTree[];
}

export const advancedAnalyticsKpiTree: AdvancedAnalyticsKpiTree = {
  id: "root",
  label: "Reviewer productivity index",
  value: 87,
  unit: "/100",
  category: "throughput",
  children: [
    {
      id: "throughput",
      label: "Throughput",
      value: 91,
      unit: "/100",
      category: "throughput",
      children: [
        { id: "auto_approve_rate", label: "Auto-approve rate",     value: 94, unit: "%",   category: "throughput", children: [] },
        { id: "queue_velocity",    label: "Queue velocity",        value: 89, unit: "/100",category: "throughput", children: [] },
      ],
    },
    {
      id: "accuracy",
      label: "Decision accuracy",
      value: 88,
      unit: "/100",
      category: "accuracy",
      children: [
        { id: "concur_rate",   label: "Reviewer concur rate",   value: 95, unit: "%",   category: "accuracy", children: [] },
        { id: "fp_rate",       label: "False positive rate",    value: 88, unit: "/100",category: "accuracy", children: [] },
        { id: "fn_rate",       label: "False negative rate",    value: 91, unit: "/100",category: "accuracy", children: [] },
      ],
    },
    {
      id: "speed",
      label: "Time-to-decision",
      value: 84,
      unit: "/100",
      category: "speed",
      children: [
        { id: "p50_latency", label: "P50 latency",  value: 92, unit: "/100", category: "speed", children: [] },
        { id: "p95_latency", label: "P95 latency",  value: 78, unit: "/100", category: "speed", children: [] },
      ],
    },
    {
      id: "compliance",
      label: "Compliance posture",
      value: 86,
      unit: "/100",
      category: "compliance",
      children: [
        { id: "audit_completeness",  label: "Audit completeness",  value: 99, unit: "%",    category: "compliance", children: [] },
        { id: "21cfr11_coverage",    label: "21 CFR 11 coverage",   value: 97, unit: "%",    category: "compliance", children: [] },
        { id: "hipaa_no_incidents",  label: "HIPAA (no incidents)", value: 100,unit: "%",    category: "compliance", children: [] },
      ],
    },
  ],
};

export interface AdvancedAnalyticsAnomaly {
  anomalyId: string;
  detectedAt: string;
  signalType: "spike" | "drop" | "drift" | "outlier" | "pattern_change";
  metric: string;
  siteId?: string;
  trialId?: string;
  expected: number;
  observed: number;
  severity: "low" | "medium" | "high";
  status: "investigating" | "false_positive" | "confirmed" | "mitigated";
  summary: string;
}

export const advancedAnalyticsAnomalies: AdvancedAnalyticsAnomaly[] = [
  { anomalyId: "an-2026-08-14-01", detectedAt: "2026-08-14T06:42:00Z", signalType: "spike",   metric: "Site 04 query rate",       siteId: "SITE-NBO-09", trialId: "TRIAL-ONCO-204", expected: 12, observed: 41, severity: "high",   status: "investigating",   summary: "Site 04 query rate spiked 3.4x above 7-day baseline; possible protocol deviation cluster." },
  { anomalyId: "an-2026-08-13-02", detectedAt: "2026-08-13T14:21:00Z", signalType: "drop",    metric: "Auto-approve rate (Brazil)",siteId: "SITE-SAO-13", trialId: "TRIAL-CV-118",   expected: 0.94, observed: 0.62,severity: "medium", status: "confirmed",       summary: "Brazil site auto-approve rate dropped 34%; root cause: Portuguese ICF variance introduced by recent amendment." },
  { anomalyId: "an-2026-08-12-03", detectedAt: "2026-08-12T22:11:00Z", signalType: "drift",   metric: "Field value distribution",  trialId: "TRIAL-VAC-301", expected: 0.08, observed: 0.21, severity: "medium", status: "mitigated",       summary: "PSI on 'weight_kg' field crossed 0.20 threshold; mitigated by retraining v3.4.2-rc." },
  { anomalyId: "an-2026-08-11-04", detectedAt: "2026-08-11T09:34:00Z", signalType: "outlier", metric: "Subject 04-014 AE count",   siteId: "SITE-NBO-09", trialId: "TRIAL-ONCO-204", expected: 1, observed: 7,  severity: "high",   status: "investigating",   summary: "Subject 04-014 reported 7 AEs in 14 days; review for potential safety signal." },
  { anomalyId: "an-2026-08-10-05", detectedAt: "2026-08-10T18:42:00Z", signalType: "pattern_change", metric: "Reviewer concur rate",  trialId: "TRIAL-CV-118",   expected: 0.95, observed: 0.71, severity: "low",    status: "false_positive",  summary: "Concur rate dropped; investigated and attributed to a new reviewer onboarding (expected dip)." },
];

export interface AdvancedAnalyticsScenario {
  scenarioId: string;
  name: string;
  baseline: number;
  predicted: number;
  unit: string;
  upliftPct: number;
  assumptions: string[];
}

export const advancedAnalyticsScenarios: AdvancedAnalyticsScenario[] = [
  { scenarioId: "scen-add-site",     name: "Add 5 sites (emerging markets)",   baseline: 100, predicted: 124, unit: "% enrollment velocity", upliftPct: 24.0, assumptions: ["Each site ~18 subjects/month", "No regulatory delays", "Edge fleet pre-provisioned"] },
  { scenarioId: "scen-raise-thresh", name: "Raise auto-approve threshold 0.82->0.85", baseline: 100, predicted: 96, unit: "% auto-approve throughput", upliftPct: -4.0, assumptions: ["FP rate drops 0.3pp", "Reviewer load increases 8%"] },
  { scenarioId: "scen-fed-round",    name: "Complete federated round 47",      baseline: 100, predicted: 103.8, unit: "% model AUC", upliftPct: 3.8, assumptions: ["All 8 nodes participate", "CKKS encryption stable"] },
  { scenarioId: "scen-protocol-amd",name: "Protocol amendment 4 (add AE reporting)", baseline: 100, predicted: 91, unit: "% reviewer velocity", upliftPct: -9.0, assumptions: ["New AE form fields", "Reviewer retraining required"] },
];



// === FEATURE #16: QUANTUM COMPUTING PARTNERSHIPS ===
// Tech Readiness: Experimental | Impact: Unknown | Complexity: Very High

export interface QuantumKpi {
  label: string;
  value: string;
  hint: string;
  trend?: "up" | "down" | "flat";
  deltaPct?: number;
}

export const quantumKpis: QuantumKpi[] = [
  { label: "Active QPU Partners",    value: "5",       hint: "IBM Q · Google · Rigetti · IonQ · Quantinuum", trend: "up",   deltaPct: 25 },
  { label: "Qubits Available (free tier)", value: "411",  hint: "Across 5 providers · peak concurrency 127", trend: "up",   deltaPct: 18 },
  { label: "Quantum Jobs (30d)",     value: "147",     hint: "QAOA · VQE · Quantum Kernel · Annealing",   trend: "up",   deltaPct: 42 },
  { label: "Avg Speedup vs CPLEX",   value: "8.4×",    hint: "Portfolio optimization @ N=64 assets",      trend: "up",   deltaPct: 12 },
  { label: "Classical Fallback Rate",value: "11.2%",   hint: "Decoherence / queue depth > 60s",            trend: "down", deltaPct: 8  },
  { label: "Abstraction Layer",      value: "v0.3.1-α", hint: "Qiskit + Cirq + PennyLane + Braket · hot-swap", trend: "up", deltaPct: 0 },
];

export interface QpuPartner {
  partnerId: string;
  name: string;
  shortName: string;
  qubits: number;
  topology: "heavy-hex" | "grid" | "trapped-ion" | "linear" | "ring";
  gateFidelity: number;          // two-qubit average, %
  freeTierQuota: string;          // human-readable quota
  freeTierMonthlyCredits: number;
  utilizationPct: number;
  sdk: string;                    // Qiskit / Cirq / Braket / etc.
  providerUrl: string;
  status: "online" | "queued" | "maintenance" | "limited";
  notes: string;
  monthlyJobsRun: number;
  avgQueueWaitSec: number;
}

export const qpuPartners: QpuPartner[] = [
  {
    partnerId: "qpu-ibmq",
    name: "IBM Quantum",
    shortName: "IBM Q",
    qubits: 127,
    topology: "heavy-hex",
    gateFidelity: 99.71,
    freeTierQuota: "10 min QPU time / month · 5,000 shots / job",
    freeTierMonthlyCredits: 10,
    utilizationPct: 78,
    sdk: "Qiskit Runtime",
    providerUrl: "https://quantum-computing.ibm.com",
    status: "online",
    notes: "Eagle r3 processor · open-plan IBM Quantum Platform · no credit card required for free tier",
    monthlyJobsRun: 58,
    avgQueueWaitSec: 42,
  },
  {
    partnerId: "qpu-google",
    name: "Google Quantum AI",
    shortName: "Google Q",
    qubits: 72,
    topology: "grid",
    gateFidelity: 99.4,
    freeTierQuota: "5 jobs / day · 1,000 shots / job · cirq simulator unlimited",
    freeTierMonthlyCredits: 150,
    utilizationPct: 64,
    sdk: "Cirq + TensorFlow Quantum",
    providerUrl: "https://quantumai.google",
    status: "online",
    notes: "Sycamore-class processor · research collaboration pathway · request access via Google Form",
    monthlyJobsRun: 41,
    avgQueueWaitSec: 18,
  },
  {
    partnerId: "qpu-rigetti",
    name: "Rigetti Computing",
    shortName: "Rigetti",
    qubits: 80,
    topology: "grid",
    gateFidelity: 99.2,
    freeTierQuota: "2,500 shots / month · 30s QPU time",
    freeTierMonthlyCredits: 30,
    utilizationPct: 52,
    sdk: "Forest SDK (pyQuil)",
    providerUrl: "https://www.rigetti.com",
    status: "online",
    notes: "Ankaa-2 84-qubit system · AWS Braket integration · free tier via Braket free-credits program",
    monthlyJobsRun: 23,
    avgQueueWaitSec: 35,
  },
  {
    partnerId: "qpu-ionq",
    name: "IonQ",
    shortName: "IonQ",
    qubits: 32,
    topology: "trapped-ion",
    gateFidelity: 99.6,
    freeTierQuota: "10,000 shots / month via AWS Braket free tier",
    freeTierMonthlyCredits: 25,
    utilizationPct: 41,
    sdk: "AWS Braket SDK",
    providerUrl: "https://ionq.com",
    status: "queued",
    notes: "Forte 32-qubit trapped-ion · all-to-all connectivity · best for QAOA on dense graphs",
    monthlyJobsRun: 17,
    avgQueueWaitSec: 88,
  },
  {
    partnerId: "qpu-quantinuum",
    name: "Quantinuum H1-2",
    shortName: "Quantinuum",
    qubits: 20,
    topology: "trapped-ion",
    gateFidelity: 99.85,
    freeTierQuota: "5,000 HQC credits via Azure Quantum free trial",
    freeTierMonthlyCredits: 25,
    utilizationPct: 33,
    sdk: "Azure Quantum + pytket",
    providerUrl: "https://www.quantinuum.com",
    status: "limited",
    notes: "H1-2 trapped-ion · highest gate fidelity available · Azure Quantum credits valid 30 days",
    monthlyJobsRun: 8,
    avgQueueWaitSec: 124,
  },
];

export interface QuantumWorkload {
  workloadId: string;
  name: string;
  domain: "site_selection" | "patient_recruitment" | "supply_chain" | "bayesian_design" | "portfolio_optimization";
  problemType: "QUBO" | "QAOA" | "VQE" | "HHL" | "quantum_kernel" | "annealing";
  description: string;
  classicalSolver: string;
  classicalBestSec: number;
  quantumBestSec: number;
  speedup: number;
  solutionQuality: number;       // 0-100, vs known optimum
  qubitsUsed: number;
  status: "queued" | "running" | "solved" | "classical_fallback" | "failed";
  partner: string;
  lastRun: string;
  iterativeImprovement: boolean;
}

export const quantumWorkloads: QuantumWorkload[] = [
  {
    workloadId: "qw-site-select-01",
    name: "Multi-region site selection (240 candidates × 18 constraints)",
    domain: "site_selection",
    problemType: "QAOA",
    description: "Combinatorial optimization selecting 24 sites from 240 candidates with 18 weighted constraints (patient density, IRB turnaround, prior performance, regulatory burden, cold-chain reach).",
    classicalSolver: "Gurobi MILP (12-core Xeon)",
    classicalBestSec: 312,
    quantumBestSec: 38,
    speedup: 8.2,
    solutionQuality: 94.2,
    qubitsUsed: 64,
    status: "solved",
    partner: "IBM Q",
    lastRun: "2026-08-13T14:22:00Z",
    iterativeImprovement: true,
  },
  {
    workloadId: "qw-recruit-02",
    name: "Patient recruitment route planning (mobile units)",
    domain: "patient_recruitment",
    problemType: "QAOA",
    description: "Optimal routing of 18 mobile recruitment units across 1,432 candidate neighborhoods with travel-time, language-match, and historical-yield constraints. Reduced time-to-screened by 31%.",
    classicalSolver: "OR-Tools VRP",
    classicalBestSec: 184,
    quantumBestSec: 27,
    speedup: 6.8,
    solutionQuality: 91.7,
    qubitsUsed: 48,
    status: "solved",
    partner: "Google Q",
    lastRun: "2026-08-12T09:14:00Z",
    iterativeImprovement: true,
  },
  {
    workloadId: "qw-supply-03",
    name: "Cold-chain IMP logistics routing (−80°C)",
    domain: "supply_chain",
    problemType: "annealing",
    description: "D-Wave-style Ising formulation for cold-chain shipment routing across 47 depots with temperature excursion risk penalties and just-in-time delivery windows.",
    classicalSolver: "CPLEX QP",
    classicalBestSec: 421,
    quantumBestSec: 52,
    speedup: 8.1,
    solutionQuality: 96.1,
    qubitsUsed: 96,
    status: "running",
    partner: "Rigetti",
    lastRun: "2026-08-14T03:11:00Z",
    iterativeImprovement: true,
  },
  {
    workloadId: "qw-bayes-04",
    name: "Bayesian adaptive trial design (4-arm oncology)",
    domain: "bayesian_design",
    problemType: "VQE",
    description: "Variational eigensolver applied to posterior covariance estimation for 4-arm Bayesian adaptive design; estimates optimal allocation ratios per interim.",
    classicalSolver: "MCMC (Stan)",
    classicalBestSec: 954,
    quantumBestSec: 147,
    speedup: 6.5,
    solutionQuality: 88.4,
    qubitsUsed: 32,
    status: "solved",
    partner: "IonQ",
    lastRun: "2026-08-10T18:42:00Z",
    iterativeImprovement: true,
  },
  {
    workloadId: "qw-portfolio-05",
    name: "Trial portfolio optimization (14 active programs × budget)",
    domain: "portfolio_optimization",
    problemType: "QUBO",
    description: "Markowitz-style portfolio optimization across 14 clinical programs with risk-adjusted NPV objective. Solved at N=64 asset universe on IBM Q.",
    classicalSolver: "CVXPY",
    classicalBestSec: 87,
    quantumBestSec: 11,
    speedup: 7.9,
    solutionQuality: 92.8,
    qubitsUsed: 64,
    status: "solved",
    partner: "IBM Q",
    lastRun: "2026-08-09T22:04:00Z",
    iterativeImprovement: false,
  },
  {
    workloadId: "qw-kernel-06",
    name: "Quantum kernel SVM (subject stratification)",
    domain: "bayesian_design",
    problemType: "quantum_kernel",
    description: "Quantum-enhanced kernel for SVM-based subject stratification; exploits exponential-size feature spaces inaccessible to classical kernels. AUC +0.027 vs RBF.",
    classicalSolver: "RBF SVM (scikit-learn)",
    classicalBestSec: 41,
    quantumBestSec: 73,
    speedup: 0.56,
    solutionQuality: 97.4,
    qubitsUsed: 24,
    status: "classical_fallback",
    partner: "Quantinuum",
    lastRun: "2026-08-08T11:21:00Z",
    iterativeImprovement: false,
  },
  {
    workloadId: "qw-linear-07",
    name: "HHL linear solver (PK/PD steady-state)",
    domain: "bayesian_design",
    problemType: "HHL",
    description: "HHL algorithm for solving sparse linear systems arising from PK/PD steady-state equations. Currently scales to N=8 due to condition-number limits.",
    classicalSolver: "Sparse LU (SciPy)",
    classicalBestSec: 0.8,
    quantumBestSec: 4.2,
    speedup: 0.19,
    solutionQuality: 84.1,
    qubitsUsed: 16,
    status: "queued",
    partner: "IBM Q",
    lastRun: "2026-08-14T07:18:00Z",
    iterativeImprovement: false,
  },
];

export interface QuantumAlgorithm {
  algoId: string;
  name: string;
  family: "VQA" | "annealing" | "grover" | "HHL" | "qml" | "shor";
  problemClass: string;
  bestFor: string;
  complexity: "poly-log" | "poly" | "exponential" | "heuristic";
  maturity: "production" | "research" | "experimental";
  availableOn: string[];
  description: string;
}

export const quantumAlgorithms: QuantumAlgorithm[] = [
  { algoId: "alg-qaoa",   name: "QAOA",           family: "VQA",       problemClass: "Combinatorial optimization",   bestFor: "Site selection, routing, scheduling",            complexity: "heuristic",    maturity: "research",      availableOn: ["IBM Q","Google Q","Rigetti","IonQ"], description: "Quantum Approximate Optimization Algorithm — alternating cost+mixer unitaries parameterized by γ, β." },
  { algoId: "alg-vqe",    name: "VQE",            family: "VQA",       problemClass: "Ground-state eigensolver",     bestFor: "Bayesian design, PK/PD covariance",              complexity: "poly",         maturity: "research",      availableOn: ["IBM Q","Google Q","Rigetti","Quantinuum"], description: "Variational Quantum Eigensolver — hybrid ansatz optimized by classical SPSA/COBYLA." },
  { algoId: "alg-anneal", name: "Quantum Annealing", family: "annealing", problemClass: "Ising / QUBO",            bestFor: "Logistics, portfolio, scheduling",               complexity: "heuristic",    maturity: "production",    availableOn: ["D-Wave (via Leap)","Rigetti (simulated)"], description: "Adiabatic evolution toward ground state of cost Hamiltonian; native fit for QUBO." },
  { algoId: "alg-qkernel",name: "Quantum Kernel SVM", family: "qml",  problemClass: "Supervised classification",   bestFor: "Stratification, biomarker discovery",            complexity: "exponential",  maturity: "experimental",  availableOn: ["IBM Q","IonQ","Quantinuum"], description: "Embeds data into exponential-size Hilbert space; kernel computed by quantum interference." },
  { algoId: "alg-hhl",    name: "HHL",            family: "HHL",       problemClass: "Sparse linear systems Ax=b",   bestFor: "PK/PD steady-state, network flow",               complexity: "poly-log",     maturity: "experimental",  availableOn: ["IBM Q"], description: "Harrow-Hassidim-Lloyd algorithm — exponential speedup for well-conditioned sparse systems (in theory)." },
  { algoId: "alg-grover", name: "Grover Search",  family: "grover",    problemClass: "Unstructured search",          bestFor: "Adverse-event pattern matching",                  complexity: "sqrt(N)",      maturity: "research",      availableOn: ["IBM Q","Google Q","Rigetti"], description: "Quadratic speedup for unstructured database search; oracle-marked solution amplification." },
];

export interface QuantumAbstractionLayer {
  layerName: string;
  layerRole: "application" | "compiler" | "provider" | "hardware";
  description: string;
  providers: string[];
  currentBackend: string;
  hotSwappable: boolean;
  fallbackSec: number;
}

export const quantumAbstractionStack: QuantumAbstractionLayer[] = [
  { layerName: "Application API",        layerRole: "application", description: "Business-facing: /quantum/optimize, /quantum/route —agnostic to provider.", providers: ["TrialGPTBot SDK"],             currentBackend: "internal",      hotSwappable: false, fallbackSec: 0  },
  { layerName: "Problem Compiler",       layerRole: "compiler",    description: "Translates combinatorial problems to QUBO / Ising / Hamiltonian forms.",  providers: ["dwave-ocean-sdk","pyqubo"],   currentBackend: "pyqubo",        hotSwappable: true,  fallbackSec: 0.2 },
  { layerName: "Provider SDK Adapter",   layerRole: "provider",    description: "Adapter pattern wrapping Qiskit/Cirq/Braket/PennyLane behind one interface.", providers: ["Qiskit","Cirq","Braket","PennyLane","pytket"], currentBackend: "Qiskit Runtime", hotSwappable: true,  fallbackSec: 1.8 },
  { layerName: "QPU Backend",            layerRole: "hardware",    description: "Physical quantum processing unit; selected per-job based on topology, fidelity, queue.", providers: ["IBM Q","Google Q","Rigetti","IonQ","Quantinuum"], currentBackend: "IBM Q (Eagle r3)", hotSwappable: true,  fallbackSec: 12.0 },
];

export interface QuantumResearchInitiative {
  initiativeId: string;
  partnerName: string;
  programName: string;
  freeTierOffering: string;
  registrationUrl: string;
  enrollmentStatus: "active" | "waitlist" | "exploring";
  monthlyQuota: string;
  currentUtilizationPct: number;
  notes: string;
}

export const quantumResearchInitiatives: QuantumResearchInitiative[] = [
  { initiativeId: "ri-ibmq-open",   partnerName: "IBM Quantum",       programName: "IBM Quantum Open Plan",       freeTierOffering: "10 min QPU time / month, perpetual, no credit card", registrationUrl: "https://quantum-computing.ibm.com",  enrollmentStatus: "active",    monthlyQuota: "10 min QPU + 10k shots",       currentUtilizationPct: 78, notes: "Best general-purpose free tier · Eagle r3 127-qubit access · community Discord support" },
  { initiativeId: "ri-google-q",    partnerName: "Google Quantum AI", programName: "Cirq + TFQ Research Access",  freeTierOffering: "5 jobs/day + unlimited simulator",         registrationUrl: "https://quantumai.google/cirq",     enrollmentStatus: "active",    monthlyQuota: "150 jobs/mo",                  currentUtilizationPct: 64, notes: "Sycamore-class hardware · best for VQE + quantum ML research" },
  { initiativeId: "ri-braket-free", partnerName: "AWS Braket",        programName: "Braket Free Tier",            freeTierQuota: "30 hours simulation + 5,000 shots QPU / month", registrationUrl: "https://aws.amazon.com/braket",     enrollmentStatus: "active",    monthlyQuota: "30h sim + 5k shots",           currentUtilizationPct: 41, notes: "Cross-provider access to Rigetti, IonQ, IQM via single SDK" },
  { initiativeId: "ri-azure-q",     partnerName: "Microsoft Azure",   programName: "Azure Quantum Free Credits",  freeTierOffering: "$500 Azure Quantum credits (30-day)",       registrationUrl: "https://azure.microsoft.com/quantum", enrollmentStatus: "waitlist",  monthlyQuota: "$500 credits",                 currentUtilizationPct: 33, notes: "Includes Quantinuum H1-2 + IonQ + Pasqal · enterprise billing post-trial" },
  { initiativeId: "ri-dwave-leap",  partnerName: "D-Wave",            programName: "Leap Quantum Cloud Free Tier",freeTierOffering: "1 min QPU time / month (perpetual)",         registrationUrl: "https://cloud.dwavesys.com/leap",   enrollmentStatus: "exploring", monthlyQuota: "1 min anneal + 30s hybrid",    currentUtilizationPct: 0,  notes: "Annealing-native — strong fit for QUBO logistics problems" },
];

// === FEATURE #17: AUTONOMOUS CLINICAL INTELLIGENCE SYSTEMS ===
// Tech Readiness: Research | Impact: Transformive | Complexity: Very High

export interface AutonomousKpi {
  label: string;
  value: string;
  hint: string;
  trend?: "up" | "down" | "flat";
  deltaPct?: number;
}

export const autonomousKpis: AutonomousKpi[] = [
  { label: "Autonomy Maturity (avg)",   value: "3.4 / 5",  hint: "Across 4 domains · target 5.0 by Q4 2027", trend: "up",   deltaPct: 9 },
  { label: "Autonomous Decisions / hr", value: "847",      hint: "Self-executed · logged for audit",          trend: "up",   deltaPct: 28 },
  { label: "Human Escalations / hr",    value: "12",       hint: "Down from 47/hr 6 months ago",              trend: "down", deltaPct: 74 },
  { label: "Proactive Interventions",   value: "89 / day", hint: "Risk mitigation before impact",             trend: "up",   deltaPct: 41 },
  { label: "Self-Improvement Cycles",   value: "47",       hint: "Weekly cadence · current cycle #47",        trend: "up",   deltaPct: 4  },
  { label: "Coverage Domains",          value: "4 / 4",    hint: "Regulatory · Scientific · Operational · Safety", trend: "flat", deltaPct: 0 },
];

export interface AutonomyMaturityLevel {
  level: number;
  name: string;
  description: string;
  capabilities: string[];
}

export const autonomyMaturityLevels: AutonomyMaturityLevel[] = [
  { level: 1, name: "Manual",        description: "Human performs all decisions; AI provides read-only dashboards.",         capabilities: ["Dashboards", "Reporting", "Search"] },
  { level: 2, name: "Assist",        description: "AI suggests actions; human accepts/rejects every decision.",              capabilities: ["Recommendations", "Drafting", "Sorting"] },
  { level: 3, name: "Augment",       description: "AI executes low-risk actions; human reviews exceptions only.",             capabilities: ["Auto-approve (high-conf)", "Escalation routing", "Draft generation"] },
  { level: 4, name: "Automated + Oversight", description: "AI runs workflows end-to-end; human supervises with audit & override.", capabilities: ["End-to-end workflows", "Self-monitoring", "Audit trail", "Drift detection"] },
  { level: 5, name: "Fully Autonomous", description: "AI sets its own goals within regulatory bounds; self-improves; self-heals.", capabilities: ["Goal-setting", "Self-retraining", "Cross-domain reasoning", "Proactive risk prevention"] },
];

export interface AutonomyDomainMaturity {
  domain: "regulatory" | "scientific" | "operational" | "safety";
  currentLevel: number;
  targetLevel2027: number;
  rationale: string;
  lastTransitionAt: string;
  blockers: string[];
}

export const autonomyDomainMaturity: AutonomyDomainMaturity[] = [
  { domain: "regulatory", currentLevel: 3, targetLevel2027: 5, rationale: "FDA's draft AI/ML SaMD guidance permits Level 4 with Predetermined Change Control Plan; Level 5 requires new rulemaking.", lastTransitionAt: "2026-03-14", blockers: ["21 CFR 11 audit-trail retention", "PCCP approval timeline", "Liability framework"] },
  { domain: "scientific", currentLevel: 3, targetLevel2027: 5, rationale: "Hypothesis generation works; verification still requires human sign-off per ICH E6(R3).",                              lastTransitionAt: "2026-02-22", blockers: ["Peer-review norms", "Reproducibility standards", "Conflict-of-interest policy"] },
  { domain: "operational",currentLevel: 4, targetLevel2027: 5, rationale: "Site selection, recruitment routing, supply-chain — already Level 4 with full audit and rollback.",                  lastTransitionAt: "2026-07-01", blockers: ["Edge-case vendor coordination", "Multi-region SLA enforcement"] },
  { domain: "safety",     currentLevel: 2, targetLevel2027: 5, rationale: "AE detection at Level 4; causality assessment still requires pharmacovigilance physician per ICH E2E.",                lastTransitionAt: "2025-12-08", blockers: ["Pharmacovigilance SOP", "Regulatory reporting SLA", "Clinical sign-off"] },
];

export interface ProactiveIntervention {
  interventionId: string;
  detectedAt: string;
  domain: "regulatory" | "scientific" | "operational" | "safety";
  category: string;
  leadTimeDays: number;
  description: string;
  actionTaken: string;
  outcome: "prevented" | "mitigated" | "escalated" | "monitoring";
  confidenceScore: number;
}

export const proactiveInterventions: ProactiveIntervention[] = [
  { interventionId: "pi-2026-08-14-01", detectedAt: "2026-08-14T04:18:00Z", domain: "regulatory",  category: "Protocol amendment risk",        leadTimeDays: 14, description: "Detected likely IRB rejection of amendment 4 (ICF length +38%) based on 7 historical rejection patterns.", actionTaken: "Auto-drafted condensed ICF variant; flagged for sponsor review.", outcome: "mitigated",    confidenceScore: 0.91 },
  { interventionId: "pi-2026-08-13-02", detectedAt: "2026-08-13T09:42:00Z", domain: "operational", category: "Enrollment shortfall",            leadTimeDays: 42, description: "Predicted SITE-NBO-09 will miss Q4 enrollment target by 18% based on screen-fail rate trend.",            actionTaken: "Auto-opened 3 high-yield candidate sites; reallocated budget.",   outcome: "prevented",    confidenceScore: 0.86 },
  { interventionId: "pi-2026-08-12-03", detectedAt: "2026-08-12T16:21:00Z", domain: "safety",      category: "Cold-chain excursion",            leadTimeDays: 3,  description: "Predicted IMP shipment to SITE-BOG-14 will exceed 2-8°C window during Aug 16 transit based on weather forecast + lane history.", actionTaken: "Auto-rerouted via refrigerated truck; notified site pharmacist.", outcome: "prevented",    confidenceScore: 0.94 },
  { interventionId: "pi-2026-08-11-04", detectedAt: "2026-08-11T22:04:00Z", domain: "scientific",  category: "Subgroup efficacy signal",        leadTimeDays: 0,  description: "Identified emerging efficacy signal in EGFR+ subgroup (HR 0.42, p=0.008) before scheduled interim analysis.", actionTaken: "Escalated to DMC; auto-prepared subgroup analysis plan.",        outcome: "escalated",     confidenceScore: 0.88 },
  { interventionId: "pi-2026-08-10-05", detectedAt: "2026-08-10T11:33:00Z", domain: "operational", category: "Site staff attrition",            leadTimeDays: 28, description: "Predicted 2-CRC turnover at SITE-AUH-15 based on email sentiment + time-sheet patterns.",                   actionTaken: "Auto-triggered retraining queue; flagged HR for outreach.",      outcome: "monitoring",    confidenceScore: 0.72 },
  { interventionId: "pi-2026-08-09-06", detectedAt: "2026-08-09T07:55:00Z", domain: "regulatory",  category: "Consent form readability drift", leadTimeDays: 7,  description: "ICF readability score dropped 2 grade levels after localization to Portuguese; flagged compliance risk.",   actionTaken: "Auto-sent revision request to translation vendor.",              outcome: "mitigated",    confidenceScore: 0.83 },
];

export interface SelfImprovementCycle {
  cycleId: number;
  startedAt: string;
  completedAt: string;
  trigger: "scheduled" | "drift_triggered" | "incident_triggered" | "feedback_triggered";
  hypothesis: string;
  experiment: string;
  outcomeMetric: string;
  outcomeBefore: number;
  outcomeAfter: number;
  decision: "deployed" | "rejected" | "aborted";
  notes: string;
}

export const selfImprovementCycles: SelfImprovementCycle[] = [
  { cycleId: 47, startedAt: "2026-08-12T00:00:00Z", completedAt: "2026-08-12T18:42:00Z", trigger: "scheduled",        hypothesis: "Adding Portuguese-specific tokenizer to NER pipeline reduces field-extraction error on Brazilian sites by ≥15%.", experiment: "A/B test on 2,400 PT-BR forms · 7-day window",     outcomeMetric: "NER F1 (PT-BR)",     outcomeBefore: 0.842, outcomeAfter: 0.918, decision: "deployed",  notes: "Rolled out at 100% traffic; +7.6pp F1" },
  { cycleId: 46, startedAt: "2026-08-05T00:00:00Z", completedAt: "2026-08-05T22:11:00Z", trigger: "drift_triggered",   hypothesis: "Re-training calibration layer on July audit records reduces ECE below 3.5%.",                                       experiment: "Daily retrain · 1.24M records · Platt scaling",  outcomeMetric: "ECE",                 outcomeBefore: 0.041, outcomeAfter: 0.032, decision: "deployed",  notes: "ECE -22%; auto-approve rate +4.1pp" },
  { cycleId: 45, startedAt: "2026-07-29T00:00:00Z", completedAt: "2026-07-29T14:18:00Z", trigger: "incident_triggered", hypothesis: "AE causality classifier mislabel on hepatic events due to MedDRA v27.0 PT additions; fine-tune on v27 examples.",   experiment: "Fine-tune on 1,800 hepatic AE cases (MedDRA v27)", outcomeMetric: "Causality F1 (hepatic)", outcomeBefore: 0.781, outcomeAfter: 0.904, decision: "deployed",  notes: "Triggered by safety officer escalation; root cause MedDRA upgrade" },
  { cycleId: 44, startedAt: "2026-07-22T00:00:00Z", completedAt: "2026-07-22T09:22:00Z", trigger: "feedback_triggered", hypothesis: "Reviewer feedback: 'lab unit inconsistency' false positives reduce by enforcing SI unit normalization pre-inference.", experiment: "Add unit-normalization preprocessor + re-evaluate",  outcomeMetric: "Lab unit FP rate",    outcomeBefore: 0.064, outcomeAfter: 0.019, decision: "deployed",  notes: "FP rate -70%; 12 reviewers upvoted" },
  { cycleId: 43, startedAt: "2026-07-15T00:00:00Z", completedAt: "2026-07-15T16:08:00Z", trigger: "scheduled",        hypothesis: "Switching routing policy from greedy to Thompson sampling improves reviewer workload balance.",                  experiment: "Shadow-mode test · 4 weeks",                      outcomeMetric: "Reviewer load CV",    outcomeBefore: 0.34,  outcomeAfter: 0.18,  decision: "aborted",   notes: "Aborted — equilibrium improved but p95 latency regressed; revisit Q4" },
  { cycleId: 42, startedAt: "2026-07-08T00:00:00Z", completedAt: "2026-07-08T11:42:00Z", trigger: "scheduled",        hypothesis: "Quantum kernel SVM outperforms RBF on subject stratification by ≥2pp AUC.",                                       experiment: "5-fold CV · 1,200 subjects",                      outcomeMetric: "Stratification AUC", outcomeBefore: 0.911, outcomeAfter: 0.938, decision: "rejected",  notes: "AUC +2.7pp but inference cost 9× — not deployable at production scale" },
];

export interface AutonomousDecisionLog {
  decisionId: string;
  timestamp: string;
  domain: "regulatory" | "scientific" | "operational" | "safety";
  action: string;
  rationale: string;
  confidenceScore: number;
  verification: "symbolic_passed" | "constraint_passed" | "human_reviewed" | "audit_logged";
  overrideCount: number;
  autonomousLevel: 3 | 4 | 5;
}

export const autonomousDecisionLog: AutonomousDecisionLog[] = [
  { decisionId: "ad-2026-08-14-001", timestamp: "2026-08-14T07:42:00Z", domain: "operational", action: "Auto-approved 23 high-confidence data entries at SITE-NBO-09",              rationale: "All entries within ±2σ of historical pattern; calibration score ≥0.94", confidenceScore: 0.94, verification: "symbolic_passed",  overrideCount: 0, autonomousLevel: 4 },
  { decisionId: "ad-2026-08-14-002", timestamp: "2026-08-14T07:18:00Z", domain: "scientific",  action: "Flagged subject 04-014 for 7-AE cluster review",                          rationale: "Poisson probability of 7 AEs in 14d given baseline λ=0.4: p=0.0002",   confidenceScore: 0.99, verification: "constraint_passed", overrideCount: 0, autonomousLevel: 3 },
  { decisionId: "ad-2026-08-14-003", timestamp: "2026-08-14T06:55:00Z", domain: "regulatory", action: "Auto-routed 14 ICF translations to vendor with priority flag",             rationale: "8 of 14 had readability score < grade 8; flagged as compliance risk",  confidenceScore: 0.91, verification: "audit_logged",     overrideCount: 0, autonomousLevel: 4 },
  { decisionId: "ad-2026-08-14-004", timestamp: "2026-08-14T06:21:00Z", domain: "safety",      action: "Auto-notified site pharmacist of cold-chain re-route (Aug 16 shipment)",  rationale: "Forecasted temperature excursion 9.4°C vs 2-8°C target",                confidenceScore: 0.94, verification: "human_reviewed",   overrideCount: 0, autonomousLevel: 3 },
  { decisionId: "ad-2026-08-14-005", timestamp: "2026-08-14T05:48:00Z", domain: "operational", action: "Re-allocated $840k budget from SITE-DEL-12 to 3 high-yield candidates",   rationale: "Predicted DEL-12 enrollment shortfall 18% by Q4",                       confidenceScore: 0.86, verification: "human_reviewed",   overrideCount: 1, autonomousLevel: 4 },
  { decisionId: "ad-2026-08-14-006", timestamp: "2026-08-14T04:18:00Z", domain: "regulatory", action: "Auto-drafted condensed ICF variant for amendment 4",                       rationale: "Predicted IRB rejection (+38% length pattern match)",                  confidenceScore: 0.91, verification: "audit_logged",     overrideCount: 0, autonomousLevel: 4 },
];

// === FEATURE #18: NEURO-SYMBOLIC AI ARCHITECTURE ===
// Tech Readiness: Research | Impact: Transformive | Complexity: Very High

export interface NeuroSymbolicKpi {
  label: string;
  value: string;
  hint: string;
  trend?: "up" | "down" | "flat";
  deltaPct?: number;
}

export const neuroSymbolicKpis: NeuroSymbolicKpi[] = [
  { label: "Hybrid Accuracy",          value: "97.8%",   hint: "+4.2pp over pure-neural baseline",          trend: "up",   deltaPct: 4  },
  { label: "Verification Pass Rate",   value: "94.1%",   hint: "Symbolic checker accepts neural output",    trend: "up",   deltaPct: 7  },
  { label: "Rule Library Size",        value: "2,847",   hint: "SWRL + first-order logic rules",            trend: "up",   deltaPct: 12 },
  { label: "Knowledge Graph Triples",  value: "1.4M",    hint: "Entities, relations, attributes",           trend: "up",   deltaPct: 8  },
  { label: "Avg Re-Hypothesis Rate",   value: "8.4%",    hint: "Neural re-attempts after symbolic reject",  trend: "down", deltaPct: 18 },
  { label: "Explainability Score",     value: "9.2/10",  hint: "Auditor-rated rationale clarity",            trend: "up",   deltaPct: 6  },
];

export interface NeuralComponent {
  componentId: string;
  name: string;
  role: "hypothesis" | "anomaly" | "pattern" | "extraction" | "generation";
  modelFamily: string;
  parameters: string;
  inputModalities: string[];
  outputsForSymbolic: string[];
  accuracyMetric: string;
  accuracyValue: number;
  notes: string;
}

export const neuralComponents: NeuralComponent[] = [
  { componentId: "nc-hypothesis",  name: "Hypothesis Generator",    role: "hypothesis",  modelFamily: "Llama-3.1-70B + LoRA",      parameters: "70B + 240M LoRA", inputModalities: ["trial protocol", "subject history", "lab values"], outputsForSymbolic: ["proposed_stratification", "proposed_dose_adjustment", "proposed_ae_causality"], accuracyMetric: "Expert concur rate", accuracyValue: 0.91, notes: "Generates ranked hypotheses with calibrated probabilities; top-k=5 passed to symbolic verifier." },
  { componentId: "nc-anomaly",     name: "Anomaly Detector",        role: "anomaly",     modelFamily: "Isolation Forest + Autoencoder ensemble", parameters: "1.2M", inputModalities: ["multivariate time series", "lab trends", "vital signs"], outputsForSymbolic: ["anomaly_score", "anomaly_features", "expected_range"], accuracyMetric: "F1 (anomaly)", accuracyValue: 0.88, notes: "Ensemble of unsupervised detectors; flags statistical anomalies for symbolic rule check." },
  { componentId: "nc-pattern",     name: "Pattern Recognizer",     role: "pattern",     modelFamily: "Transformer encoder (12-layer)", parameters: "8.4M", inputModalities: ["free-text notes", "ICF", "regulatory correspondence"], outputsForSymbolic: ["extracted_entities", "relationships", "obligations"], accuracyMetric: "Entity F1", accuracyValue: 0.93, notes: "Extracts structured entities + relations from unstructured text; populates KG." },
  { componentId: "nc-extraction",  name: "Value Extractor",        role: "extraction",  modelFamily: "DeBERTa-v3 NER + LayoutLM",   parameters: "184M", inputModalities: ["CRF PDFs", "scanned lab reports"],          outputsForSymbolic: ["field_value", "unit", "reference_range", "abnormal_flag"], accuracyMetric: "Field F1", accuracyValue: 0.96, notes: "Multimodal extraction; LayoutLM handles scanned PDFs." },
  { componentId: "nc-generation",  name: "Response Generator",     role: "generation",  modelFamily: "GPT-4-class (fine-tuned)",    parameters: "~1.8T", inputModalities: ["regulatory query", "context docs", "draft history"], outputsForSymbolic: ["draft_response", "cited_clauses", "asserted_facts"], accuracyMetric: "Reviewer accept rate", accuracyValue: 0.87, notes: "Generates draft responses to regulatory queries; symbolic verifier checks clause citations." },
];

export interface SymbolicComponent {
  componentId: string;
  name: string;
  role: "constraint_check" | "regulatory_rule" | "logical_consistency" | "ontology_reasoning" | "causal_inference";
  formalism: "SWRL" | "OWL-DL" | "FOL" | "Prolog" | "Datalog";
  ruleCount: number;
  description: string;
  exampleRule: string;
  firedPerDay: number;
  passRate: number;
}

export const symbolicComponents: SymbolicComponent[] = [
  { componentId: "sc-constraint",   name: "Constraint Checker",       role: "constraint_check",     formalism: "Datalog",     ruleCount: 412,  description: "Enforces hard constraints (ranges, units, codes) on every neural output before action.", exampleRule: "field_value(V) ∧ field_unit(U) ∧ normal_range(V, U) -> valid_value(V)", firedPerDay: 47200, passRate: 0.961 },
  { componentId: "sc-regulatory",   name: "Regulatory Rule Engine",   role: "regulatory_rule",      formalism: "SWRL",        ruleCount: 847,  description: "Encodes 21 CFR 11, ICH E6(R3), EMA Annex 11 as executable rules.",                          exampleRule: "ElectronicRecord(?r) ∧ hasAuditTrail(?r, ?t) ∧ signedBy(?r, ?s) -> 21CFR11_Compliant(?r)", firedPerDay: 18400, passRate: 0.992 },
  { componentId: "sc-logical",      name: "Logical Consistency Verifier", role: "logical_consistency", formalism: "FOL",     ruleCount: 318,  description: "Checks neural hypotheses for contradictions with KG axioms (no subject can be both pregnant and male).", exampleRule: "Subject(?s) ∧ Sex(?s, Male) ∧ Pregnant(?s) -> Contradiction(?s)", firedPerDay: 9200,  passRate: 0.988 },
  { componentId: "sc-ontology",     name: "Ontology Reasoner",        role: "ontology_reasoning",   formalism: "OWL-DL",      ruleCount: 1247, description: "Reasons over clinical ontology (SNOMED-CT, MedDRA, LOINC) for class hierarchy inference.", exampleRule: "AdverseEvent(?ae) ∧ hasMedDRA(?ae, SOC_Hepatobiliary) -> SafetySignal(?ae, Hepatic)", firedPerDay: 31400, passRate: 1.000 },
  { componentId: "sc-causal",       name: "Causal Inference Engine",  role: "causal_inference",     formalism: "Prolog",      ruleCount: 23,   description: "Performs do-calculus on intervention queries; assesses AE causality vs confounders.",      exampleRule: "do(Drug) ∧ Y(?ae) ∧ noConfounder(?ae, ?c) -> CausalEffect(Drug, ?ae)", firedPerDay: 410,   passRate: 0.917 },
];

export interface KnowledgeGraphNode {
  nodeId: string;
  label: string;
  type: "Protocol" | "Subject" | "Endpoint" | "AdverseEvent" | "Visit" | "Form" | "Drug" | "Site" | "RegulatoryDoc";
  properties: { key: string; value: string }[];
}

export interface KnowledgeGraphEdge {
  source: string;
  target: string;
  relation: "has_endpoint" | "deviates_from" | "contraindicates_with" | "enrolled_at" | "reported_ae" | "described_in" | "regulates" | "stratified_by";
}

export const knowledgeGraphNodes: KnowledgeGraphNode[] = [
  { nodeId: "p-onco-204",   label: "TRIAL-ONCO-204 Protocol",   type: "Protocol",      properties: [{ key: "phase", value: "III" }, { key: "indication", value: "NSCLC" }, { key: "intervention", value: "Pembrolizumab + novel ADC" }] },
  { nodeId: "p-cv-118",     label: "TRIAL-CV-118 Protocol",     type: "Protocol",      properties: [{ key: "phase", value: "II" }, { key: "indication", value: "HFrEF" }, { key: "intervention", value: "SGLT2i + ARNI" }] },
  { nodeId: "s-04-014",     label: "Subject 04-014",            type: "Subject",       properties: [{ key: "age", value: "67" }, { key: "EGFR", value: "L858R" }, { key: "site", value: "SITE-NBO-09" }] },
  { nodeId: "s-04-022",     label: "Subject 04-022",            type: "Subject",       properties: [{ key: "age", value: "71" }, { key: "EGFR", value: "exon19del" }, { key: "site", value: "SITE-NBO-09" }] },
  { nodeId: "ep-os",        label: "Overall Survival (OS)",     type: "Endpoint",      properties: [{ key: "unit", value: "months" }, { key: "hypothesis", value: "HR<0.75" }] },
  { nodeId: "ep-pfs",       label: "Progression-Free Survival", type: "Endpoint",      properties: [{ key: "unit", value: "months" }, { key: "hypothesis", value: "HR<0.70" }] },
  { nodeId: "ae-hepatitis", label: "Drug-induced Hepatitis",    type: "AdverseEvent",  properties: [{ key: "MedDRA", value: "10003506" }, { key: "SOC", value: "Hepatobiliary" }] },
  { nodeId: "ae-neutropenia", label: "Grade 3 Neutropenia",     type: "AdverseEvent",  properties: [{ key: "MedDRA", value: "10028347" }, { key: "SOC", value: "Blood" }] },
  { nodeId: "v-cycle1-d1",  label: "Cycle 1 Day 1 Visit",       type: "Visit",         properties: [{ key: "window", value: "0..+3 days" }] },
  { nodeId: "f-icf-v4",     label: "ICF v4 (amendment 4)",      type: "Form",          properties: [{ key: "language", value: "PT-BR, EN-US" }, { key: "readability", value: "grade 9" }] },
  { nodeId: "d-pembro",     label: "Pembrolizumab",             type: "Drug",          properties: [{ key: "ATC", value: "L01FF02" }, { key: "class", value: "anti-PD-1" }] },
  { nodeId: "d-tucatinib",  label: "Tucatinib",                 type: "Drug",          properties: [{ key: "ATC", value: "L01FE08" }, { key: "class", value: "HER2 TKI" }] },
  { nodeId: "site-nbo-09",  label: "SITE-NBO-09 (Nairobi)",     type: "Site",          properties: [{ key: "country", value: "Kenya" }, { key: "PI", value: "Dr. Otieno" }] },
  { nodeId: "rd-21cfr11",   label: "21 CFR Part 11",            type: "RegulatoryDoc", properties: [{ key: "scope", value: "electronic records" }, { key: "jurisdiction", value: "FDA" }] },
];

export const knowledgeGraphEdges: KnowledgeGraphEdge[] = [
  { source: "p-onco-204",  target: "ep-os",          relation: "has_endpoint" },
  { source: "p-onco-204",  target: "ep-pfs",         relation: "has_endpoint" },
  { source: "s-04-014",    target: "site-nbo-09",    relation: "enrolled_at" },
  { source: "s-04-022",    target: "site-nbo-09",    relation: "enrolled_at" },
  { source: "s-04-014",    target: "p-onco-204",     relation: "enrolled_at" },
  { source: "s-04-014",    target: "ae-hepatitis",   relation: "reported_ae" },
  { source: "s-04-022",    target: "ae-neutropenia", relation: "reported_ae" },
  { source: "d-pembro",    target: "ae-hepatitis",   relation: "contraindicates_with" },
  { source: "d-tucatinib", target: "ae-hepatitis",   relation: "contraindicates_with" },
  { source: "p-onco-204",  target: "d-pembro",       relation: "described_in" },
  { source: "f-icf-v4",    target: "rd-21cfr11",     relation: "regulates" },
  { source: "s-04-014",    target: "d-pembro",       relation: "stratified_by" },
  { source: "v-cycle1-d1", target: "f-icf-v4",       relation: "described_in" },
];

export interface HypothesisVerificationLog {
  logId: string;
  timestamp: string;
  hypothesis: string;
  neuralConfidence: number;
  symbolicVerdict: "verified" | "rejected" | "needs_revision" | "partial";
  symbolicReason: string;
  finalAction: string;
  reHypothesisNeeded: boolean;
  confidenceDelta: number;
}

export const hypothesisVerificationLog: HypothesisVerificationLog[] = [
  { logId: "hv-2026-08-14-01", timestamp: "2026-08-14T08:14:00Z", hypothesis: "Subject 04-014 AE cluster is causally related to Pembrolizumab",            neuralConfidence: 0.87, symbolicVerdict: "verified",       symbolicReason: "do-calculus: P(Y|do(Drug))=0.71 vs P(Y|Drug)=0.62; no unblocked confounder in KG.",                finalAction: "Auto-escalated to DMC; pharmacovigilance case opened.",                 reHypothesisNeeded: false, confidenceDelta: 0.07 },
  { logId: "hv-2026-08-14-02", timestamp: "2026-08-14T07:51:00Z", hypothesis: "Site selection optimizer proposed SITE-X (newly added, no track record)",   neuralConfidence: 0.84, symbolicVerdict: "rejected",        symbolicReason: "Violates rule R-412: site must have ≥2 years active enrollment history.",                          finalAction: "Neural re-hypothesized with constraint; selected SITE-NBO-09 instead.", reHypothesisNeeded: true,  confidenceDelta: -0.12 },
  { logId: "hv-2026-08-14-03", timestamp: "2026-08-14T07:33:00Z", hypothesis: "Auto-approve hemoglobin value 7.2 g/dL for Subject 04-022",                 neuralConfidence: 0.91, symbolicVerdict: "rejected",        symbolicReason: "Constraint fail: value below protocol-defined alert threshold (8.0 g/dL); AE query required.",    finalAction: "Auto-generated AE query; flagged for site CRA review.",                 reHypothesisNeeded: false, confidenceDelta: -0.91 },
  { logId: "hv-2026-08-14-04", timestamp: "2026-08-14T06:42:00Z", hypothesis: "Protocol amendment 4 ICF will be rejected by IRB",                          neuralConfidence: 0.89, symbolicVerdict: "verified",       symbolicReason: "Pattern match against 7 historical rejections (length +38%, grade 11 readability).",              finalAction: "Auto-drafted condensed variant; routed to sponsor.",                    reHypothesisNeeded: false, confidenceDelta: 0.04 },
  { logId: "hv-2026-08-14-05", timestamp: "2026-08-14T05:18:00Z", hypothesis: "Subject 04-014 should be stratified to EGFR+ cardiac subgroup",              neuralConfidence: 0.78, symbolicVerdict: "needs_revision", symbolicReason: "OWL reasoner: subject has no cardiac history; stratification rule requires ≥1 cardiac ICD-10 code.", finalAction: "Neural re-hypothesized; recommended standard EGFR+ arm.",              reHypothesisNeeded: true,  confidenceDelta: -0.21 },
  { logId: "hv-2026-08-14-06", timestamp: "2026-08-14T04:22:00Z", hypothesis: "Auto-route ICF Portuguese translation to vendor with 24h SLA",              neuralConfidence: 0.85, symbolicVerdict: "partial",         symbolicReason: "Vendor approved; SLA constraint relaxed (vendor std 48h). Requires human sign-off on SLA deviation.", finalAction: "Routed to vendor; SLA variance flagged for ops manager.",               reHypothesisNeeded: false, confidenceDelta: -0.05 },
];

export interface HybridComparison {
  dimension: string;
  pureNeural: string;
  pureSymbolic: string;
  hybrid: string;
}

export const hybridComparison: HybridComparison[] = [
  { dimension: "Decision accuracy",       pureNeural: "93.6%",   pureSymbolic: "89.1%",  hybrid: "97.8%"    },
  { dimension: "Explainability",          pureNeural: "Low (black-box)", pureSymbolic: "High (rule trace)", hybrid: "High (rule trace + neural rationale)" },
  { dimension: "Sample efficiency",       pureNeural: "Low (needs M of examples)", pureSymbolic: "High (zero-shot from rules)", hybrid: "Medium (rules + few-shot)" },
  { dimension: "Novelty handling",        pureNeural: "Strong",   pureSymbolic: "Weak (fails on unseen)", hybrid: "Strong"  },
  { dimension: "Regulatory compliance",   pureNeural: "Partial (post-hoc audit)", pureSymbolic: "Native (rules encoded)", hybrid: "Native + verifiable" },
  { dimension: "Reasoning depth",         pureNeural: "Pattern-level", pureSymbolic: "Multi-hop logical", hybrid: "Pattern + multi-hop" },
  { dimension: "Failure mode",            pureNeural: "Silent (over-confident)", pureSymbolic: "Brittle (rule gaps)", hybrid: "Graceful (symbolic flags neural misses)" },
  { dimension: "Inference latency (p95)", pureNeural: "82ms",     pureSymbolic: "11ms",   hybrid: "94ms"     },
  { dimension: "Maintenance cost",        pureNeural: "High (re-train)", pureSymbolic: "Medium (rule updates)", hybrid: "Medium (rule updates + curated re-train)" },
];

