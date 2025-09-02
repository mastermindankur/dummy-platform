import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { getPillarById, getPillarStatus, getPillars } from "@/lib/data";
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
import { SubItemCard } from "@/components/dashboard/sub-item-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
 
type Props = {
  params: { id: string }
}
 
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pillar = await getPillarById(params.id);
 
  return {
    title: `${pillar?.name || 'Pillar'} | WCE 2025 Dashboard`,
  }
}

export async function generateStaticParams() {
    const pillars = await getPillars();
    return pillars.map((pillar) => ({
      id: pillar.id,
    }))
  }

export default async function PillarPage({ params }: { params: { id: string } }) {
  const pillar = await getPillarById(params.id);

  if (!pillar) {
    notFound();
  }

  const status = getPillarStatus(pillar);

  const isEmergingTech = pillar.id === 'adopting-emerging-technologies';

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="mb-4">
            <Button asChild variant="outline">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
            </Button>
        </div>
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
                    <ActionRecommendations pillarName={pillar.name} pillarSubItems={pillar.subItems.map(({name, status}) => ({name, status}))} />
                  </Suspense>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="text-xl font-semibold mb-4">Sub-Item Health</h3>
            {isEmergingTech ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pillar.subItems.map((item) => (
                        <SubItemCard key={item.id} item={item} pillarName={pillar.name} />
                    ))}
                </div>
            ) : (
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
                            <RootCauseAnalysis subItem={item} pillarName={pillar.name} />
                            </Suspense>
                        )}
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
                </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
