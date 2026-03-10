// @ts-nocheck
"use client";

import { Vendor } from "@/lib/types/procurement";
import { cn } from "@/lib/utils";

function ScoreBar({ label, score, maxScore = 100 }: { label: string; score: number; maxScore?: number }) {
  const pct = (score / maxScore) * 100;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-16 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full",
            pct >= 85 ? "bg-green-500" :
            pct >= 70 ? "bg-yellow-500" :
            "bg-red-500"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-medium text-gray-700 w-8 text-right">{score}</span>
    </div>
  );
}

export default function VendorScorecard({ vendor }: { vendor: Vendor }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{vendor.name}</h3>
          <p className="text-xs text-gray-500">{vendor.category} | {vendor.address}</p>
        </div>
        <div className={cn(
          "h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg",
          vendor.overallScore >= 85 ? "bg-green-100 text-green-700" :
          vendor.overallScore >= 70 ? "bg-yellow-100 text-yellow-700" :
          "bg-red-100 text-red-700"
        )}>
          {vendor.overallScore}
        </div>
      </div>
      <div className="space-y-2">
        <ScoreBar label="Quality" score={vendor.qualityScore} />
        <ScoreBar label="Delivery" score={vendor.deliveryScore} />
        <ScoreBar label="Price" score={vendor.priceScore} />
        <ScoreBar label="Service" score={vendor.serviceScore} />
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-1">
        {vendor.certifications.map((cert) => (
          <span key={cert} className="badge bg-primary-50 text-primary-700 text-[10px]">{cert}</span>
        ))}
      </div>
    </div>
  );
}
