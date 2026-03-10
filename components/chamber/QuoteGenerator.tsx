// @ts-nocheck
"use client";

import React from "react";
import type { ChamberSpec } from "@/lib/chamber";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Building2, Calendar } from "lucide-react";

interface QuoteGeneratorProps {
  spec: ChamberSpec;
  customerName: string;
}

export default function QuoteGenerator({ spec, customerName }: QuoteGeneratorProps) {
  const subtotal = spec.estimatedCost.totalLakhs;
  const gst = Math.round(subtotal * 0.18 * 10) / 10;
  const grandTotal = Math.round((subtotal + gst) * 10) / 10;
  const grandTotalINR = grandTotal * 100000;

  const today = new Date();
  const quoteDate = today.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const validUntil = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(
    "en-IN",
    { year: "numeric", month: "long", day: "numeric" }
  );

  const deliveryWeeks = spec.uvLedCount > 0 ? "16-20" : "12-16";

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            <CardTitle>Quotation Summary</CardTitle>
          </div>
          <Badge variant="outline">Draft</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Company Header */}
        <div className="flex items-start justify-between border-b pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-bold">SolarLabX Engineering</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Environmental Test Chamber Solutions
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              ISO 9001:2015 Certified | ISO 17025 Compliant Equipment
            </p>
          </div>
          <div className="text-right text-sm">
            <p className="font-medium">Quote #{spec.id.slice(-6)}</p>
            <p className="text-muted-foreground">{quoteDate}</p>
          </div>
        </div>

        {/* Customer & Chamber Info */}
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground mb-1">Customer</p>
            <p className="font-medium">{customerName}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Configuration</p>
            <p className="font-medium">{spec.name}</p>
            <p className="text-xs text-muted-foreground">
              {spec.dimensions.length} x {spec.dimensions.width} x{" "}
              {spec.dimensions.height} mm | {spec.volume} m³
            </p>
          </div>
        </div>

        {/* Line Items */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">#</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount (Lakhs)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {spec.estimatedCost.items.map((item, i) => (
              <TableRow key={i}>
                <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                <TableCell className="font-medium">{item.item}</TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {item.description}
                </TableCell>
                <TableCell className="text-right">
                  {"\u20b9"}{item.cost.toFixed(1)}L
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3} className="font-medium">
                Subtotal
              </TableCell>
              <TableCell className="text-right font-medium">
                {"\u20b9"}{subtotal.toFixed(1)}L
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={3} className="text-muted-foreground">
                GST @ 18%
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {"\u20b9"}{gst.toFixed(1)}L
              </TableCell>
            </TableRow>
            <TableRow className="text-lg">
              <TableCell colSpan={3} className="font-bold">
                Grand Total
              </TableCell>
              <TableCell className="text-right font-bold">
                {"\u20b9"}{grandTotal.toFixed(1)}L
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={3} className="text-muted-foreground">
                Grand Total in INR
              </TableCell>
              <TableCell className="text-right font-semibold">
                {"\u20b9"}{grandTotalINR.toLocaleString("en-IN")}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>

        {/* Terms & Conditions */}
        <div className="space-y-3 text-sm border-t pt-4">
          <h4 className="font-semibold">Terms and Conditions</h4>
          <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>Payment: 40% advance, 50% before dispatch, 10% after commissioning</li>
            <li>
              Delivery: {deliveryWeeks} weeks from receipt of confirmed order and advance
              payment
            </li>
            <li>Warranty: 12 months from date of commissioning or 18 months from dispatch, whichever is earlier</li>
            <li>Installation and commissioning included at customer site within India</li>
            <li>IQ/OQ/PQ qualification documentation provided</li>
            <li>Annual Maintenance Contract available at 5% of equipment cost per annum</li>
            <li>Prices valid for 30 days from quote date</li>
          </ul>
        </div>

        {/* Delivery Timeline */}
        <div className="flex items-center gap-2 text-sm bg-muted/50 p-3 rounded-lg">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="font-medium">Estimated Delivery:</span>
          <span className="text-muted-foreground">
            {deliveryWeeks} weeks from order confirmation
          </span>
          <span className="text-muted-foreground mx-2">|</span>
          <span className="font-medium">Quote Valid Until:</span>
          <span className="text-muted-foreground">{validUntil}</span>
        </div>
      </CardContent>
    </Card>
  );
}
