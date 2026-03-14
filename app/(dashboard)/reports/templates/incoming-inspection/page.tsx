// @ts-nocheck
"use client";
import { EnvTestReportTemplate } from "@/components/reports/EnvTestReportTemplate";

export default function IncomingInspectionPage() {
  return (
    <EnvTestReportTemplate
      reportNo="SLX-RPT-INS-2026-001"
      title="Incoming Module Inspection Report"
      subtitle="Receiving Inspection · Visual Assessment · EL Baseline · Photo Documentation"
      accent="#059669"
      standard="Internal SOP (SOP-RCV-001/002/003)"
      moduleSpecs={[
        ["Manufacturer", "Axitec Energy GmbH"],
        ["Model", "AC-430MH/144V"],
        ["Technology", "Mono-PERC"],
        ["Quantity Received", "8 modules"],
        ["Purchase Order", "PO-SLX-2026-0147"],
        ["Delivery Date", "2026-03-12"],
      ]}
      testConditions={[
        ["Inspection SOP", "SOP-RCV-001 Rev. 4 (Visual), SOP-RCV-002 Rev. 3 (EL)"],
        ["Inspector", "Mr. R. Verma (Lab Technician, ID: SLX-T005)"],
        ["Ambient Temperature", "24.2°C"],
        ["Ambient Humidity", "42% RH"],
        ["Lighting", "> 1000 lux (LED panel, overhead)"],
        ["EL Forward Bias Current", "Isc × 1.0 (12.83 A)"],
      ]}
      results={[
        { sample: "Packaging Integrity", pmaxBefore: "Sealed", pmaxAfter: "Intact", delta: "OK", riso: "N/A", visual: "No defects", elChange: "N/A", pass: true },
        { sample: "Visual Inspection (IEC 61215-1 §7)", pmaxBefore: "Expected", pmaxAfter: "Compliant", delta: "OK", riso: "N/A", visual: "No defects", elChange: "N/A", pass: true },
        { sample: "Label Verification", pmaxBefore: "PO Specs", pmaxAfter: "Matched", delta: "OK", riso: "N/A", visual: "No defects", elChange: "N/A", pass: true },
        { sample: "EL Baseline (All 8 modules)", pmaxBefore: "Baseline", pmaxAfter: "Captured", delta: "OK", riso: "N/A", visual: "No defects", elChange: "None", pass: true },
      ]}
      criterion="No shipping damage, Labels match order, Quantity correct, EL baseline documented"
      purpose="This report documents the receiving inspection of PV modules delivered to SolarLabX for testing per customer test order. The incoming inspection verifies packaging integrity, physical condition, label accuracy, and establishes an electroluminescence (EL) baseline for all received modules prior to any testing. This procedure ensures that any pre-existing defects are documented before test commencement, maintaining the integrity of the test program and protecting both the laboratory and the client."
      equipment={[
        "EL Camera: Xenics Bobcat-1.7-320 (Cal. SLX-EQ-022, Valid: 2027-01-31)",
        "DC Power Supply: Keysight E36234A (Cal. SLX-EQ-033, Valid: 2026-09-30)",
        "Lux Meter: Konica Minolta T-10A (Cal. SLX-EQ-041, Valid: 2026-12-15)",
        "Digital Camera: Canon EOS R6 Mark II (24 MP, macro lens)",
        "Digital Caliper: Mitutoyo 500-196-30 (Cal. SLX-EQ-044, Valid: 2026-11-30)",
        "Barcode Scanner: Zebra DS3678-SR (inventory system linked)",
      ]}
      overallDelta="ACCEPTED"
      extraSections={
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "11pt", fontWeight: "800", color: "#059669", borderBottom: "2.5px solid #059669", paddingBottom: "5px", marginBottom: "10px", marginTop: "14px" }}>
            RECEIVING INSPECTION CHECKLIST
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8pt", marginBottom: "14px" }}>
            <thead>
              <tr style={{ background: "#059669", color: "white" }}>
                <th style={{ padding: "5px 8px", textAlign: "center", fontSize: "7.5pt", width: "30px" }}>#</th>
                <th style={{ padding: "5px 8px", textAlign: "left", fontSize: "7.5pt" }}>Inspection Item</th>
                <th style={{ padding: "5px 8px", textAlign: "center", fontSize: "7.5pt" }}>Status</th>
                <th style={{ padding: "5px 8px", textAlign: "left", fontSize: "7.5pt" }}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["1", "Outer packaging undamaged (no crush, puncture, water)", "✓ PASS", "Cardboard box intact, no moisture marks"],
                ["2", "Inner protective material intact (foam corners, PE wrap)", "✓ PASS", "All 8 modules individually wrapped"],
                ["3", "Module count matches packing list", "✓ PASS", "8/8 modules received per PO-SLX-2026-0147"],
                ["4", "Serial numbers match delivery note", "✓ PASS", "All S/N verified against delivery note DN-2026-0891"],
                ["5", "Nameplate data matches PO specifications", "✓ PASS", "Model, rating, certifications verified"],
                ["6", "No visible glass cracks or chips", "✓ PASS", "All modules inspected under 1000+ lux"],
                ["7", "No cell cracks visible (naked eye)", "✓ PASS", "No visible cell damage on any module"],
                ["8", "Frame integrity (no bends, scratches > 2mm)", "✓ PASS", "Minor handling marks on SLX-M003 (< 1mm, acceptable)"],
                ["9", "Junction box sealed, connectors intact", "✓ PASS", "All JBs sealed, MC4 connectors verified"],
                ["10", "EL baseline images captured for all modules", "✓ PASS", "8/8 EL images stored in LIMS (Job: J-2026-0147)"],
              ].map(([num, item, status, remarks], i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#ecfdf5" : "white", borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "4px 8px", textAlign: "center", fontWeight: "600" }}>{num}</td>
                  <td style={{ padding: "4px 8px" }}>{item}</td>
                  <td style={{ padding: "4px 8px", textAlign: "center", color: "#059669", fontWeight: "600" }}>{status}</td>
                  <td style={{ padding: "4px 8px", fontSize: "7.5pt", color: "#555" }}>{remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ fontSize: "11pt", fontWeight: "800", color: "#059669", borderBottom: "2.5px solid #059669", paddingBottom: "5px", marginBottom: "10px", marginTop: "14px" }}>
            PHOTO DOCUMENTATION GRID
          </div>
          <div className="grid grid-cols-4 gap-3" style={{ marginBottom: "12px" }}>
            {[
              "Packaging – Outer Box",
              "Packaging – Inner Wrap",
              "Module Front (Representative)",
              "Module Back (Representative)",
              "Nameplate / Label Close-up",
              "Junction Box Close-up",
              "Frame Corner Detail",
              "Serial Number Barcode",
            ].map((label, i) => (
              <div key={i} style={{ border: "1px solid #d1d5db", borderRadius: "4px", padding: "6px", textAlign: "center" }}>
                <div style={{ border: "1px dashed #9ca3af", height: "60px", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb", fontSize: "7pt", color: "#9ca3af", borderRadius: "3px", marginBottom: "4px" }}>
                  [Photo {i + 1}]
                </div>
                <div style={{ fontSize: "7pt", color: "#555", fontWeight: "500" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
}
