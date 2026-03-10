// @ts-nocheck
"use client";

import { CARReport, CARStatus } from "@/lib/types/audit";
import { cn } from "@/lib/utils";

const steps: { key: CARStatus; label: string; description: string }[] = [
  { key: "D1-Team", label: "D1: Team", description: "Form cross-functional team" },
  { key: "D2-Problem", label: "D2: Problem", description: "Define the problem" },
  { key: "D3-Containment", label: "D3: Containment", description: "Interim containment actions" },
  { key: "D4-RootCause", label: "D4: Root Cause", description: "Identify root cause" },
  { key: "D5-Corrective", label: "D5: Corrective", description: "Define corrective actions" },
  { key: "D6-Implementation", label: "D6: Implement", description: "Implement & verify" },
  { key: "D7-Prevention", label: "D7: Prevent", description: "Systemic prevention" },
  { key: "D8-Closure", label: "D8: Closure", description: "Close & congratulate" },
];

function getStepIndex(status: CARStatus): number {
  return steps.findIndex((s) => s.key === status);
}

export default function CARWorkflow({ car }: { car: CARReport }) {
  const currentIdx = getStepIndex(car.status);

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-900 mb-6">8D Problem-Solving Workflow</h3>
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, idx) => {
          const isComplete = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isFuture = idx > currentIdx;
          return (
            <div key={step.key} className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full">
                {idx > 0 && (
                  <div className={cn("flex-1 h-0.5", isComplete ? "bg-green-500" : "bg-gray-200")} />
                )}
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shrink-0",
                    isComplete && "bg-green-500 text-white",
                    isCurrent && "bg-primary-600 text-white ring-4 ring-primary-100",
                    isFuture && "bg-gray-200 text-gray-500"
                  )}
                >
                  {isComplete ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </div>
                {idx < steps.length - 1 && (
                  <div className={cn("flex-1 h-0.5", isComplete ? "bg-green-500" : "bg-gray-200")} />
                )}
              </div>
              <span className={cn(
                "mt-2 text-[10px] font-medium text-center",
                isCurrent ? "text-primary-700" : isComplete ? "text-green-700" : "text-gray-400"
              )}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function IshikawaDiagram({ data }: { data: CARReport["d4RootCause"]["ishikawa"] }) {
  const categories = [
    { key: "man" as const, label: "Man", color: "border-blue-400 bg-blue-50" },
    { key: "machine" as const, label: "Machine", color: "border-green-400 bg-green-50" },
    { key: "material" as const, label: "Material", color: "border-yellow-400 bg-yellow-50" },
    { key: "method" as const, label: "Method", color: "border-red-400 bg-red-50" },
    { key: "measurement" as const, label: "Measurement", color: "border-purple-400 bg-purple-50" },
    { key: "environment" as const, label: "Environment", color: "border-teal-400 bg-teal-50" },
  ];

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Ishikawa (Fishbone) Diagram - Cause Categories</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat.key} className={cn("rounded-lg border-2 p-3", cat.color)}>
            <h4 className="font-semibold text-sm mb-2">{cat.label}</h4>
            <ul className="space-y-1">
              {data[cat.key].map((cause, i) => (
                <li key={i} className="text-xs text-gray-700 flex items-start gap-1">
                  <span className="text-gray-400 mt-0.5">-</span>
                  {cause}
                </li>
              ))}
              {data[cat.key].length === 0 && (
                <li className="text-xs text-gray-400 italic">No causes identified</li>
              )}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-center">
        <div className="bg-red-100 border-2 border-red-400 rounded-lg px-6 py-3">
          <span className="text-sm font-bold text-red-800">EFFECT / PROBLEM</span>
        </div>
      </div>
    </div>
  );
}

export function FiveWhyAnalysis({ data }: { data: CARReport["d4RootCause"]["fiveWhy"] }) {
  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">5-Why Analysis</h3>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.level} className="flex gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-bold text-sm shrink-0">
              {item.level}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{item.question}</p>
              <p className="text-sm text-gray-600 mt-0.5">{item.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
