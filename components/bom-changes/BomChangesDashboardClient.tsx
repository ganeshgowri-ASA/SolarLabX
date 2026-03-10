"use client";

import { useState } from "react";
import { bomChanges, bomComponents, retestRules } from "@/lib/data/iec-guidelines-data";
import { BomChange, ChangeClassification, TestSequenceGroup } from "@/lib/types/iec-guidelines";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const classificationStyles: Record<ChangeClassification, string> = {
  Major: "bg-red-100 text-red-700",
  Minor: "bg-yellow-100 text-yellow-700",
  "No Impact": "bg-green-100 text-green-700",
};

const statusStyles: Record<string, string> = {
  Pending: "bg-gray-100 text-gray-700",
  "In Review": "bg-blue-100 text-blue-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

const groupColors: Record<TestSequenceGroup, string> = {
  A: "bg-blue-100 text-blue-700",
  B: "bg-purple-100 text-purple-700",
  C: "bg-orange-100 text-orange-700",
  D: "bg-emerald-100 text-emerald-700",
  E: "bg-red-100 text-red-700",
};

export default function BomChangesDashboardClient() {
  const [changes, setChanges] = useState<BomChange[]>(bomChanges);
  const [statusFilter, setStatusFilter] = useState("all");
  const [classificationFilter, setClassificationFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChange, setSelectedChange] = useState<BomChange | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const filteredChanges = changes.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (classificationFilter !== "all" && c.classification !== classificationFilter) return false;
    if (searchTerm && !c.componentName.toLowerCase().includes(searchTerm.toLowerCase()) && !c.category.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const pendingCount = changes.filter((c) => c.status === "Pending").length;
  const inReviewCount = changes.filter((c) => c.status === "In Review").length;
  const approvedCount = changes.filter((c) => c.status === "Approved").length;
  const rejectedCount = changes.filter((c) => c.status === "Rejected").length;
  const majorChanges = changes.filter((c) => c.classification === "Major").length;
  const retestRequired = changes.filter((c) => c.retestRequired && c.status !== "Rejected").length;

  const handleStatusChange = (changeId: string, newStatus: BomChange["status"]) => {
    setChanges((prev) =>
      prev.map((c) =>
        c.id === changeId
          ? {
              ...c,
              status: newStatus,
              reviewedBy: newStatus !== "Pending" ? "Dr. Meera Patel" : null,
              reviewedDate: newStatus !== "Pending" ? "2026-03-10" : null,
            }
          : c
      )
    );
    toast.success(`Change ${changeId} status updated to ${newStatus}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">BoM Change Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Bill of Materials change tracking and impact analysis per IEC 62915
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success("Change log exported")}>
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export
          </Button>
          <Button size="sm" onClick={() => toast.info("New BoM change form coming soon")}>
            + Log Change
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Changes</p>
            <p className="text-2xl font-bold text-primary mt-1">{changes.length}</p>
            <p className="text-xs text-muted-foreground">logged</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Pending</p>
            <p className="text-2xl font-bold text-gray-600 mt-1">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">In Review</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{inReviewCount}</p>
            <p className="text-xs text-muted-foreground">under assessment</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Approved</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{approvedCount}</p>
            <p className="text-xs text-muted-foreground">accepted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Major Changes</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{majorChanges}</p>
            <p className="text-xs text-muted-foreground">high impact</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Retest Required</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">{retestRequired}</p>
            <p className="text-xs text-muted-foreground">changes needing retest</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="changes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="changes">Change Log</TabsTrigger>
          <TabsTrigger value="components">BoM Components</TabsTrigger>
          <TabsTrigger value="impact">Impact Analysis</TabsTrigger>
          <TabsTrigger value="history">Approval History</TabsTrigger>
        </TabsList>

        {/* Change Log Tab */}
        <TabsContent value="changes">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-sm">BoM Change Log</CardTitle>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search component..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-[200px]"
                  />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In Review">In Review</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={classificationFilter} onValueChange={setClassificationFilter}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Classification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classifications</SelectItem>
                      <SelectItem value="Major">Major</SelectItem>
                      <SelectItem value="Minor">Minor</SelectItem>
                      <SelectItem value="No Impact">No Impact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Component</TableHead>
                    <TableHead>Change Type</TableHead>
                    <TableHead>Old Value</TableHead>
                    <TableHead>New Value</TableHead>
                    <TableHead className="w-[100px]">Classification</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-[100px]">Submitted</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredChanges.map((change) => (
                    <TableRow key={change.id} className="cursor-pointer" onClick={() => { setSelectedChange(change); setDetailOpen(true); }}>
                      <TableCell className="font-mono text-xs">{change.id}</TableCell>
                      <TableCell>
                        <p className="text-sm font-medium">{change.componentName}</p>
                        <p className="text-xs text-muted-foreground">{change.category}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">{change.changeType}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">{change.oldValue}</TableCell>
                      <TableCell className="text-xs max-w-[150px] truncate">{change.newValue}</TableCell>
                      <TableCell>
                        <Badge className={cn(classificationStyles[change.classification], "text-[10px]")}>
                          {change.classification}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(statusStyles[change.status], "text-[10px]")}>
                          {change.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{change.submittedDate}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); setSelectedChange(change); setDetailOpen(true); }}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BoM Components Tab */}
        <TabsContent value="components">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Current Bill of Materials</CardTitle>
              <p className="text-xs text-muted-foreground">
                Active component list for the qualified PV module design
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead className="w-[120px]">Category</TableHead>
                    <TableHead>Component</TableHead>
                    <TableHead>Specification</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead className="w-[140px]">Part Number</TableHead>
                    <TableHead className="w-[80px]">Changes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bomComponents.map((comp) => {
                    const changeCount = changes.filter((c) => c.componentId === comp.id).length;
                    return (
                      <TableRow key={comp.id}>
                        <TableCell className="font-mono text-xs">{comp.id}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[10px]">{comp.category}</Badge>
                        </TableCell>
                        <TableCell className="text-sm font-medium">{comp.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{comp.specification}</TableCell>
                        <TableCell className="text-xs">{comp.supplier}</TableCell>
                        <TableCell className="font-mono text-xs">{comp.partNumber}</TableCell>
                        <TableCell className="text-center">
                          {changeCount > 0 ? (
                            <Badge variant="outline" className="text-[10px]">{changeCount}</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Impact Analysis Tab */}
        <TabsContent value="impact">
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Impact Summary by Classification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-red-600">Major Changes</span>
                      <span className="text-sm text-muted-foreground">{majorChanges} of {changes.length}</span>
                    </div>
                    <Progress value={(majorChanges / changes.length) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-yellow-600">Minor Changes</span>
                      <span className="text-sm text-muted-foreground">{changes.filter((c) => c.classification === "Minor").length} of {changes.length}</span>
                    </div>
                    <Progress value={(changes.filter((c) => c.classification === "Minor").length / changes.length) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-green-600">No Impact</span>
                      <span className="text-sm text-muted-foreground">{changes.filter((c) => c.classification === "No Impact").length} of {changes.length}</span>
                    </div>
                    <Progress value={(changes.filter((c) => c.classification === "No Impact").length / changes.length) * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Retest Impact per Change</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Active changes requiring retesting and their affected test sequences
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {changes.filter((c) => c.retestRequired && c.status !== "Rejected").map((change) => {
                    const rule = retestRules.find((r) => r.iecReference === change.iecReference);
                    return (
                      <div key={change.id} className="flex items-start gap-3 p-3 rounded-lg border">
                        <Badge className={cn(classificationStyles[change.classification], "mt-0.5 shrink-0")}>
                          {change.classification}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{change.componentName}</p>
                            <Badge className={cn(statusStyles[change.status], "text-[10px]")}>{change.status}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {change.oldValue} → {change.newValue}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {change.affectedTests.map((t) => (
                              <Badge key={t} variant="outline" className="text-[10px] font-mono">{t}</Badge>
                            ))}
                          </div>
                          {rule && rule.retestSequences.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {rule.retestSequences.map((s) => (
                                <Badge key={s} className={cn(groupColors[s as TestSequenceGroup], "text-[10px]")}>
                                  Seq {s}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Approval History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Approval History</CardTitle>
              <p className="text-xs text-muted-foreground">
                Change review and approval timeline
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {changes
                  .sort((a, b) => b.submittedDate.localeCompare(a.submittedDate))
                  .map((change) => (
                    <div key={change.id} className="flex items-start gap-3 relative pl-6">
                      <div className="absolute left-0 top-1 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                      {change !== changes[changes.length - 1] && (
                        <div className="absolute left-[5px] top-4 h-full w-0.5 bg-border" />
                      )}
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium">{change.componentName}</p>
                          <Badge className={cn(classificationStyles[change.classification], "text-[10px]")}>
                            {change.classification}
                          </Badge>
                          <Badge className={cn(statusStyles[change.status], "text-[10px]")}>
                            {change.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {change.changeType}: {change.oldValue} → {change.newValue}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Submitted: {change.submittedDate} by {change.submittedBy}</span>
                          {change.reviewedBy && (
                            <span>Reviewed: {change.reviewedDate} by {change.reviewedBy}</span>
                          )}
                        </div>
                        {change.notes && (
                          <p className="text-xs mt-1 text-muted-foreground italic">{change.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Change Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>BoM Change Detail - {selectedChange?.id}</DialogTitle>
            <DialogDescription>
              Change record for {selectedChange?.componentName}
            </DialogDescription>
          </DialogHeader>
          {selectedChange && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Component</Label>
                  <p className="text-sm font-medium">{selectedChange.componentName}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Category</Label>
                  <p className="text-sm">{selectedChange.category}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Change Type</Label>
                  <Badge variant="outline" className="text-xs mt-1">{selectedChange.changeType}</Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Classification</Label>
                  <div className="mt-1">
                    <Badge className={cn(classificationStyles[selectedChange.classification])}>
                      {selectedChange.classification}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Old Value</Label>
                  <p className="text-sm text-muted-foreground">{selectedChange.oldValue}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">New Value</Label>
                  <p className="text-sm font-medium">{selectedChange.newValue}</p>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Affected Tests</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedChange.affectedTests.length > 0 ? (
                    selectedChange.affectedTests.map((t) => (
                      <Badge key={t} variant="outline" className="text-[10px] font-mono">{t}</Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">None</span>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Notes</Label>
                <p className="text-sm text-muted-foreground mt-1">{selectedChange.notes}</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Submitted: {selectedChange.submittedDate} by {selectedChange.submittedBy}</span>
                {selectedChange.reviewedBy && (
                  <span>Reviewed: {selectedChange.reviewedDate} by {selectedChange.reviewedBy}</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                IEC Reference: {selectedChange.iecReference}
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedChange && (selectedChange.status === "Pending" || selectedChange.status === "In Review") && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { handleStatusChange(selectedChange.id, "Rejected"); setDetailOpen(false); }}>
                  Reject
                </Button>
                {selectedChange.status === "Pending" && (
                  <Button variant="outline" size="sm" onClick={() => { handleStatusChange(selectedChange.id, "In Review"); setDetailOpen(false); }}>
                    Start Review
                  </Button>
                )}
                <Button size="sm" onClick={() => { handleStatusChange(selectedChange.id, "Approved"); setDetailOpen(false); }}>
                  Approve
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
