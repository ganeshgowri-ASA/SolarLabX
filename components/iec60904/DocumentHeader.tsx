"use client";

import { Badge } from "@/components/ui/badge";

interface DocumentHeaderProps {
  docNumber: string;
  partNumber: number;
  title: string;
  standard: string;
}

export default function DocumentHeader({ docNumber, partNumber, title, standard }: DocumentHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b pb-3 mb-4">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{standard}</p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="font-mono text-xs">
          Part {partNumber}
        </Badge>
        <Badge variant="secondary" className="font-mono text-xs">
          {docNumber}
        </Badge>
      </div>
    </div>
  );
}
