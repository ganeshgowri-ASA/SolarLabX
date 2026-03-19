"use client"

import React, { useState, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Grid3X3, Camera, Printer, Activity, Tag } from "lucide-react"
import { OMRBubbleMatrix } from "./OMRBubbleMatrix"
import { OMRPhotoScanner } from "./OMRPhotoScanner"
import { OMRPrintable } from "./OMRPrintable"
import { OMRMonitoring } from "./OMRMonitoring"
import { NomenclatureEngine } from "./NomenclatureEngine"
import { mockOMRRouteCardsV2 } from "@/lib/data/omr-route-card-v2-data"
import type { OMRBubbleEntry, OMRRouteCardV2, ScannedBubbleResult } from "@/lib/data/omr-route-card-v2-data"

// ============================================================================
// Route Card OMR V2 - Main Tab Container
// Replaces the old RouteCardOMRTab with professional OMR-style tracking
// ============================================================================

export function RouteCardOMRTab() {
  const [cards, setCards] = useState<OMRRouteCardV2[]>(mockOMRRouteCardsV2)
  const [selectedCardId, setSelectedCardId] = useState<string>(cards[0]?.id || "")
  const [activeSubTab, setActiveSubTab] = useState("matrix")

  const selectedCard = cards.find((c) => c.id === selectedCardId) || cards[0]

  const handleMatrixChange = useCallback(
    (updatedMatrix: OMRBubbleEntry[]) => {
      setCards((prev) =>
        prev.map((c) =>
          c.id === selectedCardId
            ? { ...c, bubbleMatrix: updatedMatrix, updatedAt: new Date().toISOString() }
            : c
        )
      )
    },
    [selectedCardId]
  )

  const handleScanComplete = useCallback(
    (results: ScannedBubbleResult[]) => {
      setCards((prev) =>
        prev.map((c) => {
          if (c.id !== selectedCardId) return c
          const updated = c.bubbleMatrix.map((entry) => {
            const scanned = results.find(
              (r) =>
                r.routineTest === entry.routineTest &&
                r.acceleratedTest === entry.acceleratedTest &&
                r.detectedStatus !== "empty"
            )
            if (scanned) {
              return {
                ...entry,
                status: scanned.detectedStatus,
                date: new Date().toISOString().split("T")[0],
              }
            }
            return entry
          })
          return { ...c, bubbleMatrix: updated, updatedAt: new Date().toISOString() }
        })
      )
    },
    [selectedCardId]
  )

  return (
    <div className="space-y-4">
      {/* Module Selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Module:</span>
        <Select value={selectedCardId} onValueChange={setSelectedCardId}>
          <SelectTrigger className="w-[350px]">
            <SelectValue placeholder="Select module" />
          </SelectTrigger>
          <SelectContent>
            {cards.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                <span className="font-mono font-bold">{c.moduleId}</span>
                <span className="text-muted-foreground ml-2">&mdash; {c.client}</span>
                <span className="text-muted-foreground ml-2">({c.standard})</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sub-tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="matrix" className="flex items-center gap-1.5 text-xs">
            <Grid3X3 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Bubble Matrix</span>
            <span className="sm:hidden">Matrix</span>
          </TabsTrigger>
          <TabsTrigger value="scan" className="flex items-center gap-1.5 text-xs">
            <Camera className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Photo Scan</span>
            <span className="sm:hidden">Scan</span>
          </TabsTrigger>
          <TabsTrigger value="print" className="flex items-center gap-1.5 text-xs">
            <Printer className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Printable</span>
            <span className="sm:hidden">Print</span>
          </TabsTrigger>
          <TabsTrigger value="monitor" className="flex items-center gap-1.5 text-xs">
            <Activity className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Monitoring</span>
            <span className="sm:hidden">Monitor</span>
          </TabsTrigger>
          <TabsTrigger value="nomenclature" className="flex items-center gap-1.5 text-xs">
            <Tag className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Nomenclature</span>
            <span className="sm:hidden">Names</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="matrix">
          {selectedCard && (
            <OMRBubbleMatrix card={selectedCard} onMatrixChange={handleMatrixChange} />
          )}
        </TabsContent>

        <TabsContent value="scan">
          {selectedCard && (
            <OMRPhotoScanner card={selectedCard} onScanComplete={handleScanComplete} />
          )}
        </TabsContent>

        <TabsContent value="print">
          {selectedCard && <OMRPrintable card={selectedCard} />}
        </TabsContent>

        <TabsContent value="monitor">
          <OMRMonitoring cards={cards} />
        </TabsContent>

        <TabsContent value="nomenclature">
          <NomenclatureEngine cards={cards} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
