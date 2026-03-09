"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { STANDARD_TEST_PROFILES } from "@/lib/chamber";
import {
  Thermometer,
  Droplets,
  Sun,
  Snowflake,
  Settings,
  BarChart3,
  Clock,
  IndianRupee,
  Box,
} from "lucide-react";

const testTypeIcons: Record<string, React.ReactNode> = {
  TC: <Thermometer className="h-5 w-5 text-red-500" />,
  HF: <Snowflake className="h-5 w-5 text-blue-500" />,
  DH: <Droplets className="h-5 w-5 text-cyan-500" />,
  UV: <Sun className="h-5 w-5 text-yellow-500" />,
  "TC+HF": <Thermometer className="h-5 w-5 text-purple-500" />,
  "UV+TC+HF+DH": <Sun className="h-5 w-5 text-orange-500" />,
};

const savedConfigs = [
  {
    id: "1",
    name: "Standard TC Chamber",
    volume: "14.784 m\u00b3",
    cost: "\u20b972.8L",
    testTypes: ["TC"],
    date: "2026-03-05",
  },
  {
    id: "2",
    name: "Combined TC+HF Chamber",
    volume: "14.784 m\u00b3",
    cost: "\u20b980.8L",
    testTypes: ["TC", "HF"],
    date: "2026-03-07",
  },
  {
    id: "3",
    name: "Full Suite UV Chamber",
    volume: "18.900 m\u00b3",
    cost: "\u20b9108.5L",
    testTypes: ["UV", "TC", "HF", "DH"],
    date: "2026-03-08",
  },
];

export default function ChamberConfigPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Chamber Configurator</h1>
        <p className="text-muted-foreground mt-2">
          Configure environmental test chambers for PV module testing per IEC 61215, 61730, and related standards.
          Design chamber specifications, calculate costs, and compare configurations.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/chamber-config/configure">
          <Card className="cursor-pointer hover:border-primary transition-colors h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Settings className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Configure New Chamber</CardTitle>
                  <CardDescription>
                    Design a custom environmental test chamber with interactive controls
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Start Configuration</Button>
            </CardContent>
          </Card>
        </Link>
        <Link href="/chamber-config/compare">
          <Card className="cursor-pointer hover:border-primary transition-colors h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <BarChart3 className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Compare Configurations</CardTitle>
                  <CardDescription>
                    Side-by-side comparison of two chamber configurations with charts
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Open Comparison</Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Standard Test Profiles */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Standard Test Profiles</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {STANDARD_TEST_PROFILES.map((profile) => (
            <Card key={profile.testType}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {testTypeIcons[profile.testType]}
                    <CardTitle className="text-base">{profile.testType}</CardTitle>
                  </div>
                  <Badge variant="secondary">{profile.standard}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{profile.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{profile.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Thermometer className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{profile.params.tempMin}°C to {profile.params.tempMax}°C</span>
                  </div>
                </div>
                {profile.params.humidityMax > 0 && (
                  <div className="flex items-center gap-1 text-sm">
                    <Droplets className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Humidity: {profile.params.humidityMax}% RH</span>
                  </div>
                )}
                {profile.params.uvIntensity > 0 && (
                  <div className="flex items-center gap-1 text-sm">
                    <Sun className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>UV: {profile.params.uvIntensity} W/m²</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Configurations */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Configurations</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {savedConfigs.map((config) => (
            <Card key={config.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{config.name}</CardTitle>
                <CardDescription>Saved on {config.date}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {config.testTypes.map((t) => (
                    <Badge key={t} variant="outline">{t}</Badge>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Box className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{config.volume}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{config.cost}</span>
                  </div>
                </div>
                <Link href="/chamber-config/configure">
                  <Button variant="ghost" size="sm" className="w-full mt-1">
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
