"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import type { IVDataPoint } from "@/lib/iec60904";

interface IVCurveChartProps {
  data: IVDataPoint[];
  translatedData?: IVDataPoint[];
  powerCurve?: { voltage: number; power: number }[];
  showPower?: boolean;
  height?: number;
}

export default function IVCurveChart({ data, translatedData, powerCurve, showPower = false, height = 350 }: IVCurveChartProps) {
  const combined = data.map((d, i) => ({
    voltage: d.voltage,
    current: d.current,
    power: powerCurve?.[i]?.power ?? d.voltage * d.current,
    translatedCurrent: translatedData?.[i]?.current,
    translatedVoltage: translatedData?.[i]?.voltage,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={combined} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis dataKey="voltage" label={{ value: "Voltage (V)", position: "insideBottom", offset: -5 }} tick={{ fontSize: 11 }} />
        <YAxis yAxisId="left" label={{ value: "Current (A)", angle: -90, position: "insideLeft" }} tick={{ fontSize: 11 }} />
        {showPower && (
          <YAxis yAxisId="right" orientation="right" label={{ value: "Power (W)", angle: 90, position: "insideRight" }} tick={{ fontSize: 11 }} />
        )}
        <Tooltip formatter={(v: number) => v.toFixed(4)} />
        <Legend />
        <Line yAxisId="left" type="monotone" dataKey="current" stroke="#2563eb" name="Current (A)" dot={false} strokeWidth={2} />
        {translatedData && (
          <Line yAxisId="left" type="monotone" dataKey="translatedCurrent" stroke="#dc2626" name="Translated (A)" dot={false} strokeWidth={2} strokeDasharray="5 5" />
        )}
        {showPower && (
          <Line yAxisId="right" type="monotone" dataKey="power" stroke="#16a34a" name="Power (W)" dot={false} strokeWidth={1.5} />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
