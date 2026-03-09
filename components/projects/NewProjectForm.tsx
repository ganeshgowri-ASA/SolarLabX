"use client";

import Link from "next/link";
import { useState } from "react";

export default function NewProjectForm() {
  const [standards, setStandards] = useState<string[]>([]);

  const availableStandards = [
    "IEC 61215:2021",
    "IEC 61730:2016",
    "IEC 61853-1:2011",
    "IEC 61853-2:2016",
    "IEC 61853-3:2018",
    "IEC 61853-4:2018",
    "IEC 60904-1:2020",
    "IEC 62804-1:2015",
    "IEC 62716:2013",
    "IEC 61701:2020",
  ];

  function toggleStandard(std: string) {
    setStandards((prev) =>
      prev.includes(std) ? prev.filter((s) => s !== std) : [...prev, std]
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/projects" className="text-sm text-primary hover:underline">&larr; Back to Projects</Link>
        <h1 className="text-2xl font-bold text-foreground mt-1">New Test Project</h1>
      </div>

      <form className="space-y-6">
        <div className="rounded-lg border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground mb-4">Client Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Client Name</label>
              <input type="text" className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Company name" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Contact Person</label>
              <input type="text" className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Name, email" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground mb-4">Project Details</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Project Name</label>
              <input type="text" className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="e.g., IEC 61215/61730 Type Approval - Module Name" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Description</label>
              <textarea className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]" rows={3} placeholder="Describe the testing scope and objectives" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Project Manager</label>
                <select className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option>Vikram Singh</option>
                  <option>Priya Sharma</option>
                  <option>Dr. Meera Patel</option>
                  <option>Raj Krishnan</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Budget (INR)</label>
                <input type="number" className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="0" />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground mb-4">Test Standards</h2>
          <div className="grid grid-cols-2 gap-2">
            {availableStandards.map((std) => (
              <label key={std} className="flex items-center gap-2 p-2 rounded border cursor-pointer hover:bg-muted/50">
                <input
                  type="checkbox"
                  checked={standards.includes(std)}
                  onChange={() => toggleStandard(std)}
                  className="rounded"
                />
                <span className="text-sm text-foreground">{std}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground mb-4">Timeline</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Start Date</label>
              <input type="date" className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">End Date</label>
              <input type="date" className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground mb-4">Sample Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Sample Name/Model</label>
              <input type="text" className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Module model name" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Technology Type</label>
              <select className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option>Mono PERC</option>
                <option>Bifacial HJT</option>
                <option>TOPCon</option>
                <option>Multi-Si</option>
                <option>Thin Film (CdTe)</option>
                <option>Thin Film (CIGS)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Quantity</label>
              <input type="number" className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Number of modules" />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-10 px-4 py-2 text-sm font-medium">Create Project</button>
          <Link href="/projects" className="inline-flex items-center justify-center rounded-md border border-input bg-background h-10 px-4 py-2 text-sm font-medium hover:bg-accent">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
