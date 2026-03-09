"use client";

import React from "react";
import type { ChamberSpec } from "@/lib/chamber";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SpecsTableProps {
  spec: ChamberSpec;
}

export default function SpecsTable({ spec }: SpecsTableProps) {
  return (
    <div className="space-y-4">
      {/* Dimensions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Dimensions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Length</TableCell>
                <TableCell>{spec.dimensions.length} mm</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Width</TableCell>
                <TableCell>{spec.dimensions.width} mm</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Height</TableCell>
                <TableCell>{spec.dimensions.height} mm</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Internal Volume</TableCell>
                <TableCell className="font-semibold">{spec.volume} m³</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Capacity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Capacity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Cooling Capacity</TableCell>
                <TableCell>{spec.coolingCapacity} kW</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Heating Capacity</TableCell>
                <TableCell>{spec.heatingCapacity} kW</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* UV System */}
      {spec.uvLedCount > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">UV System</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">LED Count</TableCell>
                  <TableCell>{spec.uvLedCount}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Total UV Power</TableCell>
                  <TableCell>{spec.uvPower} kW</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Features */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {spec.features.map((f, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {f}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Cost (Lakhs)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {spec.estimatedCost.items.map((item, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{item.item}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {item.description}
                  </TableCell>
                  <TableCell className="text-right">
                    {"\u20b9"}{item.cost.toFixed(1)}L
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold">
                <TableCell colSpan={2}>Total</TableCell>
                <TableCell className="text-right">
                  {"\u20b9"}{spec.estimatedCost.totalLakhs.toFixed(1)}L
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={2} className="text-muted-foreground">
                  Total in INR
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {"\u20b9"}{spec.estimatedCost.totalINR.toLocaleString("en-IN")}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
