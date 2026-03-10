// @ts-nocheck
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { REPORT_TYPES } from "@/lib/constants";
import { getTestDefinitions } from "@/lib/report-test-definitions";
import { cn } from "@/lib/utils";

interface ReportTemplateProps {
  templateId: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export function ReportTemplate({ templateId, isSelected, onClick }: ReportTemplateProps) {
  const template = REPORT_TYPES.find((t) => t.id === templateId);
  if (!template) return null;

  const defs = getTestDefinitions(templateId);
  const sections = defs.map((d) => `${d.testName} (${d.clause})`);

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{template.label}</CardTitle>
          <Badge variant="secondary">{template.standard}</Badge>
        </div>
        <CardDescription>
          ISO 17025 compliant test report template — {sections.length} tests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-medium mb-2">Test sections included:</p>
        <div className="space-y-1">
          {sections.slice(0, 5).map((section) => (
            <p key={section} className="text-xs text-muted-foreground">- {section}</p>
          ))}
          {sections.length > 5 && (
            <p className="text-xs text-primary">+ {sections.length - 5} more sections</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
