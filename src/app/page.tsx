"use client";

import { useState, useEffect } from "react";
import { SectionId } from "@/lib/trialgptbot";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navigation } from "@/components/layout/Navigation";
import { AppRibbon } from "@/components/layout/AppRibbon";
import { DashboardSection } from "@/components/sections/DashboardSection";
import { TrialsSection } from "@/components/sections/TrialsSection";
import { ReviewSection } from "@/components/sections/ReviewSection";
import { EdcSection } from "@/components/sections/EdcSection";
import { ComplianceSection } from "@/components/sections/ComplianceSection";
import { AuditSection } from "@/components/sections/PlaceholderSection";
import { AnalyticsSection } from "@/components/sections/AnalyticsSection";
import { ApiDocsSection } from "@/components/sections/ApiDocsSection";
import { SettingsSection } from "@/components/sections/SettingsSection";
import { PrivacyMLSection } from "@/components/sections/PrivacyMLSection";
import { DigitalTwinSection } from "@/components/sections/DigitalTwinSection";
import { EdgeSection } from "@/components/sections/EdgeSection";
import { CalibrationSection } from "@/components/sections/CalibrationSection";
import { FederatedSection } from "@/components/sections/FederatedSection";
import { NlpTransformersSection } from "@/components/sections/NlpTransformersSection";
import { MlopsSection } from "@/components/sections/MlopsSection";
import { AdvancedAnalyticsSection } from "@/components/sections/AdvancedAnalyticsSection";
import { QuantumSection } from "@/components/sections/QuantumSection";
import { AutonomousSection } from "@/components/sections/AutonomousSection";
import { NeuroSymbolicSection } from "@/components/sections/NeuroSymbolicSection";

export default function Home() {
  const [section, setSection] = useState<SectionId>("dashboard");

  // Scroll to top on section change
  useEffect(() => {
    const main = document.getElementById("main-scroll");
    if (main) main.scrollTo({ top: 0, behavior: "smooth" });
  }, [section]);

  const handleNavigate = (id: SectionId) => {
    setSection(id);
  };

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      {/* Application ribbon — fixed at the top of the viewport */}
      <AppRibbon
        active={section}
        onNavigate={handleNavigate}
        pendingCount={47}
        trialsCount={12}
      />

      {/* Push the rest of the layout below the ribbon */}
      <div className="flex flex-1 min-h-0">
        <Sidebar active={section} onNavigate={handleNavigate} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Navigation active={section} onNavigate={handleNavigate} />

          <main
            id="main-scroll"
            className="flex-1 overflow-y-auto p-6 grid-pattern"
          >
            {section === "dashboard" && <DashboardSection onNavigate={handleNavigate} />}
            {section === "trials" && <TrialsSection onNavigate={handleNavigate} />}
            {section === "review" && <ReviewSection onNavigate={handleNavigate} />}
            {section === "edc" && <EdcSection onNavigate={handleNavigate} />}
            {section === "compliance" && <ComplianceSection onNavigate={handleNavigate} />}
            {section === "audit" && <AuditSection onNavigate={handleNavigate} />}
            {section === "analytics" && <AnalyticsSection onNavigate={handleNavigate} />}
            {section === "settings" && <SettingsSection onNavigate={handleNavigate} />}
            {section === "api-docs" && <ApiDocsSection onNavigate={handleNavigate} />}
            {section === "privacy-ml" && <PrivacyMLSection onNavigate={handleNavigate} />}
            {section === "digital-twin" && <DigitalTwinSection onNavigate={handleNavigate} />}
            {section === "edge" && <EdgeSection onNavigate={handleNavigate} />}
            {section === "calibration" && <CalibrationSection onNavigate={handleNavigate} />}
            {section === "federated" && <FederatedSection onNavigate={handleNavigate} />}
            {section === "nlp-transformers" && <NlpTransformersSection onNavigate={handleNavigate} />}
            {section === "mlops" && <MlopsSection onNavigate={handleNavigate} />}
            {section === "advanced-analytics" && <AdvancedAnalyticsSection onNavigate={handleNavigate} />}
            {section === "quantum" && <QuantumSection onNavigate={handleNavigate} />}
            {section === "autonomous" && <AutonomousSection onNavigate={handleNavigate} />}
            {section === "neuro-symbolic" && <NeuroSymbolicSection onNavigate={handleNavigate} />}
          </main>
        </div>
      </div>
    </div>
  );
}
