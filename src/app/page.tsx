import { Header } from "@/components/layout/header";
import { pillars, getPillarStatus } from "@/lib/data";
import { ExecutiveSummary } from "@/components/dashboard/executive-summary";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusIndicator } from "@/components/dashboard/status-indicator";
import { TrendIndicator } from "@/components/dashboard/trend-indicator";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

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

  const allItems = pillars.flatMap((pillar) =>
    pillar.subItems.map((subItem) => ({
      ...subItem,
      pillarName: pillar.name,
      pillarId: pillar.id,
      pillarIcon: pillar.icon,
    }))
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
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[18%]">Pillar / Sub-item</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>% Complete</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Last Update</TableHead>
                <TableHead className="w-[25%]">Comments</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pillars.map((pillar, index) => (
                <>
                  <TableRow key={pillar.id} className="bg-muted/50">
                    <TableCell colSpan={8} className="p-2">
                       <Link
                        href={`/pillar/${pillar.id}`}
                        className="flex items-center gap-2 font-semibold text-primary"
                      >
                         <pillar.icon className="h-5 w-5" />
                        {pillar.name}
                       </Link>
                    </TableCell>
                  </TableRow>
                  {pillar.subItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="pl-8 font-medium">{item.name}</TableCell>
                      <TableCell>
                        <StatusIndicator status={item.status} />
                      </TableCell>
                      <TableCell>
                        <TrendIndicator trend={item.trend} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={item.percentageComplete} className="h-2 w-[80px]" />
                           <span className="text-xs text-muted-foreground">{item.percentageComplete}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                         <Badge variant="secondary">{item.owner}</Badge>
                      </TableCell>
                      <TableCell>{item.lastUpdate}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.comments}
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
