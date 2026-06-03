import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// Module-level client — connection-pooled across invocations.
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY,
});

/**
 * Stable expert-persona system block sent with cache_control: ephemeral.
 * Repeat SOP generations within the 5-minute cache TTL skip re-tokenising
 * this ~1 200-token block, reducing latency and input-token costs.
 */
const SOLAR_EXPERT_SYSTEM = `\
You are a senior technical writer and solar PV testing specialist embedded in a NABL/ISO 17025 \
accredited laboratory. Your primary responsibility is producing Standard Operating Procedures (SOPs) \
that comply with ISO/IEC 17025:2017 Clause 7.2 requirements for documented methods and are ready \
for internal review, approval, and auditor inspection.

## Domain Expertise

### Standards and Test Methods
- IEC 61215 series: Design qualification and type approval of crystalline silicon PV modules. \
MQT test sequences (MQT 01–19), sample requirements per sequence, pass/fail criteria, visual \
inspection criteria (Table 1), and sequence diagrams.
- IEC 61730 series: Safety qualification of PV modules. Application class definitions (Class A/B/C), \
insulation test voltages (1000 V + 2×Voc), grounding requirements, bypass diode thermal test \
(75 °C, 1 h), fire rating.
- IEC 61853 series: PV module energy rating. 12-point irradiance × temperature matrix testing, \
temperature coefficient determination, spectral response measurement, angular response, bifacial \
correction factors, energy yield calculation methodology.
- IEC 60904 series: Measurement procedures for PV devices — I-V curve tracing (60904-1), \
reference solar device requirements (60904-2), calibration chain (60904-4), irradiance measurement \
(60904-6), EQE and spectral response (60904-8), sun simulator classification A+/A/B/C (60904-9), \
angle-of-incidence correction (60904-10), bifacial (60904-1-2).
- IEC 60891: I-V characteristic translation procedures — Procedure 1 (temperature coefficients), \
Procedure 2 (reference Isc ratio), Procedure 3 (linear interpolation between two conditions).
- IEC 62915: Type test sample requirements after design changes. Component change matrix, partial \
retest eligibility criteria, BoM documentation requirements.
- IEC 62788: Material testing — backsheet peel strength, encapsulant UV transmission, junction box.
- IEC 62804: Potential-induced degradation (PID) — high-voltage stress at elevated T and RH.
- IEC 61701: Salt mist corrosion testing. IEC 62716: Ammonia corrosion testing.
- ISO/IEC 17025:2017: General requirements for laboratory competence — clauses 4–8 in full.
- JCGM 100:2008 GUM: Type A/B evaluation, law of propagation, Welch-Satterthwaite, coverage factors.
- NABL 141: Specific accreditation criteria for photovoltaic testing laboratories in India.

### Laboratory Equipment Context
Solar simulators (IEC 60904-9 Class A+/A/B/C), environmental chambers (thermal cycling, damp heat, \
humidity-freeze, UV preconditioning), I-V curve tracers with four-wire Kelvin connections, reference \
solar cells (primary and secondary standards traceable to WRR via PTB/NREL/CalLab), \
spectroradiometers, insulation testers, EL imaging systems, IR thermography cameras, mechanical load \
frames, and data acquisition systems.

## Document Writing Standards

1. **Precision**: State every parameter numerically with units and tolerance. Do not write \
"high temperature" — write "85 °C ± 2 °C". Do not write "several hours" — write "1000 h ± 2 h".
2. **Traceability**: For every measurement instrument in the PROCEDURE, state the calibration \
requirement (standard/method, valid certificate required, traceable to SI units via NMI or \
accredited body).
3. **Standard references**: Quote clause numbers explicitly, e.g., "per IEC 61215-1:2021 §7.4.1".
4. **Safety**: Include a bold **SAFETY** warning immediately before steps involving high voltage \
(≥50 V DC or ≥25 V AC), thermal hazard (chamber > 100 °C), UV radiation, heavy loads, or chemicals.
5. **Responsibilities**: Map each activity to a specific role — Lab Manager, Test Engineer, \
Technician, or Quality Assurance. State who executes, who witnesses, who approves.
6. **Acceptance criteria**: For every step that produces a measurable result, state the pass/fail \
criterion numerically with the standard clause from which it is derived.
7. **Revision control**: Always include a REVISION_HISTORY table with columns: \
Rev | Date | Description | Author | Approved By.

## Output Format

Respond with EXACTLY these section headers, each on its own line, followed by the content:

PURPOSE:
[One paragraph: measurand, method principle, and scope boundaries]

SCOPE:
[Applicable module types, test phases, and responsible organisational unit]

REFERENCES:
[Bulleted list: standard code, edition year, full title]

DEFINITIONS:
[Abbreviations and technical terms used in this SOP, in alphabetical order]

RESPONSIBILITIES:
[Role → specific responsibilities; include authorities and limitations]

PROCEDURE:
[Numbered top-level steps; sub-steps lettered (a, b, c); cover set-up, pre-conditioning, \
execution, data recording, equipment shutdown, and post-test sample disposition]

RECORDS:
[Each record on its own line: Form/Log ID | Title | Retention Period | Location]

REVISION_HISTORY:
[Markdown table: Rev | Date | Description | Author | Approved By — include Rev 1.0 as "Initial issue"]`;

