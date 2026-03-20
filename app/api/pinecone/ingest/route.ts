import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// POST /api/pinecone/ingest
// Ingest text documents into Pinecone for RAG retrieval.
//
// Body: { documents: [{ text, source, metadata? }] }
//   or  { text, source } for a single document
//
// Chunks the text with overlap, embeds via OpenAI, and upserts to Pinecone.
// Returns { success, chunksIngested, documentSource }
// ---------------------------------------------------------------------------

interface IngestDocument {
  text: string;
  source: string;
  metadata?: Record<string, string>;
}

// ---- Text chunking --------------------------------------------------------

function chunkText(
  text: string,
  chunkSize = 800,
  overlap = 150
): string[] {
  const chunks: string[] = [];
  // Split by paragraph first for natural boundaries
  const paragraphs = text.split(/\n\s*\n/);
  let currentChunk = "";

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    if (currentChunk.length + trimmed.length + 1 > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      // Overlap: keep the tail of the current chunk
      const words = currentChunk.split(/\s+/);
      const overlapWords = words.slice(-Math.ceil(overlap / 5));
      currentChunk = overlapWords.join(" ") + "\n\n" + trimmed;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + trimmed;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  // If a single chunk is too large, split it further by sentences
  const result: string[] = [];
  for (const chunk of chunks) {
    if (chunk.length <= chunkSize * 1.5) {
      result.push(chunk);
    } else {
      const sentences = chunk.match(/[^.!?]+[.!?]+/g) || [chunk];
      let sub = "";
      for (const sentence of sentences) {
        if (sub.length + sentence.length > chunkSize && sub.length > 0) {
          result.push(sub.trim());
          const words = sub.split(/\s+/);
          const overlapWords = words.slice(-Math.ceil(overlap / 5));
          sub = overlapWords.join(" ") + " " + sentence;
        } else {
          sub += sentence;
        }
      }
      if (sub.trim()) result.push(sub.trim());
    }
  }

  return result;
}

// ---- Embedding helper ------------------------------------------------------

async function embedBatch(
  texts: string[],
  apiKey: string
): Promise<number[][]> {
  // OpenAI supports batch embedding
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: texts,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI embedding error: ${res.status} - ${err}`);
  }

  const data = await res.json();
  const items = data.data as { embedding: number[]; index: number }[];
  items.sort((a, b) => a.index - b.index);
  return items.map((d) => d.embedding);
}

// ---- Pinecone upsert -------------------------------------------------------

async function upsertPinecone(
  vectors: { id: string; values: number[]; metadata: Record<string, string> }[],
  apiKey: string,
  indexHost: string
): Promise<void> {
  const host = indexHost.startsWith("http")
    ? indexHost
    : `https://${indexHost}`;

  // Upsert in batches of 100
  for (let i = 0; i < vectors.length; i += 100) {
    const batch = vectors.slice(i, i + 100);
    const res = await fetch(`${host}/vectors/upsert`, {
      method: "POST",
      headers: {
        "Api-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ vectors: batch }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Pinecone upsert error: ${res.status} - ${err}`);
    }
  }
}

// ---- Main handler ----------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const pineconeKey = process.env.PINECONE_API_KEY;
    const pineconeIndex = process.env.PINECONE_INDEX;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!pineconeKey || !pineconeIndex) {
      return NextResponse.json(
        {
          error: "Pinecone not configured",
          message:
            "Set PINECONE_API_KEY and PINECONE_INDEX environment variables to enable ingestion.",
          demo: true,
        },
        { status: 200 }
      );
    }

    if (!openaiKey) {
      return NextResponse.json(
        {
          error: "OpenAI not configured",
          message:
            "Set OPENAI_API_KEY environment variable for text embeddings.",
        },
        { status: 200 }
      );
    }

    const body = await request.json();

    // Support single doc or array
    let documents: IngestDocument[];
    if (Array.isArray(body.documents)) {
      documents = body.documents;
    } else if (body.text && body.source) {
      documents = [{ text: body.text, source: body.source, metadata: body.metadata }];
    } else {
      return NextResponse.json(
        { error: "Provide { text, source } or { documents: [...] }" },
        { status: 400 }
      );
    }

    let totalChunks = 0;
    const results: { source: string; chunks: number }[] = [];

    for (const doc of documents) {
      const chunks = chunkText(doc.text);
      if (chunks.length === 0) continue;

      // Embed in batches of 100
      const allVectors: {
        id: string;
        values: number[];
        metadata: Record<string, string>;
      }[] = [];

      for (let i = 0; i < chunks.length; i += 100) {
        const batch = chunks.slice(i, i + 100);
        const embeddings = await embedBatch(batch, openaiKey);

        for (let j = 0; j < batch.length; j++) {
          const chunkIndex = i + j;
          allVectors.push({
            id: `${doc.source.replace(/\s+/g, "-").toLowerCase()}-chunk-${chunkIndex}`,
            values: embeddings[j],
            metadata: {
              text: batch[j],
              source: doc.source,
              chunkIndex: String(chunkIndex),
              totalChunks: String(chunks.length),
              ingestedAt: new Date().toISOString(),
              ...(doc.metadata || {}),
            },
          });
        }
      }

      await upsertPinecone(allVectors, pineconeKey, pineconeIndex);
      totalChunks += allVectors.length;
      results.push({ source: doc.source, chunks: allVectors.length });
    }

    return NextResponse.json({
      success: true,
      totalChunksIngested: totalChunks,
      documents: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Ingest error:", error);
    return NextResponse.json(
      {
        error: "Ingestion failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET /api/pinecone/ingest - Return ingest status / info
export async function GET() {
  const pineconeConfigured = !!(
    process.env.PINECONE_API_KEY && process.env.PINECONE_INDEX
  );
  const openaiConfigured = !!process.env.OPENAI_API_KEY;

  // List of supported standards for the knowledge base
  const supportedStandards = [
    { id: "iec-61215", name: "IEC 61215", title: "Design Qualification & Type Approval", status: pineconeConfigured ? "ready" : "demo" },
    { id: "iec-61730", name: "IEC 61730", title: "PV Module Safety", status: pineconeConfigured ? "ready" : "demo" },
    { id: "iec-62915", name: "IEC 62915", title: "Type Test Sample Requirements", status: pineconeConfigured ? "ready" : "demo" },
    { id: "iec-60904", name: "IEC 60904", title: "PV Measurement Procedures", status: pineconeConfigured ? "ready" : "demo" },
    { id: "iec-60891", name: "IEC 60891", title: "I-V Characteristic Translation", status: pineconeConfigured ? "ready" : "demo" },
    { id: "iec-62788", name: "IEC 62788", title: "Material Testing Procedures", status: pineconeConfigured ? "ready" : "demo" },
    { id: "iec-61853", name: "IEC 61853", title: "PV Module Energy Rating", status: pineconeConfigured ? "ready" : "demo" },
    { id: "iec-62804", name: "IEC 62804", title: "PID Testing", status: pineconeConfigured ? "ready" : "demo" },
    { id: "iec-61701", name: "IEC 61701", title: "Salt Mist Corrosion", status: pineconeConfigured ? "ready" : "demo" },
    { id: "iec-62716", name: "IEC 62716", title: "Ammonia Corrosion", status: pineconeConfigured ? "ready" : "demo" },
    { id: "iso-17025", name: "ISO/IEC 17025", title: "Lab Competence Requirements", status: pineconeConfigured ? "ready" : "demo" },
  ];

  return NextResponse.json({
    pineconeConfigured,
    openaiConfigured,
    mode: pineconeConfigured ? "rag" : "demo",
    standards: supportedStandards,
    embeddingModel: "text-embedding-3-small",
    chunkSize: 800,
    chunkOverlap: 150,
  });
}
