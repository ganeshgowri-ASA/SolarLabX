import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// POST /api/chat – RAG-powered chat endpoint
// Accepts { message, history }
// 1. Embeds the user query and retrieves relevant chunks from Pinecone
// 2. Passes context + history to Claude API for a grounded answer
// 3. Streams the response back as text/event-stream
// Falls back to Claude-only (no RAG) if Pinecone is not configured, and
// further falls back to a rich demo/mock mode when no API keys are set.
// ---------------------------------------------------------------------------

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ---- Pinecone helpers -----------------------------------------------------

async function queryPinecone(
  queryEmbedding: number[],
  topK = 5
): Promise<{ text: string; source: string; score: number }[]> {
  const apiKey = process.env.PINECONE_API_KEY;
  const indexHost = process.env.PINECONE_INDEX; // full host URL or index name
  if (!apiKey || !indexHost) return [];

  // Support both full host URL and index-name style
  const host = indexHost.startsWith("http")
    ? indexHost
    : `https://${indexHost}`;

  const res = await fetch(`${host}/query`, {
    method: "POST",
    headers: {
      "Api-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    }),
  });

  if (!res.ok) {
    console.error("Pinecone query error:", await res.text());
    return [];
  }

  const data = await res.json();
  return (data.matches ?? []).map(
    (m: { metadata?: { text?: string; source?: string }; score?: number }) => ({
      text: m.metadata?.text ?? "",
      source: m.metadata?.source ?? "Unknown",
      score: m.score ?? 0,
    })
  );
}

async function embedText(text: string): Promise<number[]> {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) return [];

  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text,
    }),
  });

  if (!res.ok) {
    console.error("OpenAI embedding error:", await res.text());
    return [];
  }

  const data = await res.json();
  return data.data?.[0]?.embedding ?? [];
}

// ---- Claude streaming helper -----------------------------------------------

