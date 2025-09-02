
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusIndicator } from "./status-indicator";
import type { Pillar } from "@/types";
import { getPillarStatus } from "@/lib/data";
import { cn } from "@/lib/utils";

const statusStyles: Record<"Green" | "Amber" | "Red", string> = {
  Green: "bg-green-500",
  Amber: "bg-amber-500",
  Red: "bg-red-500",
};


export function PillarCard({ pillar }: { pillar: Pillar }) {
  const status = getPillarStatus(pillar);

  const statusCounts = pillar.subItems.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<"Green" | "Amber" | "Red", number>);


  return (
    <Link href={`/pillar/${pillar.id}`} className="block hover:shadow-lg transition-shadow duration-300 rounded-lg">
      <Card className="flex flex-col justify-between h-full transition-colors hover:border-accent bg-card">
        <CardHeader>
          <div className="mb-4">
            <pillar.icon className="h-8 w-8 text-accent" />
          </div>
          <CardTitle>{pillar.name}</CardTitle>
          <CardDescription className="line-clamp-2">{pillar.description}</CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-between items-center">
          <StatusIndicator status={status} />
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {Object.entries(statusCounts).sort(([a], [b]) => {
                const order = { Red: 0, Amber: 1, Green: 2 };
                return order[a as "Red" | "Amber" | "Green"] - order[b as "Red" | "Amber" | "Green"];
            }).map(([key, value]) => (
                <div key={key} className="flex items-center gap-1.5">
                    <span className={cn("h-2 w-2 rounded-full", statusStyles[key as "Red" | "Amber" | "Green"])} />
                    <span>{value}</span>
                </div>
            ))}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
