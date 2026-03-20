// @ts-nocheck
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Bot,
  User,
  Download,
  Trash2,
  Plus,
  MessageCircle,
  Sparkles,
  Clock,
  Database,
  BookOpen,
  FileText,
  StopCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import KnowledgeBase from "@/components/chatbot/KnowledgeBase";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string; // ISO string for serialization
  sources?: string[];
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const QUICK_ACTIONS = [
  { label: "IEC 61215 test sequence", prompt: "What are the complete test requirements for IEC 61215 design qualification?" },
  { label: "QMS audit checklist ISO 17025", prompt: "Provide a comprehensive QMS audit checklist for ISO/IEC 17025 accredited solar PV testing laboratory" },
  { label: "IEC 62915 design changes", prompt: "Explain IEC 62915 retest requirements when design changes are made to certified PV modules" },
  { label: "Uncertainty budget template", prompt: "Create a measurement uncertainty budget template for I-V measurements at STC per GUM methodology" },
  { label: "Equipment calibration requirements", prompt: "What are the equipment calibration requirements and schedules for a solar PV testing lab per ISO 17025?" },
];

const STORAGE_KEY = "solarlabx-chat-sessions";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId() {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

function loadSessions(): ChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ChatSession[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // corrupt data, reset
  }
  return [createNewSession()];
}

function saveSessions(sessions: ChatSession[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // storage full, ignore
  }
}

function createNewSession(): ChatSession {
  return {
    id: generateId(),
    title: "New Chat",
    messages: [],
    createdAt: new Date().toISOString(),
  };
}

