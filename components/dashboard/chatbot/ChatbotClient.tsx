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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: string[];
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

const SUGGESTED_PROMPTS = [
  "What tests are needed for IEC 61215?",
  "Show me climate chamber availability",
  "What is the uncertainty budget for IV measurements?",
  "Explain the damp heat test procedure",
  "What are the acceptance criteria for thermal cycling?",
  "How to classify a sun simulator per IEC 60904-9?",
];

const KNOWLEDGE_BASE: Record<string, { answer: string; sources: string[] }> = {
  "iec 61215": {
    answer: `**IEC 61215 - Design Qualification and Type Approval for Crystalline Silicon PV Modules**

IEC 61215 requires the following test sequence:

**Initial Tests:**
- MQT 01: Visual Inspection
- MQT 02: Maximum Power Determination (I-V curve at STC)
- MQT 03: Insulation Test
- MQT 06: Performance at STC

**Environmental & Stress Tests:**
- MQT 10: UV Preconditioning (15 kWh/m² UV dose)
- MQT 11: Thermal Cycling TC200 (-40°C to +85°C, 200 cycles)
- MQT 12: Humidity Freeze (10 cycles, -40°C to +85°C/85%RH)
- MQT 13: Damp Heat DH1000 (85°C/85%RH for 1000 hours)
- MQT 16: Mechanical Load (2400/5400 Pa, 3 cycles)
- MQT 17: Hail Test (25mm ice balls at 23 m/s)
- MQT 18: Bypass Diode Test
- MQT 09: Hot-spot Endurance Test (5 hours)

**Acceptance Criteria:**
- Power degradation < 5% from initial
- No major visual defects
- Insulation resistance > 40 MΩ·m²
- Wet leakage current within limits

All tests must be performed on a minimum of 8 modules across 4 test sequences.`,
    sources: ["IEC 61215-1:2021", "IEC 61215-2:2021", "SOP-LAB-001", "SOP-LAB-012"],
  },
  "climate chamber": {
    answer: `**Climate Chamber Availability**

Current chamber status in the lab:

| Chamber | Type | Status | Current Test |
|---------|------|--------|-------------|
| TC-001 | Thermal Cycling | 🟢 Available | - |
| TC-002 | Thermal Cycling | 🔴 In Use | TC200 (Module MOD-2026-0145) - 87% complete |
| DH-001 | Damp Heat | 🔴 In Use | DH1000 (Module MOD-2026-0139) - 42% complete |
| DH-002 | Damp Heat | 🟢 Available | - |
| HF-001 | Humidity Freeze | 🟡 Maintenance | Scheduled calibration Mar 12 |
| UV-001 | UV Chamber | 🟢 Available | - |

**Upcoming Availability:**
- TC-002: Available ~Mar 15 (TC200 completion)
- DH-001: Available ~Apr 2 (DH1000 completion)
- HF-001: Available Mar 13 (after calibration)

Contact the Lab Manager to schedule chamber time.`,
    sources: ["Equipment Registry", "Lab Schedule System", "Calibration Records"],
  },
  "uncertainty": {
    answer: `**Measurement Uncertainty Budget for I-V Measurements**

Per ISO/IEC 17025 and the GUM methodology, the uncertainty budget for I-V measurements at STC includes:

**Type B Uncertainty Components:**
| Source | Uncertainty | Distribution | Divisor | u(xi) |
|--------|-----------|-------------|---------|-------|
| Reference cell calibration | ±1.0% | Normal (k=2) | 2.0 | 0.50% |
| Spectral mismatch | ±0.5% | Rectangular | √3 | 0.29% |
| Spatial non-uniformity | ±1.0% | Rectangular | √3 | 0.58% |
| Temperature measurement | ±1.0°C → ±0.4% | Rectangular | √3 | 0.23% |
| Data acquisition | ±0.1% | Rectangular | √3 | 0.06% |

**Type A Uncertainty:**
- Repeatability (10 measurements): u_A = 0.15%

**Combined Standard Uncertainty:**
u_c = √(0.50² + 0.29² + 0.58² + 0.23² + 0.06² + 0.15²) = **0.86%**

**Expanded Uncertainty (k=2, 95% confidence):**
U = 2 × 0.86% = **±1.72%**

This meets the ISO 17025 requirement for declared measurement uncertainty.`,
    sources: ["ISO/IEC 17025:2017", "GUM (JCGM 100:2008)", "Lab MU Budget Rev 3", "IEC 60904-1"],
  },
  "damp heat": {
    answer: `**Damp Heat Test Procedure (IEC 61215, MQT 13)**

**Purpose:** Evaluate module resistance to long-term humidity penetration.

**Test Conditions:**
- Temperature: 85 ± 2°C
- Relative Humidity: 85 ± 5% RH
- Duration: 1000 hours continuous

**Procedure:**
1. **Pre-test characterization:** I-V curve at STC, insulation resistance, visual inspection, EL imaging
2. **Chamber setup:** Verify chamber calibration, set 85°C/85%RH
3. **Module loading:** Place modules in chamber without stacking, ensure air circulation
4. **Monitoring:** Log temperature and RH every 15 minutes
5. **Duration:** Maintain for 1000 hours without interruption
6. **Recovery:** After test, condition at 23 ± 5°C for 2-24 hours
7. **Post-test:** Repeat all initial characterization tests

**Acceptance Criteria:**
- Maximum power degradation: < 5% from initial value
- No major visual defects (IEC 61215-1, Table 1)
- Insulation resistance: > 40 MΩ·m²
- No open circuits or ground faults

**Safety Note:** Monitor for potential condensation during ramp-up/ramp-down phases.`,
    sources: ["IEC 61215-2:2021 MQT 13", "SOP-LAB-014", "IEC 60068-2-78"],
  },
  "thermal cycling": {
    answer: `**Thermal Cycling Test Procedure (IEC 61215, MQT 11)**

**Test Parameters:**
- Temperature range: -40°C to +85°C
- Number of cycles: 200 (TC200) or 50 (TC50)
- Ramp rate: ≤ 100°C/hour (max)
- Dwell time at extremes: ≥ 10 minutes
- Current injection: Apply at maximum power current during cycling

**Test Sequence:**
1. Pre-test: I-V, insulation, visual, EL
2. Program chamber: -40°C → +85°C → -40°C per cycle
3. Apply current injection per MQT 11.3 from cycle 1
4. Monitor module temperature via thermocouples
5. Complete 200 cycles (approximately 8-10 days)
6. Post-test: Recovery 24h, then I-V, insulation, visual, EL

**Acceptance:** < 5% power degradation, no major visual defects.`,
    sources: ["IEC 61215-2:2021 MQT 11", "SOP-LAB-012", "IEC 60068-2-14"],
  },
  "sun simulator": {
    answer: `**Sun Simulator Classification per IEC 60904-9 Ed.3**

A solar simulator is classified based on three parameters:

**1. Spectral Match (A+/A/B/C):**
Ratio of actual spectral irradiance to reference AM1.5G spectrum in 6 wavelength intervals (300-1200 nm).
- A+: 0.875 - 1.125 (±12.5%)
- A: 0.75 - 1.25 (±25%)
- B: 0.60 - 1.40 (±40%)
- C: 0.40 - 2.00 (±100%)

**2. Spatial Non-Uniformity:**
Variation of irradiance across the test plane.
- A+: ≤ 1%
- A: ≤ 2%
- B: ≤ 5%
- C: ≤ 10%

**3. Temporal Instability:**
Short-term (STI) and long-term (LTI) irradiance variation.
- A+: STI ≤ 0.25%, LTI ≤ 0.5%
- A: STI ≤ 0.5%, LTI ≤ 2%
- B: STI ≤ 2%, LTI ≤ 5%
- C: STI ≤ 5%, LTI ≤ 10%

**Classification format:** e.g., A+AA means Spectral A+, Spatial A, Temporal A.

Use the SolarLabX Sun Simulator Classifier module for automated classification.`,
    sources: ["IEC 60904-9 Ed.3:2020", "SunSim Classifier Module", "Lab Equipment Registry"],
  },
};

