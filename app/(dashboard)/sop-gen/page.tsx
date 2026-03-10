// @ts-nocheck
"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { APPROVAL_STATUS } from "@/lib/constants";
import { sampleSOPs } from "@/lib/mock-data";

export default function SOPDashboard() {
  const approved = sampleSOPs.filter((s) => s.status === "approved").length;
  const pending = sampleSOPs.filter((s) => s.status === "pending_review").length;
  const drafts = sampleSOPs.filter((s) => s.status === "draft").length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SOP Generator</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered Standard Operating Procedure generation from IEC/ISO standards
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/sop-gen/generate">
            <Button>Generate New SOP</Button>
          </Link>
          <Link href="/sop-gen/templates">
            <Button variant="outline">Template Library</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total SOPs</CardDescription>
            <CardTitle className="text-3xl">{sampleSOPs.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Approved</CardDescription>
            <CardTitle className="text-3xl text-green-600">{approved}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Review</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Drafts</CardDescription>
            <CardTitle className="text-3xl text-gray-600">{drafts}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* SOP List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Generated SOPs</h2>
        <div className="space-y-3">
          {sampleSOPs.map((sop) => {
            const statusInfo = APPROVAL_STATUS[sop.status as keyof typeof APPROVAL_STATUS];
            return (
              <Link key={sop.id} href={`/sop-gen/${sop.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm text-muted-foreground">{sop.sopNumber}</span>
                          <Badge style={{ backgroundColor: statusInfo.color + "20", color: statusInfo.color }}>
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <h3 className="font-medium mt-1">{sop.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>{sop.standard} - {sop.clause}</span>
                          <span>v{sop.version}</span>
                          <span>Updated: {sop.updatedAt}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
