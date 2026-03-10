"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Sun, BarChart3, Grid3X3, Timer, TrendingUp } from "lucide-react";

export default function Part9Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">IEC 60904-9: Solar Simulator</h1>
        <p className="text-muted-foreground mt-1">
          Solar simulator performance requirements and classification (A+/A/B/C)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sun Simulator Classifier Module</CardTitle>
          <CardDescription>
            The IEC 60904-9 classifier is available as a dedicated module with full spectral match, uniformity, and temporal stability analysis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/sun-simulator">
              <Card className="hover:border-primary transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <Sun className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm mt-1">Dashboard</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">Overview and quick classification</CardContent>
              </Card>
            </Link>
            <Link href="/sun-simulator/classify">
              <Card className="hover:border-primary transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm mt-1">Full Classification</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">Complete A+/A/B/C grading</CardContent>
              </Card>
            </Link>
            <Link href="/sun-simulator/spectral">
              <Card className="hover:border-primary transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm mt-1">Spectral Analysis</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">SPD spectral match analysis</CardContent>
              </Card>
            </Link>
            <Link href="/sun-simulator/uniformity">
              <Card className="hover:border-primary transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <Grid3X3 className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm mt-1">Uniformity Mapping</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">Spatial non-uniformity heatmap</CardContent>
              </Card>
            </Link>
            <Link href="/sun-simulator/stability">
              <Card className="hover:border-primary transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <Timer className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm mt-1">Temporal Stability</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">STI/LTI stability assessment</CardContent>
              </Card>
            </Link>
            <Link href="/sun-simulator/spc">
              <Card className="hover:border-primary transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm mt-1">SPC/MSA</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">Statistical process control</CardContent>
              </Card>
            </Link>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-sm mb-2">Classification Grades (IEC 60904-9 Ed.3)</h3>
            <div className="grid grid-cols-5 gap-2 text-center text-sm">
              <div className="p-2 rounded bg-emerald-500 text-white font-bold">A+</div>
              <div className="p-2 rounded bg-green-500 text-white font-bold">A</div>
              <div className="p-2 rounded bg-yellow-400 text-white font-bold">B</div>
              <div className="p-2 rounded bg-orange-500 text-white font-bold">C</div>
              <div className="p-2 rounded bg-red-600 text-white font-bold">Fail</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
