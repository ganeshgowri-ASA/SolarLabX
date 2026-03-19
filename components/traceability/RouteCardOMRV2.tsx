"use client"

import React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Grid3X3,
  ScanLine,
  Printer,
  Activity,
  Tag,
  ClipboardCheck,
} from "lucide-react"
import { RouteCardOMRTab } from "./RouteCardOMR"
import { OMRBubbleMatrix } from "./OMRBubbleMatrix"
import { OMRPhotoScanner } from "./OMRPhotoScanner"
import { OMRPrintable } from "./OMRPrintable"
import { OMRMonitoring } from "./OMRMonitoring"
import { NomenclatureEngine } from "./NomenclatureEngine"

// ============================================================================
// Enhanced Route Card System V2 - Tabbed wrapper
// ============================================================================

export function RouteCardOMRV2() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Enhanced Route Card System</h2>
        <p className="text-sm text-muted-foreground">
          OMR-based route cards with bubble matrix, photo scanning, monitoring, and ISO nomenclature
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-1.5 text-xs">
            <ClipboardCheck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="matrix" className="flex items-center gap-1.5 text-xs">
            <Grid3X3 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Matrix</span>
          </TabsTrigger>
          <TabsTrigger value="scanner" className="flex items-center gap-1.5 text-xs">
            <ScanLine className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Scanner</span>
          </TabsTrigger>
          <TabsTrigger value="print" className="flex items-center gap-1.5 text-xs">
            <Printer className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Print</span>
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-1.5 text-xs">
            <Activity className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Monitor</span>
          </TabsTrigger>
          <TabsTrigger value="nomenclature" className="flex items-center gap-1.5 text-xs">
            <Tag className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Naming</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <RouteCardOMRTab />
        </TabsContent>

        <TabsContent value="matrix" className="mt-4">
          <OMRBubbleMatrix />
        </TabsContent>

        <TabsContent value="scanner" className="mt-4">
          <OMRPhotoScanner />
        </TabsContent>

        <TabsContent value="print" className="mt-4">
          <OMRPrintable />
        </TabsContent>

        <TabsContent value="monitoring" className="mt-4">
          <OMRMonitoring />
        </TabsContent>

        <TabsContent value="nomenclature" className="mt-4">
          <NomenclatureEngine />
        </TabsContent>
      </Tabs>
    </div>
  )
}
