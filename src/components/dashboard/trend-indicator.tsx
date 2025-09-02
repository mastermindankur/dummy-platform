import { cn } from "@/lib/utils";
import type { Trend } from "@/types";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

const trendStyles: Record<Trend, string> = {
  up: "text-green-500",
  down: "text-red-500",
  flat: "text-amber-500",
};

const trendIcons: Record<Trend, React.ElementType> = {
  up: ArrowUp,
  down: ArrowDown,
  flat: Minus,
};

export function TrendIndicator({
  trend,
  className,
}: {
  trend: Trend;
  className?: string;
}) {
  const Icon = trendIcons[trend];
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Icon
        className={cn(
          "h-4 w-4",
          trendStyles[trend]
        )}
        aria-hidden="true"
      />
    </div>
  );
}
