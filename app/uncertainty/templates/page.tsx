"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UNCERTAINTY_TEMPLATES, TEMPLATE_CATEGORIES } from "@/lib/uncertainty";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const CATEGORY_COLORS: Record<string, string> = {
  "IEC 61215": "bg-blue-100 text-blue-800",
  "IEC 61730": "bg-red-100 text-red-800",
  "IEC 61853": "bg-purple-100 text-purple-800",
  "IEC 60891": "bg-amber-100 text-amber-800",
  "IEC 61724": "bg-green-100 text-green-800",
  "IEC 60904": "bg-cyan-100 text-cyan-800",
};

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const categories = TEMPLATE_CATEGORIES;

  const filteredTemplates = selectedCategory
    ? UNCERTAINTY_TEMPLATES.filter((t) => t.category === selectedCategory)
    : UNCERTAINTY_TEMPLATES;

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Uncertainty Templates</h1>
          <p className="text-muted-foreground mt-1">
            {UNCERTAINTY_TEMPLATES.length} pre-built templates covering {TEMPLATE_CATEGORIES.length} IEC standards
          </p>
        </div>
        <Link href="/uncertainty">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === "" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("")}
        >
          All ({UNCERTAINTY_TEMPLATES.length})
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.name} ({cat.count})
          </Button>
        ))}
      </div>

      {/* Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge className={CATEGORY_COLORS[template.category] || "bg-gray-100 text-gray-800"}>
                  {template.category}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {template.components.length} sources
                </Badge>
              </div>
              <CardTitle className="text-base">{template.name}</CardTitle>
              <CardDescription className="text-xs">{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Measurand</span>
                  <span className="font-medium">{template.measurand} {template.unit ? `(${template.unit})` : ""}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Standard</span>
                  <span className="font-medium text-xs">{template.standardReference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type A / B</span>
                  <span className="font-medium">
                    {template.components.filter((c) => c.type === "typeA").length} /
                    {template.components.filter((c) => c.type === "typeB").length}
                  </span>
                </div>
                {template.measurementModel && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {template.measurementModel}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/uncertainty?template=${template.id}`} className="w-full">
                <Button className="w-full" variant="outline">
                  Use Template
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
