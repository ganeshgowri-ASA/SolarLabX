// @ts-nocheck
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APPROVAL_STATUS, SOP_SECTIONS } from "@/lib/constants";
import type { SampleSOP } from "@/lib/mock-data";

interface SOPViewerProps {
  sop: SampleSOP;
}

export function SOPViewer({ sop }: SOPViewerProps) {
  const statusInfo = APPROVAL_STATUS[sop.status as keyof typeof APPROVAL_STATUS];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-mono">{sop.sopNumber}</p>
              <CardTitle className="text-xl mt-1">{sop.title}</CardTitle>
            </div>
            <Badge style={{ backgroundColor: statusInfo.color + "20", color: statusInfo.color }}>
              {statusInfo.label}
            </Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
            <div>
              <span className="text-muted-foreground">Standard:</span>
              <p className="font-medium">{sop.standard}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Clause:</span>
              <p className="font-medium">{sop.clause}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Version:</span>
              <p className="font-medium">v{sop.version}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Author:</span>
              <p className="font-medium">{sop.author}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Sections */}
      <div className="space-y-4">
        {[
          { key: "purpose", title: "1. Purpose" },
          { key: "scope", title: "2. Scope" },
          { key: "references", title: "3. References" },
          { key: "definitions", title: "4. Definitions" },
          { key: "responsibilities", title: "5. Responsibilities" },
          { key: "procedure", title: "6. Procedure" },
          { key: "records", title: "7. Records" },
          { key: "revisionHistory", title: "8. Revision History" },
        ].map((section) => (
          <Card key={section.key}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {sop.sections[section.key as keyof typeof sop.sections]}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
