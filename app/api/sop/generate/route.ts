import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ALLOWED_STANDARDS = [
  "IEC 61215", "IEC 61730", "IEC 61853", "IEC 60904", "IEC 60891",
  "IEC 62915", "IEC 62788", "IEC 62804", "IEC 61701", "IEC 62716",
  "ISO/IEC 17025", "ISO 9001", "NABL", "other",
];

const SopRequestSchema = z.object({
  standard: z.string().min(1).max(60).trim(),
  clause: z.string().min(1).max(120).trim(),
  title: z.string().min(1).max(200).trim(),
  additionalContext: z.string().max(2000).trim().optional().default(""),
  labName: z.string().max(200).trim().optional().default("Solar PV Testing Laboratory"),
  documentNumber: z.string().max(50).trim().optional().default(""),
});

function stripControlChars(s: string): string {
  // Remove characters that could be used to inject LLM instructions
  // eslint-disable-next-line no-control-regex
  return s.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const parsed = SopRequestSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { standard, clause, title, additionalContext, labName, documentNumber } = parsed.data;

    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    const params = {
      standard: stripControlChars(standard),
      clause: stripControlChars(clause),
      title: stripControlChars(title),
      additionalContext: stripControlChars(additionalContext),
      labName: stripControlChars(labName),
      documentNumber: stripControlChars(documentNumber),
    };

    const prompt = buildSOPPrompt(params);

    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 8192,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error("Claude API error:", errorText);
      return NextResponse.json(
        { error: `Claude API error: ${claudeResponse.status}` },
        { status: 502 }
      );
    }

    const claudeData = await claudeResponse.json();
    const responseText = claudeData.content?.[0]?.text || "";

    const sop = parseSOPResponse(responseText, params);

    return NextResponse.json({
      sop,
      metadata: {
        model: "claude-sonnet-4-6",
        timestamp: new Date().toISOString(),
        standard,
        clause,
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

interface SOPPromptParams {
  standard: string;
  clause: string;
  title: string;
  additionalContext: string;
  labName: string;
  documentNumber: string;
}

function buildSOPPrompt(params: SOPPromptParams): string {
  // Sentinel delimiters prevent user-supplied values from being treated as instructions
  return `You are an expert in solar PV testing laboratory operations and ISO/IEC standards. Generate a comprehensive Standard Operating Procedure (SOP) for a solar PV testing laboratory.

<document_metadata>
STANDARD: ${params.standard}
CLAUSE/TEST METHOD: ${params.clause}
SOP TITLE: ${params.title}
LABORATORY: ${params.labName}${params.documentNumber ? `\nDOCUMENT NUMBER: ${params.documentNumber}` : ""}
</document_metadata>

${params.additionalContext ? `<additional_context>\n${params.additionalContext}\n</additional_context>\n` : ""}
Generate the SOP with the following sections. Use clear, precise technical language appropriate for a NABL/ISO 17025 accredited laboratory. Include specific procedural steps, acceptance criteria where applicable, and reference standard clauses.

Respond with EXACTLY these section headers (one per section), followed by the content:

PURPOSE:
[content]

SCOPE:
[content]

REFERENCES:
[content]

DEFINITIONS:
[content]

RESPONSIBILITIES:
[content]

PROCEDURE:
[content - include numbered steps with sub-steps]

RECORDS:
[content - list forms, templates, and records]

REVISION_HISTORY:
[content]

Ensure the procedure section is detailed with specific steps, temperatures, durations, and acceptance criteria from the standard. Include safety precautions where relevant.`;
}

function parseSOPResponse(
  text: string,
  meta: { title: string; standard: string; clause: string; labName: string; documentNumber: string }
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
    let endPos = i + 1 < positions.length ? positions[i + 1].index : text.length;
    if (i + 1 < positions.length) {
      const nextKey = sectionKeys.find((s) => s.key === positions[i + 1].key);
      if (nextKey) {
        const headerMatch = text.substring(positions[i].index).match(nextKey.pattern);
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
