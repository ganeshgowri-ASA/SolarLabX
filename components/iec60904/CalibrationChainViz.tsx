"use client";

interface CalibrationChainVizProps {
  chain: string[];
}

export default function CalibrationChainViz({ chain }: CalibrationChainVizProps) {
  return (
    <div className="flex flex-col items-center gap-1 py-4">
      {chain.map((item, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className={`px-4 py-2 rounded-lg border text-sm font-medium text-center min-w-[200px] ${
            i === 0 ? "bg-primary text-primary-foreground border-primary" :
            i === chain.length - 1 ? "bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-700" :
            "bg-card border-border"
          }`}>
            {item}
          </div>
          {i < chain.length - 1 && (
            <div className="flex flex-col items-center py-1">
              <div className="w-0.5 h-4 bg-muted-foreground" />
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-muted-foreground" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
