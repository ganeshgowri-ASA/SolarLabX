// @ts-nocheck
"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, ComposedChart,
} from "recharts";

interface SpectralResponseChartProps {
  data: { wavelength: number; response: number }[];
  referenceData?: { wavelength: number; irradiance: number }[];
  height?: number;
}

export default function SpectralResponseChart({ data, referenceData, height = 350 }: SpectralResponseChartProps) {
  if (referenceData) {
    // Dual-axis: SR + reference spectrum
    const combined = data.map((d) => {
      const ref = referenceData.find((r) => Math.abs(r.wavelength - d.wavelength) < 15);
      return { wavelength: d.wavelength, response: d.response, reference: ref?.irradiance };
    });
    return (
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={combined} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="wavelength" label={{ value: "Wavelength (nm)", position: "insideBottom", offset: -5 }} tick={{ fontSize: 11 }} />
          <YAxis yAxisId="left" label={{ value: "SR (A/W)", angle: -90, position: "insideLeft" }} tick={{ fontSize: 11 }} />
          <YAxis yAxisId="right" orientation="right" label={{ value: "Irradiance (W/m²/nm)", angle: 90, position: "insideRight" }} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          <Area yAxisId="right" type="monotone" dataKey="reference" stroke="#f59e0b" fill="#fef3c7" name="AM1.5G Reference" />
          <Line yAxisId="left" type="monotone" dataKey="response" stroke="#2563eb" name="Spectral Response" dot={false} strokeWidth={2} />
        </ComposedChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis dataKey="wavelength" label={{ value: "Wavelength (nm)", position: "insideBottom", offset: -5 }} tick={{ fontSize: 11 }} />
        <YAxis label={{ value: "Response (A/W)", angle: -90, position: "insideLeft" }} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v: number) => v.toFixed(4)} />
        <Line type="monotone" dataKey="response" stroke="#2563eb" name="SR (A/W)" dot={false} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
