// @ts-nocheck
"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import type { UncertaintyBudget } from "@/lib/uncertainty";
import { generateNextDocumentNumber } from "@/lib/document-numbering";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 9,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottom: "2px solid #1e40af",
    paddingBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: "#4b5563",
    marginBottom: 2,
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 6,
    borderBottom: "1px solid #d1d5db",
    paddingBottom: 3,
  },
  row: {
    flexDirection: "row",
    marginBottom: 2,
  },
  label: {
    width: 180,
    color: "#6b7280",
    fontSize: 9,
  },
  value: {
    fontWeight: "bold",
    fontSize: 9,
  },
  table: {
    width: "100%",
    marginTop: 6,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1e40af",
    color: "white",
    padding: 4,
    fontSize: 7.5,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    padding: 3,
    fontSize: 7.5,
    borderBottom: "0.5px solid #e5e7eb",
  },
  tableRowAlt: {
    flexDirection: "row",
    padding: 3,
    fontSize: 7.5,
    borderBottom: "0.5px solid #e5e7eb",
    backgroundColor: "#f9fafb",
  },
  colSource: { width: "22%" },
  colType: { width: "6%" },
  colValue: { width: "10%", textAlign: "right" as const },
  colStdU: { width: "12%", textAlign: "right" as const },
  colCi: { width: "8%", textAlign: "right" as const },
  colVariance: { width: "14%", textAlign: "right" as const },
  colPct: { width: "10%", textAlign: "right" as const },
  colDist: { width: "10%" },
  colDof: { width: "8%", textAlign: "right" as const },
  summaryBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  summaryLabel: {
    fontSize: 10,
    color: "#1e40af",
  },
  summaryValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1e40af",
  },
  resultBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#f0fdf4",
    border: "2px solid #22c55e",
    borderRadius: 4,
    alignItems: "center" as const,
  },
  resultLabel: {
    fontSize: 10,
    color: "#15803d",
    marginBottom: 3,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#15803d",
  },
  footer: {
    position: "absolute" as const,
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 7,
    color: "#9ca3af",
    borderTop: "0.5px solid #d1d5db",
    paddingTop: 5,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modelBox: {
    padding: 8,
    backgroundColor: "#fefce8",
    border: "1px solid #fde047",
    borderRadius: 4,
    marginBottom: 8,
  },
  modelText: {
    fontSize: 8.5,
    fontFamily: "Courier",
    color: "#713f12",
  },
});

interface UncertaintyPDFProps {
  budget: UncertaintyBudget;
  reportNumber?: string;
  labName?: string;
  preparedBy?: string;
}

