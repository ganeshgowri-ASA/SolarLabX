"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { templateLibrary, type ReportTemplate, type TemplateCategory } from "@/lib/template-library-data";
import { toast } from "sonner";

const categoryColors: Record<TemplateCategory | string, string> = {
  Design: "bg-blue-100 text-blue-800",
  Safety: "bg-red-100 text-red-800",
  Performance: "bg-green-100 text-green-800",
  Durability: "bg-orange-100 text-orange-800",
  Calibration: "bg-purple-100 text-purple-800",
  Audit: "bg-yellow-100 text-yellow-800",
  Management: "bg-teal-100 text-teal-800",
  Measurement: "bg-indigo-100 text-indigo-800",
};

const sectionTypeColors: Record<string, string> = {
  header: "bg-slate-100 text-slate-700",
  table: "bg-blue-50 text-blue-700",
  text: "bg-gray-50 text-gray-700",
  signature: "bg-purple-50 text-purple-700",
  image: "bg-green-50 text-green-700",
  chart: "bg-orange-50 text-orange-700",
  results: "bg-emerald-50 text-emerald-700",
  checklist: "bg-yellow-50 text-yellow-700",
};

export default function TemplateLibraryTab() {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [previewTemplate, setPreviewTemplate] = useState<ReportTemplate | null>(null);

  const categories = useMemo(() => Array.from(new Set(templateLibrary.map((t) => t.category))), []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return templateLibrary.filter((t) => {
      if (filterCategory !== "all" && t.category !== filterCategory) return false;
      if (q && !t.name.toLowerCase().includes(q) && !t.standard.toLowerCase().includes(q) && !t.tags.some((tag) => tag.includes(q))) return false;
      return true;
    });
  }, [search, filterCategory]);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs">Total Templates</CardDescription>
            <CardTitle className="text-2xl">{templateLibrary.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs">Categories</CardDescription>
            <CardTitle className="text-2xl">{categories.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs">Most Used</CardDescription>
            <CardTitle className="text-lg truncate">{templateLibrary.sort((a, b) => b.usageCount - a.usageCount)[0]?.name.split(" ").slice(0, 3).join(" ")}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs">Total Uses</CardDescription>
            <CardTitle className="text-2xl">{templateLibrary.reduce((s, t) => s + t.usageCount, 0)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="text"
              placeholder="Search templates, standards, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-64"
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <div className="ml-auto flex gap-1">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                List
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Preview Modal */}
      {previewTemplate && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{previewTemplate.name}</CardTitle>
                <CardDescription>{previewTemplate.standard} — v{previewTemplate.version}</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setPreviewTemplate(null)}>Close</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{previewTemplate.description}</p>

            <div className="grid gap-3 md:grid-cols-4 text-sm">
              <div><span className="font-medium">Author:</span> {previewTemplate.author}</div>
              <div><span className="font-medium">Approved:</span> {previewTemplate.approvedBy}</div>
              <div><span className="font-medium">Updated:</span> {previewTemplate.lastUpdated}</div>
              <div><span className="font-medium">Used:</span> {previewTemplate.usageCount} times</div>
            </div>

            {/* Section Structure Preview */}
            <div>
              <h4 className="text-sm font-medium mb-2">Template Structure ({previewTemplate.sections.length} sections)</h4>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-2 text-left font-medium w-10">#</th>
                      <th className="p-2 text-left font-medium">Section</th>
                      <th className="p-2 text-left font-medium">Description</th>
                      <th className="p-2 text-left font-medium w-24">Type</th>
                      <th className="p-2 text-left font-medium w-20">Required</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewTemplate.sections.map((section, idx) => (
                      <tr key={section.id} className="border-b last:border-0">
                        <td className="p-2 text-muted-foreground">{idx + 1}</td>
                        <td className="p-2 font-medium">{section.name}</td>
                        <td className="p-2 text-muted-foreground text-xs">{section.description}</td>
                        <td className="p-2">
                          <Badge variant="outline" className={cn("text-[10px]", sectionTypeColors[section.type])}>
                            {section.type}
                          </Badge>
                        </td>
                        <td className="p-2">
                          {section.required ? (
                            <Badge variant="outline" className="text-[10px] bg-red-50 text-red-700">Required</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px]">Optional</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {previewTemplate.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={() => { toast.success(`Template "${previewTemplate.name}" selected for report generation`); setPreviewTemplate(null); }}>
                Use Template
              </Button>
              <Button variant="outline" onClick={() => toast.info("Opening template in customization editor...")}>
                Customize
              </Button>
              <Button variant="outline" onClick={() => toast.success(`Template exported as PDF`)}>
                Export PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Grid / List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No templates match the current filters.
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tpl) => (
            <Card key={tpl.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={cn("text-[10px]", categoryColors[tpl.category])}>
                    {tpl.category}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">v{tpl.version}</Badge>
                </div>
                <CardTitle className="text-base mt-2">{tpl.name}</CardTitle>
                <CardDescription className="text-xs">{tpl.standard}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground line-clamp-2">{tpl.description}</p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{tpl.sections.length} sections</span>
                  <span>{tpl.usageCount} uses</span>
                  <span>{tpl.lastUpdated}</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {tpl.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[9px] px-1.5 py-0">{tag}</Badge>
                  ))}
                  {tpl.tags.length > 3 && (
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0">+{tpl.tags.length - 3}</Badge>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <Button size="sm" className="flex-1" onClick={() => setPreviewTemplate(tpl)}>
                    Preview
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toast.success(`Template "${tpl.name}" selected`)}>
                    Use
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-2 text-left font-medium">Template Name</th>
                    <th className="p-2 text-left font-medium w-32">Standard</th>
                    <th className="p-2 text-left font-medium w-24">Category</th>
                    <th className="p-2 text-left font-medium w-16">Version</th>
                    <th className="p-2 text-left font-medium w-20">Sections</th>
                    <th className="p-2 text-left font-medium w-16">Uses</th>
                    <th className="p-2 text-left font-medium w-28">Updated</th>
                    <th className="p-2 text-left font-medium w-32">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((tpl) => (
                    <tr key={tpl.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-2">
                        <div>
                          <span className="font-medium">{tpl.name}</span>
                          <p className="text-xs text-muted-foreground line-clamp-1">{tpl.description}</p>
                        </div>
                      </td>
                      <td className="p-2 text-xs">{tpl.standard}</td>
                      <td className="p-2">
                        <Badge variant="outline" className={cn("text-[10px]", categoryColors[tpl.category])}>{tpl.category}</Badge>
                      </td>
                      <td className="p-2 text-xs">v{tpl.version}</td>
                      <td className="p-2 text-xs">{tpl.sections.length}</td>
                      <td className="p-2 text-xs">{tpl.usageCount}</td>
                      <td className="p-2 text-xs text-muted-foreground">{tpl.lastUpdated}</td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setPreviewTemplate(tpl)}>Preview</Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => toast.success(`Template "${tpl.name}" selected`)}>Use</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {templateLibrary.length} templates
      </p>
    </div>
  );
}
