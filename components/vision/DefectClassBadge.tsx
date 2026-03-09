import { DEFECT_TYPES, SEVERITY_LEVELS } from "@/lib/constants";

interface DefectClassBadgeProps {
  defectClass: string;
  showSeverity?: boolean;
}

export function DefectClassBadge({ defectClass, showSeverity = true }: DefectClassBadgeProps) {
  const defect = DEFECT_TYPES.find(
    (d) => d.id === defectClass || d.label.toLowerCase().includes(defectClass.toLowerCase())
  );

  const label = defect?.label || defectClass;
  const color = defect?.color || "#6b7280";
  const severity = defect?.severity || "minor";
  const severityInfo = SEVERITY_LEVELS[severity as keyof typeof SEVERITY_LEVELS];

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
        style={{ backgroundColor: color + "20", color }}
      >
        <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: color }} />
        {label}
      </span>
      {showSeverity && (
        <span
          className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
          style={{ backgroundColor: severityInfo.bgColor, color: severityInfo.color }}
        >
          {severityInfo.label}
        </span>
      )}
    </span>
  );
}
