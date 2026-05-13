import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// Stable expert persona — eligible for prompt caching on every call.
const SOLAR_EXPERT_SYSTEM = `You are an expert in solar PV testing laboratory operations and ISO/IEC standards. Generate a comprehensive Standard Operating Procedure (SOP) for a solar PV testing laboratory.

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

/**
 * POST /api/sop/generate
 * Generate a Standard Operating Procedure using the Anthropic SDK.
 * The stable expert system prompt is sent with cache_control so repeat
 * calls within the cache TTL skip re-tokenising the ~800-token system block.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      standard,
      clause,
      title,
      additionalContext,
      labName,
      documentNumber,
    } = body;

    if (!standard || !clause || !title) {
      return NextResponse.json(
        { error: "standard, clause, and title are required" },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    const client = new Anthropic({ apiKey });

    const userPrompt = [
      `STANDARD: ${standard}`,
      `CLAUSE/TEST METHOD: ${clause}`,
      `SOP TITLE: ${title}`,
      `LABORATORY: ${labName || "Solar PV Testing Laboratory"}`,
      documentNumber ? `DOCUMENT NUMBER: ${documentNumber}` : "",
      additionalContext ? `ADDITIONAL CONTEXT: ${additionalContext}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const response = await client.messages.create({
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
      response.content[0]?.type === "text" ? response.content[0].text : "";

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
        cache_read_tokens: response.usage?.cache_read_input_tokens ?? 0,
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface SOPMeta {
  title: string;
  standard: string;
  clause: string;
  labName: string;
  documentNumber: string;
}

function parseSOPResponse(text: string, meta: SOPMeta) {
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
