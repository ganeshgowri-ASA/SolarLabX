"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STANDARDS } from "@/lib/constants";

interface SOPFormProps {
  onGenerate: (params: SOPGenerateParams) => void;
  isGenerating: boolean;
}

export interface SOPGenerateParams {
  standard: string;
  clause: string;
  title: string;
  additionalContext: string;
  labName: string;
  documentNumber: string;
}

export function SOPForm({ onGenerate, isGenerating }: SOPFormProps) {
  const [standard, setStandard] = useState("");
  const [clause, setClause] = useState("");
  const [title, setTitle] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [labName, setLabName] = useState("SolarLabX PV Testing Laboratory");
  const [documentNumber, setDocumentNumber] = useState("");

  const selectedStandard = STANDARDS.find((s) => s.id === standard);
  const clauses = selectedStandard?.clauses || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({ standard, clause, title, additionalContext, labName, documentNumber });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>SOP Generation Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Standard *</label>
              <Select value={standard} onValueChange={(value) => { setStandard(value); setClause(""); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select standard..." />
                </SelectTrigger>
                <SelectContent>
                  {STANDARDS.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label} - {s.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Clause / Test Method *</label>
              <Select value={clause} onValueChange={setClause} disabled={!standard}>
                <SelectTrigger>
                  <SelectValue placeholder="Select clause..." />
                </SelectTrigger>
                <SelectContent>
                  {clauses.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">SOP Title *</label>
            <Input
              placeholder="e.g., Standard Operating Procedure for Visual Inspection of PV Modules"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Laboratory Name</label>
              <Input value={labName} onChange={(e) => setLabName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Document Number</label>
              <Input
                placeholder="e.g., SOP-LAB-025"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Additional Context</label>
            <Textarea
              placeholder="Any specific requirements, equipment details, or lab-specific procedures to include..."
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              rows={4}
            />
          </div>

          <Button type="submit" className="w-full" disabled={!standard || !clause || !title || isGenerating}>
            {isGenerating ? "Generating SOP with AI..." : "Generate SOP"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
