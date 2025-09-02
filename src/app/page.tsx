import { Header } from "@/components/layout/header";
import { getPillars, getPillarStatus } from "@/lib/data";
import { ExecutiveSummary } from "@/components/dashboard/executive-summary";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PillarCard } from "@/components/dashboard/pillar-card";
import type { Pillar } from "@/types";

export default async function Home() {
  const pillars = await getPillars();

  const allPillarStatuses = pillars.reduce(
    (acc, pillar) => {
      acc[pillar.name] = getPillarStatus(pillar);
      return acc;
    },
    {} as Record<string, "Green" | "Amber" | "Red">
  );

  const allSubItemStatuses = pillars
    .flatMap((p) => p.subItems)
    .reduce(
      (acc, item) => {
        acc[item.name] = item.status;
        return acc;
      },
      {} as Record<string, "Green" | "Amber" | "Red">
    );

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header>
        <Suspense fallback={<Skeleton className="h-9 w-48" />}>
          <ExecutiveSummary
            pillarStatuses={allPillarStatuses}
            subItemStatuses={allSubItemStatuses}
          />
        </Suspense>
      </Header>
      <main className="flex-1 p-4 md:p-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pillars.map((pillar: Pillar) => (
            <PillarCard key={pillar.id} pillar={pillar} />
          ))}
        </div>
      </main>
    </div>
  );
}
