// @ts-nocheck
"use client";

import React, { useState, useMemo, useCallback } from "react";
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
import ChamberVisualizer from "@/components/chamber/ChamberVisualizer";
import ParameterSliders from "@/components/chamber/ParameterSliders";
import SpecsTable from "@/components/chamber/SpecsTable";
import QuoteGenerator from "@/components/chamber/QuoteGenerator";
import {
  type ChamberDimensions,
  type EnvironmentalParams,
  type TestType,
  type TestProfile,
  type ChamberSpec,
  STANDARD_TEST_PROFILES,
  generateChamberSpec,
  calculateVolume,
} from "@/lib/chamber";
import {
  ArrowLeft,
  Thermometer,
  Droplets,
  Sun,
  Snowflake,
  Save,
  CheckCircle2,
  Box,
} from "lucide-react";

const BASE_TEST_TYPES: TestType[] = ["TC", "HF", "DH", "UV"];

const testTypeLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  TC: { label: "Thermal Cycling", icon: <Thermometer className="h-4 w-4" />, color: "text-red-500" },
  HF: { label: "Humidity Freeze", icon: <Snowflake className="h-4 w-4" />, color: "text-blue-500" },
  DH: { label: "Damp Heat", icon: <Droplets className="h-4 w-4" />, color: "text-cyan-500" },
  UV: { label: "UV Preconditioning", icon: <Sun className="h-4 w-4" />, color: "text-yellow-500" },
};

