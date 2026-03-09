"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { DetectionResultCard } from "@/components/vision/DetectionResultCard";
import { sampleDetectionResults } from "@/lib/mock-data";
import { DEFECT_TYPES, INSPECTION_TYPES } from "@/lib/constants";

export default function ResultsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [defectFilter, setDefectFilter] = useState("all");
  const [inspectionFilter, setInspectionFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filteredResults = useMemo(() => {
    return sampleDetectionResults.filter((result) => {
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !result.imageName.toLowerCase().includes(query) &&
          !result.moduleId.toLowerCase().includes(query)
        )
          return false;
      }

      // Inspection type filter
      if (inspectionFilter !== "all" && result.inspectionType !== inspectionFilter) return false;

      // Defect type filter
      if (defectFilter !== "all") {
        if (!result.defects.some((d) => d.class === defectFilter)) return false;
      }

      // Severity filter
      if (severityFilter !== "all") {
        const defectTypes = DEFECT_TYPES.filter((dt) => dt.severity === severityFilter);
        const defectIds = defectTypes.map((dt) => dt.id);
        if (!result.defects.some((d) => defectIds.includes(d.class as any))) return false;
      }

      // Date range
      if (dateFrom && result.date < dateFrom) return false;
      if (dateTo && result.date > dateTo) return false;

      return true;
    });
  }, [searchQuery, defectFilter, inspectionFilter, severityFilter, dateFrom, dateTo]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Detection Results</h1>
        <p className="text-muted-foreground mt-1">
          Browse and filter detection results history
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Search</label>
              <Input
                placeholder="Module ID or filename..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Inspection Type</label>
              <Select value={inspectionFilter} onValueChange={setInspectionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {INSPECTION_TYPES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Defect Type</label>
              <Select value={defectFilter} onValueChange={setDefectFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Defects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Defects</SelectItem>
                  {DEFECT_TYPES.map((dt) => (
                    <SelectItem key={dt.id} value={dt.id}>{dt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Severity</label>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="major">Major</SelectItem>
                  <SelectItem value="minor">Minor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Date From</label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Date To</label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredResults.length} of {sampleDetectionResults.length} results
      </p>

      {/* Results Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredResults.map((result) => (
          <DetectionResultCard key={result.id} result={result} />
        ))}
      </div>

      {filteredResults.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No results match your filters.
        </div>
      )}
    </div>
  );
}
