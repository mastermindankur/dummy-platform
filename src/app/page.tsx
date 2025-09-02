import { Header } from "@/components/layout/header";
import { getPillars, getPillarStatus } from "@/lib/data";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PillarCard } from "@/components/dashboard/pillar-card";
import type { Pillar } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function Home() {
  const pillars = await getPillars();

  const comingSoonPillarIds = [
    "improving-productivity",
    "building-reliable-products",
  ];

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
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pillars.map((pillar: Pillar) =>
            comingSoonPillarIds.includes(pillar.id) ? (
              <Card
                key={pillar.id}
                className="flex flex-col justify-between h-full bg-card/50 text-muted-foreground"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <pillar.icon className="h-8 w-8 text-muted-foreground" />
                    <Badge variant="outline">Coming Soon</Badge>
                  </div>
                  <CardTitle className="pt-4">{pillar.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {pillar.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter></CardFooter>
              </Card>
            ) : (
              <PillarCard key={pillar.id} pillar={pillar} />
            )
          )}
        </div>
      </main>
    </div>
  );
}
