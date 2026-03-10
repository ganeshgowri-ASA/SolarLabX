// @ts-nocheck
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APPROVAL_STATUS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ApprovalWorkflowProps {
  currentStatus: string;
  onStatusChange?: (newStatus: string) => void;
}

const workflowSteps = [
  { status: "draft", label: "Draft" },
  { status: "pending_review", label: "Pending Review" },
  { status: "reviewed", label: "Reviewed" },
  { status: "approved", label: "Approved" },
];

export function ApprovalWorkflow({ currentStatus, onStatusChange }: ApprovalWorkflowProps) {
  const currentIndex = workflowSteps.findIndex((s) => s.status === currentStatus);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Approval Workflow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          {workflowSteps.map((step, i) => {
            const statusInfo = APPROVAL_STATUS[step.status as keyof typeof APPROVAL_STATUS];
            const isActive = i <= currentIndex;
            const isCurrent = step.status === currentStatus;

            return (
              <div key={step.status} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                      isActive ? "text-white" : "bg-muted text-muted-foreground"
                    )}
                    style={isActive ? { backgroundColor: statusInfo.color } : undefined}
                  >
                    {i + 1}
                  </div>
                  <span className={cn("text-xs mt-1", isCurrent ? "font-bold" : "text-muted-foreground")}>
                    {step.label}
                  </span>
                </div>
                {i < workflowSteps.length - 1 && (
                  <div className={cn("flex-1 h-0.5 mx-2", i < currentIndex ? "bg-primary" : "bg-muted")} />
                )}
              </div>
            );
          })}
        </div>

        {onStatusChange && currentStatus !== "approved" && (
          <div className="flex gap-2">
            {currentStatus === "draft" && (
              <Button size="sm" onClick={() => onStatusChange("pending_review")}>
                Submit for Review
              </Button>
            )}
            {currentStatus === "pending_review" && (
              <>
                <Button size="sm" onClick={() => onStatusChange("reviewed")}>
                  Mark as Reviewed
                </Button>
                <Button size="sm" variant="destructive" onClick={() => onStatusChange("rejected")}>
                  Reject
                </Button>
              </>
            )}
            {currentStatus === "reviewed" && (
              <>
                <Button size="sm" onClick={() => onStatusChange("approved")}>
                  Approve
                </Button>
                <Button size="sm" variant="destructive" onClick={() => onStatusChange("rejected")}>
                  Reject
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
