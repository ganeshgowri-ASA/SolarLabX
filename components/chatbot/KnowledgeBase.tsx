// @ts-nocheck
"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Database,
  Upload,
  Search,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  BookOpen,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StandardInfo {
  id: string;
  name: string;
  title: string;
  status: "ready" | "demo" | "indexing";
}

interface IngestStatus {
  pineconeConfigured: boolean;
  openaiConfigured: boolean;
  mode: "rag" | "demo";
  standards: StandardInfo[];
  embeddingModel: string;
  chunkSize: number;
  chunkOverlap: number;
}

export default function KnowledgeBase() {
  const [status, setStatus] = useState<IngestStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pinecone/ingest");
      if (res.ok) {
        setStatus(await res.json());
      }
    } catch {
      // Use fallback demo status
      setStatus({
        pineconeConfigured: false,
        openaiConfigured: false,
        mode: "demo",
        standards: [
          { id: "iec-61215", name: "IEC 61215", title: "Design Qualification & Type Approval", status: "demo" },
          { id: "iec-61730", name: "IEC 61730", title: "PV Module Safety", status: "demo" },
          { id: "iec-62915", name: "IEC 62915", title: "Type Test Sample Requirements", status: "demo" },
          { id: "iec-60904", name: "IEC 60904", title: "PV Measurement Procedures", status: "demo" },
          { id: "iec-60891", name: "IEC 60891", title: "I-V Characteristic Translation", status: "demo" },
          { id: "iec-62788", name: "IEC 62788", title: "Material Testing Procedures", status: "demo" },
          { id: "iec-61853", name: "IEC 61853", title: "PV Module Energy Rating", status: "demo" },
          { id: "iec-62804", name: "IEC 62804", title: "PID Testing", status: "demo" },
          { id: "iec-61701", name: "IEC 61701", title: "Salt Mist Corrosion", status: "demo" },
          { id: "iec-62716", name: "IEC 62716", title: "Ammonia Corrosion", status: "demo" },
          { id: "iso-17025", name: "ISO/IEC 17025", title: "Lab Competence Requirements", status: "demo" },
        ],
        embeddingModel: "text-embedding-3-small",
        chunkSize: 800,
        chunkOverlap: 150,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadResult(null);

    try {
      const text = await file.text();
      const source = file.name.replace(/\.(pdf|txt|md)$/i, "");

      const res = await fetch("/api/pinecone/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          source,
          metadata: {
            fileName: file.name,
            fileSize: String(file.size),
            uploadedAt: new Date().toISOString(),
          },
        }),
      });

      const data = await res.json();

      if (data.success) {
        setUploadResult(
          `Ingested "${source}" — ${data.totalChunksIngested} chunks created`
        );
        fetchStatus();
      } else if (data.demo) {
        setUploadResult(
          "Demo mode: Configure Pinecone & OpenAI API keys to enable document ingestion."
        );
      } else {
        setUploadResult(`Error: ${data.error || data.message}`);
      }
    } catch (err) {
      setUploadResult("Upload failed. Check console for details.");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const filteredStandards = status?.standards?.filter(
    (s) =>
      !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Banner */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "h-10 w-10 rounded-lg flex items-center justify-center",
                status?.mode === "rag"
                  ? "bg-green-100 dark:bg-green-900/30"
                  : "bg-amber-100 dark:bg-amber-900/30"
              )}
            >
              {status?.mode === "rag" ? (
                <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <Database className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-sm">
                {status?.mode === "rag"
                  ? "RAG Mode Active"
                  : "Demo Mode (Local Knowledge Base)"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {status?.mode === "rag"
                  ? `Pinecone connected · Embedding: ${status.embeddingModel} · Chunk size: ${status.chunkSize}`
                  : "Configure PINECONE_API_KEY, OPENAI_API_KEY, and PINECONE_INDEX to enable vector search"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={status?.pineconeConfigured ? "default" : "secondary"}
              className="text-xs"
            >
              Pinecone {status?.pineconeConfigured ? "Connected" : "N/A"}
            </Badge>
            <Badge
              variant={status?.openaiConfigured ? "default" : "secondary"}
              className="text-xs"
            >
              Embeddings {status?.openaiConfigured ? "Active" : "N/A"}
            </Badge>
            <Button variant="ghost" size="icon" onClick={fetchStatus}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Upload Section */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Upload Documents</h3>
          </div>
          <span className="text-xs text-muted-foreground">
            Supported: .txt, .md (PDF text extraction coming soon)
          </span>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.pdf"
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {uploading ? "Processing..." : "Choose File"}
          </Button>
        </div>
        {uploadResult && (
          <p
            className={cn(
              "text-xs mt-2",
              uploadResult.startsWith("Error") || uploadResult.startsWith("Upload failed")
                ? "text-red-600 dark:text-red-400"
                : uploadResult.startsWith("Demo")
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-green-600 dark:text-green-400"
            )}
          >
            {uploadResult}
          </p>
        )}
      </Card>

      {/* Indexed Standards */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Indexed Standards</h3>
            <Badge variant="outline" className="text-xs">
              {status?.standards?.length ?? 0} standards
            </Badge>
          </div>
          <div className="relative w-48">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search standards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>
        <ScrollArea className="h-[340px]">
          <div className="space-y-2">
            {filteredStandards?.map((standard) => (
              <div
                key={standard.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{standard.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {standard.title}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {standard.status === "ready" ? (
                    <Badge
                      variant="default"
                      className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Indexed
                    </Badge>
                  ) : standard.status === "indexing" ? (
                    <Badge variant="secondary" className="text-xs">
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Indexing
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-xs text-amber-600 border-amber-300 dark:text-amber-400"
                    >
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Demo
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Configuration Info */}
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-2">RAG Configuration</h3>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <p className="text-muted-foreground">Embedding Model</p>
            <p className="font-mono">{status?.embeddingModel ?? "text-embedding-3-small"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Chunk Size / Overlap</p>
            <p className="font-mono">
              {status?.chunkSize ?? 800} / {status?.chunkOverlap ?? 150} tokens
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Vector DB</p>
            <p className="font-mono">Pinecone (serverless)</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">LLM</p>
            <p className="font-mono">Claude Sonnet 4</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