export default function ConfigurePage() {
  const [dimensions, setDimensions] = useState<ChamberDimensions>({
    length: 3200,
    width: 2100,
    height: 2200,
  });

  const [selectedTests, setSelectedTests] = useState<TestType[]>(["TC"]);

  const [params, setParams] = useState<EnvironmentalParams>({
    tempMin: -40,
    tempMax: 85,
    humidityMin: 0,
    humidityMax: 0,
    uvIntensity: 0,
    rampRate: 1.67,
  });

  const [cycles, setCycles] = useState(200);
  const [saved, setSaved] = useState(false);
  const [configName, setConfigName] = useState("My Custom Chamber");

  const volume = useMemo(() => calculateVolume(dimensions), [dimensions]);

  const toggleTest = useCallback(
    (test: TestType) => {
      setSelectedTests((prev) => {
        const next = prev.includes(test)
          ? prev.filter((t) => t !== test)
          : [...prev, test];
        if (next.length === 0) return prev;

        // Auto-populate params from matching standard profiles
        const matchingProfiles = STANDARD_TEST_PROFILES.filter(
          (p) => next.includes(p.testType as TestType)
        );
        if (matchingProfiles.length > 0) {
          const allParams = matchingProfiles.map((p) => p.params);
          setParams({
            tempMin: Math.min(...allParams.map((p) => p.tempMin)),
            tempMax: Math.max(...allParams.map((p) => p.tempMax)),
            humidityMin: Math.min(...allParams.map((p) => p.humidityMin)),
            humidityMax: Math.max(...allParams.map((p) => p.humidityMax)),
            uvIntensity: Math.max(...allParams.map((p) => p.uvIntensity)),
            rampRate: Math.max(...allParams.map((p) => p.rampRate)),
          });
          setCycles(matchingProfiles.reduce((sum, p) => sum + p.cycles, 0));
        }

        return next;
      });
    },
    []
  );

  const updateDimension = (key: keyof ChamberDimensions, value: number) => {
    setDimensions((prev) => ({ ...prev, [key]: value }));
  };

  const testProfiles: TestProfile[] = useMemo(() => {
    return selectedTests
      .map((t) => {
        const standard = STANDARD_TEST_PROFILES.find((p) => p.testType === t);
        if (standard) {
          return { ...standard, params, cycles };
        }
        return null;
      })
      .filter(Boolean) as TestProfile[];
  }, [selectedTests, params, cycles]);

  const spec: ChamberSpec = useMemo(
    () => generateChamberSpec(configName, dimensions, testProfiles),
    [configName, dimensions, testProfiles]
  );

  const matchingStandardProfiles = useMemo(
    () =>
      STANDARD_TEST_PROFILES.filter((p) =>
        selectedTests.includes(p.testType as TestType)
      ),
    [selectedTests]
  );

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/chamber-config">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Configure Chamber
            </h1>
            <p className="text-muted-foreground mt-1">
              Interactive environmental test chamber configuration
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={configName}
            onChange={(e) => setConfigName(e.target.value)}
            className="w-64"
            placeholder="Configuration name"
          />
          <Button onClick={handleSave} disabled={saved}>
            {saved ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Saved
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Configuration
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Section 1: Dimensions */}
      <Card>
        <CardHeader>
          <CardTitle>Chamber Dimensions</CardTitle>
          <CardDescription>
            Set the internal dimensions of the test chamber
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {(
              [
                { key: "length" as const, label: "Length", min: 1000, max: 5000 },
                { key: "width" as const, label: "Width", min: 1000, max: 3000 },
                { key: "height" as const, label: "Height", min: 1500, max: 3000 },
              ] as const
            ).map(({ key, label, min, max }) => (
              <div key={key} className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>{label}</Label>
                  <span className="text-sm font-medium">
                    {dimensions[key]} mm
                  </span>
                </div>
                <Slider
                  value={[dimensions[key]]}
                  onValueChange={([v]) => updateDimension(key, v)}
                  min={min}
                  max={max}
                  step={100}
                />
                <Input
                  type="number"
                  value={dimensions[key]}
                  onChange={(e) =>
                    updateDimension(
                      key,
                      Math.max(min, Math.min(max, Number(e.target.value) || min))
                    )
                  }
                  min={min}
                  max={max}
                  className="h-8 text-sm"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{min} mm</span>
                  <span>{max} mm</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 text-lg font-semibold">
            <Box className="h-5 w-5 text-primary" />
            Volume: {(Math.round(volume * 1000) / 1000).toFixed(3)} m³
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Test Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Test Type Selection</CardTitle>
          <CardDescription>
            Select the environmental tests this chamber needs to perform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            {BASE_TEST_TYPES.map((test) => {
              const info = testTypeLabels[test];
              const isSelected = selectedTests.includes(test);
              return (
                <button
                  key={test}
                  onClick={() => toggleTest(test)}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <div
                    className={`p-2 rounded-md ${
                      isSelected ? "bg-primary/10" : "bg-muted"
                    } ${info.color}`}
                  >
                    {info.icon}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{test}</div>
                    <div className="text-xs text-muted-foreground">
                      {info.label}
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="h-4 w-4 text-primary ml-auto" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Show matching standard profiles */}
          {matchingStandardProfiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <Label className="text-sm text-muted-foreground">
                Matching IEC Standard Profiles
              </Label>
              <div className="grid gap-2 md:grid-cols-2">
                {matchingStandardProfiles.map((profile) => (
                  <div
                    key={profile.testType}
                    className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg text-sm"
                  >
                    <Badge variant="outline" className="shrink-0 mt-0.5">
                      {profile.standard}
                    </Badge>
                    <div>
                      <p className="font-medium">{profile.testType}</p>
                      <p className="text-xs text-muted-foreground">
                        {profile.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Duration: {profile.duration} | Cycles: {profile.cycles}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 3: Environmental Parameters */}
      <ParameterSliders
        params={params}
        onChange={setParams}
        enabledTests={selectedTests}
      />

      {/* Cycles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Test Cycles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label>Number of Cycles</Label>
            <Input
              type="number"
              value={cycles}
              onChange={(e) => setCycles(Math.max(1, Number(e.target.value) || 1))}
              className="w-32"
              min={1}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 4 & 5: Generated Specs */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Generated Specifications</h2>
        <SpecsTable spec={spec} />
      </div>

      {/* Section 6: Chamber Visualizer */}
      <Card>
        <CardHeader>
          <CardTitle>Chamber Visualization</CardTitle>
          <CardDescription>
            3D representation of the configured chamber. Hover to rotate.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <ChamberVisualizer
            dimensions={dimensions}
            features={spec.features}
            testTypes={selectedTests}
          />
        </CardContent>
      </Card>

      {/* Quote Generator */}
      <QuoteGenerator spec={spec} customerName="Solar PV Testing Lab" />
    </div>
  );
}
