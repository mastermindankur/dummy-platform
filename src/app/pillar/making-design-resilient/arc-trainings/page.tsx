
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
import { ArrowLeft, CalendarClock, Loader2, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { ExcelData, Pillar, SubItem, ExcelRow } from '@/types';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

const fetchTrainingsData = async (): Promise<ExcelData | null> => {
  const res = await fetch('/api/data?key=arc-trainings');
  if (res.status === 404) {
    return null; // No data uploaded yet
  }
  if (!res.ok) {
    throw new Error('Failed to fetch trainings data');
  }
  return res.json();
};

const fetchPillarsData = async (): Promise<Pillar[] | null> => {
    const res = await fetch('/api/data');
    if (!res.ok) {
      throw new Error('Failed to fetch pillars data');
    }
    return res.json();
};

const fetchMetadata = async (key: string) => {
    const res = await fetch(`/api/data?key=${key}&meta=true`);
    if (!res.ok) return null;
    const { lastUpdated } = await res.json();
    return lastUpdated;
};


export default function ArcTrainingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [trainingSubItem, setTrainingSubItem] = useState<SubItem | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [data, pillars, metadata] = await Promise.all([
            fetchTrainingsData(),
            fetchPillarsData(),
            fetchMetadata('arc-trainings')
        ]);
        
        setExcelData(data);
        setLastUpdated(metadata);

        if (pillars) {
            const resilientPillar = pillars.find(p => p.id === 'making-design-resilient');
            const subItem = resilientPillar?.subItems.find(s => s.id === 'arc-trainings') || null;
            setTrainingSubItem(subItem);
        }

      } catch (error) {
        console.error('Failed to load page data', error);
        toast({
          title: 'Error',
          description: 'Could not load the ARC Trainings data.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const { participationData, totalAttendees } = useMemo(() => {
    if (!excelData?.rows) return { participationData: [], totalAttendees: 0 };

    let total = 0;
    const data = excelData.rows.map((row: ExcelRow) => {
        const attendees = Number(row['Participation']) || 0;
        total += attendees;
        return {
            name: row['Date'] as string,
            attendees: attendees,
            title: row['Agenda of Session'] as string
        };
    });

    return { participationData: data, totalAttendees: total };
  }, [excelData]);

  const totalSessions = excelData?.rows.length || 0;
  const annualTarget = trainingSubItem?.annualTarget || 0;
  const progressPercentage = annualTarget > 0 ? (totalSessions / annualTarget) * 100 : 0;


  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-background border rounded-md shadow-md">
          <p className="label">{`Date: ${label}`}</p>
          <p className="intro">{`Session: ${payload[0].payload.title}`}</p>
          <p className="desc">{`Participation: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };


  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="mb-4">
            <Button asChild variant="outline">
                <Link href="/pillar/making-design-resilient">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Pillar
                </Link>
            </Button>
        </div>
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-4">
                <CardTitle className="text-3xl">
                  ARC Trainings
                </CardTitle>
                {lastUpdated && (
                    <Badge variant="outline" className="font-normal">
                        <CalendarClock className="mr-2 h-4 w-4" />
                        Last updated: {new Date(lastUpdated).toLocaleString()}
                    </Badge>
                )}
            </div>
            <CardDescription>
              This page displays the current data for ARC Trainings.
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
                  No data has been uploaded for this section yet.
              </div>
            )}

            {excelData && (
                <div className="space-y-8">
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Overall Progress</CardTitle>
                            <CardDescription>Sessions conducted against the annual target.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center h-full">
                               <div className="text-center">
                                    <p className="text-5xl font-bold">{totalSessions}</p>
                                    <p className="text-lg text-muted-foreground">out of {annualTarget} sessions</p>
                                    <Progress value={progressPercentage} className="mt-4 h-3" />
                               </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-base font-medium">Total Participants</CardTitle>
                        <Users className="h-5 w-5 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-bold">{totalAttendees}</div>
                        <p className="text-xs text-muted-foreground">
                          across all {totalSessions} sessions
                        </p>
                      </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Participation by Session</CardTitle>
                            <CardDescription>Number of attendees for each ARC Training session.</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ChartContainer config={{}} className="min-h-[200px] w-full">
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={participationData} margin={{ right: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} interval={0} />
                                <YAxis />
                                <ChartTooltip content={<CustomTooltip />} />
                                <Bar dataKey="attendees" name="Participation" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </CardContent>
                      </Card>
                 </div>
                 
                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                    Spreadsheet Data ({totalSessions} sessions)
                    </h3>
                    <div className="border rounded-lg">
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
