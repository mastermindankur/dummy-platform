
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
import { ArrowLeft, CalendarClock, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { MonthlyExcelData, ExcelRow } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
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

const fetchMetadata = async (key: string) => {
    const res = await fetch(`/api/data?key=${key}&meta=true`);
    if (!res.ok) return null;
    const { lastUpdated } = await res.json();
    return lastUpdated;
};


type MonthlyStats = {
    totalUsers: number;
    activeUsers: number;
    adoption: number;
};

type TestCaseMonthlyStats = {
    totalCases: number;
    jaCases: number;
    adoption: number;
}

type PlatformAdoptionData = {
    platform: string;
    monthlyData: { [month: string]: MonthlyStats };
}

type PlatformTestCaseAdoptionData = {
    platform: string;
    monthlyData: { [month: string]: TestCaseMonthlyStats };
}


export default function JiraAssistantAdoptionPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<MonthlyExcelData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [data, metadata] = await Promise.all([
            fetchAdoptionData(),
            fetchMetadata('jira-assistant-adoption')
        ]);
        setMonthlyData(data);
        setLastUpdated(metadata);
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

  const {
    reportData,
    sortedMonths,
    totalRow,
    chartData,
    platformKeys,
    testCaseReportData,
    testCaseTotalRow,
    testCaseChartData,
    testCasePlatformKeys
} = useMemo(() => {
    if (!monthlyData) {
        return {
            reportData: [],
            sortedMonths: [],
            totalRow: null,
            chartData: [],
            platformKeys: [],
            testCaseReportData: [],
            testCaseTotalRow: null,
            testCaseChartData: [],
            testCasePlatformKeys: [],
        };
    }

    const allMonths = Object.keys(monthlyData).sort();
    const sortedMonthLabels = allMonths.map(m => new Date(m + '-02').toLocaleString('default', { month: 'short', year: '2-digit' }));
    
    // USER ADOPTION LOGIC
    const platformUserStats = new Map<string, { [month: string]: { totalUsers: Set<string>; activeUsers: Set<string> } }>();
    
    // TEST CASE ADOPTION LOGIC
    const platformTestCaseStats = new Map<string, { [month: string]: { totalCases: number, jaCases: number } }>();

    const findColumnValue = (row: ExcelRow, potentialNames: string[]): any => {
      const rowKeys = Object.keys(row);
      for (const name of potentialNames) {
        const foundKey = rowKeys.find(key => key.toLowerCase() === name.toLowerCase());
        if (foundKey) {
          return row[foundKey];
        }
      }
      return undefined;
    };


    for (const month of allMonths) {
        const monthLabel = new Date(month + '-02').toLocaleString('default', { month: 'short', 'year': '2-digit' });
        const monthRows = monthlyData[month].rows;

        for (const row of monthRows) {
            const platform = (findColumnValue(row, ['platforms', 'platform']) as string) || 'Unknown';
            const userId = findColumnValue(row, ['1bankid']);
            const isAdopted = findColumnValue(row, ['is_created_via_ja']) === 1;
            
            // User Adoption Processing
            if (!platformUserStats.has(platform)) {
                platformUserStats.set(platform, {});
            }
            const platformUserData = platformUserStats.get(platform)!;
            
            if (!platformUserData[monthLabel]) {
                platformUserData[monthLabel] = { totalUsers: new Set(), activeUsers: new Set() };
            }
            const userMonthStats = platformUserData[monthLabel];

            if (userId) {
                userMonthStats.totalUsers.add(userId);
                if (isAdopted) {
                    userMonthStats.activeUsers.add(userId);
                }
            }

            // Test Case Adoption Processing
            if (String(findColumnValue(row, ['issue_type'])).toLowerCase() === 'test') {
                if (!platformTestCaseStats.has(platform)) {
                    platformTestCaseStats.set(platform, {});
                }
                const platformTestCaseData = platformTestCaseStats.get(platform)!;

                if (!platformTestCaseData[monthLabel]) {
                    platformTestCaseData[monthLabel] = { totalCases: 0, jaCases: 0 };
                }
                const testCaseMonthStats = platformTestCaseData[monthLabel];
                testCaseMonthStats.totalCases += 1;
                if (isAdopted) {
                    testCaseMonthStats.jaCases += 1;
                }
            }
        }
    }
    
    // Final processing for User Adoption
    const finalReportData: PlatformAdoptionData[] = [];
    const allPlatformKeys = Array.from(platformUserStats.keys()).sort();

    for (const platform of allPlatformKeys) {
        const monthMap = platformUserStats.get(platform)!;
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

    const grandTotalRow: PlatformAdoptionData = { platform: 'Total', monthlyData: {} };
    for(const monthLabel of sortedMonthLabels) {
        let totalUsersForMonth = 0;
        let activeUsersForMonth = 0;
        reportDataSorted.forEach(p => {
            totalUsersForMonth += p.monthlyData[monthLabel]?.totalUsers || 0;
            activeUsersForMonth += p.monthlyData[monthLabel]?.activeUsers || 0;
        });
        const adoption = totalUsersForMonth > 0 ? (activeUsersForMonth / totalUsersForMonth) * 100 : 0;
        grandTotalRow.monthlyData[monthLabel] = { totalUsers: totalUsersForMonth, activeUsers: activeUsersForMonth, adoption };
    }

    const chartDataFormatted = sortedMonthLabels.map(month => {
        const monthEntry: {[key: string]: any} = { name: month };
        reportDataSorted.forEach(platformData => {
            monthEntry[platformData.platform] = platformData.monthlyData[month]?.adoption.toFixed(2);
        });
        monthEntry['Total'] = grandTotalRow.monthlyData[month]?.adoption.toFixed(2);
        return monthEntry;
    });

    // Final processing for Test Case Adoption
    const finalTestCaseReportData: PlatformTestCaseAdoptionData[] = [];
    const allTestCasePlatformKeys = Array.from(platformTestCaseStats.keys()).sort();

    for (const platform of allTestCasePlatformKeys) {
        const monthMap = platformTestCaseStats.get(platform)!;
        const platformAdoption: PlatformTestCaseAdoptionData = { platform, monthlyData: {} };

        for (const monthLabel of sortedMonthLabels) {
            const stats = monthMap[monthLabel];
            const totalCases = stats?.totalCases || 0;
            const jaCases = stats?.jaCases || 0;
            const adoption = totalCases > 0 ? (jaCases / totalCases) * 100 : 0;
            platformAdoption.monthlyData[monthLabel] = { totalCases, jaCases, adoption };
        }
        finalTestCaseReportData.push(platformAdoption);
    }
    
    const testCaseReportDataSorted = finalTestCaseReportData.sort((a, b) => a.platform.localeCompare(b.platform));
    
    const testCaseGrandTotalRow: PlatformTestCaseAdoptionData = { platform: 'Total', monthlyData: {} };
    for (const monthLabel of sortedMonthLabels) {
        let totalCasesForMonth = 0;
        let jaCasesForMonth = 0;
        testCaseReportDataSorted.forEach(l => {
            totalCasesForMonth += l.monthlyData[monthLabel]?.totalCases || 0;
            jaCasesForMonth += l.monthlyData[monthLabel]?.jaCases || 0;
        });
        const adoption = totalCasesForMonth > 0 ? (jaCasesForMonth / totalCasesForMonth) * 100 : 0;
        testCaseGrandTotalRow.monthlyData[monthLabel] = { totalCases: totalCasesForMonth, jaCases: jaCasesForMonth, adoption };
    }

    const testCaseChartDataFormatted = sortedMonthLabels.map(month => {
        const monthEntry: {[key: string]: any} = { name: month };
        testCaseReportDataSorted.forEach(platformData => {
            monthEntry[platformData.platform] = platformData.monthlyData[month]?.adoption.toFixed(2);
        });
        monthEntry['Total'] = testCaseGrandTotalRow.monthlyData[month]?.adoption.toFixed(2);
        return monthEntry;
    });

    return {
      reportData: reportDataSorted,
      sortedMonths: sortedMonthLabels,
      totalRow: grandTotalRow,
      chartData: chartDataFormatted,
      platformKeys: allPlatformKeys,
      testCaseReportData: testCaseReportDataSorted,
      testCaseTotalRow: testCaseGrandTotalRow,
      testCaseChartData: testCaseChartDataFormatted,
      testCasePlatformKeys: allTestCasePlatformKeys,
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
             <Card>
                <CardHeader>
                    <div className="flex flex-wrap items-center gap-4">
                        <CardTitle>Jira Assistant Adoption</CardTitle>
                        {lastUpdated && (
                            <Badge variant="outline" className="font-normal">
                                <CalendarClock className="mr-2 h-4 w-4" />
                                Last updated: {new Date(lastUpdated).toLocaleString()}
                            </Badge>
                        )}
                    </div>
                    <CardDescription>
                        Month-on-month adoption metrics.
                    </CardDescription>
                </CardHeader>
            </Card>
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
                                    <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis label={{ value: 'Adoption %', angle: -90, position: 'insideLeft' }} domain={[0, 100]}/>
                                        <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                                        <ChartLegend />
                                        <Bar dataKey="Total" fill="#ff7300" name="Total Adoption" />
                                        {platformKeys.map((key, index) => (
                                            <Bar 
                                                key={key} 
                                                dataKey={key} 
                                                fill={chartColors[index % chartColors.length]}
                                                name={key}
                                            />
                                        ))}
                                    </BarChart>
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
                <Card>
                    <CardHeader>
                        <CardTitle>JA Test Cases Adoption Trend</CardTitle>
                        <CardDescription>Month-on-month test case adoption percentage.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading && (
                            <div className="flex items-center justify-center p-8 h-[400px]">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        )}
                        {!isLoading && testCaseChartData.length > 0 && (
                            <ChartContainer config={{}} className="h-[400px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={testCaseChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis label={{ value: 'Adoption %', angle: -90, position: 'insideLeft' }} domain={[0, 100]}/>
                                        <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                                        <ChartLegend />
                                        <Bar dataKey="Total" fill="#ff7300" name="Total Adoption" />
                                        {testCasePlatformKeys.map((key, index) => (
                                            <Bar
                                                key={key} 
                                                dataKey={key} 
                                                fill={chartColors[index % chartColors.length]} 
                                                name={key}
                                            />
                                        ))}
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        )}
                        {!isLoading && testCaseChartData.length === 0 && (
                             <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                                No data available to display chart.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>User Adoption Details</CardTitle>
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
                    <CardTitle>Jira Assist Test Cases Adoption Details</CardTitle>
                    <CardDescription>Month-on-month test case adoption of Jira Assistant, broken down by Platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    )}
                    {!isLoading && testCaseReportData.length === 0 && (
                         <div className="text-center text-muted-foreground p-8">
                            No test case data is available to display.
                        </div>
                    )}
                    {!isLoading && testCaseReportData.length > 0 && (
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
                                            <React.Fragment key={`${month}-sub-test`}>
                                                <TableHead className="text-right border-l">Total Cases</TableHead>
                                                <TableHead className="text-right">JA Cases</TableHead>
                                                <TableHead className="text-right">Adoption %</TableHead>
                                            </React.Fragment>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {testCaseReportData.map((item) => (
                                        <TableRow key={item.platform}>
                                            <TableCell className="font-medium sticky left-0 bg-background">{item.platform}</TableCell>
                                            {sortedMonths.map(month => {
                                                const monthData = item.monthlyData[month];
                                                return (
                                                   <React.Fragment key={`${item.platform}-${month}`}>
                                                        <TableCell className="text-right border-l">{monthData?.totalCases ?? 'N/A'}</TableCell>
                                                        <TableCell className="text-right">{monthData?.jaCases ?? 'N/A'}</TableCell>
                                                        <TableCell className="text-right">{monthData?.adoption !== undefined ? `${monthData.adoption.toFixed(2)}%` : 'N/A'}</TableCell>
                                                   </React.Fragment>
                                                )
                                            })}
                                        </TableRow>
                                    ))}
                                    {testCaseTotalRow && (
                                        <TableRow className="font-bold bg-secondary hover:bg-secondary/80">
                                            <TableCell className="sticky left-0 bg-secondary">{testCaseTotalRow.platform}</TableCell>
                                            {sortedMonths.map(month => {
                                                const monthData = testCaseTotalRow.monthlyData[month];
                                                return (
                                                   <React.Fragment key={`total-test-${month}`}>
                                                        <TableCell className="text-right border-l">{monthData?.totalCases ?? 'N/A'}</TableCell>
                                                        <TableCell className="text-right">{monthData?.jaCases ?? 'N/A'}</TableCell>
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
        </div>
      </main>
    </div>
  );
}

    