// @ts-nocheck
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { STANDARDS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface StandardSelectorProps {
  selectedStandard: string;
  onSelect: (standardId: string) => void;
}

export function StandardSelector({ selectedStandard, onSelect }: StandardSelectorProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {STANDARDS.map((standard) => (
        <Card
          key={standard.id}
          className={cn(
            "cursor-pointer transition-all hover:shadow-md",
            selectedStandard === standard.id && "ring-2 ring-primary"
          )}
          onClick={() => onSelect(standard.id)}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{standard.label}</CardTitle>
            <CardDescription>{standard.title}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {standard.clauses.length} clauses/test methods available
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
