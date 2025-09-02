
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Pillar } from "@/types";
import { cn } from "@/lib/utils";

const statusStyles: Record<"Green" | "Amber" | "Red", string> = {
  Green: "bg-green-500",
  Amber: "bg-amber-500",
  Red: "bg-red-500",
};


export function PillarCard({ pillar }: { pillar: Pillar }) {

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
        <CardFooter className="flex justify-end items-center">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {(Object.keys(statusCounts) as Array<keyof typeof statusCounts>).length > 0 ? (
                (Object.keys(statusCounts) as Array<keyof typeof statusCounts>).sort((a, b) => {
                    const order = { Red: 0, Amber: 1, Green: 2 };
                    return order[a] - order[b];
                }).map((key) => (
                    <div key={key} className="flex items-center gap-1.5">
                        <span className={cn("h-2 w-2 rounded-full", statusStyles[key])} />
                        <span>{statusCounts[key]} {key}</span>
                    </div>
                ))
            ) : (
                <div className="text-sm text-muted-foreground">No sub-items</div>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
