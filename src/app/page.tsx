
import { Header } from "@/components/layout/header";
import { getPillars } from "@/lib/data";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PillarCard } from "@/components/dashboard/pillar-card";
import type { Pillar } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ListChecks, CheckCircle2, AlertTriangle, XCircle, ArrowRight } from "lucide-react";
import { StatusIndicator } from "@/components/dashboard/status-indicator";

export default async function Home() {
  const pillars = await getPillars();

  const comingSoonPillarIds = [
    "improving-productivity",
    "world-class-corporate-governance",
  ];

  const activePillars = pillars.filter(p => !comingSoonPillarIds.includes(p.id));

  const allSubItems = activePillars.flatMap((p) => p.subItems);
  const totalSubItems = allSubItems.length;
  const statusCounts = allSubItems.reduce(
    (acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    },
    { Green: 0, Amber: 0, Red: 0 }
  );

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <Card className="mb-6 bg-secondary/30">
          <CardHeader>
            <CardTitle className="text-2xl">Executive Value Map</CardTitle>
            <CardDescription className="max-w-prose pt-2">
              This was the origin with which we started the WCE 2025, it is the brain child. The Value Map connects our strategic outcomes to the drivers and levers that enable them.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link href="/executive">
                View Value Map
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <div className="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Sub-Items</CardTitle>
                    <ListChecks className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalSubItems}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Green</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{statusCounts.Green}
                        <span className="text-base text-muted-foreground">/{totalSubItems}</span>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Amber</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{statusCounts.Amber}
                        <span className="text-base text-muted-foreground">/{totalSubItems}</span>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Red</CardTitle>
                    <XCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{statusCounts.Red}
                        <span className="text-base text-muted-foreground">/{totalSubItems}</span>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {pillars.map((pillar: Pillar) =>
            comingSoonPillarIds.includes(pillar.id) ? (
              <Card
                key={pillar.id}
                className="flex flex-col justify-between h-full bg-card/50 text-muted-foreground border-dashed"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <pillar.icon className="h-8 w-8 text-muted-foreground/50" />
                    <Badge variant="outline">Coming Soon</Badge>
                  </div>
                  <CardTitle className="pt-4 text-card-foreground/60">{pillar.name}</CardTitle>
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
