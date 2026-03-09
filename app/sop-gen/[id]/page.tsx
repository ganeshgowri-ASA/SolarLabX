"use client";

import { use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SOPViewer } from "@/components/sop/SOPViewer";
import { ApprovalWorkflow } from "@/components/sop/ApprovalWorkflow";
import { SOPExporter } from "@/components/sop/SOPExporter";
import { sampleSOPs } from "@/lib/mock-data";

export default function SOPDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const sop = sampleSOPs.find((s) => s.id === id);

  if (!sop) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">SOP Not Found</h1>
        <p className="text-muted-foreground mt-2">The SOP with ID &quot;{id}&quot; was not found.</p>
        <Link href="/sop-gen">
          <Button className="mt-4">Back to SOPs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SOP Details</h1>
          <p className="text-muted-foreground mt-1">{sop.sopNumber} - v{sop.version}</p>
        </div>
        <div className="flex gap-3">
          <SOPExporter sop={sop} />
          <Link href="/sop-gen">
            <Button variant="outline">Back to SOPs</Button>
          </Link>
        </div>
      </div>

      <ApprovalWorkflow currentStatus={sop.status} />
      <SOPViewer sop={sop} />
    </div>
  );
}