function findBestMatch(query: string): { answer: string; sources: string[] } | null {
  const q = query.toLowerCase();
  const entries = Object.entries(KNOWLEDGE_BASE);

  for (const [key, value] of entries) {
    if (q.includes(key)) return value;
  }

  if (q.includes("test") && (q.includes("61215") || q.includes("qualification"))) {
    return KNOWLEDGE_BASE["iec 61215"];
  }
  if (q.includes("chamber") || q.includes("availability") || q.includes("schedule")) {
    return KNOWLEDGE_BASE["climate chamber"];
  }
  if (q.includes("uncertainty") || q.includes("mu ") || q.includes("gum") || q.includes("budget")) {
    return KNOWLEDGE_BASE["uncertainty"];
  }
  if (q.includes("damp") || q.includes("humidity") && q.includes("85")) {
    return KNOWLEDGE_BASE["damp heat"];
  }
  if (q.includes("thermal") || q.includes("cycling") || q.includes("tc200")) {
    return KNOWLEDGE_BASE["thermal cycling"];
  }
  if (q.includes("simulator") || q.includes("60904-9") || q.includes("classify")) {
    return KNOWLEDGE_BASE["sun simulator"];
  }

  return null;
}

function generateMockResponse(query: string): { content: string; sources: string[] } {
  const match = findBestMatch(query);
  if (match) return { content: match.answer, sources: match.sources };

  return {
    content: `Thank you for your question about "${query}".

Based on the SolarLabX knowledge base, here's what I can share:

This query relates to solar PV testing laboratory operations. While I don't have a specific pre-built answer for this exact question, in a production environment this would be answered using:

1. **RAG Pipeline:** Your question would be embedded and matched against our vector database (Pinecone) containing:
   - IEC/ISO standard summaries (61215, 61730, 60904, 17025)
   - Laboratory SOPs and work instructions
   - Equipment manuals and calibration records
   - Test result databases

2. **Suggested Actions:**
   - Check the relevant SOP in the SOP Generator module
   - Review test protocols in the LIMS module
   - Consult the equipment registry for availability

*Note: Connect your PINECONE_API_KEY and CLAUDE_API_KEY in environment variables to enable full RAG-powered responses.*

Is there anything specific about IEC standards, test procedures, equipment, or lab operations I can help with?`,
    sources: ["SolarLabX Knowledge Base", "RAG System (pending configuration)"],
  };
}

