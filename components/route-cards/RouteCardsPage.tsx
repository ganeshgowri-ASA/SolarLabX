'use client'

import { useState, useCallback } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { cn, formatDate, getStatusColor } from '@/lib/utils'
import { mockRouteCards, routeCardTemplates, type RouteCard, type RouteCardStation } from '@/lib/data/route-card-data'
import BarcodeGenerator from '@/components/lims/labels/BarcodeGenerator'
import {
  ClipboardList,
  ChevronRight,
  ChevronDown,
  Check,
  Circle,
  Loader2,
  SkipForward,
  Printer,
  Plus,
  QrCode,
  User,
  Calendar,
  MapPin,
  AlertTriangle,
  FileText,
  ArrowRight,
} from 'lucide-react'

const statusIcons: Record<string, React.ElementType> = {
  completed: Check,
  in_progress: Loader2,
  pending: Circle,
  skipped: SkipForward,
}

const statusColors: Record<string, string> = {
  completed: 'text-green-500',
  in_progress: 'text-blue-500 animate-spin',
  pending: 'text-muted-foreground',
  skipped: 'text-yellow-500',
}

const statusBg: Record<string, string> = {
  completed: 'bg-green-500/10 border-green-500/30',
  in_progress: 'bg-blue-500/10 border-blue-500/30',
  pending: 'bg-muted border-border',
  skipped: 'bg-yellow-500/10 border-yellow-500/30',
}

const priorityColors: Record<string, string> = {
  low: 'bg-blue-100 text-blue-700',
  normal: 'bg-green-100 text-green-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
}

