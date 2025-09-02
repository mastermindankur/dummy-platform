
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
import { ArrowLeft, Loader2, TrendingUp, Users, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { MonthlyExcelData } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const fetchAdoptionData = async (): Promise<MonthlyExcelData | null> => {
  const res = await fetch('/api/data?key=jira-assistant-adoption');
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error('Failed to fetch adoption data');
  }
  const data = await res.json();
  if (Object.keys(data).length === 0) return null;
  return data;
};

type PlatformAdoptionData = {
    platform: string;
    totalUsers: number;
    activeUsers: number;
    monthlyAdoption: { [month: string]: number };
};

export default function JiraAssistantAdoptionPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<MonthlyExcelData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchAdoptionData();
        setMonthlyData(data);
      } catch (error) {
        console.error('Failed to load page data', error);
        toast({
          title: 'Error',
          description: 'Could not load the Jira Assistant Adoption data.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

 const { reportData, sortedMonths, summaryMetrics } = useMemo(() => {
    if (!monthlyData) {
      return { reportData: [], sortedMonths: [], summaryMetrics: { totalUsers: 0, teamsOnboarded: 0, averageAdoption: '0.00' } };
    }

    // --- Start: Logic from old user-adoption-report page ---
    const platformData = new Map<string, {
        totalUserIds: Set<string>;
        activeUserIds: Set<string>;
        monthlyStats: Map<string, { total: Set<string>; active: Set<string> }>;
    }>();

    const allMonths = Object.keys(monthlyData).sort();

    for (const month of allMonths) {
        const monthRows = monthlyData[month].rows;
        const monthLabel = new Date(month).toLocaleString('default', { month: 'short', year: '2-digit' });

        for (const row of monthRows) {
            const platform = (row['Platforms'] as string) || 'Unknown';
            const userId = row['1bankid'] as string;
            const isAdopted = row['is_created_via_JA'] === 1;

            if (!platformData.has(platform)) {
                platformData.set(platform, {
                    totalUserIds: new Set(),
                    activeUserIds: new Set(),
                    monthlyStats: new Map(),
                });
            }
            const data = platformData.get(platform)!;
            data.totalUserIds.add(userId);

            if (!data.monthlyStats.has(monthLabel)) {
                data.monthlyStats.set(monthLabel, { total: new Set(), active: new Set() });
            }
            const monthStats = data.monthlyStats.get(monthLabel)!;
            monthStats.total.add(userId);

            if (isAdopted) {
                data.activeUserIds.add(userId);
                monthStats.active.add(userId);
            }
        }
    }
    
    const finalReportData: PlatformAdoptionData[] = [];
    for (const [platform, data] of platformData.entries()) {
        const monthlyAdoption: { [month: string]: number } = {};
        for(const month of allMonths) {
            const monthLabel = new Date(month).toLocaleString('default', { month: 'short', year: '2-digit' });
            const stats = data.monthlyStats.get(monthLabel);
            if (stats && stats.total.size > 0) {
                monthlyAdoption[monthLabel] = (stats.active.size / stats.total.size) * 100;
            } else {
                monthlyAdoption[monthLabel] = 0;
            }
        }

        finalReportData.push({
            platform,
            totalUsers: data.totalUserIds.size,
            activeUsers: data.activeUserIds.size,
            monthlyAdoption
        });
    }

    const reportDataSorted = finalReportData.sort((a, b) => a.platform.localeCompare(b.platform));
    const sortedMonthLabels = allMonths.map(m => new Date(m).toLocaleString('default', { month: 'short', year: '2-digit' }));
    // --- End: Logic from old user-adoption-report page ---


    // --- Start: Logic for summary cards ---
    const allRows = Object.values(monthlyData).flatMap(monthData => monthData.rows);
    const uniqueUsers = new Set(allRows.map(r => r['1bankid'])).size;
    const uniqueTeams = new Set(allRows.map(r => r['Team'])).size;
    const overallAdoption = allRows.reduce((acc, row) => acc + (Number(row['is_created_via_JA']) || 0), 0);
    const averageAdoption = allRows.length > 0 ? ((overallAdoption / allRows.length) * 100).toFixed(2) : '0.00';
    
    const summaryMetricsData = { 
        totalUsers: uniqueUsers, 
        teamsOnboarded: uniqueTeams, 
        averageAdoption 
    };
    // --- End: Logic for summary cards ---

    return {
      reportData: reportDataSorted,
      sortedMonths: sortedMonthLabels,
      summaryMetrics: summaryMetricsData
    };
  }, [monthlyData]);


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
            <CardTitle className="text-3xl">Jira Assistant Adoption</CardTitle>
            <CardDescription>
                Month-on-month user adoption breakdown by Platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {!isLoading && (!monthlyData || Object.keys(monthlyData).length === 0) && (
              <div className="text-center text-muted-foreground p-8">
                  No data has been uploaded for this section yet.
              </div>
            )}

            {!isLoading && monthlyData && Object.keys(monthlyData).length > 0 && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Total Unique Users</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summaryMetrics.totalUsers}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Teams Onboarded</CardTitle>
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summaryMetrics.teamsOnboarded}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Average Story Adoption</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summaryMetrics.averageAdoption}%</div>
                            </CardContent>
                        </Card>
                    </div>
                    
                    <div className="border rounded-lg overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[200px] sticky left-0 bg-secondary">Platform</TableHead>
                                    <TableHead className="text-right">Total Users</TableHead>
                                    <TableHead className="text-right">Active Users</TableHead>
                                    {sortedMonths.map(month => (
                                        <TableHead key={month} className="text-right min-w-[120px]">
                                            Adoption % ({month})
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reportData.map((item) => (
                                    <TableRow key={item.platform}>
                                        <TableCell className="font-medium sticky left-0 bg-background">{item.platform}</TableCell>
                                        <TableCell className="text-right">{item.totalUsers}</TableCell>
                                        <TableCell className="text-right">{item.activeUsers}</TableCell>
                                        {sortedMonths.map(month => (
                                            <TableCell key={`${item.platform}-${month}`} className="text-right">
                                                {item.monthlyAdoption[month] !== undefined ? `${item.monthlyAdoption[month].toFixed(2)}%` : 'N/A'}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
