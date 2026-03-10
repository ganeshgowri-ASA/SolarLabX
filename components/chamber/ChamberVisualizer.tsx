// @ts-nocheck
"use client";

import React from "react";
import type { ChamberDimensions, TestType } from "@/lib/chamber";
import { Snowflake, Sun, Thermometer, Droplets } from "lucide-react";

interface ChamberVisualizerProps {
  dimensions: ChamberDimensions;
  features: string[];
  testTypes: TestType[];
}

export default function ChamberVisualizer({
  dimensions,
  features,
  testTypes,
}: ChamberVisualizerProps) {
  const maxDim = Math.max(dimensions.length, dimensions.width, dimensions.height);
  const scale = 180 / maxDim;
  const w = dimensions.length * scale;
  const h = dimensions.height * scale;
  const d = dimensions.width * scale;

  const hasUV = testTypes.some((t) => t.includes("UV"));
  const hasCooling = features.some((f) => f.toLowerCase().includes("refrigeration"));
  const hasHumidity = features.some((f) => f.toLowerCase().includes("humidity"));
  const hasHeating = features.some((f) => f.toLowerCase().includes("heating"));

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className="group relative"
        style={{
          perspective: "800px",
          width: w + d * 0.6 + 60,
          height: h + d * 0.6 + 60,
        }}
      >
        <div
          className="relative transition-transform duration-700 ease-out group-hover:[transform:rotateX(-5deg)_rotateY(-10deg)]"
          style={{
            transformStyle: "preserve-3d",
            transform: "rotateX(-15deg) rotateY(-25deg)",
            width: w + d * 0.6,
            height: h + d * 0.6,
            marginLeft: 30,
            marginTop: 20,
          }}
        >
          {/* Front face */}
          <div
            className="absolute border-2 border-slate-400 rounded-sm"
            style={{
              width: w,
              height: h,
              bottom: 0,
              left: 0,
              background: "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 50%, #94a3b8 100%)",
              transform: `translateZ(${d / 2}px)`,
              boxShadow: "inset 0 0 20px rgba(0,0,0,0.1)",
            }}
          >
            {/* Door handle */}
            <div
              className="absolute right-3 bg-slate-500 rounded-full"
              style={{ width: 6, height: 30, top: h / 2 - 15 }}
            />
            {/* Window */}
            <div
              className="absolute bg-slate-700/30 border border-slate-400 rounded"
              style={{
                width: w * 0.4,
                height: h * 0.35,
                left: w * 0.3,
                top: h * 0.15,
              }}
            />
            {/* UV indicators on front */}
            {hasUV && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2">
                <Sun className="h-4 w-4 text-yellow-500 animate-pulse" />
              </div>
            )}
          </div>

          {/* Top face */}
          <div
            className="absolute border-2 border-slate-400 rounded-sm"
            style={{
              width: w,
              height: d,
              bottom: h,
              left: 0,
              background: "linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%)",
              transform: `rotateX(90deg) translateZ(${d / 2}px)`,
              transformOrigin: "bottom",
            }}
          >
            {/* UV LEDs on top */}
            {hasUV && (
              <div className="absolute inset-0 flex items-center justify-center gap-2">
                {Array.from({ length: Math.min(5, Math.ceil(w / 40)) }).map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.7)]"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right face */}
          <div
            className="absolute border-2 border-slate-400 rounded-sm"
            style={{
              width: d,
              height: h,
              bottom: 0,
              left: w,
              background: "linear-gradient(135deg, #cbd5e1 0%, #94a3b8 50%, #64748b 100%)",
              transform: `rotateY(90deg) translateZ(${w / 2}px)`,
              transformOrigin: "left",
            }}
          >
            {/* Cooling indicator */}
            {hasCooling && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2">
                <Snowflake className="h-4 w-4 text-blue-400" />
              </div>
            )}
            {/* Humidity indicator */}
            {hasHumidity && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                <Droplets className="h-4 w-4 text-cyan-400" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dimension labels */}
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-foreground">L:</span>
          {dimensions.length} mm
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-foreground">W:</span>
          {dimensions.width} mm
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-foreground">H:</span>
          {dimensions.height} mm
        </div>
      </div>

      {/* Feature indicators */}
      <div className="flex flex-wrap gap-2 justify-center">
        {hasCooling && (
          <div className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-200">
            <Snowflake className="h-3 w-3" /> Cascade Cooling
          </div>
        )}
        {hasHeating && (
          <div className="flex items-center gap-1 text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full border border-red-200">
            <Thermometer className="h-3 w-3" /> High-Power Heating
          </div>
        )}
        {hasHumidity && (
          <div className="flex items-center gap-1 text-xs bg-cyan-50 text-cyan-700 px-2 py-1 rounded-full border border-cyan-200">
            <Droplets className="h-3 w-3" /> Humidity Control
          </div>
        )}
        {hasUV && (
          <div className="flex items-center gap-1 text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full border border-yellow-200">
            <Sun className="h-3 w-3" /> UV LED Array
          </div>
        )}
      </div>
    </div>
  );
}
