
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
import type { MonthlyExcelData, ExcelRow } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

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

  const { reportData, sortedMonths, totalRow, chartData, platformKeys, testCaseAdoptionData, testCaseTotals } = useMemo(() => {
    if (!monthlyData) {
      return { reportData: [], sortedMonths: [], totalRow: null, chartData: [], platformKeys: [], testCaseAdoptionData: [], testCaseTotals: { totalCases: 0, jaCases: 0, adoption: 0 } };
    }

    // USER ADOPTION LOGIC
    const platformMonthlyStats = new Map<string, { [month: string]: { totalUsers: Set<string>; activeUsers: Set<string> } }>();
    const allMonths = Object.keys(monthlyData).sort();
    const sortedMonthLabels = allMonths.map(m => new Date(m + '-02').toLocaleString('default', { month: 'short', year: '2-digit' }));
    
    // TEST CASE ADOPTION LOGIC
    const testCaseStatsByLOBT = new Map<string, { totalCases: number; jaCases: number }>();

    for (const month of allMonths) {
        const monthLabel = new Date(month + '-02').toLocaleString('default', { month: 'short', 'year': '2-digit' });
        const monthRows = monthlyData[month].rows;

        for (const row of monthRows) {
            // User Adoption Processing
            const platform = (row['Platforms'] as string) || 'Unknown';
            const userId = row['1bankid'] as string;
            const isAdopted = row['is_created_via_JA'] === 1;
            
            if (!platformMonthlyStats.has(platform)) {
                platformMonthlyStats.set(platform, {});
            }
            const platformData = platformMonthlyStats.get(platform)!;
            
            if (!platformData[monthLabel]) {
                platformData[monthLabel] = { totalUsers: new Set(), activeUsers: new Set() };
            }
            const monthStats = platformData[monthLabel];

            if (userId) {
                monthStats.totalUsers.add(userId);
                if (isAdopted) {
                    monthStats.activeUsers.add(userId);
                }
            }

            // Test Case Adoption Processing
            if (row['issue_type'] === 'Test') {
                const lobt = (row['LOBT'] as string) || 'Unknown';
                if (!testCaseStatsByLOBT.has(lobt)) {
                    testCaseStatsByLOBT.set(lobt, { totalCases: 0, jaCases: 0 });
                }
                const stats = testCaseStatsByLOBT.get(lobt)!;
                stats.totalCases += 1;
                if (row['is_created_via_JA'] === 1) {
                    stats.jaCases += 1;
                }
            }
        }
    }
    
    const finalReportData: PlatformAdoptionData[] = [];
    const allPlatformKeys = Array.from(platformMonthlyStats.keys()).sort();

    for (const platform of allPlatformKeys) {
        const monthMap = platformMonthlyStats.get(platform)!;
        const platformAdoption: PlatformAdoptionData = { platform, monthlyData: {} };

        for(const monthLabel of sortedMonthLabels) {
            const stats = monthMap[monthLabel];
            const totalUsersCount = stats?.totalUsers.size || 0;
            const activeUsersCount = stats?.activeUsers.size || 0;
            const adoption = totalUsersCount > 0 ? (activeUsersCount / totalUsersCount) * 100 : 0;
            platformAdoption.monthlyData[monthLabel] = { totalUsers: totalUsersCount, activeUsers: activeUsersCount, adoption };
        }
        finalReportData.push(platformAdoption);
    }

    const reportDataSorted = finalReportData.sort((a, b) => a.platform.localeCompare(b.platform));

    const grandTotalRow: PlatformAdoptionData = {
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
        grandTotalRow.monthlyData[monthLabel] = {
            totalUsers: totalUsersForMonth,
            activeUsers: activeUsersForMonth,
            adoption: adoption
        };
    }

    const chartDataFormatted = sortedMonthLabels.map(month => {
        const monthEntry: {[key: string]: any} = { name: month };
        reportDataSorted.forEach(platformData => {
            monthEntry[platformData.platform] = platformData.monthlyData[month]?.adoption.toFixed(2);
        });
        monthEntry['Total'] = grandTotalRow.monthlyData[month]?.adoption.toFixed(2);
        return monthEntry;
    });

    const testCaseAdoptionData = Array.from(testCaseStatsByLOBT.entries()).map(([lobt, stats]) => ({
      lobt,
      ...stats,
      adoption: stats.totalCases > 0 ? (stats.jaCases / stats.totalCases) * 100 : 0,
    })).sort((a, b) => a.lobt.localeCompare(b.lobt));

    const testCaseTotals = testCaseAdoptionData.reduce((acc, curr) => {
        acc.totalCases += curr.totalCases;
        acc.jaCases += curr.jaCases;
        return acc;
    }, { totalCases: 0, jaCases: 0, adoption: 0});
    
    testCaseTotals.adoption = testCaseTotals.totalCases > 0 ? (testCaseTotals.jaCases / testCaseTotals.totalCases) * 100 : 0;


    return {
      reportData: reportDataSorted,
      sortedMonths: sortedMonthLabels,
      totalRow: grandTotalRow,
      chartData: chartDataFormatted,
      platformKeys: allPlatformKeys,
      testCaseAdoptionData,
      testCaseTotals
    };
  }, [monthlyData]);

  const chartColors = [
      'hsl(var(--chart-1))',
      'hsl(var(--chart-2))',
      'hsl(var(--chart-3))',
      'hsl(var(--chart-4))',
      'hsl(var(--chart-5))',
      '#82ca9d',
      '#ffc658',
  ];

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
        <div className="space-y-8">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>User Adoption Trend</CardTitle>
                        <CardDescription>Month-on-month adoption percentage.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading && (
                            <div className="flex items-center justify-center p-8 h-[400px]">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        )}
                        {!isLoading && chartData.length > 0 && (
                            <ChartContainer config={{}} className="h-[400px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis label={{ value: 'Adoption %', angle: -90, position: 'insideLeft' }} domain={[0, 100]}/>
                                        <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                                        <ChartLegend />
                                        <Line type="monotone" dataKey="Total" stroke="#ff7300" strokeWidth={3} name="Total Adoption" dot={false} />
                                        {platformKeys.map((key, index) => (
                                            <Line 
                                                key={key} 
                                                type="monotone" 
                                                dataKey={key} 
                                                stroke={chartColors[index % chartColors.length]} 
                                                strokeWidth={2}
                                                name={key}
                                                dot={false}
                                            />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        )}
                        {!isLoading && chartData.length === 0 && (
                             <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                                No data available to display chart.
                            </div>
                        )}
                    </CardContent>
                </Card>
                <div />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>User Adoption</CardTitle>
                    <CardDescription>
                        Month-on-month user adoption of Jira Assistant, broken down by platform.
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
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Jira Assist Test Cases Adoption</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading && (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    )}
                    {!isLoading && testCaseAdoptionData.length === 0 && (
                         <div className="text-center text-muted-foreground p-8">
                            No test case data is available to display.
                        </div>
                    )}
                    {!isLoading && testCaseAdoptionData.length > 0 && (
                         <div className="border rounded-lg">
                             <Table>
                                 <TableHeader>
                                     <TableRow>
                                         <TableHead>LOBT</TableHead>
                                         <TableHead className="text-right">Total Test Cases</TableHead>
                                         <TableHead className="text-right">JA Created Cases</TableHead>
                                         <TableHead className="text-right">Adoption %</TableHead>
                                     </TableRow>
                                 </TableHeader>
                                 <TableBody>
                                     {testCaseAdoptionData.map(item => (
                                         <TableRow key={item.lobt}>
                                             <TableCell className="font-medium">{item.lobt}</TableCell>
                                             <TableCell className="text-right">{item.totalCases}</TableCell>
                                             <TableCell className="text-right">{item.jaCases}</TableCell>
                                             <TableCell className="text-right">{item.adoption.toFixed(2)}%</TableCell>
                                         </TableRow>
                                     ))}
                                     <TableRow className="font-bold bg-secondary hover:bg-secondary/80">
                                         <TableCell>Total</TableCell>
                                         <TableCell className="text-right">{testCaseTotals.totalCases}</TableCell>
                                         <TableCell className="text-right">{testCaseTotals.jaCases}</TableCell>
                                         <TableCell className="text-right">{testCaseTotals.adoption.toFixed(2)}%</TableCell>
                                     </TableRow>
                                 </TableBody>
                             </Table>
                         </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
