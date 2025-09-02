
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
import type { MonthlyExcelData, ExcelRow } from '@/types';
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
  return Object.keys(data).length > 0 ? data : null;
};

type PlatformAdoptionData = {
    platform: string;
    totalUsers: number;
    activeUsers: number;
    monthlyAdoption: { [month: string]: number };
};

export default function UserAdoptionReportPage() {
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

  const { reportData, sortedMonths } = useMemo(() => {
    if (!monthlyData) {
      return { reportData: [], sortedMonths: [] };
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

    return {
      reportData: finalReportData.sort((a, b) => a.platform.localeCompare(b.platform)),
      sortedMonths: allMonths.map(m => new Date(m).toLocaleString('default', { month: 'short', year: '2-digit' })),
    };
  }, [monthlyData]);
  
  const totalRow = useMemo(() => {
    if (reportData.length === 0) return null;

    const totalUsers = reportData.reduce((sum, item) => sum + item.totalUsers, 0);
    const activeUsers = reportData.reduce((sum, item) => sum + item.activeUsers, 0);

    const monthlyAdoption: { [month: string]: number } = {};
    for (const month of sortedMonths) {
        let monthTotalUsers = 0;
        let monthActiveUsers = 0;
        
        for (const item of reportData) {
            const adoptionRate = item.monthlyAdoption[month];
            if (adoptionRate !== undefined) {
                 // This is an approximation as we don't have distinct user counts per month at this stage
                 // A more accurate way would be to recalculate from raw data, but this is a summary row
                 const platformData = monthlyData ? Object.values(monthlyData).flatMap(m => m.rows).filter(r => r['Platforms'] === item.platform) : [];
                 const usersThisMonth = new Set(platformData.filter(r => new Date(Object.keys(monthlyData!).find(key => monthlyData![key].rows.includes(r))!).toLocaleString('default', { month: 'short', year: '2-digit' }) === month).map(r => r['1bankid']));
                 const totalUsersForPlatformThisMonth = usersThisMonth.size;

                monthTotalUsers += totalUsersForPlatformThisMonth;
                monthActiveUsers += (totalUsersForPlatformThisMonth * adoptionRate) / 100;
            }
        }
        monthlyAdoption[month] = monthTotalUsers > 0 ? (monthActiveUsers / monthTotalUsers) * 100 : 0;
    }

    return { totalUsers, activeUsers, monthlyAdoption };
  }, [reportData, sortedMonths, monthlyData]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="mb-4">
            <Button asChild variant="outline">
                <Link href="/pillar/making-design-resilient/jira-assistant-adoption">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Adoption Overview
                </Link>
            </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">User Adoption Report</CardTitle>
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

            {!isLoading && reportData.length === 0 && (
              <div className="text-center text-muted-foreground p-8">
                  No data available to generate this report. Please upload data for at least one month.
              </div>
            )}

            {!isLoading && reportData.length > 0 && (
                <div className="border rounded-lg overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="min-w-[200px]">Platform</TableHead>
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
                                    <TableCell className="font-medium">{item.platform}</TableCell>
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
                         {totalRow && (
                           <tfoot className="border-t">
                                <TableRow className="font-bold bg-secondary/50">
                                    <TableCell>Total</TableCell>
                                    <TableCell className="text-right">{totalRow.totalUsers}</TableCell>
                                    <TableCell className="text-right">{totalRow.activeUsers}</TableCell>
                                    {sortedMonths.map(month => (
                                        <TableCell key={`total-${month}`} className="text-right">
                                            {totalRow.monthlyAdoption[month] !== undefined ? `${totalRow.monthlyAdoption[month].toFixed(2)}%` : 'N/A'}
                                        </TableCell>
                                    ))}
                                </TableRow>
                           </tfoot>
                        )}
                    </Table>
                </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
