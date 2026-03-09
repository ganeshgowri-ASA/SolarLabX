"use client";

import React from "react";
import type { EnvironmentalParams, TestType } from "@/lib/chamber";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Thermometer, Droplets, Sun, Gauge } from "lucide-react";

interface ParameterSlidersProps {
  params: EnvironmentalParams;
  onChange: (params: EnvironmentalParams) => void;
  enabledTests: TestType[];
}

export default function ParameterSliders({
  params,
  onChange,
  enabledTests,
}: ParameterSlidersProps) {
  const needsHumidity = enabledTests.some(
    (t) => t.includes("HF") || t.includes("DH")
  );
  const needsUV = enabledTests.some((t) => t.includes("UV"));

  const update = (key: keyof EnvironmentalParams, value: number) => {
    onChange({ ...params, [key]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Environmental Parameters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Temperature Min */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-1.5">
              <Thermometer className="h-4 w-4 text-blue-500" />
              Min Temperature
            </Label>
            <span className="text-sm font-medium">{params.tempMin}°C</span>
          </div>
          <Slider
            value={[params.tempMin]}
            onValueChange={([v]) => update("tempMin", v)}
            min={-70}
            max={25}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>-70°C</span>
            <span>25°C</span>
          </div>
        </div>

        {/* Temperature Max */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-1.5">
              <Thermometer className="h-4 w-4 text-red-500" />
              Max Temperature
            </Label>
            <span className="text-sm font-medium">{params.tempMax}°C</span>
          </div>
          <Slider
            value={[params.tempMax]}
            onValueChange={([v]) => update("tempMax", v)}
            min={25}
            max={200}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>25°C</span>
            <span>200°C</span>
          </div>
        </div>

        {/* Humidity Min */}
        {needsHumidity && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1.5">
                <Droplets className="h-4 w-4 text-cyan-500" />
                Min Humidity
              </Label>
              <span className="text-sm font-medium">{params.humidityMin}% RH</span>
            </div>
            <Slider
              value={[params.humidityMin]}
              onValueChange={([v]) => update("humidityMin", v)}
              min={0}
              max={95}
              step={1}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>95%</span>
            </div>
          </div>
        )}

        {/* Humidity Max */}
        {needsHumidity && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1.5">
                <Droplets className="h-4 w-4 text-blue-500" />
                Max Humidity
              </Label>
              <span className="text-sm font-medium">{params.humidityMax}% RH</span>
            </div>
            <Slider
              value={[params.humidityMax]}
              onValueChange={([v]) => update("humidityMax", v)}
              min={0}
              max={98}
              step={1}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>98%</span>
            </div>
          </div>
        )}

        {/* UV Intensity */}
        {needsUV && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1.5">
                <Sun className="h-4 w-4 text-yellow-500" />
                UV Intensity
              </Label>
              <span className="text-sm font-medium">{params.uvIntensity} W/m²</span>
            </div>
            <Slider
              value={[params.uvIntensity]}
              onValueChange={([v]) => update("uvIntensity", v)}
              min={50}
              max={500}
              step={10}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>50 W/m²</span>
              <span>500 W/m²</span>
            </div>
          </div>
        )}

        {/* Ramp Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-1.5">
              <Gauge className="h-4 w-4 text-green-500" />
              Ramp Rate
            </Label>
            <span className="text-sm font-medium">{params.rampRate} °C/min</span>
          </div>
          <Slider
            value={[params.rampRate * 100]}
            onValueChange={([v]) => update("rampRate", v / 100)}
            min={10}
            max={500}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0.1 °C/min</span>
            <span>5.0 °C/min</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
