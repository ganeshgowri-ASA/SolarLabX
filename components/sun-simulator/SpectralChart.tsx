"use client";

import {
  SpectralDataPoint,
  SpectralMatchResult,
  AM15G_REFERENCE,
  WAVELENGTH_BANDS,
} from "@/lib/sun-simulator";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
  CartesianGrid,
} from "recharts";

interface SpectralChartProps {
  data: SpectralDataPoint[];
  result: SpectralMatchResult;
}

const bandColors = [
  "rgba(139,92,246,0.08)",
  "rgba(59,130,246,0.08)",
  "rgba(16,185,129,0.08)",
  "rgba(245,158,11,0.08)",
  "rgba(239,68,68,0.08)",
  "rgba(168,85,247,0.08)",
];

export default function SpectralChart({ data, result }: SpectralChartProps) {
  const refEntries = Object.entries(AM15G_REFERENCE)
    .map(([wl, irr]) => ({ wavelength: Number(wl), irradiance: irr }))
    .sort((a, b) => a.wavelength - b.wavelength);

  const allWavelengths = new Set<number>();
  data.forEach((d) => allWavelengths.add(d.wavelength));
  refEntries.forEach((d) => allWavelengths.add(d.wavelength));

  const sorted = Array.from(allWavelengths).sort((a, b) => a - b);

  const measuredMap = new Map(data.map((d) => [d.wavelength, d.irradiance]));
  const refMap = new Map(refEntries.map((d) => [d.wavelength, d.irradiance]));

  const chartData = sorted.map((wl) => ({
    wavelength: wl,
    measured: measuredMap.get(wl) ?? undefined,
    reference: refMap.get(wl) ?? undefined,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        {WAVELENGTH_BANDS.map((band, i) => (
          <ReferenceArea
            key={band.range}
            x1={band.start}
            x2={band.end}
            fill={bandColors[i]}
            fillOpacity={1}
            label={{ value: band.range, position: "top", fontSize: 10, fill: "#888" }}
          />
        ))}
        <XAxis
          dataKey="wavelength"
          type="number"
          domain={[300, 1200]}
          label={{ value: "Wavelength (nm)", position: "insideBottom", offset: -5 }}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          label={{ value: "Irradiance (W/m\u00b2/nm)", angle: -90, position: "insideLeft" }}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          formatter={(value: number) => value?.toFixed(3)}
          labelFormatter={(v) => `${v} nm`}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="measured"
          stroke="#2563eb"
          strokeWidth={2}
          dot={false}
          name="Measured"
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="reference"
          stroke="#dc2626"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
          name="AM1.5G Reference"
          connectNulls
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
