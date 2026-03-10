"use client";

import React, { useMemo, useRef, useState } from "react";
import type { UncertaintyComponent } from "@/lib/uncertainty";
import { FISHBONE_CATEGORIES } from "@/lib/uncertainty";

interface FishboneDiagramProps {
  components: UncertaintyComponent[];
  measurand: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Equipment: "#2563eb",
  Method: "#16a34a",
  Environment: "#ea580c",
  Personnel: "#9333ea",
  Sample: "#dc2626",
  "Reference Standard": "#0891b2",
};

export default function FishboneDiagram({ components, measurand }: FishboneDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredSource, setHoveredSource] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map: Record<string, UncertaintyComponent[]> = {};
    for (const cat of FISHBONE_CATEGORIES) {
      map[cat] = [];
    }
    for (const c of components) {
      const cat = c.category || "Method";
      if (!map[cat]) map[cat] = [];
      map[cat].push(c);
    }
    return map;
  }, [components]);

  const activeCategories = FISHBONE_CATEGORIES.filter((cat) => grouped[cat].length > 0);

  // Layout constants
  const width = 900;
  const spineY = 200;
  const spineStartX = 60;
  const spineEndX = 840;
  const headWidth = 30;
  const branchLength = 130;

  // Position categories evenly along the spine
  const topCats = activeCategories.filter((_, i) => i % 2 === 0);
  const bottomCats = activeCategories.filter((_, i) => i % 2 === 1);
  const totalCats = activeCategories.length;
  const spacing = (spineEndX - spineStartX - headWidth - 60) / Math.max(totalCats, 1);

  interface BranchData {
    category: string;
    cx: number;
    cy: number;
    direction: "up" | "down";
    sources: UncertaintyComponent[];
    color: string;
  }

  const branches: BranchData[] = useMemo(() => {
    const result: BranchData[] = [];
    let topIdx = 0;
    let bottomIdx = 0;
    for (let i = 0; i < activeCategories.length; i++) {
      const cat = activeCategories[i];
      const isTop = i % 2 === 0;
      const idx = isTop ? topIdx++ : bottomIdx++;
      const positionIndex = i;
      const cx = spineStartX + 60 + positionIndex * spacing;
      const cy = spineY;
      result.push({
        category: cat,
        cx,
        cy,
        direction: isTop ? "up" : "down",
        sources: grouped[cat],
        color: CATEGORY_COLORS[cat] || "#6b7280",
      });
    }
    return result;
  }, [activeCategories, grouped, spacing]);

  const svgHeight = 420;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${svgHeight}`}
        className="w-full"
        style={{ minWidth: 700, maxHeight: 500 }}
      >
        {/* Background */}
        <rect width={width} height={svgHeight} fill="#fafafa" rx={8} />

        {/* Title */}
        <text x={width / 2} y={24} textAnchor="middle" fontSize={14} fontWeight="bold" fill="#1f2937">
          Ishikawa (Fishbone) Diagram — Uncertainty Sources
        </text>

        {/* Main spine */}
        <line
          x1={spineStartX}
          y1={spineY}
          x2={spineEndX - headWidth}
          y2={spineY}
          stroke="#374151"
          strokeWidth={3}
        />

        {/* Fish head (effect) arrow */}
        <polygon
          points={`${spineEndX - headWidth},${spineY - 15} ${spineEndX},${spineY} ${spineEndX - headWidth},${spineY + 15}`}
          fill="#374151"
        />
        <text
          x={spineEndX - headWidth - 8}
          y={spineY + 5}
          textAnchor="end"
          fontSize={13}
          fontWeight="bold"
          fill="#1f2937"
        >
          {measurand || "Measurand"}
        </text>

        {/* Category branches */}
        {branches.map((branch) => {
          const sign = branch.direction === "up" ? -1 : 1;
          const endY = branch.cy + sign * branchLength;
          const angleX = branch.cx + 40;

          return (
            <g key={branch.category}>
              {/* Main branch line (angled) */}
              <line
                x1={angleX}
                y1={spineY}
                x2={branch.cx}
                y2={endY}
                stroke={branch.color}
                strokeWidth={2.5}
                opacity={0.8}
              />

              {/* Category label */}
              <rect
                x={branch.cx - 55}
                y={endY + sign * 4 - (branch.direction === "up" ? 18 : 0)}
                width={110}
                height={20}
                rx={4}
                fill={branch.color}
                opacity={0.9}
              />
              <text
                x={branch.cx}
                y={endY + sign * 4 + (branch.direction === "up" ? -4 : 14)}
                textAnchor="middle"
                fontSize={10}
                fontWeight="bold"
                fill="white"
              >
                {branch.category}
              </text>

              {/* Individual sources as sub-branches */}
              {branch.sources.map((src, idx) => {
                const subY =
                  branch.direction === "up"
                    ? spineY - 20 - idx * 22
                    : spineY + 20 + idx * 22;
                const subEndY = subY;
                // Interpolate x along the branch
                const t = (subY - spineY) / (endY - spineY);
                const branchX = angleX + t * (branch.cx - angleX);
                const labelX = branchX - 8;

                const isHovered = hoveredSource === src.id;
                const pct = src.percentageContribution;
                const lineWidth = Math.max(0.8, Math.min(2.5, pct / 15));

                return (
                  <g
                    key={src.id}
                    onMouseEnter={() => setHoveredSource(src.id)}
                    onMouseLeave={() => setHoveredSource(null)}
                    style={{ cursor: "pointer" }}
                  >
                    <line
                      x1={branchX}
                      y1={subEndY}
                      x2={labelX - 2}
                      y2={subEndY}
                      stroke={branch.color}
                      strokeWidth={lineWidth}
                      opacity={isHovered ? 1 : 0.6}
                    />
                    <circle
                      cx={branchX}
                      cy={subEndY}
                      r={isHovered ? 3.5 : 2.5}
                      fill={branch.color}
                      opacity={isHovered ? 1 : 0.7}
                    />
                    <text
                      x={labelX - 5}
                      y={subEndY + 3.5}
                      textAnchor="end"
                      fontSize={isHovered ? 9.5 : 8.5}
                      fill={isHovered ? branch.color : "#4b5563"}
                      fontWeight={isHovered ? "bold" : "normal"}
                    >
                      {src.name.length > 28 ? src.name.slice(0, 25) + "..." : src.name}
                    </text>
                    {isHovered && (
                      <text
                        x={labelX - 5}
                        y={subEndY + 15}
                        textAnchor="end"
                        fontSize={8}
                        fill={branch.color}
                        fontWeight="600"
                      >
                        u={src.standardUncertainty.toFixed(4)} ({pct.toFixed(1)}%)
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* Legend */}
        <g transform={`translate(${spineStartX}, ${svgHeight - 30})`}>
          {FISHBONE_CATEGORIES.map((cat, i) => (
            <g key={cat} transform={`translate(${i * 140}, 0)`}>
              <rect x={0} y={0} width={10} height={10} rx={2} fill={CATEGORY_COLORS[cat]} />
              <text x={14} y={9} fontSize={9} fill="#6b7280">
                {cat}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