async function* streamClaude(
  systemPrompt: string,
  messages: { role: string; content: string }[]
): AsyncGenerator<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
  if (!apiKey) throw new Error("NO_API_KEY");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      stream: true,
      system: systemPrompt,
      messages,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Claude API error:", err);
    throw new Error(`Claude API ${res.status}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
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
      if (payload === "[DONE]") return;
      try {
        const evt = JSON.parse(payload);
        if (evt.type === "content_block_delta" && evt.delta?.text) {
          yield evt.delta.text;
        }
      } catch {
        // ignore non-JSON lines
      }
    }
  }
}

// ---- Demo / mock streaming -------------------------------------------------

const DEMO_RESPONSES: Record<string, { answer: string; sources: string[] }> = {
  "iec 61215": {
    answer: `## IEC 61215 - Design Qualification Test Sequence

IEC 61215 requires the following comprehensive test sequence for crystalline silicon PV modules:

### Initial Characterization
- **MQT 01:** Visual Inspection (per IEC 61215-1, Clause 7)
- **MQT 02:** Maximum Power Determination (I-V curve at STC: 1000 W/m², 25°C, AM1.5G)
- **MQT 03:** Insulation Test (1000V + 2×Voc for ≥1 min)
- **MQT 06:** Performance at STC and NMOT

### Environmental & Stress Tests
| Test | Condition | Duration/Cycles |
|------|-----------|-----------------|
| MQT 10 - UV Preconditioning | 280-400nm, 15 kWh/m² total UV dose | ~120 hours |
| MQT 11 - Thermal Cycling | -40°C to +85°C with current injection | 200 cycles (TC200) |
| MQT 12 - Humidity Freeze | -40°C to +85°C/85%RH | 10 cycles |
| MQT 13 - Damp Heat | 85°C / 85% RH continuous | 1000 hours |
| MQT 16 - Mechanical Load | 2400 Pa (front), 5400 Pa (front & rear) | 3 cycles each |
| MQT 17 - Hail Test | 25mm ice balls at 23 m/s | 11 impact locations |
| MQT 18 - Bypass Diode | Thermal test at 75°C for 1 hour | Per diode |
| MQT 09 - Hot-spot | Worst-case shading, 5 hours | 5 hours |

### Acceptance Criteria
- Maximum power degradation: **< 5%** from initial value
- No major visual defects per Table 1 of IEC 61215-1
- Insulation resistance: **> 40 MΩ·m²**
- Wet leakage current within limits
- Minimum **8 modules** across **4 test sequences**

### Test Sequence Groups (IEC 61215-2, Figure 2)
- **Sequence A:** UV → TC50 → HF10 (2 modules)
- **Sequence B:** TC200 (2 modules)
- **Sequence C:** DH1000 (2 modules)
- **Sequence D:** Outdoor exposure → additional TC/HF (2 modules)`,
    sources: [
      "IEC 61215-1:2021 §7-10",
      "IEC 61215-2:2021 §4 (Test Sequences)",
      "IEC 61215-1:2021 Table 1 (Visual Defects)",
      "SOP-LAB-001 Rev.4",
    ],
  },
  "qms audit": {
    answer: `## ISO 17025 QMS Audit Checklist

### 1. Structural Requirements (Clause 4-5)
- [ ] Legal entity documentation current
- [ ] Organizational chart with defined responsibilities
- [ ] Impartiality policy documented and communicated
- [ ] Confidentiality procedures in place
- [ ] Management commitment evidence

### 2. Resource Requirements (Clause 6)
- [ ] **Personnel:** Competency records for all technical staff
- [ ] **Personnel:** Training plans and effectiveness evaluation
- [ ] **Facilities:** Environmental monitoring records (temp, humidity)
- [ ] **Equipment:** Calibration certificates current (traceable to SI)
- [ ] **Equipment:** Maintenance and intermediate check logs
- [ ] **Metrological traceability:** Reference standards documentation

### 3. Process Requirements (Clause 7)
- [ ] **7.1:** Contract review records for each test request
- [ ] **7.2:** Method validation/verification records
- [ ] **7.3:** Sampling procedures documented
- [ ] **7.4:** Sample handling and identification procedures
- [ ] **7.5:** Technical records complete and retrievable
- [ ] **7.6:** Measurement uncertainty budgets for all test methods
- [ ] **7.7:** Quality control data (proficiency testing, inter-lab comparisons)
- [ ] **7.8:** Report format compliant with Clause 7.8

### 4. Management System (Clause 8)
- [ ] Quality manual / documentation hierarchy
- [ ] Document control procedure effective
- [ ] Internal audit schedule and reports
- [ ] Management review minutes (annual minimum)
- [ ] CAPA log with effectiveness verification
- [ ] Risk assessment and opportunity register

### Key Focus Areas for Solar PV Labs
- Uncertainty budgets for I-V measurements (IEC 60904-1)
- Sun simulator classification records (IEC 60904-9)
- Chamber calibration and uniformity surveys
- Reference cell calibration chain (to WRR/SI)`,
    sources: [
      "ISO/IEC 17025:2017 §4-8",
      "NABL 141 (Specific Criteria for PV Labs)",
      "QMS-DOC-001 Quality Manual Rev.6",
      "AUDIT-TEMPLATE-17025-v3",
    ],
  },
  "iec 62915": {
    answer: `## IEC 62915 - Type Test Sample Requirements for Design Changes

IEC 62915 defines rules for **retesting requirements** when design modifications are made to already-certified PV modules.

### Key Concepts
- **Bill of Materials (BoM):** Comprehensive list of all module components
- **Type Test Matrix:** Mapping of component changes to required retests
- **Design Change Categories:** Minor, Major, Critical

### Component Change → Retest Matrix
| Component Changed | Required Retests |
|-------------------|-----------------|
| Cell supplier/type | Full IEC 61215 requalification |
| Encapsulant material | TC200 + HF10 + DH1000 + UV |
| Backsheet | DH1000 + UV + Insulation |
| Junction box | Bypass diode + Insulation + Wet leakage |
| Frame design | Mechanical load + Hail |
| Glass (same spec, new supplier) | Hail + Mechanical load |
| Interconnect ribbon | TC200 + HF10 |
| Solder flux only | TC50 + HF10 (reduced) |

### Decision Process
1. Document complete BoM for certified design (baseline)
2. Identify ALL component changes from baseline
3. Map each change against IEC 62915 Table 1
4. Determine combined test requirements (union of all changes)
5. Execute minimum retest program
6. Update BoM documentation and certificate

### Important Notes
- Multiple simultaneous changes require the **union** of all retests
- Some CBs accept IEC 62915 for reduced retesting; verify with your CB
- BoM documentation must be maintained as a controlled document
- Cross-reference with IEC 61215 and IEC 61730 test reports`,
    sources: [
      "IEC TS 62915:2018 §5-7",
      "IEC 62915 Table 1 (Retest Matrix)",
      "CB Scheme Guidance OD-2019-001",
      "QMS-FORM-062 BoM Change Control",
    ],
  },
  uncertainty: {
    answer: `## Measurement Uncertainty Budget Template (ISO 17025 / GUM)

### I-V Measurement Uncertainty at STC

#### Type B Uncertainty Components
| Source | Value | Distribution | Divisor | u(xi) |
|--------|-------|-------------|---------|-------|
| Reference cell calibration | ±1.0% | Normal (k=2) | 2.0 | 0.500% |
| Spectral mismatch correction | ±0.5% | Rectangular | √3 | 0.289% |
| Spatial non-uniformity of irradiance | ±1.0% | Rectangular | √3 | 0.577% |
| Temperature measurement | ±1.0°C → ±0.4% | Rectangular | √3 | 0.231% |
| Temperature correction coefficient | ±5% relative | Rectangular | √3 | 0.115% |
| Data acquisition system | ±0.1% | Rectangular | √3 | 0.058% |
| Irradiance setting | ±0.5% | Rectangular | √3 | 0.289% |

#### Type A Uncertainty
- Repeatability (n=10 measurements): s = 0.25%, u_A = s/√n = **0.079%**

#### Combined & Expanded
- **Combined standard uncertainty:** u_c = √(Σu_i²) = **0.93%**
- **Effective degrees of freedom** (Welch-Satterthwaite): ν_eff ≈ 48
- **Coverage factor:** k = 2.01 (95.45% confidence)
- **Expanded uncertainty:** U = k × u_c = **±1.87%**

### Template Structure for Your Lab
1. Define measurand clearly (Pmax, Isc, Voc, FF)
2. Identify all input quantities
3. Evaluate Type A (statistical) components
4. Evaluate Type B (non-statistical) components
5. Calculate combined uncertainty
6. Apply Welch-Satterthwaite for effective DoF
7. Select coverage factor from t-distribution
8. Report expanded uncertainty with confidence level

Use the **Uncertainty Calculator** module in SolarLabX for automated computation.`,
    sources: [
      "GUM (JCGM 100:2008) §4-8",
      "ISO/IEC 17025:2017 §7.6",
      "IEC 60904-1:2020 Annex A",
      "EA-4/02 M:2022 (Expression of Uncertainty)",
      "Lab MU Budget MU-IV-001 Rev.3",
    ],
  },
  calibration: {
    answer: `## Equipment Calibration Requirements (ISO 17025)

### General Requirements (ISO/IEC 17025:2017 §6.4)
- All equipment affecting test results must be calibrated
- Calibration must be traceable to SI units (via NMI or accredited lab)
- Calibration intervals based on stability, usage, and manufacturer guidance
- Intermediate checks between calibrations

### Solar PV Lab Equipment Calibration Schedule
| Equipment | Calibration Interval | Traceable To | Intermediate Check |
|-----------|---------------------|-------------|-------------------|
| Reference Cell | 12 months | WRR (via PTB/NREL/CalLab) | Monthly (compare cells) |
| Sun Simulator | 12 months (classification) | IEC 60904-9 | Weekly uniformity check |
| I-V Curve Tracer | 12 months | NMI (voltage & current) | Monthly (ref module) |
| Temp/RH Chamber | 12 months (mapping) | NMI (temp & humidity) | Daily monitoring |
| Thermocouples | 12 months | NMI (ITS-90) | Quarterly (ice point) |
| Spectroradiometer | 12 months | NMI (spectral irradiance) | Monthly (lamp check) |
| Insulation Tester | 12 months | NMI (voltage & resistance) | Before use (internal cal) |
| Mechanical Load System | 12 months | NMI (force/pressure) | Monthly (check cell) |
| Data Logger | 24 months | NMI (voltage) | Quarterly (reference) |
| Pyranometer | 24 months | WRR (via regional center) | Monthly (compare) |

### Calibration Records Must Include
- Equipment ID and description
- Calibration date and due date
- Calibration procedure reference
- Environmental conditions during calibration
- Results with measurement uncertainty
- Pass/fail determination against acceptance criteria
- Calibration certificate number
- Traceability chain documentation

### Non-Conforming Equipment Procedure
1. Immediately take out of service and label
2. Evaluate impact on previous test results (lookback)
3. Notify affected clients if results were impacted
4. Recalibrate or repair before returning to service
5. Document in CAPA system`,
    sources: [
      "ISO/IEC 17025:2017 §6.4-6.5",
      "NABL 141:2019 Annex (PV Lab Specific)",
      "SOP-CAL-001 Calibration Management Rev.5",
      "Equipment Registry EQ-REG-2026",
    ],
  },
};

function findDemoResponse(query: string): {
  answer: string;
  sources: string[];
} {
  const q = query.toLowerCase();

  if (q.includes("61215") || (q.includes("test") && q.includes("sequence")))
    return DEMO_RESPONSES["iec 61215"];
  if (
    q.includes("qms") ||
    q.includes("audit") ||
    q.includes("checklist") ||
    q.includes("17025")
  )
    return DEMO_RESPONSES["qms audit"];
  if (q.includes("62915") || q.includes("design change") || q.includes("bom"))
    return DEMO_RESPONSES["iec 62915"];
  if (
    q.includes("uncertainty") ||
    q.includes("budget") ||
    q.includes("gum") ||
    q.includes("measurement")
  )
    return DEMO_RESPONSES["uncertainty"];
  if (
    q.includes("calibration") ||
    q.includes("equipment") ||
    q.includes("traceability")
  )
    return DEMO_RESPONSES["calibration"];

  // Generic fallback
  return {
    answer: `Thank you for your question about "${query}".

Based on the SolarLabX knowledge base covering IEC/ISO standards for solar PV testing:

This is currently running in **demo mode**. In production with Pinecone RAG enabled, this query would be:

1. **Embedded** using OpenAI text-embedding-3-small
2. **Matched** against our vector database containing:
   - IEC 61215, 61730, 62915, 60904, 60891, 62788, 61853, 62804, 61701, 62716
   - ISO/IEC 17025 requirements
   - Laboratory SOPs and work instructions
3. **Augmented** with retrieved context and sent to Claude for a grounded answer

### Quick Actions You Can Try
- "IEC 61215 test sequence" - Complete test requirements
- "QMS audit checklist ISO 17025" - Audit preparation
- "IEC 62915 design changes" - Retest requirements
- "Uncertainty budget template" - MU calculation guide
- "Equipment calibration requirements" - Calibration schedules

Configure \`PINECONE_API_KEY\`, \`ANTHROPIC_API_KEY\`, and \`OPENAI_API_KEY\` to enable full RAG mode.`,
    sources: ["SolarLabX Demo Mode", "Knowledge Base (local)"],
  };
}

