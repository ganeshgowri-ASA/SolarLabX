// @ts-nocheck
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  reportTemplateLibrary,
  templateCategories,
  type ReportTemplateConfig,
  type TemplateCategory,
} from "@/lib/template-library-data";

// ---------------------------------------------------------------------------
// Template Preview Dialog (inline)
// ---------------------------------------------------------------------------

function TemplatePreview({
  template,
  onClose,
}: {
  template: ReportTemplateConfig;
  onClose: () => void;
}) {
  const [activePreviewTab, setActivePreviewTab] = useState<"sections" | "fields" | "history">("sections");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-background rounded-lg shadow-lg w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold">{template.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">{template.standard}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">v{template.version}</Badge>
              <Badge className={cn(
                template.status === "active" ? "bg-green-100 text-green-800" :
                template.status === "draft" ? "bg-yellow-100 text-yellow-800" :
                "bg-gray-100 text-gray-600"
              )}>
                {template.status.toUpperCase()}
              </Badge>
              <button onClick={onClose} className="ml-2 text-muted-foreground hover:text-foreground text-lg">
                &times;
              </button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">{template.description}</p>
          <div className="flex gap-1 mt-3">
            {template.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
            ))}
          </div>
        </div>

        {/* Preview Tabs */}
        <div className="flex gap-1 border-b px-6 pt-2">
          {(["sections", "fields", "history"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActivePreviewTab(tab)}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-t-md transition-colors",
                activePreviewTab === tab
                  ? "bg-background border border-b-0 border-border text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {tab === "sections" ? "Sections" : tab === "fields" ? "Fields" : "Version History"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activePreviewTab === "sections" && (
            <div className="space-y-2">
              {template.sections.map((section, idx) => (
                <div key={section.id} className="flex items-start gap-3 p-3 rounded-md border">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{section.name}</span>
                      {section.required && (
                        <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700">Required</Badge>
                      )}
                      {section.conditional && (
                        <Badge variant="outline" className="text-[10px] bg-yellow-50 text-yellow-700">Conditional</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activePreviewTab === "fields" && (
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-2 text-left font-medium">Field Name</th>
                    <th className="p-2 text-left font-medium">Type</th>
                    <th className="p-2 text-left font-medium">Section</th>
                    <th className="p-2 text-left font-medium">Required</th>
                    <th className="p-2 text-left font-medium">Auto-populate</th>
                  </tr>
                </thead>
                <tbody>
                  {template.fields.map((field) => {
                    const section = template.sections.find((s) => s.id === field.section);
                    return (
                      <tr key={field.id} className="border-b last:border-0">
                        <td className="p-2 font-medium">{field.name}</td>
                        <td className="p-2">
                          <Badge variant="outline" className="text-xs">{field.type}</Badge>
                        </td>
                        <td className="p-2 text-xs">{section?.name || field.section}</td>
                        <td className="p-2">
                          {field.required ? (
                            <span className="text-green-600 text-xs font-medium">Yes</span>
                          ) : (
                            <span className="text-gray-400 text-xs">No</span>
                          )}
                        </td>
                        <td className="p-2">
                          {field.autoPopulate ? (
                            <Badge className="text-[10px] bg-blue-100 text-blue-700">Auto</Badge>
                          ) : (
                            <span className="text-gray-400 text-xs">Manual</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activePreviewTab === "history" && (
            <div className="space-y-3">
              {template.versionHistory.map((v) => (
                <div key={v.version} className="flex gap-3 p-3 rounded-md border">
                  <Badge variant="outline" className="shrink-0">v{v.version}</Badge>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{v.changes}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {v.author} &middot; {v.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            Used {template.usageCount} times &middot; Last updated {template.lastUpdated}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { toast.info("PDF preview generated"); }}>
              Preview PDF
            </Button>
            <Button size="sm" onClick={() => { toast.success(`Template "${template.name}" selected for report generation`); onClose(); }}>
              Use Template
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function TemplateLibrary() {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<"all" | TemplateCategory>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "draft" | "deprecated">("all");
  const [previewTemplate, setPreviewTemplate] = useState<ReportTemplateConfig | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return reportTemplateLibrary.filter((t) => {
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.standard.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q));
      const matchesCategory = filterCategory === "all" || t.category === filterCategory;
      const matchesStatus = filterStatus === "all" || t.status === filterStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [search, filterCategory, filterStatus]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-64"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as "all" | TemplateCategory)}
          className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="all">All Categories</option>
          {templateCategories.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "draft" | "deprecated")}
          className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="deprecated">Deprecated</option>
        </select>
        <p className="text-sm text-muted-foreground ml-auto">
          {filtered.length} template{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Category badges row */}
      <div className="flex flex-wrap gap-2">
        {templateCategories.map((cat) => {
          const count = reportTemplateLibrary.filter((t) => t.category === cat.value).length;
          return (
            <button
              key={cat.value}
              onClick={() => setFilterCategory(filterCategory === cat.value ? "all" : cat.value)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium border transition-colors",
                filterCategory === cat.value
                  ? cat.color + " border-transparent"
                  : "bg-background border-border text-muted-foreground hover:bg-muted/50"
              )}
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Template cards */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No templates match the current filters.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tpl) => {
            const catStyle = templateCategories.find((c) => c.value === tpl.category);
            return (
              <Card key={tpl.id} className="hover:shadow-md transition-shadow flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-base leading-tight">{tpl.name}</CardTitle>
                      <CardDescription className="mt-1">{tpl.standard}</CardDescription>
                    </div>
                    <Badge variant="outline" className="shrink-0">v{tpl.version}</Badge>
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    <Badge className={cn("text-[10px]", catStyle?.color)}>{catStyle?.label}</Badge>
                    <Badge className={cn("text-[10px]",
                      tpl.status === "active" ? "bg-green-100 text-green-800" :
                      tpl.status === "draft" ? "bg-yellow-100 text-yellow-800" :
                      "bg-gray-100 text-gray-600"
                    )}>
                      {tpl.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{tpl.description}</p>

                  {/* Quick stats */}
                  <div className="grid grid-cols-3 gap-2 text-center mb-3">
                    <div className="rounded-md bg-muted/50 p-2">
                      <p className="text-lg font-bold">{tpl.sections.length}</p>
                      <p className="text-[10px] text-muted-foreground">Sections</p>
                    </div>
                    <div className="rounded-md bg-muted/50 p-2">
                      <p className="text-lg font-bold">{tpl.fields.length}</p>
                      <p className="text-[10px] text-muted-foreground">Fields</p>
                    </div>
                    <div className="rounded-md bg-muted/50 p-2">
                      <p className="text-lg font-bold">{tpl.usageCount}</p>
                      <p className="text-[10px] text-muted-foreground">Uses</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {tpl.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                    ))}
                    {tpl.tags.length > 3 && (
                      <Badge variant="outline" className="text-[10px]">+{tpl.tags.length - 3}</Badge>
                    )}
                  </div>

                  <div className="mt-auto pt-3 border-t flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">
                      Updated {tpl.lastUpdated}
                    </span>
                    <div className="flex gap-1.5">
                      <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setPreviewTemplate(tpl)}>
                        Preview
                      </Button>
                      <Button size="sm" className="text-xs h-7" onClick={() => toast.success(`Template "${tpl.name}" selected`)}>
                        Use
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <TemplatePreview template={previewTemplate} onClose={() => setPreviewTemplate(null)} />
      )}
    </div>
  );
}
