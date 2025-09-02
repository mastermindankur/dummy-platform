import { cn } from "@/lib/utils";
import type { Status } from "@/types";

const statusStyles: Record<Status, string> = {
  Green: "bg-green-500",
  Amber: "bg-amber-500",
  Red: "bg-red-500",
};

export function StatusIndicator({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "h-3 w-3 rounded-full",
          statusStyles[status]
        )}
        aria-hidden="true"
      />
      <span>{status}</span>
    </div>
  );
}
