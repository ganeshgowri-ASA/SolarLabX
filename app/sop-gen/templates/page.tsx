"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { STANDARDS } from "@/lib/constants";

const templatesByStandard = STANDARDS.map((standard) => ({
  ...standard,
  templates: standard.clauses.map((clause) => ({
    clause,
    sopTitle: `SOP for ${clause}`,
  })),
}));

export default function TemplatesPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SOP Template Library</h1>
          <p className="text-muted-foreground mt-1">
            Browse SOP templates organized by IEC/ISO standard
          </p>
        </div>
        <Link href="/sop-gen/generate">
          <Button>Generate Custom SOP</Button>
        </Link>
      </div>

      {templatesByStandard.map((standard) => (
        <Card key={standard.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{standard.label}</CardTitle>
                <CardDescription>{standard.title}</CardDescription>
              </div>
              <Badge variant="secondary">{standard.templates.length} templates</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {standard.templates.map((template) => (
                <Link
                  key={template.clause}
                  href={`/sop-gen/generate?standard=${standard.id}&clause=${encodeURIComponent(template.clause)}`}
                >
                  <div className="p-3 rounded-md border hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
                    <p className="text-sm font-medium">{template.clause}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Click to generate SOP
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