function generateId() {
  return Math.random().toString(36).substring(2, 11);
}

export default function ChatbotClient() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => [
    {
      id: "default",
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
    },
  ]);
  const [activeSessionId, setActiveSessionId] = useState("default");
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages.length, scrollToBottom]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeSessionId) return s;
        const updated = { ...s, messages: [...s.messages, userMessage] };
        if (s.messages.length === 0) {
          updated.title = input.trim().substring(0, 50) + (input.trim().length > 50 ? "..." : "");
        }
        return updated;
      })
    );

    setInput("");
    setIsTyping(true);

    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 1200));

    const response = generateMockResponse(userMessage.content);
    const assistantMessage: Message = {
      id: generateId(),
      role: "assistant",
      content: response.content,
      timestamp: new Date(),
      sources: response.sources,
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId ? { ...s, messages: [...s.messages, assistantMessage] } : s
      )
    );
    setIsTyping(false);
  };

  const handleNewSession = () => {
    const newSession: ChatSession = {
      id: generateId(),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleDeleteSession = (sessionId: string) => {
    if (sessions.length <= 1) return;
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      const remaining = sessions.filter((s) => s.id !== sessionId);
      setActiveSessionId(remaining[0]?.id || "");
    }
  };

  const handleExportPDF = () => {
    const content = [
      "SolarLabX AI Chat Export",
      `Session: ${activeSession.title}`,
      `Date: ${new Date().toLocaleDateString()}`,
      "=".repeat(60),
      "",
      ...activeSession.messages.map(
        (m) =>
          `[${m.role === "user" ? "You" : "SolarLabX AI"}] (${m.timestamp.toLocaleTimeString()})\n${m.content}\n${
            m.sources ? `Sources: ${m.sources.join(", ")}` : ""
          }\n`
      ),
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `solarlabx-chat-${activeSession.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

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
                onClick={() => setActiveSessionId(session.id)}
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
        <div className="p-3 border-t">
          <Button variant="outline" size="sm" className="w-full" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export Chat
          </Button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col border rounded-lg bg-card overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b flex items-center justify-between">
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

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeSession.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">SolarLabX AI Assistant</h3>
              <p className="text-muted-foreground text-sm max-w-md mb-6">
                Ask me anything about test standards, equipment, procedures, sample status,
                uncertainty calculations, and laboratory operations.
              </p>
              <div className="grid grid-cols-2 gap-2 max-w-lg">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSuggestedPrompt(prompt)}
                    className="text-left text-xs p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {activeSession.messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="h-3.5 w-3.5 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[70%] rounded-lg px-4 py-3",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </div>
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-border/50">
                        <p className="text-xs font-medium mb-1 opacity-70">Sources:</p>
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
                        {message.timestamp.toLocaleTimeString()}
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
              {isTyping && (
                <div className="flex gap-3">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
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
              placeholder="Ask about test standards, equipment, procedures..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button type="submit" disabled={!input.trim() || isTyping}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            Powered by Claude API + Pinecone RAG. Configure PINECONE_API_KEY &amp; PINECONE_INDEX for production use.
          </p>
        </div>
      </div>
    </div>
  );
}
