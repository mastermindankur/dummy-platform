
'use client';

import React, { useState, useEffect, useMemo } from 'react';
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

type MonthlyStats = {
    totalUsers: number;
    activeUsers: number;
    adoption: number;
};

type PlatformAdoptionData = {
    platform: string;
    monthlyData: { [month: string]: MonthlyStats };
}

type ReportTotal = {
    platform: string;
    monthlyData: { [month: string]: MonthlyStats };
}

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

    const platformMonthlyData = new Map<string, Map<string, { totalUsers: Set<string>; activeUsers: Set<string> }>>();
    const allMonths = Object.keys(monthlyData).sort();
    const sortedMonthLabels = allMonths.map(m => new Date(m).toLocaleString('default', { month: 'short', year: '2-digit' }));

    for (const month of allMonths) {
        const monthLabel = new Date(month).toLocaleString('default', { month: 'short', year: '2-digit' });
        const monthRows = monthlyData[month].rows;

        for (const row of monthRows) {
            const platform = (row['Platforms'] as string) || 'Unknown';
            const userId = row['1bankid'] as string;
            const isAdopted = row['is_created_via_JA'] === 1;

            if (!platformMonthlyData.has(platform)) {
                platformMonthlyData.set(platform, new Map());
            }
            const platformData = platformMonthlyData.get(platform)!;
            
            if (!platformData.has(monthLabel)) {
                platformData.set(monthLabel, { totalUsers: new Set(), activeUsers: new Set() });
            }
            const monthStats = platformData.get(monthLabel)!;

            monthStats.totalUsers.add(userId);
            if (isAdopted) {
                monthStats.activeUsers.add(userId);
            }
        }
    }
    
    const finalReportData: PlatformAdoptionData[] = [];
    for (const [platform, monthMap] of platformMonthlyData.entries()) {
        const monthlyAdoption: { [month: string]: MonthlyStats } = {};

        for(const monthLabel of sortedMonthLabels) {
            const stats = monthMap.get(monthLabel);
            const totalUsers = stats?.totalUsers.size || 0;
            const activeUsers = stats?.activeUsers.size || 0;
            const adoption = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;
            monthlyAdoption[monthLabel] = { totalUsers, activeUsers, adoption };
        }

        finalReportData.push({ platform, monthlyData: monthlyAdoption });
    }

    const reportDataSorted = finalReportData.sort((a, b) => a.platform.localeCompare(b.platform));

    const grandTotal: ReportTotal = {
      platform: 'Total',
      monthlyData: {}
    };

    for(const monthLabel of sortedMonthLabels) {
        let totalUsersForMonth = 0;
        let activeUsersForMonth = 0;
        reportDataSorted.forEach(p => {
            totalUsersForMonth += p.monthlyData[monthLabel]?.totalUsers || 0;
            activeUsersForMonth += p.monthlyData[monthLabel]?.activeUsers || 0;
        });
        
        const adoption = totalUsersForMonth > 0 ? (activeUsersForMonth / totalUsersForMonth) * 100 : 0;
        grandTotal.monthlyData[monthLabel] = {
            totalUsers: totalUsersForMonth,
            activeUsers: activeUsersForMonth,
            adoption: adoption
        };
    }

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
          <CardContent className="space-y-8">
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
                                            <TableHead className="min-w-[150px] sticky left-0 bg-secondary" rowSpan={2}>Platform</TableHead>
                                            {sortedMonths.map(month => (
                                                <TableHead key={month} className="text-center min-w-[300px] border-l" colSpan={3}>
                                                    {month}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                         <TableRow>
                                            {sortedMonths.map(month => (
                                                <React.Fragment key={`${month}-sub`}>
                                                    <TableHead className="text-right border-l">Total Users</TableHead>
                                                    <TableHead className="text-right">Active Users</TableHead>
                                                    <TableHead className="text-right">Adoption %</TableHead>
                                                </React.Fragment>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reportData.map((item) => (
                                            <TableRow key={item.platform}>
                                                <TableCell className="font-medium sticky left-0 bg-background">{item.platform}</TableCell>
                                                {sortedMonths.map(month => {
                                                    const monthData = item.monthlyData[month];
                                                    return (
                                                       <React.Fragment key={`${item.platform}-${month}`}>
                                                            <TableCell className="text-right border-l">{monthData?.totalUsers ?? 'N/A'}</TableCell>
                                                            <TableCell className="text-right">{monthData?.activeUsers ?? 'N/A'}</TableCell>
                                                            <TableCell className="text-right">{monthData?.adoption !== undefined ? `${monthData.adoption.toFixed(2)}%` : 'N/A'}</TableCell>
                                                       </React.Fragment>
                                                    )
                                                })}
                                            </TableRow>
                                        ))}
                                        {totalRow && (
                                            <TableRow className="font-bold bg-secondary hover:bg-secondary/80">
                                                <TableCell className="sticky left-0 bg-secondary">{totalRow.platform}</TableCell>
                                                {sortedMonths.map(month => {
                                                    const monthData = totalRow.monthlyData[month];
                                                    return (
                                                       <React.Fragment key={`total-${month}`}>
                                                            <TableCell className="text-right border-l">{monthData?.totalUsers ?? 'N/A'}</TableCell>
                                                            <TableCell className="text-right">{monthData?.activeUsers ?? 'N/A'}</TableCell>
                                                            <TableCell className="text-right">{monthData?.adoption !== undefined ? `${monthData.adoption.toFixed(2)}%` : 'N/A'}</TableCell>
                                                       </React.Fragment>
                                                    )
                                                })}
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
                    <div className="flex items-center justify-center h-full text-muted-foreground p-8">
                        <p>This section is under construction.</p>
                    </div>
                </CardContent>
            </Card>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
