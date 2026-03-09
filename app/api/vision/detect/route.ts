import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/vision/detect
 * Proxy to Roboflow API for PV module defect detection.
 *
 * Accepts multipart form data with:
 * - image: The PV module image file (EL, IR, or visual)
 * - inspectionType: "el" | "ir" | "visual"
 * - moduleId: Optional module identifier
 *
 * Forwards the image to Roboflow's inference API and returns
 * detection predictions with bounding boxes and confidence scores.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;
    const inspectionType = formData.get("inspectionType") as string || "el";
    const moduleId = formData.get("moduleId") as string || "";

    if (!imageFile) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const apiKey = process.env.ROBOFLOW_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ROBOFLOW_API_KEY not configured" },
        { status: 500 }
      );
    }

    // Model selection based on inspection type
    // These can be configured per Roboflow workspace/project
    const modelMap: Record<string, string> = {
      el: process.env.ROBOFLOW_EL_MODEL || "solar-panel-defect-detection/1",
      ir: process.env.ROBOFLOW_IR_MODEL || "solar-panel-thermal/1",
      visual: process.env.ROBOFLOW_VISUAL_MODEL || "solar-panel-defects/1",
    };

    const modelId = modelMap[inspectionType] || modelMap.el;

    // Convert image to base64 for Roboflow API
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    // Call Roboflow Inference API
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

    // Transform Roboflow response to our detection format
    // Roboflow returns: { predictions: [{ x, y, width, height, class, confidence }], image: { width, height } }
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

/**
 * Normalize defect class names from Roboflow model output
 * to our standardized defect type IDs.
 */
function normalizeDefectClass(rawClass: string): string {
  const classMap: Record<string, string> = {
    // Common Roboflow model output labels
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