export default function RouteCardsPage() {
  const [routeCards, setRouteCards] = useState<RouteCard[]>(mockRouteCards)
  const [selectedCard, setSelectedCard] = useState<string | null>(mockRouteCards[0]?.id || null)
  const [expandedStations, setExpandedStations] = useState<Set<string>>(new Set())
  const [showNewCardForm, setShowNewCardForm] = useState(false)

  const activeCard = routeCards.find(rc => rc.id === selectedCard)

  const toggleStation = (stationId: string) => {
    setExpandedStations(prev => {
      const next = new Set(prev)
      if (next.has(stationId)) next.delete(stationId)
      else next.add(stationId)
      return next
    })
  }

  const toggleChecklist = useCallback((cardId: string, stationIdx: number, checkIdx: number) => {
    setRouteCards(prev => prev.map(card => {
      if (card.id !== cardId) return card
      const stations = card.stations.map((st, si) => {
        if (si !== stationIdx) return st
        const checklist = st.checklist.map((item, ci) => {
          if (ci !== checkIdx) return item
          return { ...item, completed: !item.completed }
        })
        const allDone = checklist.every(c => c.completed)
        const anyDone = checklist.some(c => c.completed)
        return {
          ...st,
          checklist,
          status: allDone ? 'completed' as const : anyDone ? 'in_progress' as const : st.status,
        }
      })
      return { ...card, stations }
    }))
  }, [])

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print()
  }

  const getProgress = (card: RouteCard) => {
    const completed = card.stations.filter(s => s.status === 'completed').length
    return { completed, total: card.stations.length, pct: Math.round((completed / card.stations.length) * 100) }
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Route Cards</h1>
          <p className="text-sm text-muted-foreground">
            Digital test route cards with QR codes, checklists, and audit trail
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            disabled={!activeCard}
            className="flex items-center gap-2 px-4 py-2 text-sm border rounded-md hover:bg-accent disabled:opacity-50 transition-colors"
          >
            <Printer className="h-4 w-4" />
            Print Route Card
          </button>
          <button
            onClick={() => setShowNewCardForm(!showNewCardForm)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Route Card
          </button>
        </div>
      </div>

      {/* New Card Template Selector */}
      {showNewCardForm && (
        <div className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-semibold mb-3">Select Route Card Template</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {routeCardTemplates.map(tpl => (
              <button
                key={tpl.id}
                onClick={() => setShowNewCardForm(false)}
                className="flex items-start gap-3 p-3 border rounded-lg text-left hover:border-primary/50 transition-colors"
              >
                <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium">{tpl.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {tpl.standard} - {tpl.stations.length} stations
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Route Card List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">Active Route Cards</h3>
          {routeCards.map(card => {
            const progress = getProgress(card)
            const isActive = selectedCard === card.id
            return (
              <button
                key={card.id}
                onClick={() => {
                  setSelectedCard(card.id)
                  setExpandedStations(new Set())
                }}
                className={cn(
                  'w-full text-left p-4 rounded-lg border transition-all',
                  isActive ? 'border-primary bg-primary/5' : 'bg-card hover:border-primary/50'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold font-mono">{card.id}</span>
                  <span className={cn('text-xs px-2 py-0.5 rounded', priorityColors[card.priority])}>
                    {card.priority}
                  </span>
                </div>
                <div className="text-sm font-medium truncate">{card.sampleName}</div>
                <div className="text-xs text-muted-foreground">{card.clientName}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-primary">{card.standard}</span>
                  <span className="text-xs text-muted-foreground">|</span>
                  <span className="text-xs text-muted-foreground">{card.sampleId}</span>
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{progress.completed}/{progress.total}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${progress.pct}%` }}
                    />
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Route Card Detail */}
        <div className="lg:col-span-2">
          {activeCard ? (
            <div className="space-y-4 print:space-y-2">
              {/* Card Header */}
              <div className="rounded-lg border bg-card p-4 print:border-black">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <ClipboardList className="h-5 w-5 text-primary" />
                      <h2 className="text-lg font-bold">Route Card: {activeCard.id}</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Sample:</span>
                        <span className="font-mono font-medium">{activeCard.sampleId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Standard:</span>
                        <span className="font-medium text-primary">{activeCard.standard}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Module:</span>
                        <span>{activeCard.sampleName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Client:</span>
                        <span>{activeCard.clientName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Created:</span>
                        <span>{formatDate(activeCard.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Priority:</span>
                        <span className={cn('text-xs px-2 py-0.5 rounded', priorityColors[activeCard.priority])}>
                          {activeCard.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2 shrink-0 ml-4">
                    <div className="bg-white p-2 rounded-lg">
                      <QRCodeSVG value={`${baseUrl}/route-cards/${activeCard.id}`} size={80} />
                    </div>
                    <div className="text-xs font-mono text-muted-foreground">{activeCard.id}</div>
                  </div>
                </div>
              </div>

              {/* Progress Overview */}
              <div className="flex items-center gap-1 overflow-x-auto pb-2">
                {activeCard.stations.map((station, idx) => {
                  const StatusIcon = statusIcons[station.status] || Circle
                  return (
                    <div key={station.id} className="flex items-center shrink-0">
                      <div
                        className={cn(
                          'flex items-center gap-1 px-2 py-1 rounded text-xs border',
                          statusBg[station.status]
                        )}
                      >
                        <StatusIcon className={cn('h-3 w-3', statusColors[station.status])} />
                        <span className="whitespace-nowrap">{station.stationName}</span>
                      </div>
                      {idx < activeCard.stations.length - 1 && (
                        <ArrowRight className="h-3 w-3 text-muted-foreground mx-0.5 shrink-0" />
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Station Details */}
              <div className="space-y-2">
                {activeCard.stations.map((station, stationIdx) => {
                  const isExpanded = expandedStations.has(station.id)
                  const StatusIcon = statusIcons[station.status] || Circle
                  const completedItems = station.checklist.filter(c => c.completed).length
                  return (
                    <div
                      key={station.id}
                      className={cn(
                        'rounded-lg border transition-all print:break-inside-avoid',
                        statusBg[station.status]
                      )}
                    >
                      <button
                        onClick={() => toggleStation(station.id)}
                        className="w-full flex items-center gap-3 p-3 text-left"
                      >
                        <div className={cn(
                          'flex items-center justify-center w-8 h-8 rounded-full border-2',
                          station.status === 'completed' ? 'bg-green-500 border-green-500 text-white' :
                          station.status === 'in_progress' ? 'bg-blue-500 border-blue-500 text-white' :
                          'bg-muted border-border text-muted-foreground'
                        )}>
                          <span className="text-xs font-bold">{stationIdx + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{station.stationName}</span>
                            <span className="text-xs text-muted-foreground">- {station.testName}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                            {station.standard && <span>{station.standard}</span>}
                            <span>{completedItems}/{station.checklist.length} items</span>
                            {station.operator && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {station.operator}
                              </span>
                            )}
                            {station.signOffDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(station.signOffDate)}
                              </span>
                            )}
                          </div>
                        </div>
                        {isExpanded ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                      </button>

                      {isExpanded && (
                        <div className="px-3 pb-3 ml-11">
                          <div className="space-y-1.5">
                            {station.checklist.map((item, checkIdx) => (
                              <label
                                key={checkIdx}
                                className="flex items-center gap-2 cursor-pointer group"
                              >
                                <input
                                  type="checkbox"
                                  checked={item.completed}
                                  onChange={() => toggleChecklist(activeCard.id, stationIdx, checkIdx)}
                                  className="rounded border-border"
                                />
                                <span className={cn(
                                  'text-sm transition-colors',
                                  item.completed ? 'line-through text-muted-foreground' : 'group-hover:text-primary'
                                )}>
                                  {item.item}
                                </span>
                              </label>
                            ))}
                          </div>
                          {station.equipmentUsed && (
                            <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              Equipment: {station.equipmentUsed}
                            </div>
                          )}
                          {station.notes && (
                            <div className="mt-1 text-xs text-muted-foreground">
                              Notes: {station.notes}
                            </div>
                          )}
                          {/* Sign-off area */}
                          {station.status !== 'completed' && station.status !== 'skipped' && (
                            <div className="mt-3 pt-2 border-t border-dashed">
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  placeholder="Operator name..."
                                  className="px-2 py-1 text-xs border rounded bg-background flex-1"
                                />
                                <button className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors">
                                  Sign Off
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Audit Trail */}
              <div className="rounded-lg border bg-card p-4 print:border-black">
                <h3 className="text-sm font-semibold mb-3">Audit Trail</h3>
                <div className="space-y-2 text-xs">
                  {activeCard.stations
                    .filter(s => s.signOffDate)
                    .map((station, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-muted-foreground">{formatDate(station.signOffDate!)}</span>
                        <span className="font-medium">{station.operator}</span>
                        <span className="text-muted-foreground">signed off</span>
                        <span className="font-medium text-primary">{station.stationName}</span>
                      </div>
                    ))}
                  {activeCard.stations.filter(s => s.signOffDate).length === 0 && (
                    <div className="text-muted-foreground">No audit entries yet</div>
                  )}
                </div>
              </div>

              {/* Print Footer with Barcode */}
              <div className="hidden print:block rounded-lg border border-black p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold">SOLARLABX - Digital Route Card</div>
                    <div className="text-xs">Printed: {formatDate(new Date())}</div>
                  </div>
                  <BarcodeGenerator value={activeCard.id} height={30} width={1.2} showDownload={false} />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm">Select a route card to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
