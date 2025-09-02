
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
import type { MonthlyExcelData } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

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

 const { reportData, sortedMonths, totalRow } = useMemo(() => {
    if (!monthlyData) {
      return { reportData: [], sortedMonths: [], totalRow: null };
    }

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

    const grandTotal = {
      platform: 'Total',
      totalUsers: 0,
      activeUsers: 0,
      monthlyAdoption: {} as { [month: string]: number }
    };

    const monthlyTotals: { [month: string]: { total: Set<string>, active: Set<string> } } = {};

    reportDataSorted.forEach(item => {
      grandTotal.totalUsers += item.totalUsers;
      grandTotal.activeUsers += item.activeUsers;
    });

    for(const [platform, data] of platformData.entries()) {
        for(const [monthLabel, stats] of data.monthlyStats.entries()) {
            if(!monthlyTotals[monthLabel]) {
                monthlyTotals[monthLabel] = { total: new Set(), active: new Set() };
            }
            stats.total.forEach(u => monthlyTotals[monthLabel].total.add(u));
            stats.active.forEach(u => monthlyTotals[monthLabel].active.add(u));
        }
    }
    
    sortedMonthLabels.forEach(monthLabel => {
        const monthStat = monthlyTotals[monthLabel];
        if (monthStat && monthStat.total.size > 0) {
            grandTotal.monthlyAdoption[monthLabel] = (monthStat.active.size / monthStat.total.size) * 100;
        } else {
            grandTotal.monthlyAdoption[monthLabel] = 0;
        }
    });

    return {
      reportData: reportDataSorted,
      sortedMonths: sortedMonthLabels,
      totalRow: grandTotal,
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
                Month-on-month adoption breakdown for Jira Assistant features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>User Adoption</CardTitle>
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
                                <div className="border rounded-lg overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="min-w-[150px] sticky left-0 bg-secondary">Platform</TableHead>
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
                                            {totalRow && (
                                                <TableRow className="font-bold bg-secondary hover:bg-secondary/80">
                                                    <TableCell className="sticky left-0 bg-secondary">{totalRow.platform}</TableCell>
                                                    <TableCell className="text-right">{totalRow.totalUsers}</TableCell>
                                                    <TableCell className="text-right">{totalRow.activeUsers}</TableCell>
                                                    {sortedMonths.map(month => (
                                                        <TableCell key={`total-${month}`} className="text-right">
                                                          {totalRow.monthlyAdoption[month] !== undefined ? `${totalRow.monthlyAdoption[month].toFixed(2)}%` : 'N/A'}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                        </div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Jira Assist Test Cases Adoption</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            <p>This section is under construction.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