function UncertaintyReportDocument({ budget, reportNumber, labName, preparedBy }: UncertaintyPDFProps) {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Measurement Uncertainty Report</Text>
          <Text style={styles.subtitle}>ISO/IEC 17025:2017 Compliant Uncertainty Budget</Text>
          <View style={[styles.row, { marginTop: 6 }]}>
            <Text style={styles.label}>Report Number:</Text>
            <Text style={styles.value}>{reportNumber || generateNextDocumentNumber('analysis_report', { standard: budget.standardReference || 'ISO 17025' })}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Laboratory:</Text>
            <Text style={styles.value}>{labName || "Solar PV Testing Laboratory"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{dateStr}</Text>
          </View>
          {preparedBy && (
            <View style={styles.row}>
              <Text style={styles.label}>Prepared By:</Text>
              <Text style={styles.value}>{preparedBy}</Text>
            </View>
          )}
        </View>

        {/* Measurement Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Measurement Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Budget Name:</Text>
            <Text style={styles.value}>{budget.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Measurand:</Text>
            <Text style={styles.value}>{budget.measurand} {budget.unit ? `(${budget.unit})` : ""}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Measured Value:</Text>
            <Text style={styles.value}>{budget.measuredValue.toFixed(4)} {budget.unit}</Text>
          </View>
          {budget.standardReference && (
            <View style={styles.row}>
              <Text style={styles.label}>Standard Reference:</Text>
              <Text style={styles.value}>{budget.standardReference}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Coverage Probability:</Text>
            <Text style={styles.value}>{(budget.coverageProbability * 100).toFixed(0)}%</Text>
          </View>
        </View>

        {/* Measurement Model */}
        {budget.measurementModel && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Measurement Model</Text>
            <View style={styles.modelBox}>
              <Text style={styles.modelText}>{budget.measurementModel}</Text>
            </View>
          </View>
        )}

        {/* Uncertainty Budget Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Uncertainty Budget</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.colSource}>Source</Text>
              <Text style={styles.colType}>Type</Text>
              <Text style={styles.colValue}>Value</Text>
              <Text style={styles.colStdU}>u(xi)</Text>
              <Text style={styles.colCi}>ci</Text>
              <Text style={styles.colVariance}>ci²·u²(xi)</Text>
              <Text style={styles.colPct}>Contrib %</Text>
              <Text style={styles.colDist}>Distrib.</Text>
              <Text style={styles.colDof}>DOF</Text>
            </View>
            {budget.components.map((c, i) => (
              <View key={c.id} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <Text style={styles.colSource}>{c.name}</Text>
                <Text style={styles.colType}>{c.type === "typeA" ? "A" : "B"}</Text>
                <Text style={styles.colValue}>{c.value.toFixed(4)}</Text>
                <Text style={styles.colStdU}>{c.standardUncertainty.toFixed(6)}</Text>
                <Text style={styles.colCi}>{c.sensitivityCoefficient.toFixed(2)}</Text>
                <Text style={styles.colVariance}>{c.varianceContribution.toExponential(3)}</Text>
                <Text style={styles.colPct}>{c.percentageContribution.toFixed(1)}%</Text>
                <Text style={styles.colDist}>{c.distribution}</Text>
                <Text style={styles.colDof}>{c.degreesOfFreedom === Infinity ? "∞" : c.degreesOfFreedom}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Combined Standard Uncertainty (uc):</Text>
            <Text style={styles.summaryValue}>{budget.combinedStandardUncertainty.toFixed(6)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Effective Degrees of Freedom (νeff):</Text>
            <Text style={styles.summaryValue}>
              {budget.effectiveDegreesOfFreedom === Infinity ? "∞" : budget.effectiveDegreesOfFreedom}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Coverage Factor (k):</Text>
            <Text style={styles.summaryValue}>
              {budget.coverageFactor.toFixed(3)} (p = {(budget.coverageProbability * 100).toFixed(0)}%)
            </Text>
          </View>
        </View>

        {/* Final Result */}
        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>Expanded Uncertainty (U = k × uc)</Text>
          <Text style={styles.resultValue}>
            {budget.measurand} = {budget.measuredValue.toFixed(2)} ± {budget.expandedUncertainty.toFixed(4)} {budget.unit}
          </Text>
          <Text style={[styles.resultLabel, { marginTop: 4 }]}>
            (U_rel = {budget.relativeUncertaintyPercent.toFixed(2)}%, k = {budget.coverageFactor.toFixed(2)}, p = {(budget.coverageProbability * 100).toFixed(0)}%)
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Generated by SolarLabX Uncertainty Module | ISO/IEC 17025:2017</Text>
          <Text>Page 1 of 1 | {dateStr}</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generateUncertaintyPDF(props: UncertaintyPDFProps): Promise<Blob> {
  const doc = <UncertaintyReportDocument {...props} />;
  const blob = await pdf(doc).toBlob();
  return blob;
}

export function downloadUncertaintyPDF(props: UncertaintyPDFProps) {
  generateUncertaintyPDF(props).then((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `uncertainty-report-${props.budget.measurand.replace(/[^a-zA-Z0-9]/g, "_")}-${new Date().toISOString().split("T")[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}
