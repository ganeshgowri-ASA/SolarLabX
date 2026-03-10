// @ts-nocheck
"use client";

import { useState } from "react";
import { testSequences, retestRules } from "@/lib/data/iec-guidelines-data";
import { ChangeClassification, TestSequenceGroup } from "@/lib/types/iec-guidelines";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const classificationStyles: Record<ChangeClassification, string> = {
  Major: "bg-red-100 text-red-700",
  Minor: "bg-yellow-100 text-yellow-700",
  "No Impact": "bg-green-100 text-green-700",
};

const groupColors: Record<TestSequenceGroup, string> = {
  A: "bg-blue-100 text-blue-700",
  B: "bg-purple-100 text-purple-700",
  C: "bg-orange-100 text-orange-700",
  D: "bg-emerald-100 text-emerald-700",
  E: "bg-red-100 text-red-700",
};

const wizardSteps = [
  { id: 1, title: "Module Type", description: "Select the PV module technology" },
  { id: 2, title: "Change Category", description: "Identify the type of BoM change" },
  { id: 3, title: "Change Details", description: "Describe the specific change" },
  { id: 4, title: "Impact Assessment", description: "Review classification and required retests" },
];

export default function IECGuidelinesClient() {
  const [selectedStandard, setSelectedStandard] = useState<string>("all");
  const [selectedModuleType, setSelectedModuleType] = useState<string>("all");
  const [searchFilter, setSearchFilter] = useState("");

  // Wizard state
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardModuleType, setWizardModuleType] = useState("");
  const [wizardChangeCategory, setWizardChangeCategory] = useState("");
  const [wizardChangeDescription, setWizardChangeDescription] = useState("");

  const filteredSequences = testSequences.filter((seq) => {
    if (selectedStandard !== "all" && seq.standard !== selectedStandard) return false;
    if (selectedModuleType !== "all" && !seq.moduleTypes.includes(selectedModuleType)) return false;
    return true;
  });

  const filteredRules = retestRules.filter((rule) => {
    if (searchFilter && !rule.changeCategory.toLowerCase().includes(searchFilter.toLowerCase()) && !rule.changeDescription.toLowerCase().includes(searchFilter.toLowerCase())) return false;
    return true;
  });

  const selectedRule = retestRules.find((r) => r.changeCategory === wizardChangeCategory);

  const majorCount = retestRules.filter((r) => r.classification === "Major").length;
  const minorCount = retestRules.filter((r) => r.classification === "Minor").length;
  const noImpactCount = retestRules.filter((r) => r.classification === "No Impact").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">IEC 62915 Guidelines</h1>
          <p className="text-sm text-muted-foreground">
            Type test guideline implementation, test sequences, and retesting rules per IEC 62915:2018
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success("Guidelines exported as PDF")}>
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Test Sequences</p>
            <p className="text-2xl font-bold text-primary mt-1">{testSequences.length}</p>
            <p className="text-xs text-muted-foreground">A through E</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Retest Rules</p>
            <p className="text-2xl font-bold text-foreground mt-1">{retestRules.length}</p>
            <p className="text-xs text-muted-foreground">change categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Major Changes</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{majorCount}</p>
            <p className="text-xs text-muted-foreground">full retest required</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Minor Changes</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{minorCount}</p>
            <p className="text-xs text-muted-foreground">partial retest</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">No Impact</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{noImpactCount}</p>
            <p className="text-xs text-muted-foreground">no retest needed</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="sequences" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sequences">Test Sequences</TabsTrigger>
          <TabsTrigger value="retest-rules">Retest Rules</TabsTrigger>
          <TabsTrigger value="classification">Change Classification</TabsTrigger>
          <TabsTrigger value="wizard">Guideline Wizard</TabsTrigger>
        </TabsList>

        {/* Test Sequences Tab */}
        <TabsContent value="sequences">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Select value={selectedStandard} onValueChange={setSelectedStandard}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Standard" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Standards</SelectItem>
                  <SelectItem value="IEC 61215">IEC 61215</SelectItem>
                  <SelectItem value="IEC 61730">IEC 61730</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedModuleType} onValueChange={setSelectedModuleType}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Module Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Module Types</SelectItem>
                  <SelectItem value="Crystalline Si">Crystalline Si</SelectItem>
                  <SelectItem value="Thin Film">Thin Film</SelectItem>
                  <SelectItem value="Bifacial">Bifacial</SelectItem>
                  <SelectItem value="HJT">HJT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredSequences.map((seq) => (
              <Card key={seq.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={cn(groupColors[seq.group])}>{seq.group}</Badge>
                      <CardTitle className="text-sm">{seq.name}</CardTitle>
                    </div>
                    <Badge variant="outline">{seq.standard}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{seq.description}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {seq.moduleTypes.map((mt) => (
                      <Badge key={mt} variant="secondary" className="text-[10px]">{mt}</Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60px]">Order</TableHead>
                        <TableHead className="w-[80px]">Code</TableHead>
                        <TableHead>Test Name</TableHead>
                        <TableHead className="w-[100px]">Duration</TableHead>
                        <TableHead className="w-[120px]">Prerequisite</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {seq.tests.map((test) => (
                        <TableRow key={test.id}>
                          <TableCell className="text-center">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                              {test.order}
                            </span>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{test.mqtCode}</TableCell>
                          <TableCell>
                            <p className="text-sm font-medium">{test.name}</p>
                            <p className="text-xs text-muted-foreground">{test.description}</p>
                          </TableCell>
                          <TableCell className="text-sm">{test.duration}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{test.prerequisite || "None"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Retest Rules Tab */}
        <TabsContent value="retest-rules">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">IEC 62915 Retesting Rules</CardTitle>
                <Input
                  placeholder="Search changes..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-[250px]"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Rules governing which tests must be repeated when Bill of Materials changes occur
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Change Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[100px]">Classification</TableHead>
                    <TableHead>Affected Tests</TableHead>
                    <TableHead className="w-[120px]">Retest Sequences</TableHead>
                    <TableHead className="w-[180px]">IEC Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium text-sm">{rule.changeCategory}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[250px]">{rule.changeDescription}</TableCell>
                      <TableCell>
                        <Badge className={cn(classificationStyles[rule.classification], "text-xs")}>
                          {rule.classification}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {rule.affectedTests.length > 0 ? (
                            rule.affectedTests.map((t) => (
                              <Badge key={t} variant="outline" className="text-[10px] font-mono">{t}</Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">None</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {rule.retestSequences.length > 0 ? (
                            rule.retestSequences.map((s) => (
                              <Badge key={s} className={cn(groupColors[s as TestSequenceGroup], "text-[10px]")}>{s}</Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">None</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{rule.iecReference}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Change Classification Matrix Tab */}
        <TabsContent value="classification">
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Change Classification Matrix</CardTitle>
                <p className="text-xs text-muted-foreground">
                  IEC 62915 defines three levels of change impact on type test qualification
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-red-200">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-500" />
                        <CardTitle className="text-sm text-red-700">Major Change</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Changes that significantly alter module performance, reliability, or safety characteristics.
                        Full or extensive retest sequences are required.
                      </p>
                      <div className="space-y-1">
                        {retestRules.filter((r) => r.classification === "Major").map((r) => (
                          <div key={r.id} className="flex items-center gap-2 text-xs">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                            <span>{r.changeCategory}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-yellow-200">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-yellow-500" />
                        <CardTitle className="text-sm text-yellow-700">Minor Change</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Changes with limited impact on module characteristics. Only specific test sequences
                        need to be repeated.
                      </p>
                      <div className="space-y-1">
                        {retestRules.filter((r) => r.classification === "Minor").map((r) => (
                          <div key={r.id} className="flex items-center gap-2 text-xs">
                            <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 shrink-0" />
                            <span>{r.changeCategory}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                        <CardTitle className="text-sm text-green-700">No Impact</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Changes that do not affect module qualification status. No retesting is required.
                      </p>
                      <div className="space-y-1">
                        {retestRules.filter((r) => r.classification === "No Impact").map((r) => (
                          <div key={r.id} className="flex items-center gap-2 text-xs">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-400 shrink-0" />
                            <span>{r.changeCategory}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Sequence-to-Change Mapping */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Test Sequence Selection Matrix</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Which test sequences are required for each type of BoM change
                </p>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Change Category</TableHead>
                      <TableHead className="text-center w-[60px]">Seq A</TableHead>
                      <TableHead className="text-center w-[60px]">Seq B</TableHead>
                      <TableHead className="text-center w-[60px]">Seq C</TableHead>
                      <TableHead className="text-center w-[60px]">Seq D</TableHead>
                      <TableHead className="text-center w-[60px]">Seq E</TableHead>
                      <TableHead className="w-[100px]">Classification</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {retestRules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-medium text-sm">{rule.changeCategory}</TableCell>
                        {(["A", "B", "C", "D", "E"] as TestSequenceGroup[]).map((seq) => (
                          <TableCell key={seq} className="text-center">
                            {rule.retestSequences.includes(seq) ? (
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px]">
                                &#10003;
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs">-</span>
                            )}
                          </TableCell>
                        ))}
                        <TableCell>
                          <Badge className={cn(classificationStyles[rule.classification], "text-[10px]")}>
                            {rule.classification}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Guideline Wizard Tab */}
        <TabsContent value="wizard">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">IEC 62915 Change Impact Wizard</CardTitle>
              <p className="text-xs text-muted-foreground">
                Step-by-step guide to determine retesting requirements for BoM changes
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-6">
                {wizardSteps.map((step, idx) => (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-colors",
                          wizardStep >= step.id
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-muted-foreground border-muted"
                        )}
                      >
                        {wizardStep > step.id ? "✓" : step.id}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 text-center w-20">{step.title}</p>
                    </div>
                    {idx < wizardSteps.length - 1 && (
                      <div className={cn("h-0.5 w-12 mx-2 mb-4", wizardStep > step.id ? "bg-primary" : "bg-muted")} />
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Module Type */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Select PV Module Technology</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {["Crystalline Si", "Thin Film", "Bifacial", "HJT"].map((type) => (
                      <Button
                        key={type}
                        variant={wizardModuleType === type ? "default" : "outline"}
                        className="h-auto py-4 flex flex-col gap-1"
                        onClick={() => setWizardModuleType(type)}
                      >
                        <span className="text-sm font-medium">{type}</span>
                      </Button>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={() => setWizardStep(2)}
                      disabled={!wizardModuleType}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Change Category */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Select Change Category</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {retestRules.map((rule) => (
                      <Button
                        key={rule.id}
                        variant={wizardChangeCategory === rule.changeCategory ? "default" : "outline"}
                        className="h-auto py-3 flex flex-col items-start gap-1 text-left"
                        onClick={() => setWizardChangeCategory(rule.changeCategory)}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <span className="text-sm font-medium">{rule.changeCategory}</span>
                          <Badge className={cn(classificationStyles[rule.classification], "text-[10px] ml-auto")}>
                            {rule.classification}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground font-normal">{rule.changeDescription}</span>
                      </Button>
                    ))}
                  </div>
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setWizardStep(1)}>Back</Button>
                    <Button
                      onClick={() => setWizardStep(3)}
                      disabled={!wizardChangeCategory}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Change Details */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Describe the Specific Change</Label>
                  <Input
                    placeholder="e.g., EVA 0.45mm to POE 0.45mm from same supplier"
                    value={wizardChangeDescription}
                    onChange={(e) => setWizardChangeDescription(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Provide details about the old and new component specifications
                  </p>
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setWizardStep(2)}>Back</Button>
                    <Button
                      onClick={() => setWizardStep(4)}
                      disabled={!wizardChangeDescription}
                    >
                      Assess Impact
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Impact Assessment */}
              {wizardStep === 4 && selectedRule && (
                <div className="space-y-4">
                  <Card className={cn(
                    "border-2",
                    selectedRule.classification === "Major" ? "border-red-300" :
                    selectedRule.classification === "Minor" ? "border-yellow-300" : "border-green-300"
                  )}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Impact Assessment Result</CardTitle>
                        <Badge className={cn(classificationStyles[selectedRule.classification], "text-sm px-3 py-1")}>
                          {selectedRule.classification}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Module Type</p>
                          <p className="text-sm font-medium mt-1">{wizardModuleType}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Change Category</p>
                          <p className="text-sm font-medium mt-1">{selectedRule.changeCategory}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Change Description</p>
                          <p className="text-sm mt-1">{wizardChangeDescription}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Rationale</p>
                        <p className="text-sm text-muted-foreground">{selectedRule.rationale}</p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Required Retest Sequences</p>
                        {selectedRule.retestSequences.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {selectedRule.retestSequences.map((s) => {
                              const seq = testSequences.find((ts) => ts.group === s);
                              return (
                                <Badge key={s} className={cn(groupColors[s as TestSequenceGroup], "text-xs px-3 py-1")}>
                                  Sequence {s}: {seq?.name.split(" - ")[1] || s}
                                </Badge>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-green-600">No retesting required</p>
                        )}
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Affected Tests</p>
                        {selectedRule.affectedTests.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {selectedRule.affectedTests.map((t) => (
                              <Badge key={t} variant="outline" className="text-[10px] font-mono">{t}</Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-green-600">No tests affected</p>
                        )}
                      </div>

                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          Reference: {selectedRule.iecReference}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setWizardStep(3)}>Back</Button>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setWizardStep(1);
                          setWizardModuleType("");
                          setWizardChangeCategory("");
                          setWizardChangeDescription("");
                        }}
                      >
                        Start Over
                      </Button>
                      <Button onClick={() => {
                        toast.success("Assessment saved. You can create a BoM change record from the BoM Changes dashboard.");
                      }}>
                        Save Assessment
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
