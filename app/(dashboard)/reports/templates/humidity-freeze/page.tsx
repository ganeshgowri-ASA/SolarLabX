// @ts-nocheck
"use client";
import { EnvTestReportTemplate } from "@/components/reports/EnvTestReportTemplate";
import { HumidityFreezeChart } from "@/components/reports/charts/HumidityFreezeChart";
import { PrePostComparisonChart } from "@/components/reports/charts/PrePostComparisonChart";
import { ReportUncertaintyBudgetTable } from "@/components/reports/uncertainty/ReportUncertaintyBudgetTable";
import { TEST_UNCERTAINTY_CONFIGS } from "@/components/reports/uncertainty/testUncertaintyConfigs";

export default function HumidityFreezePage() {
  return (
    <EnvTestReportTemplate
      reportNo="SLX-RPT-HF-2026-001"
      title="Humidity Freeze Test"
      subtitle="IEC 61215-2:2021 · MQT 12 (HF10) · 10 Cycles · −40°C ↔ +85°C/85%RH"
      accent="#1d4ed8"
      standard="IEC 61215-2 MQT 12"
      testConditions={[
        ["Temperature Range", "−40°C to +85°C"],
        ["Relative Humidity (High T)", "85% RH"],
        ["No. of Cycles", "10 (HF10)"],
        ["High Temp Dwell", "20 hours at 85°C/85%RH"],
        ["Transfer Time", "≤ 30 min"],
        ["Low Temp Dwell", "0.5 hr at −40°C"],
        ["Standard", "IEC 61215-2:2021 §4.11"],
      ]}
      results={[
        { sample: "SLX-M401", pmaxBefore: "432.1", pmaxAfter: "431.0", delta: "−0.25%", riso: "6100 MΩ·m²", visual: "No defects", elChange: "None", pass: true },
        { sample: "SLX-M402", pmaxBefore: "431.8", pmaxAfter: "430.8", delta: "−0.23%", riso: "6080 MΩ·m²", visual: "No defects", elChange: "None", pass: true },
        { sample: "SLX-M403", pmaxBefore: "432.0", pmaxAfter: "430.9", delta: "−0.26%", riso: "6120 MΩ·m²", visual: "No defects", elChange: "None", pass: true },
      ]}
      criterion="ΔPmax < 5%, RISO·A ≥ 40 MΩ·m², no major visual defects after 10 humidity-freeze cycles"
      purpose="Determines the ability of the module to withstand the effects of high temperature/humidity followed by sub-zero temperature, as may be experienced in climates with significant temperature swings and high humidity. The test identifies potential degradation due to moisture ingress or differential thermal expansion of encapsulant, glass, and cell materials."
      equipment={[
        "Humidity Freeze Chamber: Weiss BF-720 (NABL Cal. SLX-EQ-025, Valid: 2026-09-30)",
        "Solar Simulator: Spire 4600SLP AAA+ (Cal. SLX-EQ-001, Valid: 2026-11-30)",
        "EL Camera: Xenics Bobcat-1.7 InGaAs (Cal. SLX-EQ-022, Valid: 2027-01-31)",
        "Insulation Tester: Fluke 1555C (Cal. SLX-EQ-018, Valid: 2026-10-31)",
      ]}
      overallDelta="−0.26%"
      testSpecificCharts={
        <>
          <div style={{ marginBottom: "16px" }}>
            <HumidityFreezeChart />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <PrePostComparisonChart
              data={[
                { sampleId: "SLX-M401", preValue: 432.1, postValue: 431.0 },
                { sampleId: "SLX-M402", preValue: 431.8, postValue: 430.8 },
                { sampleId: "SLX-M403", preValue: 432.0, postValue: 430.9 },
              ]}
              parameter="Pmax" unit="W" threshold={5} thresholdType="max_degradation_pct"
            />
          </div>
        </>
      }
      uncertaintySection={
        <ReportUncertaintyBudgetTable
          rows={TEST_UNCERTAINTY_CONFIGS.tc_dh_hf.rows}
          measurand={TEST_UNCERTAINTY_CONFIGS.tc_dh_hf.measurand}
          measuredValue={432.0}
          unit={TEST_UNCERTAINTY_CONFIGS.tc_dh_hf.unit}
          combinedUncertainty={TEST_UNCERTAINTY_CONFIGS.tc_dh_hf.combinedUncertainty}
          coverageFactor={TEST_UNCERTAINTY_CONFIGS.tc_dh_hf.coverageFactor}
          expandedUncertainty={TEST_UNCERTAINTY_CONFIGS.tc_dh_hf.expandedUncertainty}
          compact
        />
      }
    />
  );
}
