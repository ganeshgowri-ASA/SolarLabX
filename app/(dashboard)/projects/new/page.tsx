"use client";

import Link from "next/link";
import { useState } from "react";

export default function NewProjectPage() {
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
        <Link href="/projects" className="text-sm text-primary-600 hover:underline">&larr; Back to Projects</Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">New Test Project</h1>
      </div>

      <form className="space-y-6">
        {/* Client Information */}
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Client Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Client Name</label>
              <input type="text" className="input" placeholder="Company name" />
            </div>
            <div>
              <label className="label">Contact Person</label>
              <input type="text" className="input" placeholder="Name, email" />
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Project Details</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Project Name</label>
              <input type="text" className="input" placeholder="e.g., IEC 61215/61730 Type Approval - Module Name" />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input" rows={3} placeholder="Describe the testing scope and objectives" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Project Manager</label>
                <select className="input">
                  <option>Vikram Singh</option>
                  <option>Priya Sharma</option>
                  <option>Dr. Meera Patel</option>
                  <option>Raj Krishnan</option>
                </select>
              </div>
              <div>
                <label className="label">Budget (USD)</label>
                <input type="number" className="input" placeholder="0.00" />
              </div>
            </div>
          </div>
        </div>

        {/* Test Standards */}
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Test Standards</h2>
          <div className="grid grid-cols-2 gap-2">
            {availableStandards.map((std) => (
              <label key={std} className="flex items-center gap-2 p-2 rounded border border-gray-200 cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={standards.includes(std)}
                  onChange={() => toggleStandard(std)}
                  className="rounded text-primary-600"
                />
                <span className="text-sm text-gray-700">{std}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Timeline</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date</label>
              <input type="date" className="input" />
            </div>
            <div>
              <label className="label">End Date</label>
              <input type="date" className="input" />
            </div>
          </div>
        </div>

        {/* Sample Info */}
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Sample Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Sample Name/Model</label>
              <input type="text" className="input" placeholder="Module model name" />
            </div>
            <div>
              <label className="label">Technology Type</label>
              <select className="input">
                <option>Mono PERC</option>
                <option>Bifacial HJT</option>
                <option>TOPCon</option>
                <option>Multi-Si</option>
                <option>Thin Film (CdTe)</option>
                <option>Thin Film (CIGS)</option>
                <option>a-Si</option>
              </select>
            </div>
            <div>
              <label className="label">Quantity</label>
              <input type="number" className="input" placeholder="Number of modules" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button type="submit" className="btn-primary">Create Project</button>
          <Link href="/projects" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
