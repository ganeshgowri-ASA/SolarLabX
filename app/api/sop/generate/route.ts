import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/sop/generate
 * Generate a Standard Operating Procedure using Claude API.
 *
 * Accepts JSON body with:
 * - standard: The IEC/ISO standard identifier
 * - clause: The specific clause/test method
 * - title: SOP title
 * - additionalContext: Optional additional context
 * - labName: Laboratory name
 * - documentNumber: Optional SOP document number
 */
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

    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "CLAUDE_API_KEY not configured" },
        { status: 500 }
      );
    }

    const prompt = buildSOPPrompt({ standard, clause, title, additionalContext, labName, documentNumber });

    // Call Claude API
    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
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

    // Parse the structured SOP from Claude's response
    const sop = parseSOPResponse(responseText, { title, standard, clause, labName, documentNumber });

    return NextResponse.json({
      sop,
      metadata: {
        model: "claude-sonnet-4-20250514",
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
  return `You are an expert in solar PV testing laboratory operations and ISO/IEC standards. Generate a comprehensive Standard Operating Procedure (SOP) for a solar PV testing laboratory.

STANDARD: ${params.standard}
CLAUSE/TEST METHOD: ${params.clause}
SOP TITLE: ${params.title}
LABORATORY: ${params.labName || "Solar PV Testing Laboratory"}
${params.documentNumber ? `DOCUMENT NUMBER: ${params.documentNumber}` : ""}
${params.additionalContext ? `ADDITIONAL CONTEXT: ${params.additionalContext}` : ""}

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

  // Find positions of each section header
  const positions: { key: string; index: number }[] = [];
  for (const { pattern, key } of sectionKeys) {
    const match = text.match(pattern);
    if (match && match.index !== undefined) {
      positions.push({ key, index: match.index + match[0].length });
    }
  }

  // Sort by position
  positions.sort((a, b) => a.index - b.index);

  // Extract content between headers
  for (let i = 0; i < positions.length; i++) {
    const start = positions[i].index;
    const end = i + 1 < positions.length ? positions[i + 1].index : text.length;
    // Find the start of the next section header (go back to find the header)
    let endPos = end;
    if (i + 1 < positions.length) {
      // Find the actual header text before the next section
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
