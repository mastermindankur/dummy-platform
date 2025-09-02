
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
import { ArrowLeft, Loader2, TrendingUp, Users, CheckCircle, ArrowRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { ExcelData, MonthlyExcelData } from '@/types';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
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

  const { chartData, summaryMetrics, allTimeData, headers } = useMemo(() => {
    if (!monthlyData || Object.keys(monthlyData).length === 0) {
      return { chartData: [], summaryMetrics: { totalUsers: 0, teamsOnboarded: 0, averageAdoption: '0.00' }, allTimeData: [], headers: [] };
    }

    const allHeaders = new Set<string>();
    const data: { month: string; users: number; teams: number; adoption: number }[] = [];
    let allRows: any[] = [];

    const sortedMonths = Object.keys(monthlyData).sort();

    sortedMonths.forEach(month => {
        const monthData = monthlyData[month];
        monthData.headers.forEach(h => allHeaders.add(h));
        const monthRows = monthData.rows;
        allRows = allRows.concat(monthRows.map(row => ({...row, 'Month': new Date(month).toLocaleString('default', { month: 'short', year: '2-digit' }) })));

        const totalUsers = monthRows.length;
        const teamsOnboarded = new Set(monthRows.map(r => r['Team'])).size;
        // Assuming 'Adoption %' is a field in the data
        const totalAdoption = monthRows.reduce((acc, row) => acc + (parseFloat(row['Adoption %']) || 0), 0);
        const averageAdoption = totalUsers > 0 ? totalAdoption / totalUsers : 0;
        
        data.push({
            month: new Date(month).toLocaleString('default', { month: 'short', year: '2-digit' }),
            users: totalUsers,
            teams: teamsOnboarded,
            adoption: parseFloat(averageAdoption.toFixed(2)),
        });
    });

    const uniqueUsers = new Set(allRows.map(r => r['User ID'])).size;
    const uniqueTeams = new Set(allRows.map(r => r['Team'])).size;
    const overallAdoption = allRows.reduce((acc, row) => acc + (parseFloat(row['Adoption %']) || 0), 0);
    const averageAdoption = allRows.length > 0 ? (overallAdoption / allRows.length).toFixed(2) : '0.00';
    
    return { 
        chartData: data,
        summaryMetrics: { totalUsers: uniqueUsers, teamsOnboarded: uniqueTeams, averageAdoption },
        allTimeData: allRows,
        headers: ['Month', ...Array.from(allHeaders)],
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
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
                <CardTitle className="text-3xl">Jira Assistant Adoption</CardTitle>
                <CardDescription>
                Month-over-month analysis of Jira Assistant usage and adoption across teams.
                </CardDescription>
            </div>
            <Button asChild>
                <Link href="/pillar/making-design-resilient/user-adoption-report">
                    View LOBT Report
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
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
                                <CardTitle className="text-sm font-medium">Average Adoption</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summaryMetrics.averageAdoption}%</div>
                            </CardContent>
                        </Card>
                    </div>

                 <Card>
                    <CardHeader>
                        <CardTitle>Adoption Trend</CardTitle>
                        <CardDescription>Monthly active users and average adoption rate.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="border rounded-lg">
                          <Table>
                              <TableHeader>
                                  <TableRow>
                                      <TableHead>Month</TableHead>
                                      <TableHead className="text-right">Active Users</TableHead>
                                      <TableHead className="text-right">Teams Onboarded</TableHead>
                                      <TableHead className="text-right">Adoption %</TableHead>
                                  </TableRow>
                              </TableHeader>
                              <TableBody>
                                  {chartData.map((item) => (
                                      <TableRow key={item.month}>
                                          <TableCell className="font-medium">{item.month}</TableCell>
                                          <TableCell className="text-right">{item.users}</TableCell>
                                          <TableCell className="text-right">{item.teams}</TableCell>
                                          <TableCell className="text-right">{item.adoption}%</TableCell>
                                      </TableRow>
                                  ))}
                              </TableBody>
                          </Table>
                      </div>
                    </CardContent>
                  </Card>
                 
                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                        All-Time Data
                    </h3>
                    <div className="border rounded-lg max-h-[500px] overflow-auto">
                    <Table>
                        <TableHeader className="sticky top-0 bg-secondary">
                        <TableRow>
                            {headers.map((header) => (
                            <TableHead key={header}>{header}</TableHead>
                            ))}
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {allTimeData.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                            {headers.map((header) => (
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
