// @ts-nocheck
"use client";

import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
  ReferenceLine,
  ComposedChart,
  Cell,
} from "recharts";
import type { IECStandard } from "@/lib/data/data-analysis-data";
import {
  generateIVCurve,
  generateDegradationData,
  generateInsulationData,
  generatePowerMatrix,
  generateSpectralData,
  generateWeibullData,
} from "@/lib/data/data-analysis-data";

interface AnalysisChartsProps {
  standard: IECStandard;
}

export function AnalysisCharts({ standard }: AnalysisChartsProps) {
  const ivData = useMemo(() => generateIVCurve(10.5, 48.5, 400), []);
  const ivPowerData = useMemo(
    () => ivData.map((p) => ({ ...p, power: Math.round(p.voltage * p.current * 100) / 100 })),
    [ivData]
  );
  const degradationData = useMemo(() => generateDegradationData(401.5, 0.03, 200), []);
  const insulationData = useMemo(() => generateInsulationData(), []);
  const powerMatrix = useMemo(() => generatePowerMatrix(), []);
  const spectralData = useMemo(() => generateSpectralData(), []);
  const weibullData = useMemo(() => generateWeibullData(), []);

  // IEC 61215 Charts
  if (standard === "IEC 61215") {
    return (
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">I-V Curve Overlay</CardTitle>
            <CardDescription className="text-xs">Voltage vs Current & Power at STC</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={ivPowerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="voltage" label={{ value: "Voltage (V)", position: "insideBottom", offset: -5 }} tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" label={{ value: "Current (A)", angle: -90, position: "insideLeft" }} tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: "Power (W)", angle: 90, position: "insideRight" }} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="current" stroke="#2563eb" name="Current (A)" dot={false} strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="power" stroke="#f97316" name="Power (W)" dot={false} strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Power Degradation Trend</CardTitle>
            <CardDescription className="text-xs">Pmax vs Thermal Cycles (TC200)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={degradationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hours" label={{ value: "Thermal Cycles", position: "insideBottom", offset: -5 }} tick={{ fontSize: 11 }} />
                <YAxis domain={["auto", "auto"]} label={{ value: "Pmax (W)", angle: -90, position: "insideLeft" }} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <ReferenceLine y={401.5 * 0.95} stroke="#ef4444" strokeDasharray="5 5" label={{ value: "5% Limit", position: "right", fill: "#ef4444", fontSize: 10 }} />
                <Line type="monotone" dataKey="pmax" stroke="#2563eb" name="Pmax (W)" dot={{ r: 2 }} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Weibull Reliability Analysis</CardTitle>
            <CardDescription className="text-xs">Cumulative failure probability</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={weibullData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" label={{ value: "Time (hours)", position: "insideBottom", offset: -5 }} tick={{ fontSize: 11 }} />
                <YAxis label={{ value: "Probability (%)", angle: -90, position: "insideLeft" }} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="reliability" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} name="Reliability (%)" />
                <Area type="monotone" dataKey="cumulativeFailure" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} name="Cum. Failure (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Temperature Correction</CardTitle>
            <CardDescription className="text-xs">IV parameters vs cycle count</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={degradationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hours" label={{ value: "Thermal Cycles", position: "insideBottom", offset: -5 }} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="voc" stroke="#8b5cf6" name="Voc (V)" dot={false} strokeWidth={1.5} />
                <Line type="monotone" dataKey="isc" stroke="#06b6d4" name="Isc (A)" dot={false} strokeWidth={1.5} />
                <Line type="monotone" dataKey="ff" stroke="#f59e0b" name="FF" dot={false} strokeWidth={1.5} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    );
  }

  // IEC 61730 Charts
  if (standard === "IEC 61730") {
    return (
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Insulation Resistance Trending</CardTitle>
            <CardDescription className="text-xs">Resistance over measurement period</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={insulationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                <YAxis label={{ value: "Resistance (MΩ)", angle: -90, position: "insideLeft" }} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="5 5" label={{ value: "Min Threshold (40 MΩ)", position: "right", fill: "#ef4444", fontSize: 10 }} />
                <Bar dataKey="resistanceMOhm" fill="#3b82f6" name="Resistance (MΩ)" opacity={0.7} />
                <Line type="monotone" dataKey="resistanceMOhm" stroke="#1d4ed8" name="Trend" dot={false} strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Dielectric Withstand Analysis</CardTitle>
            <CardDescription className="text-xs">Applied voltage vs leakage current profile</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={insulationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                <YAxis label={{ value: "Applied Voltage (V)", angle: -90, position: "insideLeft" }} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="appliedVoltageV" stroke="#f97316" name="Applied Voltage (V)" dot={{ r: 2 }} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Environmental Conditions</CardTitle>
            <CardDescription className="text-xs">Temperature & humidity during measurements</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={insulationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                <YAxis yAxisId="left" label={{ value: "Temp (°C)", angle: -90, position: "insideLeft" }} tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: "Humidity (%)", angle: 90, position: "insideRight" }} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="right" dataKey="humidity" fill="#06b6d4" name="Humidity (%)" opacity={0.4} />
                <Line yAxisId="left" type="monotone" dataKey="temperatureC" stroke="#ef4444" name="Temperature (°C)" dot={{ r: 2 }} strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Partial Discharge Analysis</CardTitle>
            <CardDescription className="text-xs">Discharge magnitude distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={Array.from({ length: 12 }, (_, i) => ({
                  range: `${i * 5}-${(i + 1) * 5} pC`,
                  count: Math.round(Math.exp(-0.3 * i) * 50 + Math.random() * 10),
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" tick={{ fontSize: 9 }} angle={-45} textAnchor="end" height={60} />
                <YAxis label={{ value: "Count", angle: -90, position: "insideLeft" }} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Discharge Events">
                  {Array.from({ length: 12 }, (_, i) => (
                    <Cell key={i} fill={i < 4 ? "#22c55e" : i < 8 ? "#f59e0b" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    );
  }

  // IEC 61853 Charts
  if (standard === "IEC 61853") {
    const irradiances = [100, 200, 400, 600, 800, 1000, 1100];
    const matrixAt25 = powerMatrix.filter((e) => e.temperature === 25);

    return (
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Power vs Irradiance (Energy Rating)</CardTitle>
            <CardDescription className="text-xs">Multi-temperature power curves</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="irradiance" type="number" domain={[0, 1200]} label={{ value: "Irradiance (W/m²)", position: "insideBottom", offset: -5 }} tick={{ fontSize: 11 }} />
                <YAxis label={{ value: "Power (W)", angle: -90, position: "insideLeft" }} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                {[15, 25, 50, 75].map((temp, idx) => (
                  <Line
                    key={temp}
                    data={powerMatrix.filter((e) => e.temperature === temp)}
                    type="monotone"
                    dataKey="power"
                    stroke={["#3b82f6", "#22c55e", "#f59e0b", "#ef4444"][idx]}
                    name={`${temp}°C`}
                    dot={{ r: 3 }}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Power Matrix Heatmap (Interpolated)</CardTitle>
            <CardDescription className="text-xs">Power at each irradiance/temperature combination</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="border p-1 bg-muted text-left">W/m²</th>
                    {[15, 25, 50, 75].map((t) => (
                      <th key={t} className="border p-1 bg-muted text-center">{t}°C</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {irradiances.map((irr) => (
                    <tr key={irr}>
                      <td className="border p-1 font-medium bg-muted/50">{irr}</td>
                      {[15, 25, 50, 75].map((temp) => {
                        const entry = powerMatrix.find((e) => e.irradiance === irr && e.temperature === temp);
                        const pmax = entry?.power ?? 0;
                        const ratio = pmax / 450;
                        const bg = `rgba(37, 99, 235, ${Math.min(ratio, 1).toFixed(2)})`;
                        return (
                          <td
                            key={temp}
                            className="border p-1 text-center font-mono"
                            style={{ backgroundColor: bg, color: ratio > 0.5 ? "white" : "inherit" }}
                          >
                            {pmax.toFixed(1)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Fill Factor vs Irradiance</CardTitle>
            <CardDescription className="text-xs">FF at 25°C across irradiance levels</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={matrixAt25}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="irradiance" label={{ value: "Irradiance (W/m²)", position: "insideBottom", offset: -5 }} tick={{ fontSize: 11 }} />
                <YAxis domain={[0.6, 0.85]} label={{ value: "Fill Factor", angle: -90, position: "insideLeft" }} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="ff" fill="#8b5cf6" name="Fill Factor" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">NMOT Determination</CardTitle>
            <CardDescription className="text-xs">Module temperature vs irradiance for NMOT calc</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="irradiance" type="number" name="Irradiance" domain={[0, 1200]} label={{ value: "Irradiance (W/m²)", position: "insideBottom", offset: -5 }} tick={{ fontSize: 11 }} />
                <YAxis dataKey="temperature" type="number" name="Module Temp" label={{ value: "Module Temp (°C)", angle: -90, position: "insideLeft" }} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Scatter data={powerMatrix} fill="#f97316" name="Measurements" />
                <ReferenceLine y={43.2} stroke="#ef4444" strokeDasharray="5 5" label={{ value: "NMOT = 43.2°C", fill: "#ef4444", fontSize: 10 }} />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    );
  }

  // IEC 60891 Charts
  if (standard === "IEC 60891") {
    const ivSTC = generateIVCurve(10.5, 48.5, 400);
    const ivTranslated = generateIVCurve(10.2, 47.8, 385);
    const ivMeasured = generateIVCurve(8.4, 49.2, 320);

    return (
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">I-V Translation (Procedure 1)</CardTitle>
            <CardDescription className="text-xs">Measured → STC translated curves</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="voltage" type="number" domain={[0, 52]} label={{ value: "Voltage (V)", position: "insideBottom", offset: -5 }} tick={{ fontSize: 11 }} />
                <YAxis label={{ value: "Current (A)", angle: -90, position: "insideLeft" }} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line data={ivSTC} type="monotone" dataKey="current" stroke="#22c55e" name="STC Reference" dot={false} strokeWidth={2} />
                <Line data={ivTranslated} type="monotone" dataKey="current" stroke="#3b82f6" name="Translated to STC" dot={false} strokeWidth={2} strokeDasharray="5 5" />
                <Line data={ivMeasured} type="monotone" dataKey="current" stroke="#f97316" name="Measured (800 W/m², 45°C)" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Rs Determination</CardTitle>
            <CardDescription className="text-xs">Series resistance from dual-irradiance method</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" type="number" domain={[0, 1.0]} label={{ value: "dV/dI near Voc (Ω)", position: "insideBottom", offset: -5 }} tick={{ fontSize: 11 }} />
                <YAxis dataKey="y" type="number" label={{ value: "Rs estimate (Ω)", angle: -90, position: "insideLeft" }} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Scatter
                  data={Array.from({ length: 15 }, () => ({
                    x: 0.3 + Math.random() * 0.15,
                    y: 0.33 + Math.random() * 0.04,
                  }))}
                  fill="#8b5cf6"
                  name="Rs measurements"
                />
                <ReferenceLine y={0.35} stroke="#ef4444" strokeDasharray="5 5" label={{ value: "Rs = 0.35 Ω", fill: "#ef4444", fontSize: 10 }} />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Temperature Correction</CardTitle>
            <CardDescription className="text-xs">Pmax vs cell temperature</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart
                data={Array.from({ length: 20 }, (_, i) => {
                  const t = 15 + i * 3.5;
                  return {
                    temp: Math.round(t * 10) / 10,
                    pmax: Math.round((400 * (1 - 0.0035 * (t - 25)) + (Math.random() - 0.5) * 3) * 10) / 10,
                  };
                })}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="temp" label={{ value: "Cell Temp (°C)", position: "insideBottom", offset: -5 }} tick={{ fontSize: 11 }} />
                <YAxis domain={["auto", "auto"]} label={{ value: "Pmax (W)", angle: -90, position: "insideLeft" }} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="pmax" stroke="#f97316" name="Pmax (W)" dot={{ r: 2 }} strokeWidth={2} />
                <ReferenceLine x={25} stroke="#22c55e" strokeDasharray="5 5" label={{ value: "STC (25°C)", fill: "#22c55e", fontSize: 10 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Irradiance Correction</CardTitle>
            <CardDescription className="text-xs">Isc linearity check across irradiance levels</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart
                data={[200, 400, 600, 800, 1000, 1100].map((irr) => ({
                  irradiance: irr,
                  isc: Math.round(10.5 * (irr / 1000) * (1 + (Math.random() - 0.5) * 0.02) * 1000) / 1000,
                  ideal: Math.round(10.5 * (irr / 1000) * 1000) / 1000,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="irradiance" label={{ value: "Irradiance (W/m²)", position: "insideBottom", offset: -5 }} tick={{ fontSize: 11 }} />
                <YAxis label={{ value: "Isc (A)", angle: -90, position: "insideLeft" }} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="ideal" stroke="#94a3b8" name="Ideal Linear" strokeDasharray="5 5" dot={false} strokeWidth={1.5} />
                <Bar dataKey="isc" fill="#3b82f6" name="Measured Isc" opacity={0.7} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    );
  }

  // IEC 60904 Charts
  if (standard === "IEC 60904") {
    return (
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Spectral Mismatch Correction</CardTitle>
            <CardDescription className="text-xs">AM1.5 Reference vs Simulator Spectrum</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={spectralData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="wavelength" label={{ value: "Wavelength (nm)", position: "insideBottom", offset: -5 }} tick={{ fontSize: 11 }} />
                <YAxis label={{ value: "Relative Irradiance", angle: -90, position: "insideLeft" }} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="amReference" stroke="#f97316" name="AM1.5G Reference" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="simulatorSpectral" stroke="#3b82f6" name="Simulator" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Spectral Mismatch Factor</CardTitle>
            <CardDescription className="text-xs">Ratio across wavelength bands</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={spectralData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="wavelength" label={{ value: "Wavelength (nm)", position: "insideBottom", offset: -5 }} tick={{ fontSize: 11 }} />
                <YAxis domain={[0.8, 1.2]} label={{ value: "Mismatch Factor", angle: -90, position: "insideLeft" }} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <ReferenceLine y={1.0} stroke="#22c55e" strokeDasharray="5 5" />
                <ReferenceLine y={0.98} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "±2% limit", fill: "#ef4444", fontSize: 9 }} />
                <ReferenceLine y={1.02} stroke="#ef4444" strokeDasharray="3 3" />
                <Bar dataKey="spectralMismatch" name="Mismatch Factor">
                  {spectralData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        entry.spectralMismatch >= 0.98 && entry.spectralMismatch <= 1.02
                          ? "#22c55e"
                          : entry.spectralMismatch >= 0.95 && entry.spectralMismatch <= 1.05
                          ? "#f59e0b"
                          : "#ef4444"
                      }
                    />
                  ))}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Reference Device Linearity</CardTitle>
            <CardDescription className="text-xs">Isc response vs irradiance linearity check</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart
                data={[100, 200, 400, 600, 800, 1000, 1100].map((irr) => ({
                  irradiance: irr,
                  response: Math.round(0.1023 * (irr / 1000) * (1 + (Math.random() - 0.5) * 0.01) * 10000) / 10000,
                  ideal: Math.round(0.1023 * (irr / 1000) * 10000) / 10000,
                  deviation: Math.round((Math.random() - 0.5) * 0.4 * 100) / 100,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="irradiance" label={{ value: "Irradiance (W/m²)", position: "insideBottom", offset: -5 }} tick={{ fontSize: 11 }} />
                <YAxis label={{ value: "Isc (A)", angle: -90, position: "insideLeft" }} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="ideal" stroke="#94a3b8" name="Ideal Linear" strokeDasharray="5 5" dot={false} />
                <Line type="monotone" dataKey="response" stroke="#3b82f6" name="Measured" dot={{ r: 3 }} strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Calibration Analysis (All Parts)</CardTitle>
            <CardDescription className="text-xs">IEC 60904-1 through 60904-13 coverage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={[
                  { part: "60904-1", label: "I-V Meas.", score: 95, status: "pass" },
                  { part: "60904-2", label: "Ref. Devices", score: 92, status: "pass" },
                  { part: "60904-3", label: "Terrestrial", score: 88, status: "pass" },
                  { part: "60904-4", label: "Ref. Cells", score: 94, status: "pass" },
                  { part: "60904-5", label: "Open-Circuit V", score: 91, status: "pass" },
                  { part: "60904-7", label: "Spectral MM", score: 87, status: "pass" },
                  { part: "60904-8", label: "Spectral Resp.", score: 83, status: "warning" },
                  { part: "60904-9", label: "Sun Sim", score: 96, status: "pass" },
                  { part: "60904-10", label: "Linearity", score: 90, status: "pass" },
                  { part: "60904-13", label: "EL Imaging", score: 78, status: "warning" },
                ]}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} label={{ value: "Score (%)", position: "insideBottom", offset: -5 }} tick={{ fontSize: 11 }} />
                <YAxis dataKey="part" type="category" tick={{ fontSize: 10 }} width={70} />
                <Tooltip />
                <Bar dataKey="score" name="Compliance Score">
                  {[95, 92, 88, 94, 91, 87, 83, 96, 90, 78].map((score, i) => (
                    <Cell key={i} fill={score >= 90 ? "#22c55e" : score >= 80 ? "#f59e0b" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
