"use client";

import { useState } from "react";
import { TechnicalSpec } from "@/lib/types/procurement";

export default function RFQForm() {
  const [specs, setSpecs] = useState<TechnicalSpec[]>([
    { parameter: "", requirement: "", unit: "", mandatory: true },
  ]);

  function addSpec() {
    setSpecs([...specs, { parameter: "", requirement: "", unit: "", mandatory: false }]);
  }

  function removeSpec(index: number) {
    setSpecs(specs.filter((_, i) => i !== index));
  }

  return (
    <form className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">RFQ Title</label>
          <input type="text" className="input" placeholder="Enter RFQ title" />
        </div>
        <div>
          <label className="label">Category</label>
          <select className="input">
            <option>Capital Equipment</option>
            <option>Test Equipment - Consumables</option>
            <option>Calibration Services</option>
            <option>Laboratory Supplies</option>
            <option>IT/Software</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="label">Description</label>
          <textarea className="input" rows={3} placeholder="Detailed description of requirement" />
        </div>
        <div>
          <label className="label">Budget (USD)</label>
          <input type="number" className="input" placeholder="0.00" />
        </div>
        <div>
          <label className="label">Response Deadline</label>
          <input type="date" className="input" />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Technical Specifications</h3>
          <button type="button" onClick={addSpec} className="btn-secondary text-xs">
            + Add Spec
          </button>
        </div>
        <div className="space-y-2">
          {specs.map((spec, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                className="input flex-1"
                placeholder="Parameter"
                value={spec.parameter}
                onChange={(e) => {
                  const next = [...specs];
                  next[idx] = { ...next[idx], parameter: e.target.value };
                  setSpecs(next);
                }}
              />
              <input
                type="text"
                className="input flex-1"
                placeholder="Requirement"
                value={spec.requirement}
                onChange={(e) => {
                  const next = [...specs];
                  next[idx] = { ...next[idx], requirement: e.target.value };
                  setSpecs(next);
                }}
              />
              <input
                type="text"
                className="input w-20"
                placeholder="Unit"
                value={spec.unit}
                onChange={(e) => {
                  const next = [...specs];
                  next[idx] = { ...next[idx], unit: e.target.value };
                  setSpecs(next);
                }}
              />
              <label className="flex items-center gap-1 text-xs text-gray-500 shrink-0">
                <input
                  type="checkbox"
                  checked={spec.mandatory}
                  onChange={(e) => {
                    const next = [...specs];
                    next[idx] = { ...next[idx], mandatory: e.target.checked };
                    setSpecs(next);
                  }}
                  className="rounded"
                />
                Req
              </label>
              {specs.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSpec(idx)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  X
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" className="btn-primary">Save as Draft</button>
        <button type="button" className="btn-secondary">Issue RFQ</button>
      </div>
    </form>
  );
}
