// @ts-nocheck
"use client";
import { EnvTestReportTemplate } from "@/components/reports/EnvTestReportTemplate";
import { StabilizationDosageChart } from "@/components/reports/charts/StabilizationDosageChart";
import { PrePostComparisonChart } from "@/components/reports/charts/PrePostComparisonChart";
import { ReportUncertaintyBudgetTable } from "@/components/reports/uncertainty/ReportUncertaintyBudgetTable";
import { TEST_UNCERTAINTY_CONFIGS } from "@/components/reports/uncertainty/testUncertaintyConfigs";

export default function IEC61345UVThinFilmPage() {
  return (
    <EnvTestReportTemplate
      reportNo="SLX-RPT-UVTF-2026-001"
      title="UV Exposure Test (Thin-Film)"
      subtitle="IEC 61345 · 50 kWh/m² · CdTe Module · Extended UV Stability"
      accent="#7c3aed"
      standard="IEC 61345"
      moduleModel="FS-6450A"
      customer="First Solar Inc."
      moduleSpecs={[
        ["Manufacturer", "First Solar Inc."],
        ["Model", "FS-6450A"],
        ["Technology", "CdTe Thin-Film"],
        ["Rated Pmax", "450 Wp"],
        ["No. of Samples", "3 modules"],
        ["Module Dimensions", "2009 × 1232 × 40 mm"],
      ]}
      testConditions={[
        ["Standard", "IEC 61345:1998"],
        ["Total UV Dose", "50 kWh/m²"],
        ["UV-A (320–400 nm)", "45 kWh/m²"],
        ["UV-B (280–320 nm)", "5 kWh/m²"],
        ["Module Temperature", "60°C ± 5°C"],
        ["Irradiance Uniformity", "±15% over test area"],
        ["UV Source", "Metal halide + UV fluorescent lamps"],
        ["Exposure Duration", "~830 hours continuous"],
      ]}
      results={[
        { sample: "SLX-TF301", pmaxBefore: "451.2", pmaxAfter: "445.6", delta: "−1.24%", riso: "8920 MΩ·m²", visual: "No defects", elChange: "None", pass: true },
        { sample: "SLX-TF302", pmaxBefore: "450.8", pmaxAfter: "444.9", delta: "−1.31%", riso: "8850 MΩ·m²", visual: "No defects", elChange: "None", pass: true },
        { sample: "SLX-TF303", pmaxBefore: "451.0", pmaxAfter: "445.8", delta: "−1.15%", riso: "8970 MΩ·m²", visual: "No defects", elChange: "None", pass: true },
      ]}
      criterion="Pmax degradation ≤ 5%, No delamination, No discoloration"
      purpose="Determines the resistance of thin-film CdTe photovoltaic modules to UV radiation exposure in accordance with IEC 61345. Thin-film modules, particularly CdTe technology, are tested at an extended dose of 50 kWh/m² to assess the stability of the semiconductor absorber layer, transparent conducting oxide (TCO), encapsulant, and edge seal under prolonged UV irradiation. This test is essential for validating long-term reliability in high-UV climate zones and complements the IEC 61215 UV preconditioning test with a more stringent UV-B component."
      equipment={[
        "UV Test Chamber: Atlas UVTest (NABL Cal. SLX-EQ-051, Valid: 2026-12-31)",
        "UV-A Radiometer: EIT PowerPuck II (Cal. SLX-EQ-052, Valid: 2026-10-15)",
        "UV-B Radiometer: EIT PowerPuck II (Cal. SLX-EQ-053, Valid: 2026-10-15)",
        "Solar Simulator: Spire 4600SLP AAA+ (Cal. SLX-EQ-001, Valid: 2026-11-30)",
        "EL Camera: Xenics Bobcat-1.7 (Cal. SLX-EQ-022, Valid: 2027-01-31)",
        "Insulation Tester: Fluke 1555C (Cal. SLX-EQ-018, Valid: 2026-10-31)",
        "Module Temp. Sensors: T-type TC ×6 (Cal. SLX-EQ-054, Valid: 2026-09-30)",
      ]}
      overallDelta="−1.31%"
      testSpecificCharts={
        <>
          <div style={{ marginBottom: "16px" }}>
            <StabilizationDosageChart targetDose={50} />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <PrePostComparisonChart
              data={[
                { sampleId: "SLX-TF301", preValue: 451.2, postValue: 445.6 },
                { sampleId: "SLX-TF302", preValue: 450.8, postValue: 444.9 },
                { sampleId: "SLX-TF303", preValue: 451.0, postValue: 445.8 },
              ]}
              parameter="Pmax"
              unit="W"
              threshold={5}
              thresholdType="max_degradation_pct"
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
        <div style={{ marginBottom: "12px", padding: "10px 14px", background: "#f5f3ff", border: "1px solid #c4b5fd", borderRadius: "4px", fontSize: "8.5pt" }}>
          <strong>CdTe-Specific Observation:</strong> All three CdTe thin-film samples demonstrated excellent UV stability with maximum power degradation of 1.31%. No delamination, discoloration, or edge seal deterioration was observed. The CdTe absorber layer and TCO front contact showed no measurable spectral response shift. Light soaking stabilisation was performed per IEC 61215-1 Annex A prior to initial measurement to account for metastability effects inherent to CdTe technology.
        </div>
      }
    />
  );
}