async function* streamDemo(
  query: string
): AsyncGenerator<{ type: "text" | "sources"; data: string }> {
  const resp = findDemoResponse(query);

  // Stream the answer character-by-character in small chunks for realistic effect
  const chars = resp.answer;
  let i = 0;
  while (i < chars.length) {
    const chunkSize = Math.min(
      3 + Math.floor(Math.random() * 8),
      chars.length - i
    );
    yield { type: "text", data: chars.slice(i, i + chunkSize) };
    i += chunkSize;
    // Small delay simulated via the stream itself
    await new Promise((r) => setTimeout(r, 10 + Math.random() * 20));
  }

  // Send sources as a final event
  yield { type: "sources", data: JSON.stringify(resp.sources) };
}

// ---- Main handler ----------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history = [] } = body as {
      message: string;
      history: ChatMessage[];
    };

    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const anthropicKey =
      process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
    const pineconeKey = process.env.PINECONE_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    // ---------- DEMO MODE (no API keys) ----------
    if (!anthropicKey) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          for await (const chunk of streamDemo(message)) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`)
            );
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // ---------- RAG MODE (with Pinecone + OpenAI embeddings) ----------
    let ragContext = "";
    let ragSources: string[] = [];

    if (pineconeKey && openaiKey) {
      const embedding = await embedText(message);
      if (embedding.length > 0) {
        const results = await queryPinecone(embedding, 5);
        if (results.length > 0) {
          ragContext = results
            .map(
              (r, i) =>
                `[Source ${i + 1}: ${r.source} (relevance: ${(r.score * 100).toFixed(1)}%)]\n${r.text}`
            )
            .join("\n\n---\n\n");
          ragSources = Array.from(new Set(results.map((r) => r.source)));
        }
      }
    }

    // Build system prompt
    const systemPrompt = `You are SolarLabX AI Assistant, an expert in solar PV testing laboratory operations, IEC/ISO standards, and quality management systems.

