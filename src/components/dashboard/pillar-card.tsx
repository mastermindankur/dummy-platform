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

export function PillarCard({ pillar }: { pillar: Pillar }) {
  const status = getPillarStatus(pillar);

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
        <CardFooter>
          <StatusIndicator status={status} />
        </CardFooter>
      </Card>
    </Link>
  );
}
