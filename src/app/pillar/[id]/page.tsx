import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { getPillarById, getPillarStatus, pillars } from "@/lib/data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusIndicator } from "@/components/dashboard/status-indicator";
import { RootCauseAnalysis } from "@/components/dashboard/root-cause-analysis";
import { ActionRecommendations } from "@/components/dashboard/action-recommendations";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Metadata } from 'next'
 
type Props = {
  params: { id: string }
}
 
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pillar = getPillarById(params.id);
 
  return {
    title: `${pillar?.name || 'Pillar'} | WCE 2025 Dashboard`,
  }
}

export async function generateStaticParams() {
    return pillars.map((pillar) => ({
      id: pillar.id,
    }))
  }

export default function PillarPage({ params }: { params: { id: string } }) {
  const pillar = getPillarById(params.id);

  if (!pillar) {
    notFound();
  }

  const status = getPillarStatus(pillar.id);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <pillar.icon className="h-10 w-10 text-accent" />
                  <CardTitle className="text-3xl">{pillar.name}</CardTitle>
                </div>
                <CardDescription className="max-w-prose">
                  {pillar.description}
                </CardDescription>
              </div>
              <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                <div className="flex items-center gap-4">
                  <span className="font-semibold">Overall Status:</span>
                  <StatusIndicator status={status} className="text-lg" />
                </div>
                {status !== "Green" && (
                  <Suspense fallback={<Skeleton className="h-10 w-52" />}>
                    <ActionRecommendations pillarName={pillar.name} pillarSubItems={pillar.subItems} />
                  </Suspense>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="text-xl font-semibold mb-4">Sub-Item Health</h3>
            <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">Sub-Item</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">AI Tools</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pillar.subItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <StatusIndicator status={item.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.description}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.status !== "Green" && (
                        <Suspense fallback={<Skeleton className="h-9 w-44 ml-auto" />}>
                           <RootCauseAnalysis subItem={item} pillar={pillar} />
                        </Suspense>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
