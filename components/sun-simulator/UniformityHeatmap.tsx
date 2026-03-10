// @ts-nocheck
"use client";

import { useState } from "react";
import { UniformityResult } from "@/lib/sun-simulator";

interface UniformityHeatmapProps {
  grid: number[][];
  stats: UniformityResult;
}

function valueToColor(value: number, min: number, max: number): string {
  const range = max - min || 1;
  const ratio = (value - min) / range;
  // green (high) -> yellow (mid) -> red (low)
  if (ratio >= 0.5) {
    const t = (ratio - 0.5) * 2;
    const r = Math.round(255 * (1 - t));
    const g = Math.round(180 + 75 * t);
    return `rgb(${r}, ${g}, 50)`;
  } else {
    const t = ratio * 2;
    const r = 255;
    const g = Math.round(180 * t);
    return `rgb(${r}, ${g}, 50)`;
  }
}

export default function UniformityHeatmap({ grid, stats }: UniformityHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);

  const rows = grid.length;
  const cols = grid[0]?.length || 0;

  return (
    <div className="space-y-2">
      <div
        className="inline-grid gap-[2px] border rounded-lg p-2 bg-muted/30"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(40px, 1fr))` }}
      >
        {grid.map((row, ri) =>
          row.map((val, ci) => {
            const isMin = val === stats.min;
            const isMax = val === stats.max;
            return (
              <div
                key={`${ri}-${ci}`}
                className="relative flex items-center justify-center text-xs font-mono p-1 rounded cursor-pointer transition-transform hover:scale-110 hover:z-10"
                style={{
                  backgroundColor: valueToColor(val, stats.min, stats.max),
                  minWidth: 40,
                  minHeight: 36,
                }}
                onMouseEnter={() => setHoveredCell({ row: ri, col: ci })}
                onMouseLeave={() => setHoveredCell(null)}
              >
                <span className="text-[10px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                  {val.toFixed(0)}
                </span>
                {isMin && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border border-white text-[7px] text-white flex items-center justify-center">
                    L
                  </span>
                )}
                {isMax && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full border border-white text-[7px] text-white flex items-center justify-center">
                    H
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
      {hoveredCell && (
        <div className="text-sm text-muted-foreground">
          Cell [{hoveredCell.row + 1}, {hoveredCell.col + 1}]: {grid[hoveredCell.row][hoveredCell.col].toFixed(1)} W/m&sup2;
        </div>
      )}
      <div className="flex gap-4 text-xs text-muted-foreground items-center">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-600 border" />
          <span>L = Min</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-600 border" />
          <span>H = Max</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-16 h-3 rounded" style={{ background: "linear-gradient(to right, rgb(255,0,50), rgb(255,180,50), rgb(50,255,50))" }} />
          <span>Low to High</span>
        </div>
      </div>
    </div>
  );
}
