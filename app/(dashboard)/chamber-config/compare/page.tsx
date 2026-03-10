// @ts-nocheck
"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type ChamberDimensions,
  type TestProfile,
  type ChamberSpec,
  type TestType,
  STANDARD_TEST_PROFILES,
  generateChamberSpec,
  compareChambers,
} from "@/lib/chamber";
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ChamberPreset {
  name: string;
  label: string;
  dimensions: ChamberDimensions;
  testTypes: TestType[];
}

const PRESETS: ChamberPreset[] = [
  {
    name: "standard-tc",
    label: "Standard TC",
    dimensions: { length: 3200, width: 2100, height: 2200 },
    testTypes: ["TC"],
  },
  {
    name: "combined-tc-hf",
    label: "Combined TC+HF",
    dimensions: { length: 3200, width: 2100, height: 2200 },
    testTypes: ["TC", "HF"],
  },
  {
    name: "full-suite",
    label: "Full Suite UV+TC+HF+DH",
    dimensions: { length: 3500, width: 2500, height: 2500 },
    testTypes: ["UV", "TC", "HF", "DH"],
  },
];

function getProfilesForTests(tests: TestType[]): TestProfile[] {
  return tests
    .map((t) => STANDARD_TEST_PROFILES.find((p) => p.testType === t))
    .filter(Boolean) as TestProfile[];
}

interface ColumnConfig {
  dimensions: ChamberDimensions;
  selectedTests: TestType[];
}