Your knowledge covers:
- IEC 61215 (Design Qualification), IEC 61730 (Safety), IEC 61853 (Energy Rating)
- IEC 60904 (Measurement Procedures), IEC 60891 (I-V Translation)
- IEC 62915 (Type Test Sample Requirements), IEC 62788 (Material Testing)
- IEC 62804 (PID), IEC 61701 (Salt Mist), IEC 62716 (Ammonia)
- ISO/IEC 17025 (Lab Competence), ISO 9001 (Quality Management)
- GUM (Guide to Uncertainty in Measurement)
- NABL, ILAC, BIS compliance requirements

${ragContext ? `\n## Retrieved Context from Knowledge Base\nUse the following retrieved information to ground your answer. Cite the source references.\n\n${ragContext}\n` : ""}

Guidelines:
- Provide technically accurate, detailed answers with specific clause/section references
- Use markdown formatting with tables where appropriate
- When citing standards, include edition year and specific clause numbers
- If the context doesn't fully answer the question, supplement with your knowledge but note this
- For procedural questions, include step-by-step instructions with acceptance criteria
- Always mention relevant SolarLabX modules that can help (e.g., Uncertainty Calculator, LIMS, etc.)`;

    // Build messages array
    const claudeMessages = [
      ...history.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    // Stream response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const text of streamClaude(systemPrompt, claudeMessages)) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "text", data: text })}\n\n`
              )
            );
          }

          // Send sources if we have RAG context
          if (ragSources.length > 0) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "sources", data: JSON.stringify(ragSources) })}\n\n`
              )
            );
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          console.error("Stream error:", err);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", data: "Failed to generate response. Please try again." })}\n\n`
            )
          );
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
