// @ts-nocheck
"use client";
import { EnvTestReportTemplate } from "@/components/reports/EnvTestReportTemplate";
import { ChamberCycleChart } from "@/components/reports/charts/ChamberCycleChart";
import { PrePostComparisonChart } from "@/components/reports/charts/PrePostComparisonChart";
import { ReportUncertaintyBudgetTable } from "@/components/reports/uncertainty/ReportUncertaintyBudgetTable";
import { UncertaintyPieChart } from "@/components/reports/uncertainty/UncertaintyPieChart";
import { TEST_UNCERTAINTY_CONFIGS } from "@/components/reports/uncertainty/testUncertaintyConfigs";

export default function ThermalCyclingPage() {
  return <EnvTestReportTemplate
    reportNo="SLX-RPT-TC-2026-001"
    title="Thermal Cycling Test"
    subtitle="IEC 61215-2:2021 · MQT 11 (TC200) · 200 Cycles · −40°C to +85°C"
    accent="#b45309"
    standard="IEC 61215-2 MQT 11"
    testConditions={[
      ["Temp Range", "−40°C to +85°C"],
      ["No. of Cycles", "200 (TC200)"],
      ["Ramp Rate", "≤ 100°C/hr"],
      ["Dwell Time", "10 min at extremes"],
      ["Transfer Time", "< 30 s between extremes"],
      ["Humidity (High T)", "< 75% RH during heating"],
    ]}
    results={[
      { sample: "SLX-M301", pmaxBefore: "432.1", pmaxAfter: "430.4", delta: "−0.39%", riso: "6180 MΩ·m²", visual: "No defects", elChange: "None", pass: true },
      { sample: "SLX-M302", pmaxBefore: "431.8", pmaxAfter: "430.2", delta: "−0.37%", riso: "6210 MΩ·m²", visual: "No defects", elChange: "None", pass: true },
      { sample: "SLX-M303", pmaxBefore: "431.9", pmaxAfter: "430.1", delta: "−0.42%", riso: "6150 MΩ·m²", visual: "No defects", elChange: "None", pass: true },
    ]}
    criterion="ΔPmax < 5%, RISO·A ≥ 40 MΩ·m², no major visual defects"
    purpose="Determines the ability of the module to withstand thermal mismatch, fatigue and other stresses caused by repeated changes in temperature."
    equipment={["Thermal Cycling Chamber: Weiss WT-600/70 (Cal. SLX-EQ-020)", "Solar Simulator: Spire 4600SLP AAA+ (Cal. SLX-EQ-001)", "EL Camera: Xenics Bobcat-1.7 (Cal. SLX-EQ-022)"]}
    testSpecificCharts={
      <>
        <div style={{ marginBottom: "16px" }}>
          <ChamberCycleChart cycleCount={200} tempMin={-40} tempMax={85} />
        </div>
        <div style={{ marginBottom: "16px" }}>
          <PrePostComparisonChart
            data={[
              { sampleId: "SLX-M301", preValue: 432.1, postValue: 430.4 },
              { sampleId: "SLX-M302", preValue: 431.8, postValue: 430.2 },
              { sampleId: "SLX-M303", preValue: 431.9, postValue: 430.1 },
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
  />;
}
