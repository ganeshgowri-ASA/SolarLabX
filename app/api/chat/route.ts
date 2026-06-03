import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// ---------------------------------------------------------------------------
// POST /api/chat – RAG-powered chat endpoint
// Accepts { message, history }
// 1. Embeds the user query and retrieves relevant chunks from Pinecone
// 2. Passes context + history to Claude via the Anthropic SDK (streaming)
// 3. Streams the response back as text/event-stream
// Falls back to Claude-only (no RAG) if Pinecone is not configured, and
// further falls back to a rich demo/mock mode when no API keys are set.
// ---------------------------------------------------------------------------

// Module-level client — connection-pooled across invocations.
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY,
});

/**
 * Stable assistant instruction block sent with cache_control: ephemeral.
 * The ~1 200-token block is re-used across chat turns within the 5-minute
 * cache TTL. Dynamic RAG context is injected as a separate (non-cached)
 * system block so the stable prefix remains cacheable.
 */
const ASSISTANT_SYSTEM = `\
You are SolarLabX AI Assistant, an expert advisor integrated into a solar PV testing laboratory's \
unified operations platform. You provide technically accurate, well-referenced answers to questions \
about PV module testing, laboratory quality management, IEC/ISO standards compliance, and measurement \
uncertainty.

## Domain Coverage

### PV Testing Standards
- IEC 61215 series: Design qualification and type approval of crystalline silicon PV modules. \
Complete MQT test sequences (MQT 01–19), sample requirements per sequence group (A/B/C/D), \
pass/fail criteria (≤5% power degradation, no major visual defects per Table 1), visual inspection \
criteria, and sequence diagrams for 8-module minimum test programs.
- IEC 61730 series: Safety qualification. Application class definitions (Class A/B/C), insulation \
test voltages (1000 V + 2×Voc for ≥1 min), grounding requirements, bypass diode thermal test \
(75 °C, 1 h per diode), fire classification.
- IEC 61853 series: Energy rating. 12-point irradiance × temperature matrix (100–1100 W/m², \
15–75 °C), temperature coefficient determination (α, β, γ), spectral responsivity, angular response, \
bifacial correction, energy yield methodology per specific climate datasets.
- IEC 60904 series: Measurement procedures — I-V curve tracing at STC (60904-1), reference solar \
device requirements (60904-2), calibration chain from WRR (60904-4), irradiance measurement \
(60904-6), EQE and spectral response (60904-8), sun simulator classification A+/A/B/C using spectral \
match, spatial uniformity, temporal instability (60904-9), angle-of-incidence correction (60904-10), \
bifacial measurement (60904-1-2).
- IEC 60891: I-V translation procedures — Procedure 1 (α/β temperature coefficients), Procedure 2 \
(reference Isc ratio), Procedure 3 (linear interpolation between conditions).
- IEC 62915: Retest after design change. Component change matrix, partial retest eligibility, BoM.
- IEC 62788: Material testing — backsheet peel, encapsulant UV transmission, junction box pull.
- IEC 62804 (PID), IEC 61701 (salt mist), IEC 62716 (ammonia), IEC 62782 (dynamic mechanical load).

### Laboratory Quality Management
- ISO/IEC 17025:2017: Full clause coverage — impartiality and confidentiality (§4–5), resources \
(personnel competency §6.2, facilities §6.3, equipment and calibration §6.4, traceability §6.5), \
process requirements (method validation §7.2, sampling §7.3, handling §7.4, technical records §7.5, \
measurement uncertainty §7.6, quality control §7.7, reporting §7.8), management system (§8).
- ISO 9001:2015: Context, leadership, planning, support, operation, performance evaluation, \
improvement.
- JCGM 100:2008 GUM: Type A (statistical) and Type B (non-statistical) uncertainty evaluation, law \
of propagation of uncertainty, Welch-Satterthwaite formula for effective degrees of freedom, \
Student-t coverage factor selection, expanded uncertainty reporting at 95% confidence.
- NABL 141: Specific accreditation criteria for PV testing laboratories in India.
- ILAC P14: Policy for uncertainty in calibration.

### SolarLabX Platform
Point users to the right module:
- LIMS (/lims): sample registration, test execution workflows, chain of custody, equipment \
calibration tracking, barcode/QR label generation.
- QMS (/qms): document control, CAPA management, management review, internal audit scheduling.
- Audit (/audit): ISO 9001/17025 audit planning, NC/OFI tracking with severity, 8D/CAR \
problem-solving, auditor competency.
- Projects (/projects): test project Gantt charts, milestone tracking, resource allocation, client \
deliverables, project costing.
- Uncertainty Calculator (/uncertainty): GUM budget builder with Type A/B components, Monte Carlo \
simulation (GUM-S1), Welch-Satterthwaite, k-factor selection, budget PDF export.
- Vision AI (/vision-ai): AI-powered defect detection (EL, IR, visual inspection) via Roboflow; \
crack, hotspot, snail trail, PID classification.
- SOP Generator (/sop-gen): AI-assisted SOP authoring referenced to IEC/ISO clauses.
- Reports (/reports): ISO 17025-compliant automated test report generation with digital signatures.
- Sun Simulator (/sun-simulator): IEC 60904-9 classification — spectral match, spatial uniformity, \
temporal stability assessment.
- Chamber Config (/chamber-config): environmental chamber specifications, CFD visualisation, quoting.
- Procurement (/procurement): RFQ, Technical Bid Evaluation, PO tracking, FAT/SAT management.

## Response Guidelines

1. **Cite precisely**: Standard code + edition year + clause (e.g., "IEC 61215-1:2021 §7.4.3").
2. **Use structured markdown**: Tables for comparison data, numbered steps for procedures.
3. **State acceptance criteria numerically**: "power degradation ≤ 5%" — never just "acceptable".
4. **Distinguish certainty levels**: Separate information directly from the standard versus reasoned \
interpretation. State assumptions explicitly.
5. **Point to SolarLabX modules**: When a module directly addresses the question, mention it by name \
and route path.
6. **Uncertainty**: Remind users that ISO/IEC 17025 §7.8.3 requires test reports to include a \
statement of measurement uncertainty with coverage factor and confidence level.`;

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
  const indexHost = process.env.PINECONE_INDEX;
  if (!apiKey || !indexHost) return [];

  const host = indexHost.startsWith("http") ? indexHost : `https://${indexHost}`;

  const res = await fetch(`${host}/query`, {
    method: "POST",
    headers: {
      "Api-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ vector: queryEmbedding, topK, includeMetadata: true }),
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
    body: JSON.stringify({ model: "text-embedding-3-small", input: text }),
  });

  if (!res.ok) {
    console.error("OpenAI embedding error:", await res.text());
    return [];
  }

  const data = await res.json();
  return data.data?.[0]?.embedding ?? [];
}

