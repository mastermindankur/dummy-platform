import { Header } from "@/components/layout/header";
import { pillars, getPillarStatus } from "@/lib/data";
import { PillarCard } from "@/components/dashboard/pillar-card";
import { ExecutiveSummary } from "@/components/dashboard/executive-summary";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const allPillarStatuses = pillars.reduce(
    (acc, pillar) => {
      acc[pillar.name] = getPillarStatus(pillar.id);
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
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3 xl:grid-cols-5">
          {pillars.map((pillar) => (
            <PillarCard key={pillar.id} pillar={pillar} />
          ))}
        </div>
        <div className="mt-8">
            <h2 className="text-2xl font-bold tracking-tight">About this Dashboard</h2>
            <p className="text-muted-foreground mt-2">
              This dashboard provides a real-time overview of the World Class Engineering 2025 program. Each pillar's status is determined by the health of its sub-items. Red indicates critical issues, Amber signifies potential risks, and Green means on-track. Use the AI tools to generate summaries, analyze root causes for issues, and get recommended actions.
            </p>
        </div>
      </main>
    </div>
  );
}
