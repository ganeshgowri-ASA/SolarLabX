"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calculator,
  Plus,
  Trash2,
  FileDown,
  BarChart3,
  TrendingUp,
  FileText,
  BookOpen,
  Dices,
  GitBranch,
  ChevronRight,
  Activity,
} from "lucide-react";
import {
  type UncertaintyComponent,
  type UncertaintyBudget,
  type UncertaintyTemplate,
  type DistributionType,
  type UncertaintyType,
  type MonteCarloResult,
  type FishboneCategory,
  UNCERTAINTY_TEMPLATES,
  TEMPLATE_CATEGORIES,
  FISHBONE_CATEGORIES,
  createComponent,
  calculateBudget,
  calculateTypeA,
  runMonteCarloSimulation,
} from "@/lib/uncertainty";
import UncertaintyBudgetTable from "@/components/uncertainty/UncertaintyBudgetTable";
import SensitivityAnalysis from "@/components/uncertainty/SensitivityAnalysis";
import CoverageFactor from "@/components/uncertainty/CoverageFactor";
import NormalDistributionChart from "@/components/uncertainty/NormalDistributionChart";
import FishboneDiagram from "@/components/uncertainty/FishboneDiagram";
import MonteCarloChart from "@/components/uncertainty/MonteCarloChart";
import TornadoChart from "@/components/uncertainty/TornadoChart";
import { downloadUncertaintyPDF } from "@/components/uncertainty/UncertaintyPDFReport";

// ===== Component form state =====
interface ComponentFormData {
  name: string;
  value: string;
  uncertainty: string;
  distribution: DistributionType;
  type: UncertaintyType;
  sensitivityCoefficient: string;
  degreesOfFreedom: string;
  measurements: string;
  category: FishboneCategory;
  description: string;
}

const emptyForm: ComponentFormData = {
  name: "",
  value: "",
  uncertainty: "",
  distribution: "normal",
  type: "typeB",
  sensitivityCoefficient: "1.0",
  degreesOfFreedom: "",
  measurements: "",
  category: "Equipment",
  description: "",
};

