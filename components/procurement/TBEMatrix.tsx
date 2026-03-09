"use client";

import { TBEMatrix as TBEMatrixType } from "@/lib/types/procurement";
import { cn } from "@/lib/utils";

export default function TBEMatrixView({ data }: { data: TBEMatrixType }) {
  const winner = data.vendors.reduce((a, b) => a.totalWeightedScore > b.totalWeightedScore ? a : b);

  return (
    <div className="card overflow-x-auto">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Technical Bid Evaluation Matrix</h3>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Criterion</th>
            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Category</th>
            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Weight</th>
            {data.vendors.map((v) => (
              <th key={v.vendorId} className={cn(
                "px-3 py-2 text-center text-xs font-medium uppercase",
                v.vendorId === winner.vendorId ? "text-green-700 bg-green-50" : "text-gray-500"
              )}>
                {v.vendorName}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.criteria.map((crit) => (
            <tr key={crit.id} className="hover:bg-gray-50">
              <td className="px-3 py-2 text-sm text-gray-700">{crit.name}</td>
              <td className="px-3 py-2 text-xs text-gray-500 text-center">
                <span className="badge bg-gray-100 text-gray-600">{crit.category}</span>
              </td>
              <td className="px-3 py-2 text-sm text-gray-700 text-center font-medium">{crit.weight}%</td>
              {data.vendors.map((v) => {
                const score = v.scores.find((s) => s.criterionId === crit.id);
                const val = score?.score || 0;
                return (
                  <td key={v.vendorId} className={cn(
                    "px-3 py-2 text-sm text-center",
                    v.vendorId === winner.vendorId ? "bg-green-50" : ""
                  )}>
                    <span className={cn(
                      "font-medium",
                      val >= 9 ? "text-green-700" :
                      val >= 7 ? "text-gray-700" :
                      val >= 5 ? "text-yellow-700" :
                      "text-red-700"
                    )}>
                      {val}/10
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
          {/* Total row */}
          <tr className="bg-gray-50 font-bold">
            <td className="px-3 py-2 text-sm text-gray-900" colSpan={3}>
              Total Weighted Score
            </td>
            {data.vendors.map((v) => (
              <td key={v.vendorId} className={cn(
                "px-3 py-2 text-sm text-center",
                v.vendorId === winner.vendorId ? "text-green-700 bg-green-100" : "text-gray-700"
              )}>
                {v.totalWeightedScore}
                {v.vendorId === winner.vendorId && (
                  <span className="ml-1 badge bg-green-200 text-green-800 text-[9px]">WINNER</span>
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
