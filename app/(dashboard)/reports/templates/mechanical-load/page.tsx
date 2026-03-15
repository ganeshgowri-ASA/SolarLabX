// @ts-nocheck
"use client";
import { EnvTestReportTemplate } from "@/components/reports/EnvTestReportTemplate";
import { DMLTCycleChart } from "@/components/reports/charts/DMLTCycleChart";
import { PrePostComparisonChart } from "@/components/reports/charts/PrePostComparisonChart";
import { ReportUncertaintyBudgetTable } from "@/components/reports/uncertainty/ReportUncertaintyBudgetTable";
import { TEST_UNCERTAINTY_CONFIGS } from "@/components/reports/uncertainty/testUncertaintyConfigs";

export default function MechanicalLoadPage() {
  return (
    <EnvTestReportTemplate
      reportNo="SLX-RPT-ML-2026-001"
      title="Dynamic Mechanical Load Test"
      subtitle="IEC 61215-2:2021 · MQT 16 · ±5400 Pa · 3 + 3 Load Cycles · Wind & Snow Simulation"
      accent="#7c3aed"
      standard="IEC 61215-2 MQT 16"
      testConditions={[
        ["Positive Load", "+5400 Pa (simulates snow load)"],
        ["Negative Load", "−2400 Pa (simulates wind suction)"],
        ["No. of Cycles (Positive)", "3 cycles"],
        ["No. of Cycles (Negative)", "3 cycles"],
        ["Load Application", "Uniform distributed via airbag"],
        ["Hold Time per Cycle", "1 hour at full load"],
        ["Standard", "IEC 61215-2:2021 §4.14"],
      ]}
      results={[
        { sample: "SLX-M601", pmaxBefore: "432.1", pmaxAfter: "431.6", delta: "−0.12%", riso: "6180 MΩ·m²", visual: "No cracking", elChange: "None", pass: true },
        { sample: "SLX-M602", pmaxBefore: "431.8", pmaxAfter: "431.3", delta: "−0.12%", riso: "6200 MΩ·m²", visual: "No cracking", elChange: "None", pass: true },
        { sample: "SLX-M603", pmaxBefore: "432.0", pmaxAfter: "431.4", delta: "−0.14%", riso: "6160 MΩ·m²", visual: "No cracking", elChange: "None", pass: true },
      ]}
      criterion="No visible major cracking, delamination, or broken interconnects. ΔPmax < 5%. RISO·A ≥ 40 MΩ·m²"
      purpose="Evaluates the ability of the module structure and mounting system to withstand mechanical loads that may occur during wind, snow, or hail events. The dynamic cyclic nature of the test is more representative of actual field loads than static load tests. The test identifies potential weak points in frame, glass, cells, and interconnects."
      equipment={[
        "Mechanical Load Tester: Mectronic MLT-1000 with airbag load applicator (Cal. SLX-EQ-030)",
        "Solar Simulator: Spire 4600SLP AAA+ (Cal. SLX-EQ-001)",
        "EL Camera: Xenics Bobcat-1.7 (Cal. SLX-EQ-022)",
        "Insulation Tester: Fluke 1555C (Cal. SLX-EQ-018)",
        "Pressure Gauge: Kistler 4264A (Cal. SLX-EQ-031)",
      ]}
      overallDelta="−0.14%"
      moduleSpecs={[
        ["Manufacturer", "Axitec Energy GmbH"], ["Model", "AC-430MH/144V"], ["Technology", "Mono-PERC"],
        ["Rated Pmax", "430 Wp"], ["Samples", "3 modules"], ["Frame", "Anodized Al – 40mm depth"],
        ["Glass", "3.2mm ARC tempered (front)"], ["Backsheet", "TPT (white)"],
      ]}
      testSpecificCharts={
        <>
          <div style={{ marginBottom: "16px" }}>
            <DMLTCycleChart />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <PrePostComparisonChart
              data={[
                { sampleId: "SLX-M601", preValue: 432.1, postValue: 431.6 },
                { sampleId: "SLX-M602", preValue: 431.8, postValue: 431.3 },
                { sampleId: "SLX-M603", preValue: 432.0, postValue: 431.4 },
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
      extraSections={
        <div style={{ marginBottom: "12px" }}>
          <div style={{ fontWeight: "700", color: "#7c3aed", borderBottom: "2px solid #7c3aed", paddingBottom: "4px", marginBottom: "8px", fontSize: "10pt" }}>
            DEFLECTION MEASUREMENTS
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5pt" }}>
            <thead>
              <tr style={{ background: "#7c3aed", color: "white" }}>
                {["Sample", "Load (Pa)", "Max Deflection (mm)", "Criterion", "Status"].map(h => <th key={h} style={{ padding: "5px 8px" }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {[["SLX-M601", "+5400", "18.4", "< L/100 = 21.1 mm", "OK"], ["SLX-M602", "+5400", "18.7", "< L/100 = 21.1 mm", "OK"], ["SLX-M603", "+5400", "18.2", "< L/100 = 21.1 mm", "OK"],
                ["SLX-M601", "−2400", "8.1", "< L/100 = 21.1 mm", "OK"], ["SLX-M602", "−2400", "8.3", "< L/100 = 21.1 mm", "OK"], ["SLX-M603", "−2400", "8.0", "< L/100 = 21.1 mm", "OK"]].map(([s, l, d, c, st], i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#f5f3ff" : "white", borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "4px 8px" }}>{s}</td>
                  <td style={{ padding: "4px 8px", textAlign: "center" }}>{l}</td>
                  <td style={{ padding: "4px 8px", textAlign: "center", fontWeight: "600" }}>{d}</td>
                  <td style={{ padding: "4px 8px" }}>{c}</td>
                  <td style={{ padding: "4px 8px", textAlign: "center", color: "#059669", fontWeight: "600" }}>{st}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }
    />
  );
}