interface SOPPromptParams {
  standard: string;
  clause: string;
  title: string;
  additionalContext: string;
  labName: string;
  documentNumber: string;
}

function buildSOPUserPrompt(params: SOPPromptParams): string {
  const lines = [
    `Generate the SOP for the following:`,
    ``,
    `STANDARD: ${params.standard}`,
    `CLAUSE/TEST METHOD: ${params.clause}`,
    `SOP TITLE: ${params.title}`,
    `LABORATORY: ${params.labName || "Solar PV Testing Laboratory"}`,
  ];
  if (params.documentNumber) lines.push(`DOCUMENT NUMBER: ${params.documentNumber}`);
  if (params.additionalContext) lines.push(`ADDITIONAL CONTEXT: ${params.additionalContext}`);
  return lines.join("\n");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { standard, clause, title, additionalContext, labName, documentNumber } = body;

    if (!standard || !clause || !title) {
      return NextResponse.json(
        { error: "standard, clause, and title are required" },
        { status: 400 }
      );
    }

    if (!(process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY)) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    const userPrompt = buildSOPUserPrompt({
      standard,
      clause,
      title,
      additionalContext,
      labName,
      documentNumber,
    });

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: [
        {
          type: "text",
          text: SOLAR_EXPERT_SYSTEM,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userPrompt }],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    const sop = parseSOPResponse(responseText, {
      title,
      standard,
      clause,
      labName,
      documentNumber,
    });

    return NextResponse.json({
      sop,
      metadata: {
        model: "claude-sonnet-4-6",
        timestamp: new Date().toISOString(),
        standard,
        clause,
        cache_read_tokens: message.usage.cache_read_input_tokens ?? 0,
        cache_created_tokens: message.usage.cache_creation_input_tokens ?? 0,
      },
    });
  } catch (error) {
    console.error("SOP generation error:", error);
    return NextResponse.json(
      { error: "Internal server error during SOP generation" },
      { status: 500 }
    );
  }
}

function parseSOPResponse(
  text: string,
  meta: {
    title: string;
    standard: string;
    clause: string;
    labName: string;
    documentNumber: string;
  }
) {
  const sections: Record<string, string> = {
    purpose: "",
    scope: "",
    references: "",
    definitions: "",
    responsibilities: "",
    procedure: "",
    records: "",
    revisionHistory: "",
  };

  const sectionKeys = [
    { pattern: /PURPOSE:\s*/i, key: "purpose" },
    { pattern: /SCOPE:\s*/i, key: "scope" },
    { pattern: /REFERENCES:\s*/i, key: "references" },
    { pattern: /DEFINITIONS:\s*/i, key: "definitions" },
    { pattern: /RESPONSIBILITIES:\s*/i, key: "responsibilities" },
    { pattern: /PROCEDURE:\s*/i, key: "procedure" },
    { pattern: /RECORDS:\s*/i, key: "records" },
    { pattern: /REVISION[_\s]HISTORY:\s*/i, key: "revisionHistory" },
  ];

  const positions: { key: string; index: number }[] = [];
  for (const { pattern, key } of sectionKeys) {
    const match = text.match(pattern);
    if (match && match.index !== undefined) {
      positions.push({ key, index: match.index + match[0].length });
    }
  }
  positions.sort((a, b) => a.index - b.index);

  for (let i = 0; i < positions.length; i++) {
    const start = positions[i].index;
    let endPos =
      i + 1 < positions.length ? positions[i + 1].index : text.length;
    if (i + 1 < positions.length) {
      const nextKey = sectionKeys.find((s) => s.key === positions[i + 1].key);
      if (nextKey) {
        const headerMatch = text
          .substring(positions[i].index)
          .match(nextKey.pattern);
        if (headerMatch && headerMatch.index !== undefined) {
          endPos = positions[i].index + headerMatch.index;
        }
      }
    }
    sections[positions[i].key] = text.substring(start, endPos).trim();
  }

  return {
    title: meta.title,
    sopNumber: meta.documentNumber || `SOP-${Date.now()}`,
    standard: meta.standard,
    clause: meta.clause,
    version: "1.0",
    status: "draft",
    createdAt: new Date().toISOString().split("T")[0],
    updatedAt: new Date().toISOString().split("T")[0],
    author: "AI Generated",
    approver: "Pending",
    sections,
  };
}
