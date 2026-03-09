import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { REPORT_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ReportTemplateProps {
  templateId: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export function ReportTemplate({ templateId, isSelected, onClick }: ReportTemplateProps) {
  const template = REPORT_TYPES.find((t) => t.id === templateId);
  if (!template) return null;

  const testSections: Record<string, string[]> = {
    iec_61215_qualification: [
      "Visual Inspection (MQT 01)", "Maximum Power (MQT 02)", "Insulation Test (MQT 03)",
      "Temperature Coefficients (MQT 04)", "NMOT (MQT 05)", "Performance at STC (MQT 06)",
      "Outdoor Exposure (MQT 09)", "Hot-spot (MQT 10)", "UV Preconditioning (MQT 11.1)",
      "Thermal Cycling (MQT 11)", "Humidity Freeze (MQT 12)", "Damp Heat (MQT 13)",
      "Mechanical Load (MQT 16)", "Hail Test (MQT 17)", "Bypass Diode (MQT 18)",
    ],
    iec_61730_safety: [
      "Visual Inspection (MST 01)", "Accessibility (MST 11)", "Cut Susceptibility (MST 12)",
      "Ground Continuity (MST 13)", "Impulse Voltage (MST 14)", "Insulation Resistance (MST 16)",
      "Wet Leakage Current (MST 17)", "Temperature Test (MST 21)", "Hot-spot (MST 22)",
      "Reverse Current Overload (MST 26)", "Module Breakage (MST 32)", "Fire Test (MST 34)",
    ],
    iec_61853_energy: [
      "Power Rating at STC", "Power at NMOT", "Power at Low Irradiance",
      "Spectral Response", "Angular Response", "Temperature Coefficients", "Energy Rating",
    ],
    iec_60904_measurement: [
      "I-V Characteristics", "Reference Device Calibration", "Spectral Mismatch Correction",
      "Spectral Response", "Linearity Measurement",
    ],
    custom: ["Custom test sections as needed"],
  };

  const sections = testSections[templateId] || [];

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{template.label}</CardTitle>
          <Badge variant="secondary">{template.standard}</Badge>
        </div>
        <CardDescription>ISO 17025 compliant test report template</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-medium mb-2">Test sections included:</p>
        <div className="space-y-1">
          {sections.slice(0, 5).map((section) => (
            <p key={section} className="text-xs text-muted-foreground">- {section}</p>
          ))}
          {sections.length > 5 && (
            <p className="text-xs text-primary">+ {sections.length - 5} more sections</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