// ---- SDK streaming helper --------------------------------------------------

async function* streamClaude(
  systemBlocks: Anthropic.TextBlockParam[],
  messages: Anthropic.MessageParam[]
): AsyncGenerator<string> {
  const stream = client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: systemBlocks,
    messages,
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
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

function findDemoResponse(query: string): { answer: string; sources: string[] } {
  const q = query.toLowerCase();

  if (q.includes("61215") || (q.includes("test") && q.includes("sequence")))
    return DEMO_RESPONSES["iec 61215"];
  if (q.includes("qms") || q.includes("audit") || q.includes("checklist") || q.includes("17025"))
    return DEMO_RESPONSES["qms audit"];
  if (q.includes("62915") || q.includes("design change") || q.includes("bom"))
    return DEMO_RESPONSES["iec 62915"];
  if (q.includes("uncertainty") || q.includes("budget") || q.includes("gum") || q.includes("measurement"))
    return DEMO_RESPONSES["uncertainty"];
  if (q.includes("calibration") || q.includes("equipment") || q.includes("traceability"))
    return DEMO_RESPONSES["calibration"];

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
  const chars = resp.answer;
  let i = 0;
  while (i < chars.length) {
    const chunkSize = Math.min(3 + Math.floor(Math.random() * 8), chars.length - i);
    yield { type: "text", data: chars.slice(i, i + chunkSize) };
    i += chunkSize;
    await new Promise((r) => setTimeout(r, 10 + Math.random() * 20));
  }
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

    const anthropicKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
    const pineconeKey = process.env.PINECONE_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    // ---------- DEMO MODE (no API keys) ----------
    if (!anthropicKey) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          for await (const chunk of streamDemo(message)) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
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

    // Build system blocks: stable instructions are cached; RAG context is not.
    const systemBlocks: Anthropic.TextBlockParam[] = [
      {
        type: "text",
        text: ASSISTANT_SYSTEM,
        cache_control: { type: "ephemeral" },
      },
    ];

    if (ragContext) {
      systemBlocks.push({
        type: "text",
        text: `## Retrieved Context from Knowledge Base\nUse the following retrieved information to ground your answer. Cite the source references.\n\n${ragContext}`,
      });
    }

    const claudeMessages: Anthropic.MessageParam[] = [
      ...history.slice(-10).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    // Stream response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const text of streamClaude(systemBlocks, claudeMessages)) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "text", data: text })}\n\n`
              )
            );
          }

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
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
