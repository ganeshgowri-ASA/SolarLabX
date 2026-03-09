import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SampleReport } from "@/lib/mock-data";

interface SignatureBlockProps {
  report: SampleReport;
}

export function SignatureBlock({ report }: SignatureBlockProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Authorization & Signatures</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center space-y-4">
            <div className="border-b-2 border-dashed pb-8 min-h-[60px] flex items-end justify-center">
              {report.preparedBy && (
                <span className="italic text-sm text-muted-foreground">{report.preparedBy}</span>
              )}
            </div>
            <div>
              <p className="font-medium text-sm">Prepared By</p>
              <p className="text-xs text-muted-foreground">Lab Technician</p>
              <p className="text-xs text-muted-foreground mt-1">Date: {report.createdAt}</p>
            </div>
          </div>
          <div className="text-center space-y-4">
            <div className="border-b-2 border-dashed pb-8 min-h-[60px] flex items-end justify-center">
              {report.reviewedBy && (
                <span className="italic text-sm text-muted-foreground">{report.reviewedBy}</span>
              )}
            </div>
            <div>
              <p className="font-medium text-sm">Reviewed By</p>
              <p className="text-xs text-muted-foreground">Lab Manager</p>
              <p className="text-xs text-muted-foreground mt-1">Date: {report.updatedAt}</p>
            </div>
          </div>
          <div className="text-center space-y-4">
            <div className="border-b-2 border-dashed pb-8 min-h-[60px] flex items-end justify-center">
              {report.approvedBy && (
                <span className="italic text-sm text-muted-foreground">{report.approvedBy}</span>
              )}
            </div>
            <div>
              <p className="font-medium text-sm">Approved By</p>
              <p className="text-xs text-muted-foreground">Lab Director</p>
              <p className="text-xs text-muted-foreground mt-1">Date: ________</p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t text-xs text-muted-foreground text-center">
          <p>This report shall not be reproduced except in full, without written permission of the laboratory.</p>
          <p className="mt-1">ISO/IEC 17025:2017 Compliant Test Report</p>
        </div>
      </CardContent>
    </Card>
  );
}
