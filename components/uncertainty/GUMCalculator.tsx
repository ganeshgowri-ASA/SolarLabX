// @ts-nocheck
"use client";

import React, { useState } from "react";
import type {
  UncertaintyComponent,
  DistributionType,
  UncertaintyType,
  UncertaintyTemplate,
} from "@/lib/uncertainty";
import { createComponent, calculateTypeA } from "@/lib/uncertainty";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface GUMCalculatorProps {
  onCalculate: (
    measurand: string,
    measuredValue: number,
    components: UncertaintyComponent[]
  ) => void;
  initialTemplate?: UncertaintyTemplate;
}

interface ComponentFormData {
  name: string;
  value: string;
  uncertainty: string;
  distribution: DistributionType;
  type: UncertaintyType;
  sensitivityCoefficient: string;
  degreesOfFreedom: string;
  measurements: string;
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
};

export default function GUMCalculator({ onCalculate, initialTemplate }: GUMCalculatorProps) {
  const [measurand, setMeasurand] = useState(initialTemplate?.measurand ?? "");
  const [measuredValue, setMeasuredValue] = useState("");
  const [components, setComponents] = useState<UncertaintyComponent[]>(() => {
    if (!initialTemplate) return [];
    return initialTemplate.components.map((tc, i) =>
      createComponent(
        `tmpl-${i}`,
        tc.name,
        tc.defaultUncertainty,
        tc.defaultUncertainty,
        tc.distribution,
        tc.type,
        tc.sensitivityCoefficient,
        tc.degreesOfFreedom
      )
    );
  });
  const [form, setForm] = useState<ComponentFormData>({ ...emptyForm });
  const [typeAResult, setTypeAResult] = useState<{
    mean: number;
    stdDev: number;
    standardUncertainty: number;
    degreesOfFreedom: number;
    n: number;
  } | null>(null);

  function handleMeasurementsChange(value: string) {
    setForm((f) => ({ ...f, measurements: value }));
    const nums = value
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "")
      .map(Number)
      .filter((n) => !isNaN(n));
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

  function addComponent() {
    const val = parseFloat(form.value) || 0;
    const unc = parseFloat(form.uncertainty) || 0;
    const sc = parseFloat(form.sensitivityCoefficient) || 1;
    const dofStr = form.degreesOfFreedom.trim();
    const dof = dofStr === "" || dofStr.toLowerCase() === "inf" ? Infinity : parseInt(dofStr) || Infinity;

    const comp = createComponent(
      `comp-${Date.now()}`,
      form.name || `Component ${components.length + 1}`,
      val,
      unc,
      form.distribution,
      form.type,
      sc,
      dof
    );

    setComponents((prev) => [...prev, comp]);
    setForm({ ...emptyForm });
    setTypeAResult(null);
  }

  function removeComponent(id: string) {
    setComponents((prev) => prev.filter((c) => c.id !== id));
  }

  function handleCalculate() {
    if (components.length === 0) return;
    onCalculate(measurand, parseFloat(measuredValue) || 0, components);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Measurand</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="measurand">Measurand Name</Label>
              <Input
                id="measurand"
                placeholder="e.g., Pmax (W)"
                value={measurand}
                onChange={(e) => setMeasurand(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="measuredValue">Measured Value</Label>
              <Input
                id="measuredValue"
                type="number"
                placeholder="e.g., 350.5"
                value={measuredValue}
                onChange={(e) => setMeasuredValue(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Add Uncertainty Component</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="compName">Source Name</Label>
              <Input
                id="compName"
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
          </div>

          {form.type === "typeA" && (
            <div className="space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Label htmlFor="measurements">Repeated Measurements (comma-separated)</Label>
              <Input
                id="measurements"
                placeholder="e.g., 350.2, 350.5, 349.8, 350.1, 350.3"
                value={form.measurements}
                onChange={(e) => handleMeasurementsChange(e.target.value)}
              />
              {typeAResult && (
                <div className="grid grid-cols-4 gap-3 mt-3 text-sm">
                  <div className="bg-white p-2 rounded border">
                    <span className="text-muted-foreground">n = </span>
                    <span className="font-mono font-semibold">{typeAResult.n}</span>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <span className="text-muted-foreground">Mean = </span>
                    <span className="font-mono font-semibold">{typeAResult.mean.toFixed(4)}</span>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <span className="text-muted-foreground">Std Dev = </span>
                    <span className="font-mono font-semibold">{typeAResult.stdDev.toFixed(4)}</span>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <span className="text-muted-foreground">u = </span>
                    <span className="font-mono font-semibold">{typeAResult.standardUncertainty.toFixed(6)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="compValue">Value</Label>
              <Input
                id="compValue"
                type="number"
                placeholder="0"
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                disabled={form.type === "typeA" && typeAResult !== null}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="compUncertainty">Uncertainty</Label>
              <Input
                id="compUncertainty"
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
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, distribution: v as DistributionType }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="uniform">Uniform (Rectangular)</SelectItem>
                  <SelectItem value="triangular">Triangular</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="compSC">Sensitivity Coeff. ci</Label>
              <Input
                id="compSC"
                type="number"
                placeholder="1.0"
                value={form.sensitivityCoefficient}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sensitivityCoefficient: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="compDOF">Degrees of Freedom</Label>
              <Input
                id="compDOF"
                placeholder="Inf (leave blank for infinite)"
                value={form.degreesOfFreedom}
                onChange={(e) => setForm((f) => ({ ...f, degreesOfFreedom: e.target.value }))}
                disabled={form.type === "typeA" && typeAResult !== null}
              />
            </div>
          </div>

          <Button onClick={addComponent} className="w-full">
            Add Component
          </Button>
        </CardContent>
      </Card>

      {components.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Components ({components.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {components.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={c.type === "typeA" ? "outline" : "secondary"}>
                      {c.type === "typeA" ? "A" : "B"}
                    </Badge>
                    <span className="font-medium text-sm">{c.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">
                      u = {c.standardUncertainty.toFixed(6)} | {c.distribution} | c = {c.sensitivityCoefficient}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeComponent(c.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            <Button onClick={handleCalculate} className="w-full mt-4" size="lg">
              Calculate Uncertainty Budget
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
