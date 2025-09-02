
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { ExcelData, Pillar, SubItem, ExcelRow } from '@/types';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend } from '@/components/ui/chart';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const fetchProgramData = async (): Promise<ExcelData | null> => {
  const res = await fetch('/api/data?key=explore-resiliency-program');
  if (res.status === 404) {
    return null; // No data uploaded yet
  }
  if (!res.ok) {
    throw new Error('Failed to fetch program data');
  }
  return res.json();
};

// Fetch all pillar data to find the specific sub-item for targets
const fetchPillarsData = async (): Promise<Pillar[] | null> => {
    const res = await fetch('/api/data');
    if (!res.ok) {
      throw new Error('Failed to fetch pillars data');
    }
    return res.json();
};


export default function ExploreResiliencyProgramPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [programSubItem, setProgramSubItem] = useState<SubItem | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [data, pillars] = await Promise.all([
            fetchProgramData(),
            fetchPillarsData()
        ]);
        setExcelData(data);

        if (pillars) {
            const emergingTechPillar = pillars.find(p => p.id === 'adopting-emerging-technologies');
            const subItem = emergingTechPillar?.subItems.find(s => s.id === 'explore-resiliency-program') || null;
            setProgramSubItem(subItem);
        }

      } catch (error) {
        console.error('Failed to load program data', error);
        toast({
          title: 'Error',
          description: 'Could not load the program data.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const { overallStatusData, lobtDistributionData, statusColors, statusList } = useMemo(() => {
    if (!excelData?.rows) return { overallStatusData: [], lobtDistributionData: [], statusColors: {}, statusList: [] };

    const statusCounts: { [key: string]: number } = {};
    const lobtStatusCounts: { [lobt: string]: { [status: string]: number } } = {};
    const statuses = new Set<string>();

    excelData.rows.forEach((row: ExcelRow) => {
      const status = row['Status'] as string;
      const lobt = row['LOBT'] as string;

      if (status) {
        statuses.add(status);
        statusCounts[status] = (statusCounts[status] || 0) + 1;

        if (lobt) {
          if (!lobtStatusCounts[lobt]) {
            lobtStatusCounts[lobt] = {};
          }
          lobtStatusCounts[lobt][status] = (lobtStatusCounts[lobt][status] || 0) + 1;
        }
      }
    });

    const overallStatusData = Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
    }));

    const statusList = Array.from(statuses);
    const chartColors = [
      'hsl(var(--chart-1))',
      'hsl(var(--chart-2))',
      'hsl(var(--chart-3))',
      'hsl(var(--chart-4))',
      'hsl(var(--chart-5))',
    ];
    const statusColors = statusList.reduce((acc, status, index) => {
        acc[status] = chartColors[index % chartColors.length];
        return acc;
    }, {} as Record<string, string>);


    const lobtDistributionData = Object.entries(lobtStatusCounts).map(([lobt, counts]) => ({
      name: lobt,
      ...counts,
    }));


    return { overallStatusData, lobtDistributionData, statusColors, statusList };
  }, [excelData]);
  
  const totalAssessments = excelData?.rows.length || 0;
  const completedAssessments = excelData?.rows.filter(row => row['Status'] === 'Assessment Completed').length || 0;
  const annualTarget = programSubItem?.annualTarget || 0;
  const progressPercentage = annualTarget > 0 ? (completedAssessments / annualTarget) * 100 : 0;


  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="mb-4">
            <Button asChild variant="outline">
                <Link href="/pillar/adopting-emerging-technologies">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Pillar
                </Link>
            </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Explore Resiliency Program</CardTitle>
            <CardDescription>
              This page displays the current data for the Explore Resiliency Program. To update this data, please use the Excel upload feature on the &quot;Update Data&quot; page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {!isLoading && !excelData && (
              <div className="text-center text-muted-foreground p-8">
                No data has been uploaded for this program yet.
              </div>
            )}

            {excelData && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <Card>
                      <CardHeader>
                          <CardTitle>Overall Progress</CardTitle>
                          <CardDescription>Assessments completed against the annual target.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <div className="flex items-center justify-center h-full">
                             <div className="text-center">
                                  <p className="text-5xl font-bold">{completedAssessments}</p>
                                  <p className="text-lg text-muted-foreground">out of {annualTarget} assessments</p>
                                  <Progress value={progressPercentage} className="mt-4 h-3" />
                             </div>
                          </div>
                      </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Overall Status</CardTitle>
                      <CardDescription>Distribution of assessment statuses.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={{}} className="min-h-[200px] w-full">
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={overallStatusData} layout="vertical" margin={{ right: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                   <Card>
                    <CardHeader>
                      <CardTitle>LOBT-wise Distribution</CardTitle>
                      <CardDescription>Status breakdown by Line of Business Technology.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={statusColors} className="min-h-[200px] w-full">
                         <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={lobtDistributionData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <ChartLegend />
                                {statusList.map((status) => (
                                    <Bar key={status} dataKey={status} stackId="a" fill={statusColors[status]} />
                                ))}
                            </BarChart>
                         </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">Program Data</h3>
                  <div className="border rounded-lg overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {excelData.headers.map((header) => (
                            <TableHead key={header}>{header}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {excelData.rows.map((row, rowIndex) => (
                          <TableRow key={rowIndex}>
                            {excelData.headers.map((header) => (
                              <TableCell key={header}>
                                {String(row[header] ?? '')}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
