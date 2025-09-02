
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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const fetchSessionsData = async (): Promise<ExcelData | null> => {
  const res = await fetch('/api/data?key=tech-sphere-sessions');
  if (res.status === 404) {
    return null; // No data uploaded yet
  }
  if (!res.ok) {
    throw new Error('Failed to fetch sessions data');
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


export default function TechSphereSessionsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [sessionSubItem, setSessionSubItem] = useState<SubItem | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [data, pillars] = await Promise.all([
            fetchSessionsData(),
            fetchPillarsData()
        ]);
        
        setExcelData(data);

        if (pillars) {
            const emergingTechPillar = pillars.find(p => p.id === 'adopting-emerging-technologies');
            const subItem = emergingTechPillar?.subItems.find(s => s.id === 'tech-sphere-sessions') || null;
            setSessionSubItem(subItem);
        }

      } catch (error) {
        console.error('Failed to load page data', error);
        toast({
          title: 'Error',
          description: 'Could not load the Tech Sphere Sessions data.',
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
  const annualTarget = sessionSubItem?.annualTarget || 0;
  // Using percentageComplete from data.json as the single source of truth for progress
  const progressPercentage = sessionSubItem?.percentageComplete || 0;

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
                <Link href="/pillar/adopting-emerging-technologies">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Pillar
                </Link>
            </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">
              Tech Sphere Sessions
            </CardTitle>
            <CardDescription>
              This page displays the current data for Tech Sphere Sessions. To update this data, please use the Excel upload feature on the &quot;Update Data&quot; page.
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
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Overall Progress</CardTitle>
                            <CardDescription>Audience participation against the annual target.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center h-full">
                               <div className="text-center">
                                    <p className="text-5xl font-bold">{progressPercentage}%</p>
                                    <p className="text-lg text-muted-foreground">of {annualTarget}% annual target</p>
                                    <Progress value={progressPercentage} className="mt-4 h-3" />
                               </div>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Participation by Session</CardTitle>
                            <CardDescription>Number of attendees for each Tech Sphere session.</CardDescription>
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