export default function UncertaintyPage() {
  // Template selection
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<UncertaintyTemplate | null>(null);

  // Calculator state
  const [measurand, setMeasurand] = useState("");
  const [unit, setUnit] = useState("");
  const [measuredValue, setMeasuredValue] = useState("");
  const [components, setComponents] = useState<UncertaintyComponent[]>([]);
  const [form, setForm] = useState<ComponentFormData>({ ...emptyForm });
  const [typeAResult, setTypeAResult] = useState<{
    mean: number; stdDev: number; standardUncertainty: number; degreesOfFreedom: number; n: number;
  } | null>(null);
  const [coverageProbability, setCoverageProbability] = useState<number>(0.95);

  // Results state
  const [budget, setBudget] = useState<UncertaintyBudget | null>(null);
  const [mcResult, setMcResult] = useState<MonteCarloResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [mcIterations, setMcIterations] = useState(10000);

  // Active tab
  const [activeTab, setActiveTab] = useState("templates");

  // PDF settings
  const [labName, setLabName] = useState("Solar PV Testing Laboratory");
  const [preparedBy, setPreparedBy] = useState("");

  // Saved budgets
  const [savedBudgets, setSavedBudgets] = useState<UncertaintyBudget[]>([]);

  // Filter templates by category
  const filteredTemplates = useMemo(() => {
    if (!selectedCategory) return UNCERTAINTY_TEMPLATES;
    return UNCERTAINTY_TEMPLATES.filter((t) => t.category === selectedCategory);
  }, [selectedCategory]);

  // Load template
  function loadTemplate(template: UncertaintyTemplate) {
    setSelectedTemplate(template);
    setMeasurand(template.measurand);
    setUnit(template.unit);
    setMeasuredValue(template.defaultMeasuredValue.toString());
    const comps = template.components.map((tc, i) =>
      createComponent(
        `tmpl-${i}-${Date.now()}`,
        tc.name,
        tc.defaultUncertainty,
        tc.defaultUncertainty,
        tc.distribution,
        tc.type,
        tc.sensitivityCoefficient,
        tc.degreesOfFreedom,
        false,
        tc.category,
        tc.description
      )
    );
    setComponents(comps);
    setBudget(null);
    setMcResult(null);
    setActiveTab("calculator");
  }

  // Type A measurements handler
  function handleMeasurementsChange(value: string) {
    setForm((f) => ({ ...f, measurements: value }));
    const nums = value.split(",").map((s) => s.trim()).filter((s) => s !== "").map(Number).filter((n) => !isNaN(n));
    if (nums.length >= 2) {
      const result = calculateTypeA(nums);
      setTypeAResult(result);
      setForm((f) => ({
        ...f,
        value: result.mean.toString(),
        uncertainty: result.standardUncertainty.toString(),
        degreesOfFreedom: result.degreesOfFreedom.toString(),
      }));
    } else {
      setTypeAResult(null);
    }
  }

  // Add component
  function addComponent() {
    const val = parseFloat(form.value) || 0;
    const unc = parseFloat(form.uncertainty) || 0;
    const sc = parseFloat(form.sensitivityCoefficient) || 1;
    const dofStr = form.degreesOfFreedom.trim();
    const dof = dofStr === "" || dofStr.toLowerCase() === "inf" ? Infinity : parseInt(dofStr) || Infinity;
    const comp = createComponent(
      `comp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      form.name || `Component ${components.length + 1}`,
      val, unc, form.distribution, form.type, sc, dof, false, form.category, form.description
    );
    setComponents((prev) => [...prev, comp]);
    setForm({ ...emptyForm });
    setTypeAResult(null);
  }

  // Remove component
  function removeComponent(id: string) {
    setComponents((prev) => prev.filter((c) => c.id !== id));
  }

  // Update component uncertainty inline
  function updateComponentUncertainty(id: string, newUncertainty: number) {
    setComponents((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const stdU = c.distribution === "uniform" ? newUncertainty / Math.sqrt(3) :
          c.distribution === "triangular" ? newUncertainty / Math.sqrt(6) : newUncertainty;
        const varContrib = (c.sensitivityCoefficient * stdU) ** 2;
        return { ...c, uncertainty: newUncertainty, standardUncertainty: stdU, varianceContribution: varContrib };
      })
    );
    setBudget(null);
  }

  // Calculate budget
  const handleCalculate = useCallback(() => {
    if (components.length === 0) return;
    setIsCalculating(true);

    const b = calculateBudget(
      selectedTemplate?.name || "Custom Budget",
      measurand, parseFloat(measuredValue) || 0, components, coverageProbability,
      undefined, unit, selectedTemplate?.measurementModel, selectedTemplate?.standardReference
    );
    setBudget(b);

    // Run Monte Carlo
    const mc = runMonteCarloSimulation(
      components, parseFloat(measuredValue) || 0, mcIterations
    );
    setMcResult(mc);
    setIsCalculating(false);
    setActiveTab("results");
  }, [components, measurand, measuredValue, coverageProbability, unit, selectedTemplate, mcIterations]);

  // Save budget
  function saveBudget() {
    if (budget) {
      setSavedBudgets((prev) => [budget, ...prev]);
    }
  }

  // Export PDF
  function handleExportPDF() {
    if (!budget) return;
    downloadUncertaintyPDF({ budget, labName, preparedBy });
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Uncertainty Calculator</h1>
          <p className="text-muted-foreground">
            ISO/IEC 17025 measurement uncertainty analysis — GUM methodology with Monte Carlo verification
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {UNCERTAINTY_TEMPLATES.length} Templates
          </Badge>
          <Badge variant="outline" className="text-xs">
            {TEMPLATE_CATEGORIES.length} IEC Standards
          </Badge>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="templates" className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="calculator" className="flex items-center gap-1">
            <Calculator className="h-3.5 w-3.5" />
            Calculator
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-1" disabled={!budget}>
            <BarChart3 className="h-3.5 w-3.5" />
            Results
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-1" disabled={!budget}>
            <TrendingUp className="h-3.5 w-3.5" />
            Analysis
          </TabsTrigger>
          <TabsTrigger value="report" className="flex items-center gap-1" disabled={!budget}>
            <FileText className="h-3.5 w-3.5" />
            Report
          </TabsTrigger>
        </TabsList>

        {/* ===== TEMPLATES TAB ===== */}
        <TabsContent value="templates" className="space-y-4">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("")}
            >
              All ({UNCERTAINTY_TEMPLATES.length})
            </Button>
            {TEMPLATE_CATEGORIES.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.id} ({cat.count})
              </Button>
            ))}
          </div>

          {/* Template grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedTemplate?.id === template.id ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => loadTemplate(template)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {template.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {template.components.length} sources
                    </Badge>
                  </div>
                  <CardTitle className="text-sm mt-2">{template.name}</CardTitle>
                  <CardDescription className="text-xs">{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Measurand:</span>
                      <span>{template.measurand} {template.unit ? `(${template.unit})` : ""}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Ref:</span>
                      <span className="truncate">{template.standardReference}</span>
                    </div>
                  </div>
                  <Button size="sm" className="w-full mt-3" variant="outline">
                    <ChevronRight className="h-3 w-3 mr-1" />
                    Load Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ===== CALCULATOR TAB ===== */}
        <TabsContent value="calculator" className="space-y-4">
          {/* Template info banner */}
          {selectedTemplate && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-blue-900">{selectedTemplate.name}</span>
                    <span className="text-xs text-blue-700 ml-2">— {selectedTemplate.standardReference}</span>
                  </div>
                  <Badge variant="secondary">{selectedTemplate.category}</Badge>
                </div>
                {selectedTemplate.measurementModel && (
                  <div className="mt-2 p-2 bg-white rounded border border-blue-200 text-xs font-mono text-blue-800">
                    {selectedTemplate.measurementModel}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Measurand settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Measurand & Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label>Measurand</Label>
                  <Input
                    placeholder="e.g., Pmax"
                    value={measurand}
                    onChange={(e) => setMeasurand(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Input
                    placeholder="e.g., W"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Measured Value</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 350.5"
                    value={measuredValue}
                    onChange={(e) => setMeasuredValue(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Coverage Probability</Label>
                  <Select
                    value={coverageProbability.toString()}
                    onValueChange={(v) => setCoverageProbability(parseFloat(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.95">95% (k ≈ 2)</SelectItem>
                      <SelectItem value="0.99">99% (k ≈ 2.58)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>MC Iterations</Label>
                  <Select value={mcIterations.toString()} onValueChange={(v) => setMcIterations(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1000">1,000</SelectItem>
                      <SelectItem value="5000">5,000</SelectItem>
                      <SelectItem value="10000">10,000</SelectItem>
                      <SelectItem value="50000">50,000</SelectItem>
                      <SelectItem value="100000">100,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Uncertainty components table (editable) */}
          {components.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Uncertainty Sources ({components.length})</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Type A: {components.filter((c) => c.type === "typeA").length}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Type B: {components.filter((c) => c.type === "typeB").length}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-2 font-medium">Source</th>
                        <th className="text-center p-2 font-medium w-14">Type</th>
                        <th className="text-left p-2 font-medium w-28">Category</th>
                        <th className="text-right p-2 font-medium w-24">Uncertainty</th>
                        <th className="text-center p-2 font-medium w-20">Distrib.</th>
                        <th className="text-right p-2 font-medium w-16">ci</th>
                        <th className="text-right p-2 font-medium w-16">DOF</th>
                        <th className="text-right p-2 font-medium w-24">u(xi)</th>
                        <th className="w-16"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {components.map((c) => (
                        <tr key={c.id} className="border-b hover:bg-muted/30">
                          <td className="p-2">
                            <span className="font-medium text-xs">{c.name}</span>
                            {c.description && (
                              <span className="block text-xs text-muted-foreground truncate max-w-xs">{c.description}</span>
                            )}
                          </td>
                          <td className="text-center p-2">
                            <Badge variant={c.type === "typeA" ? "outline" : "secondary"} className="text-xs">
                              {c.type === "typeA" ? "A" : "B"}
                            </Badge>
                          </td>
                          <td className="p-2 text-xs text-muted-foreground">{c.category || "—"}</td>
                          <td className="p-2">
                            <Input
                              type="number"
                              className="h-7 text-xs font-mono text-right w-24"
                              value={c.uncertainty}
                              onChange={(e) => updateComponentUncertainty(c.id, parseFloat(e.target.value) || 0)}
                            />
                          </td>
                          <td className="text-center p-2 text-xs capitalize">{c.distribution}</td>
                          <td className="text-right p-2 text-xs font-mono">{c.sensitivityCoefficient.toFixed(2)}</td>
                          <td className="text-right p-2 text-xs font-mono">
                            {c.degreesOfFreedom === Infinity ? "∞" : c.degreesOfFreedom}
                          </td>
                          <td className="text-right p-2 text-xs font-mono">{c.standardUncertainty.toFixed(6)}</td>
                          <td className="p-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              onClick={() => removeComponent(c.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add component form */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Uncertainty Source
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Source Name</Label>
                  <Input
                    placeholder="e.g., Reference cell calibration"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={form.type === "typeA" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setForm((f) => ({ ...f, type: "typeA" }))}
                    >
                      Type A (Statistical)
                    </Button>
                    <Button
                      type="button"
                      variant={form.type === "typeB" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setForm((f) => ({ ...f, type: "typeB" }))}
                    >
                      Type B (Other)
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Fishbone Category</Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) => setForm((f) => ({ ...f, category: v as FishboneCategory }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FISHBONE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {form.type === "typeA" && (
                <div className="space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Label>Repeated Measurements (comma-separated)</Label>
                  <Input
                    placeholder="e.g., 350.2, 350.5, 349.8, 350.1, 350.3"
                    value={form.measurements}
                    onChange={(e) => handleMeasurementsChange(e.target.value)}
                  />
                  {typeAResult && (
                    <div className="grid grid-cols-4 gap-3 mt-3 text-sm">
                      <div className="bg-white p-2 rounded border">
                        <span className="text-muted-foreground text-xs">n = </span>
                        <span className="font-mono font-semibold">{typeAResult.n}</span>
                      </div>
                      <div className="bg-white p-2 rounded border">
                        <span className="text-muted-foreground text-xs">Mean = </span>
                        <span className="font-mono font-semibold">{typeAResult.mean.toFixed(4)}</span>
                      </div>
                      <div className="bg-white p-2 rounded border">
                        <span className="text-muted-foreground text-xs">Std Dev = </span>
                        <span className="font-mono font-semibold">{typeAResult.stdDev.toFixed(4)}</span>
                      </div>
                      <div className="bg-white p-2 rounded border">
                        <span className="text-muted-foreground text-xs">u = </span>
                        <span className="font-mono font-semibold">{typeAResult.standardUncertainty.toFixed(6)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={form.value}
                    onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                    disabled={form.type === "typeA" && typeAResult !== null}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Uncertainty</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={form.uncertainty}
                    onChange={(e) => setForm((f) => ({ ...f, uncertainty: e.target.value }))}
                    disabled={form.type === "typeA" && typeAResult !== null}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Distribution</Label>
                  <Select
                    value={form.distribution}
                    onValueChange={(v) => setForm((f) => ({ ...f, distribution: v as DistributionType }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="uniform">Uniform (Rectangular)</SelectItem>
                      <SelectItem value="triangular">Triangular</SelectItem>
                      <SelectItem value="u-shaped">U-shaped (Arcsine)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sensitivity ci</Label>
                  <Input
                    type="number"
                    placeholder="1.0"
                    value={form.sensitivityCoefficient}
                    onChange={(e) => setForm((f) => ({ ...f, sensitivityCoefficient: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>DOF</Label>
                  <Input
                    placeholder="∞"
                    value={form.degreesOfFreedom}
                    onChange={(e) => setForm((f) => ({ ...f, degreesOfFreedom: e.target.value }))}
                    disabled={form.type === "typeA" && typeAResult !== null}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Input
                  placeholder="Describe this uncertainty source..."
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>

              <Button onClick={addComponent} className="w-full" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Component
              </Button>
            </CardContent>
          </Card>

          {/* Calculate button */}
          {components.length > 0 && (
            <Button onClick={handleCalculate} className="w-full" size="lg" disabled={isCalculating}>
              <Calculator className="h-4 w-4 mr-2" />
              {isCalculating ? "Calculating..." : `Calculate Uncertainty Budget (${components.length} sources)`}
            </Button>
          )}
        </TabsContent>

        {/* ===== RESULTS TAB ===== */}
        <TabsContent value="results" className="space-y-4">
          {budget && (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-5 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4 pb-3 text-center">
                    <div className="text-xs text-blue-600 mb-1">Measured Value</div>
                    <div className="text-xl font-bold text-blue-900">{budget.measuredValue.toFixed(2)}</div>
                    <div className="text-xs text-blue-600">{budget.unit}</div>
                  </CardContent>
                </Card>
                <Card className="bg-amber-50 border-amber-200">
                  <CardContent className="pt-4 pb-3 text-center">
                    <div className="text-xs text-amber-600 mb-1">Combined uc</div>
                    <div className="text-xl font-bold text-amber-900">{budget.combinedStandardUncertainty.toFixed(4)}</div>
                    <div className="text-xs text-amber-600">{budget.unit}</div>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-4 pb-3 text-center">
                    <div className="text-xs text-green-600 mb-1">Expanded U</div>
                    <div className="text-xl font-bold text-green-900">± {budget.expandedUncertainty.toFixed(4)}</div>
                    <div className="text-xs text-green-600">{budget.unit}</div>
                  </CardContent>
                </Card>
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="pt-4 pb-3 text-center">
                    <div className="text-xs text-purple-600 mb-1">Relative U</div>
                    <div className="text-xl font-bold text-purple-900">{budget.relativeUncertaintyPercent.toFixed(2)}%</div>
                    <div className="text-xs text-purple-600">k = {budget.coverageFactor.toFixed(2)}</div>
                  </CardContent>
                </Card>
                <Card className="bg-rose-50 border-rose-200">
                  <CardContent className="pt-4 pb-3 text-center">
                    <div className="text-xs text-rose-600 mb-1">ν_eff</div>
                    <div className="text-xl font-bold text-rose-900">
                      {budget.effectiveDegreesOfFreedom === Infinity ? "∞" : budget.effectiveDegreesOfFreedom}
                    </div>
                    <div className="text-xs text-rose-600">
                      p = {(budget.coverageProbability * 100).toFixed(0)}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Final result banner */}
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-300">
                <CardContent className="py-4 text-center">
                  <div className="text-sm text-green-700 mb-1">Measurement Result</div>
                  <div className="text-2xl font-bold text-green-900">
                    {budget.measurand} = {budget.measuredValue.toFixed(2)} ± {budget.expandedUncertainty.toFixed(4)} {budget.unit}
                  </div>
                  <div className="text-xs text-green-700 mt-1">
                    (U_rel = {budget.relativeUncertaintyPercent.toFixed(2)}%, k = {budget.coverageFactor.toFixed(2)},
                    p = {(budget.coverageProbability * 100).toFixed(0)}%)
                  </div>
                </CardContent>
              </Card>

              {/* Budget table */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Uncertainty Budget Table</CardTitle>
                </CardHeader>
                <CardContent>
                  <UncertaintyBudgetTable budget={budget} />
                </CardContent>
              </Card>

              {/* Distribution and Coverage Factor side by side */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Normal Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <NormalDistributionChart
                      mean={budget.measuredValue}
                      uncertainty={budget.expandedUncertainty}
                      coverageFactor={budget.coverageFactor}
                    />
                  </CardContent>
                </Card>
                <CoverageFactor
                  dof={budget.effectiveDegreesOfFreedom}
                  probability={budget.coverageProbability}
                />
              </div>

              {/* GUM vs Monte Carlo comparison */}
              {mcResult && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      GUM vs Monte Carlo Comparison
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="text-left p-2">Parameter</th>
                            <th className="text-right p-2">GUM (Analytical)</th>
                            <th className="text-right p-2">Monte Carlo ({mcResult.iterations.toLocaleString()} iter.)</th>
                            <th className="text-right p-2">Difference</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="p-2">Mean</td>
                            <td className="p-2 text-right font-mono">{budget.measuredValue.toFixed(4)}</td>
                            <td className="p-2 text-right font-mono">{mcResult.mean.toFixed(4)}</td>
                            <td className="p-2 text-right font-mono">{(mcResult.mean - budget.measuredValue).toFixed(4)}</td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-2">Standard Uncertainty</td>
                            <td className="p-2 text-right font-mono">{budget.combinedStandardUncertainty.toFixed(4)}</td>
                            <td className="p-2 text-right font-mono">{mcResult.standardDeviation.toFixed(4)}</td>
                            <td className="p-2 text-right font-mono">
                              {(mcResult.standardDeviation - budget.combinedStandardUncertainty).toFixed(4)}
                            </td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-2">Expanded Uncertainty (95%)</td>
                            <td className="p-2 text-right font-mono">{budget.expandedUncertainty.toFixed(4)}</td>
                            <td className="p-2 text-right font-mono">{mcResult.expandedUncertainty.toFixed(4)}</td>
                            <td className="p-2 text-right font-mono">
                              {(mcResult.expandedUncertainty - budget.expandedUncertainty).toFixed(4)}
                            </td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-2">95% CI Lower</td>
                            <td className="p-2 text-right font-mono">
                              {(budget.measuredValue - budget.expandedUncertainty).toFixed(4)}
                            </td>
                            <td className="p-2 text-right font-mono">{mcResult.percentile2_5.toFixed(4)}</td>
                            <td className="p-2 text-right font-mono">
                              {(mcResult.percentile2_5 - (budget.measuredValue - budget.expandedUncertainty)).toFixed(4)}
                            </td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-2">95% CI Upper</td>
                            <td className="p-2 text-right font-mono">
                              {(budget.measuredValue + budget.expandedUncertainty).toFixed(4)}
                            </td>
                            <td className="p-2 text-right font-mono">{mcResult.percentile97_5.toFixed(4)}</td>
                            <td className="p-2 text-right font-mono">
                              {(mcResult.percentile97_5 - (budget.measuredValue + budget.expandedUncertainty)).toFixed(4)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* ===== ANALYSIS TAB ===== */}
        <TabsContent value="analysis" className="space-y-4">
          {budget && (
            <>
              {/* Fishbone Diagram */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <GitBranch className="h-4 w-4" />
                    Fishbone (Ishikawa) Diagram
                  </CardTitle>
                  <CardDescription>Interactive cause-and-effect diagram of uncertainty sources</CardDescription>
                </CardHeader>
                <CardContent>
                  <FishboneDiagram
                    components={budget.components}
                    measurand={`${budget.measurand} (${budget.unit})`}
                  />
                </CardContent>
              </Card>

              {/* Sensitivity Analysis (Pareto) */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Contribution Analysis (Pareto)
                  </CardTitle>
                  <CardDescription>Percentage contribution of each source to combined variance</CardDescription>
                </CardHeader>
                <CardContent>
                  <SensitivityAnalysis components={budget.components} />
                </CardContent>
              </Card>

              {/* Tornado Chart */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Tornado Chart (Sensitivity)
                  </CardTitle>
                  <CardDescription>Effect of each source on measurand (±1 standard uncertainty)</CardDescription>
                </CardHeader>
                <CardContent>
                  <TornadoChart
                    components={budget.components}
                    measuredValue={budget.measuredValue}
                    combinedUncertainty={budget.combinedStandardUncertainty}
                  />
                </CardContent>
              </Card>

              {/* Monte Carlo Distribution */}
              {mcResult && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Dices className="h-4 w-4" />
                      Monte Carlo Simulation
                    </CardTitle>
                    <CardDescription>
                      Numerical verification of GUM analytical result ({mcResult.iterations.toLocaleString()} iterations)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MonteCarloChart
                      result={mcResult}
                      measuredValue={budget.measuredValue}
                      measurand={budget.measurand}
                      unit={budget.unit}
                    />
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* ===== REPORT TAB ===== */}
        <TabsContent value="report" className="space-y-4">
          {budget && (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">PDF Report Settings</CardTitle>
                  <CardDescription>Configure ISO 17025 compliant uncertainty report</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Laboratory Name</Label>
                      <Input value={labName} onChange={(e) => setLabName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Prepared By</Label>
                      <Input
                        placeholder="Your name"
                        value={preparedBy}
                        onChange={(e) => setPreparedBy(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button onClick={handleExportPDF} className="w-full" size="lg">
                    <FileDown className="h-4 w-4 mr-2" />
                    Generate & Download PDF Report
                  </Button>
                </CardContent>
              </Card>

              {/* Report preview */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Report Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Summary section */}
                  <div className="border rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-sm border-b pb-2">Measurement Information</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Budget: </span>
                        <span className="font-medium">{budget.name}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Measurand: </span>
                        <span className="font-medium">{budget.measurand} ({budget.unit})</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Measured Value: </span>
                        <span className="font-medium">{budget.measuredValue.toFixed(4)} {budget.unit}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Standard: </span>
                        <span className="font-medium">{budget.standardReference || "—"}</span>
                      </div>
                    </div>

                    {budget.measurementModel && (
                      <div className="bg-amber-50 p-3 rounded border border-amber-200">
                        <div className="text-xs font-medium text-amber-700 mb-1">Measurement Model:</div>
                        <div className="text-xs font-mono text-amber-900">{budget.measurementModel}</div>
                      </div>
                    )}
                  </div>

                  {/* Budget table */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-sm border-b pb-2 mb-3">Uncertainty Budget</h3>
                    <UncertaintyBudgetTable budget={budget} />
                  </div>

                  {/* Result */}
                  <div className="bg-green-50 border border-green-300 rounded-lg p-4 text-center">
                    <div className="text-sm text-green-700 mb-1">Final Result</div>
                    <div className="text-lg font-bold text-green-900">
                      {budget.measurand} = {budget.measuredValue.toFixed(2)} ± {budget.expandedUncertainty.toFixed(4)} {budget.unit}
                    </div>
                    <div className="text-xs text-green-700 mt-1">
                      U_rel = {budget.relativeUncertaintyPercent.toFixed(2)}% | k = {budget.coverageFactor.toFixed(2)} |
                      ν_eff = {budget.effectiveDegreesOfFreedom === Infinity ? "∞" : budget.effectiveDegreesOfFreedom} |
                      p = {(budget.coverageProbability * 100).toFixed(0)}%
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Save and History */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Budget History</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button onClick={saveBudget} variant="outline" className="w-full mb-4">
                    Save Current Budget
                  </Button>
                  {savedBudgets.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground py-4">
                      No saved budgets yet. Calculate and save budgets to see them here.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {savedBudgets.map((sb) => (
                        <div key={sb.id} className="flex items-center justify-between p-3 bg-muted/30 rounded border">
                          <div>
                            <span className="font-medium text-sm">{sb.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {sb.measurand} = {sb.measuredValue.toFixed(2)} ± {sb.expandedUncertainty.toFixed(4)} {sb.unit}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              U_rel = {sb.relativeUncertaintyPercent.toFixed(2)}%
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => downloadUncertaintyPDF({ budget: sb, labName, preparedBy })}
                            >
                              <FileDown className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