function ConfigColumn({
  index,
  config,
  onChange,
}: {
  index: number;
  config: ColumnConfig;
  onChange: (config: ColumnConfig) => void;
}) {
  const label = index === 0 ? "A" : "B";
  const color = index === 0 ? "blue" : "emerald";

  const toggleTest = (test: TestType) => {
    const next = config.selectedTests.includes(test)
      ? config.selectedTests.filter((t) => t !== test)
      : [...config.selectedTests, test];
    if (next.length === 0) return;
    onChange({ ...config, selectedTests: next });
  };

  const updateDim = (key: keyof ChamberDimensions, value: number) => {
    onChange({ ...config, dimensions: { ...config.dimensions, [key]: value } });
  };

  const applyPreset = (preset: ChamberPreset) => {
    onChange({
      dimensions: { ...preset.dimensions },
      selectedTests: [...preset.testTypes],
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Chamber {label}
          </CardTitle>
          <Badge
            variant={index === 0 ? "default" : "secondary"}
            className={index === 0 ? "bg-blue-600" : "bg-emerald-600 text-white"}
          >
            {label}
          </Badge>
        </div>
        <CardDescription>Select a preset or configure manually</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Presets */}
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset.name}
              variant="outline"
              size="sm"
              onClick={() => applyPreset(preset)}
            >
              {preset.label}
            </Button>
          ))}
        </div>

        {/* Test Type Toggles */}
        <div>
          <Label className="text-xs text-muted-foreground">Test Types</Label>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {(["TC", "HF", "DH", "UV"] as TestType[]).map((test) => {
              const isActive = config.selectedTests.includes(test);
              return (
                <button
                  key={test}
                  onClick={() => toggleTest(test)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                    isActive
                      ? `border-${color}-500 bg-${color}-50 text-${color}-700`
                      : "border-border text-muted-foreground hover:bg-muted"
                  } ${isActive && index === 0 ? "border-blue-500 bg-blue-50 text-blue-700" : ""} ${isActive && index === 1 ? "border-emerald-500 bg-emerald-50 text-emerald-700" : ""}`}
                >
                  {test}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dimensions */}
        <div className="space-y-3">
          {(
            [
              { key: "length" as const, label: "Length", min: 1000, max: 5000 },
              { key: "width" as const, label: "Width", min: 1000, max: 3000 },
              { key: "height" as const, label: "Height", min: 1500, max: 3000 },
            ] as const
          ).map(({ key, label, min, max }) => (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <Label className="text-xs">{label}</Label>
                <span className="text-xs font-medium">
                  {config.dimensions[key]} mm
                </span>
              </div>
              <Slider
                value={[config.dimensions[key]]}
                onValueChange={([v]) => updateDim(key, v)}
                min={min}
                max={max}
                step={100}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ComparePage() {
  const [configA, setConfigA] = useState<ColumnConfig>({
    dimensions: { length: 3200, width: 2100, height: 2200 },
    selectedTests: ["TC"] as TestType[],
  });

  const [configB, setConfigB] = useState<ColumnConfig>({
    dimensions: { length: 3500, width: 2500, height: 2500 },
    selectedTests: ["TC", "HF", "DH", "UV"] as TestType[],
  });

  const specA: ChamberSpec = useMemo(
    () =>
      generateChamberSpec(
        "Chamber A",
        configA.dimensions,
        getProfilesForTests(configA.selectedTests)
      ),
    [configA]
  );

  const specB: ChamberSpec = useMemo(
    () =>
      generateChamberSpec(
        "Chamber B",
        configB.dimensions,
        getProfilesForTests(configB.selectedTests)
      ),
    [configB]
  );

  const comparison = useMemo(() => compareChambers(specA, specB), [specA, specB]);

  const chartData = useMemo(
    () => [
      {
        name: "Volume (m³)",
        "Chamber A": specA.volume,
        "Chamber B": specB.volume,
      },
      {
        name: "Cooling (kW)",
        "Chamber A": specA.coolingCapacity,
        "Chamber B": specB.coolingCapacity,
      },
      {
        name: "Heating (kW)",
        "Chamber A": specA.heatingCapacity,
        "Chamber B": specB.heatingCapacity,
      },
      {
        name: "Cost (Lakhs)",
        "Chamber A": specA.estimatedCost.totalLakhs,
        "Chamber B": specB.estimatedCost.totalLakhs,
      },
    ],
    [specA, specB]
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/chamber-config">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Compare Configurations
          </h1>
          <p className="text-muted-foreground mt-1">
            Side-by-side comparison of two chamber configurations
          </p>
        </div>
      </div>

      {/* Two Configuration Columns */}
      <div className="grid gap-6 md:grid-cols-2">
        <ConfigColumn index={0} config={configA} onChange={setConfigA} />
        <ConfigColumn index={1} config={configB} onChange={setConfigB} />
      </div>

      {/* Generated Specs Side-by-Side */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Badge className="bg-blue-600">A</Badge>
              Specifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-y-1.5">
              <span className="text-muted-foreground">Volume</span>
              <span className="font-medium">{specA.volume} m³</span>
              <span className="text-muted-foreground">Cooling</span>
              <span className="font-medium">{specA.coolingCapacity} kW</span>
              <span className="text-muted-foreground">Heating</span>
              <span className="font-medium">{specA.heatingCapacity} kW</span>
              <span className="text-muted-foreground">UV LEDs</span>
              <span className="font-medium">{specA.uvLedCount}</span>
              <span className="text-muted-foreground">UV Power</span>
              <span className="font-medium">{specA.uvPower} kW</span>
              <span className="text-muted-foreground">Cost</span>
              <span className="font-medium font-semibold">
                {"\u20b9"}{specA.estimatedCost.totalLakhs.toFixed(1)}L
              </span>
            </div>
            <div className="flex flex-wrap gap-1 pt-2">
              {specA.features.map((f, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {f}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Badge className="bg-emerald-600 text-white">B</Badge>
              Specifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-y-1.5">
              <span className="text-muted-foreground">Volume</span>
              <span className="font-medium">{specB.volume} m³</span>
              <span className="text-muted-foreground">Cooling</span>
              <span className="font-medium">{specB.coolingCapacity} kW</span>
              <span className="text-muted-foreground">Heating</span>
              <span className="font-medium">{specB.heatingCapacity} kW</span>
              <span className="text-muted-foreground">UV LEDs</span>
              <span className="font-medium">{specB.uvLedCount}</span>
              <span className="text-muted-foreground">UV Power</span>
              <span className="font-medium">{specB.uvPower} kW</span>
              <span className="text-muted-foreground">Cost</span>
              <span className="font-medium font-semibold">
                {"\u20b9"}{specB.estimatedCost.totalLakhs.toFixed(1)}L
              </span>
            </div>
            <div className="flex flex-wrap gap-1 pt-2">
              {specB.features.map((f, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {f}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Parameter Comparison</CardTitle>
          <CardDescription>
            Green indicates an advantage for that chamber
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parameter</TableHead>
                <TableHead>
                  <div className="flex items-center gap-1.5">
                    <Badge className="bg-blue-600">A</Badge>
                    Chamber A
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-1.5">
                    <Badge className="bg-emerald-600 text-white">B</Badge>
                    Chamber B
                  </div>
                </TableHead>
                <TableHead className="text-center">Advantage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparison.map((row) => (
                <TableRow key={row.parameter}>
                  <TableCell className="font-medium">{row.parameter}</TableCell>
                  <TableCell
                    className={
                      row.advantage === "A"
                        ? "text-green-700 bg-green-50 font-medium"
                        : row.advantage === "B"
                        ? "text-red-600 bg-red-50"
                        : ""
                    }
                  >
                    {row.specA}
                  </TableCell>
                  <TableCell
                    className={
                      row.advantage === "B"
                        ? "text-green-700 bg-green-50 font-medium"
                        : row.advantage === "A"
                        ? "text-red-600 bg-red-50"
                        : ""
                    }
                  >
                    {row.specB}
                  </TableCell>
                  <TableCell className="text-center">
                    {row.advantage === "A" ? (
                      <Badge className="bg-blue-600">A</Badge>
                    ) : row.advantage === "B" ? (
                      <Badge className="bg-emerald-600 text-white">B</Badge>
                    ) : (
                      <Badge variant="outline">Equal</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Visual Comparison</CardTitle>
          <CardDescription>
            Key metrics compared between the two chamber configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="Chamber A"
                  fill="#2563eb"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="Chamber B"
                  fill="#059669"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