// Simple markdown-ish rendering: bold, headers, tables, lists, code
function renderMarkdown(text: string) {
  // Split into lines for block-level processing
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let inTable = false;
  let tableRows: string[][] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let listItems: string[] = [];
  let listOrdered = false;

  const flushTable = () => {
    if (tableRows.length === 0) return;
    elements.push(
      <div key={`table-${elements.length}`} className="overflow-x-auto my-2">
        <table className="text-xs border-collapse w-full">
          <thead>
            <tr>
              {tableRows[0]?.map((cell, i) => (
                <th
                  key={i}
                  className="border border-border/50 px-2 py-1 text-left font-semibold bg-muted/50"
                >
                  {cell.trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.slice(2).map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} className="border border-border/50 px-2 py-1">
                    {cell.trim()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableRows = [];
    inTable = false;
  };

  const flushList = () => {
    if (listItems.length === 0) return;
    const Tag = listOrdered ? "ol" : "ul";
    elements.push(
      <Tag
        key={`list-${elements.length}`}
        className={cn("my-1 pl-5 text-sm", listOrdered ? "list-decimal" : "list-disc")}
      >
        {listItems.map((item, i) => (
          <li key={i} dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
        ))}
      </Tag>
    );
    listItems = [];
  };

  const inlineFormat = (s: string) => {
    return s
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/`(.+?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-xs font-mono">$1</code>');
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre
            key={`code-${elements.length}`}
            className="bg-muted rounded p-2 my-2 text-xs font-mono overflow-x-auto"
          >
            {codeLines.join("\n")}
          </pre>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        flushTable();
        flushList();
        inCodeBlock = true;
      }
      continue;
    }
    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    // Table rows
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      flushList();
      inTable = true;
      const cells = line
        .split("|")
        .slice(1, -1);
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Headings
    const h3Match = line.match(/^### (.+)/);
    const h2Match = line.match(/^## (.+)/);
    if (h2Match) {
      flushList();
      elements.push(
        <h2
          key={`h2-${elements.length}`}
          className="text-sm font-bold mt-3 mb-1"
          dangerouslySetInnerHTML={{ __html: inlineFormat(h2Match[1]) }}
        />
      );
      continue;
    }
    if (h3Match) {
      flushList();
      elements.push(
        <h3
          key={`h3-${elements.length}`}
          className="text-sm font-semibold mt-2 mb-1"
          dangerouslySetInnerHTML={{ __html: inlineFormat(h3Match[1]) }}
        />
      );
      continue;
    }

    // Unordered list
    const ulMatch = line.match(/^[-*] (.+)/);
    const checkMatch = line.match(/^- \[[ x]\] (.+)/);
    if (checkMatch) {
      const checked = line.includes("[x]");
      flushList(); // flush previous non-checkbox list
      elements.push(
        <div key={`check-${elements.length}`} className="flex items-start gap-2 text-sm my-0.5">
          <span className="mt-0.5">{checked ? "✅" : "⬜"}</span>
          <span dangerouslySetInnerHTML={{ __html: inlineFormat(checkMatch[1]) }} />
        </div>
      );
      continue;
    }
    if (ulMatch) {
      if (listOrdered && listItems.length > 0) flushList();
      listOrdered = false;
      listItems.push(ulMatch[1]);
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^\d+\.\s+(.+)/);
    if (olMatch) {
      if (!listOrdered && listItems.length > 0) flushList();
      listOrdered = true;
      listItems.push(olMatch[1]);
      continue;
    }

    // Flush any pending list
    flushList();

    // Empty line
    if (!line.trim()) {
      continue;
    }

    // Normal paragraph
    elements.push(
      <p
        key={`p-${elements.length}`}
        className="text-sm leading-relaxed my-1"
        dangerouslySetInnerHTML={{ __html: inlineFormat(line) }}
      />
    );
  }

  // Flush remaining
  flushTable();
  flushList();
  if (inCodeBlock && codeLines.length > 0) {
    elements.push(
      <pre key={`code-${elements.length}`} className="bg-muted rounded p-2 my-2 text-xs font-mono overflow-x-auto">
        {codeLines.join("\n")}
      </pre>
    );
  }

  return <>{elements}</>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ChatbotClient() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState("");
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [activeTab, setActiveTab] = useState<"chat" | "knowledge">("chat");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load sessions from localStorage on mount
  useEffect(() => {
    const loaded = loadSessions();
    setSessions(loaded);
    setActiveSessionId(loaded[0]?.id || "");
  }, []);

  // Persist sessions to localStorage
  useEffect(() => {
    if (sessions.length > 0) saveSessions(sessions);
  }, [sessions]);

  const activeSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0];

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages.length, streamingContent, scrollToBottom]);

  // ---- Send message with streaming ----------------------------------------

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    // Add user message and update session title
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeSessionId) return s;
        const updated = { ...s, messages: [...s.messages, userMessage] };
        if (s.messages.length === 0) {
          updated.title =
            input.trim().substring(0, 50) +
            (input.trim().length > 50 ? "..." : "");
        }
        return updated;
      })
    );

    const query = input.trim();
    setInput("");
    setIsStreaming(true);
    setStreamingContent("");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // Build history from current session
      const history = (activeSession?.messages ?? []).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query, history }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let fullContent = "";
      let sources: string[] = [];
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") break;

          try {
            const evt = JSON.parse(payload);
            if (evt.type === "text") {
              fullContent += evt.data;
              setStreamingContent(fullContent);
            } else if (evt.type === "sources") {
              try {
                sources = JSON.parse(evt.data);
              } catch {
                sources = [evt.data];
              }
            } else if (evt.type === "error") {
              fullContent += `\n\n⚠️ ${evt.data}`;
              setStreamingContent(fullContent);
            }
          } catch {
            // ignore non-JSON
          }
        }
      }

      // Add complete assistant message
      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: fullContent || "I couldn't generate a response. Please try again.",
        timestamp: new Date().toISOString(),
        sources: sources.length > 0 ? sources : undefined,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...s.messages, assistantMessage] }
            : s
        )
      );
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        // User cancelled
        if (streamingContent) {
          const partialMessage: Message = {
            id: generateId(),
            role: "assistant",
            content: streamingContent + "\n\n*[Response stopped by user]*",
            timestamp: new Date().toISOString(),
          };
          setSessions((prev) =>
            prev.map((s) =>
              s.id === activeSessionId
                ? { ...s, messages: [...s.messages, partialMessage] }
                : s
            )
          );
        }
      } else {
        console.error("Chat error:", err);
        const errorMessage: Message = {
          id: generateId(),
          role: "assistant",
          content:
            "Sorry, I encountered an error processing your request. Please try again.",
          timestamp: new Date().toISOString(),
        };
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? { ...s, messages: [...s.messages, errorMessage] }
              : s
          )
        );
      }
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
      abortRef.current = null;
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
  };

  // ---- Session management --------------------------------------------------

  const handleNewSession = () => {
    const s = createNewSession();
    setSessions((prev) => [s, ...prev]);
    setActiveSessionId(s.id);
    setActiveTab("chat");
  };

  const handleDeleteSession = (sessionId: string) => {
    if (sessions.length <= 1) return;
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== sessionId);
      if (activeSessionId === sessionId) {
        setActiveSessionId(updated[0]?.id || "");
      }
      return updated;
    });
  };

  // ---- Export as PDF (text file with .txt extension for simplicity) ---------

  const handleExport = () => {
    if (!activeSession) return;
    const content = [
      "=" .repeat(60),
      "SolarLabX AI Chat Export",
      `Session: ${activeSession.title}`,
      `Exported: ${new Date().toLocaleString()}`,
      `Messages: ${activeSession.messages.length}`,
      "=".repeat(60),
      "",
      ...activeSession.messages.map(
        (m) =>
          `[${m.role === "user" ? "You" : "SolarLabX AI"}] (${new Date(m.timestamp).toLocaleTimeString()})\n${m.content}\n${
            m.sources ? `\nSources: ${m.sources.join(", ")}` : ""
          }\n${"─".repeat(40)}\n`
      ),
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `solarlabx-chat-${activeSession.title.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  // ---- Render ---------------------------------------------------------------

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-4">
      {/* Session Sidebar */}
      <div className="w-64 shrink-0 flex flex-col border rounded-lg bg-card">
        <div className="p-3 border-b">
          <Button onClick={handleNewSession} className="w-full" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm cursor-pointer group",
                  session.id === activeSessionId
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent text-muted-foreground"
                )}
                onClick={() => {
                  setActiveSessionId(session.id);
                  setActiveTab("chat");
                }}
              >
                <MessageCircle className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate flex-1">{session.title}</span>
                {sessions.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSession(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="p-3 border-t space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleExport}
            disabled={!activeSession || activeSession.messages.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Chat
          </Button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col border rounded-lg bg-card overflow-hidden">
        {/* Header with tabs */}
        <div className="border-b">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-sm">SolarLabX AI Assistant</h2>
                <p className="text-xs text-muted-foreground">
                  RAG-powered knowledge base for solar PV testing
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                Pinecone RAG
              </Badge>
              <Badge variant="outline" className="text-xs">
                Claude API
              </Badge>
            </div>
          </div>
          {/* Tab bar */}
          <div className="flex gap-0 px-4">
            <button
              onClick={() => setActiveTab("chat")}
              className={cn(
                "px-4 py-2 text-xs font-medium border-b-2 transition-colors",
                activeTab === "chat"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <MessageCircle className="h-3.5 w-3.5 inline mr-1.5" />
              Chat
            </button>
            <button
              onClick={() => setActiveTab("knowledge")}
              className={cn(
                "px-4 py-2 text-xs font-medium border-b-2 transition-colors",
                activeTab === "knowledge"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Database className="h-3.5 w-3.5 inline mr-1.5" />
              Knowledge Base
            </button>
          </div>
        </div>

        {/* Tab content */}
        {activeTab === "knowledge" ? (
          <div className="flex-1 overflow-y-auto p-4">
            <KnowledgeBase />
          </div>
        ) : (
          <>
            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeSession?.messages.length === 0 && !isStreaming ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Bot className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    SolarLabX AI Assistant
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-md mb-6">
                    Ask me anything about IEC/ISO standards, test procedures,
                    equipment calibration, uncertainty calculations, QMS, and
                    laboratory operations.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-w-2xl">
                    {QUICK_ACTIONS.map((action) => (
                      <button
                        key={action.label}
                        onClick={() => handleQuickAction(action.prompt)}
                        className="text-left text-xs p-3 rounded-lg border hover:bg-accent transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <BookOpen className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                          <span>{action.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {activeSession?.messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      )}
                    >
                      {message.role === "assistant" && (
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                          <Bot className="h-3.5 w-3.5 text-primary" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[75%] rounded-lg px-4 py-3",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        {message.role === "assistant" ? (
                          <div className="prose-sm">
                            {renderMarkdown(message.content)}
                          </div>
                        ) : (
                          <div className="text-sm whitespace-pre-wrap leading-relaxed">
                            {message.content}
                          </div>
                        )}
                        {message.sources && message.sources.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-border/50">
                            <p className="text-xs font-medium mb-1 opacity-70 flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              Sources:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {message.sources.map((src) => (
                                <Badge
                                  key={src}
                                  variant="secondary"
                                  className="text-[10px] px-1.5 py-0"
                                >
                                  {src}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-1 mt-1 opacity-50">
                          <Clock className="h-2.5 w-2.5" />
                          <span className="text-[10px]">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      {message.role === "user" && (
                        <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1">
                          <User className="h-3.5 w-3.5 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Streaming indicator */}
                  {isStreaming && (
                    <div className="flex gap-3 justify-start">
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                        <Bot className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="max-w-[75%] bg-muted rounded-lg px-4 py-3">
                        {streamingContent ? (
                          <div className="prose-sm">
                            {renderMarkdown(streamingContent)}
                            <span className="inline-block w-2 h-4 bg-primary/60 animate-pulse ml-0.5" />
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            <span
                              className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce"
                              style={{ animationDelay: "0ms" }}
                            />
                            <span
                              className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce"
                              style={{ animationDelay: "150ms" }}
                            />
                            <span
                              className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce"
                              style={{ animationDelay: "300ms" }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about IEC standards, test procedures, equipment, QMS..."
                  className="flex-1"
                  disabled={isStreaming}
                />
                {isStreaming ? (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleStop}
                  >
                    <StopCircle className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={!input.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                )}
              </form>
              <p className="text-[10px] text-muted-foreground mt-2 text-center">
                Powered by Claude API + Pinecone RAG. Works in demo mode
                without API keys.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
