import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ALLOWED_INSPECTION_TYPES = ["el", "ir", "visual"] as const;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_PREFIXES = ["image/jpeg", "image/png", "image/webp", "image/tiff", "image/bmp"];

const InspectionTypeSchema = z.enum(ALLOWED_INSPECTION_TYPES);
const ModuleIdSchema = z.string().max(100).trim().optional().default("");

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;

    const inspectionTypeRaw = formData.get("inspectionType") as string | null;
    const inspectionTypeParsed = InspectionTypeSchema.safeParse(inspectionTypeRaw ?? "el");
    if (!inspectionTypeParsed.success) {
      return NextResponse.json(
        { error: "inspectionType must be one of: el, ir, visual" },
        { status: 400 }
      );
    }
    const inspectionType = inspectionTypeParsed.data;

    const moduleIdParsed = ModuleIdSchema.safeParse(formData.get("moduleId") as string | null ?? "");
    const moduleId = moduleIdParsed.success ? moduleIdParsed.data : "";

    if (!imageFile) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    if (imageFile.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Image too large. Maximum size is 10 MB." },
        { status: 400 }
      );
    }

    const mimeType = imageFile.type.toLowerCase();
    if (!ALLOWED_MIME_PREFIXES.includes(mimeType)) {
      return NextResponse.json(
        { error: "Unsupported image type. Upload JPEG, PNG, WebP, TIFF, or BMP." },
        { status: 400 }
      );
    }

    const apiKey = process.env.ROBOFLOW_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ROBOFLOW_API_KEY not configured" },
        { status: 500 }
      );
    }

    const modelMap: Record<string, string> = {
      el: process.env.ROBOFLOW_EL_MODEL || "solar-panel-defect-detection/1",
      ir: process.env.ROBOFLOW_IR_MODEL || "solar-panel-thermal/1",
      visual: process.env.ROBOFLOW_VISUAL_MODEL || "solar-panel-defects/1",
    };

    const modelId = modelMap[inspectionType];

    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    const roboflowUrl = `https://detect.roboflow.com/${modelId}?api_key=${apiKey}&confidence=40&overlap=30`;

    const roboflowResponse = await fetch(roboflowUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: base64Image,
    });

    if (!roboflowResponse.ok) {
      const errorText = await roboflowResponse.text();
      console.error("Roboflow API error:", errorText);
      return NextResponse.json(
        { error: `Roboflow API error: ${roboflowResponse.status}` },
        { status: 502 }
      );
    }

    const roboflowData = await roboflowResponse.json();

    const predictions = (roboflowData.predictions || []).map((pred: any) => ({
      x: pred.x,
      y: pred.y,
      width: pred.width,
      height: pred.height,
      class: normalizeDefectClass(pred.class),
      confidence: pred.confidence,
    }));

    return NextResponse.json({
      predictions,
      image: roboflowData.image || { width: 0, height: 0 },
      metadata: {
        inspectionType,
        moduleId,
        model: modelId,
        timestamp: new Date().toISOString(),
        defectCount: predictions.length,
      },
    });
  } catch (error) {
    console.error("Detection error:", error);
    return NextResponse.json(
      { error: "Internal server error during detection" },
      { status: 500 }
    );
  }
}

function normalizeDefectClass(rawClass: string): string {
  const classMap: Record<string, string> = {
    "crack": "crack",
    "cell-crack": "crack",
    "cell_crack": "crack",
    "micro-crack": "crack",
    "hotspot": "hotspot",
    "hot-spot": "hotspot",
    "hot_spot": "hotspot",
    "snail-trail": "snail_trail",
    "snail_trail": "snail_trail",
    "snailtrail": "snail_trail",
    "pid": "pid",
    "potential-induced-degradation": "pid",
    "busbar": "busbar_misalignment",
    "busbar-misalignment": "busbar_misalignment",
    "busbar_misalignment": "busbar_misalignment",
    "cell-breakage": "cell_breakage",
    "cell_breakage": "cell_breakage",
    "broken-cell": "cell_breakage",
    "delamination": "delamination",
    "discoloration": "discoloration",
    "corrosion": "corrosion",
    "broken-interconnect": "broken_interconnect",
    "broken_interconnect": "broken_interconnect",
  };

  const normalized = rawClass.toLowerCase().trim();
  return classMap[normalized] || normalized;
}
