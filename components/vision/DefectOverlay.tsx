// @ts-nocheck
"use client";

import React, { useRef, useEffect, useState } from "react";
import { DEFECT_TYPES } from "@/lib/constants";

export interface Detection {
  x: number;
  y: number;
  width: number;
  height: number;
  class: string;
  confidence: number;
}

interface DefectOverlayProps {
  imageSrc: string;
  detections: Detection[];
  className?: string;
}

export function DefectOverlay({ imageSrc, detections, className }: DefectOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const maxWidth = 800;
      const scale = Math.min(1, maxWidth / img.width);
      const width = img.width * scale;
      const height = img.height * scale;

      canvas.width = width;
      canvas.height = height;
      setDimensions({ width, height });

      ctx.drawImage(img, 0, 0, width, height);

      detections.forEach((det) => {
        const defectType = DEFECT_TYPES.find((d) => d.id === det.class || d.label.toLowerCase().includes(det.class.toLowerCase()));
        const color = defectType?.color || "#ef4444";

        const bx = (det.x - det.width / 2) * scale;
        const by = (det.y - det.height / 2) * scale;
        const bw = det.width * scale;
        const bh = det.height * scale;

        // Bounding box
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, by, bw, bh);

        // Semi-transparent fill
        ctx.fillStyle = color + "20";
        ctx.fillRect(bx, by, bw, bh);

        // Label background
        const label = `${det.class} ${(det.confidence * 100).toFixed(0)}%`;
        ctx.font = "bold 12px sans-serif";
        const textWidth = ctx.measureText(label).width;
        ctx.fillStyle = color;
        ctx.fillRect(bx, by - 20, textWidth + 8, 20);

        // Label text
        ctx.fillStyle = "#ffffff";
        ctx.fillText(label, bx + 4, by - 6);
      });
    };
    img.src = imageSrc;
  }, [imageSrc, detections]);

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        className="rounded-md border max-w-full"
        style={{ width: dimensions.width || "100%", height: dimensions.height || "auto" }}
      />
    </div>
  );
}
