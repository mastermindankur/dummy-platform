
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
import { ArrowLeft, Loader2, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { MonthlyExcelData, ExcelRow } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';


const fetchAdoptionData = async (): Promise<MonthlyExcelData | null> => {
  const res = await fetch('/api/data?key=jira-assistant-adoption');
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error('Failed to fetch adoption data');
  }
  return res.json();
};

type AdoptionStats = {
    lobt: string;
    totalUsers: number;
    adoptedUsers: number;
    adoptionRate: number;
    prevAdoptionRate: number | null;
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

  const adoptionReportData = useMemo(() => {
    if (!monthlyData || Object.keys(monthlyData).length === 0) {
      return [];
    }
    
    const sortedMonths = Object.keys(monthlyData).sort();
    const currentMonth = sortedMonths[sortedMonths.length - 1];
    const prevMonth = sortedMonths.length > 1 ? sortedMonths[sortedMonths.length - 2] : null;

    const getLOBTStats = (month: string | null): Map<string, { total: number; adopted: number }> => {
        const stats = new Map<string, { total: number; adopted: number }>();
        if (!month || !monthlyData[month]) return stats;

        for (const row of monthlyData[month].rows) {
            const lobt = row['L3 Department'] as string || 'Unknown';
            if (!stats.has(lobt)) {
                stats.set(lobt, { total: 0, adopted: 0 });
            }
            const lobtStats = stats.get(lobt)!;
            lobtStats.total += 1;
            if (row['is_created_via_JA'] === 1) {
                lobtStats.adopted += 1;
            }
        }
        return stats;
    };
    
    const currentMonthStats = getLOBTStats(currentMonth);
    const prevMonthStats = getLOBTStats(prevMonth);
    
    const report: AdoptionStats[] = [];

    for (const [lobt, currentStats] of currentMonthStats.entries()) {
        const prevStats = prevMonthStats.get(lobt);
        const currentRate = currentStats.total > 0 ? (currentStats.adopted / currentStats.total) * 100 : 0;
        const prevRate = prevStats && prevStats.total > 0 ? (prevStats.adopted / prevStats.total) * 100 : null;
        
        report.push({
            lobt,
            totalUsers: currentStats.total,
            adoptedUsers: currentStats.adopted,
            adoptionRate: currentRate,
            prevAdoptionRate: prevRate,
        });
    }

    return report.sort((a,b) => a.lobt.localeCompare(b.lobt));

  }, [monthlyData]);

  const totalRow = useMemo(() => {
    if (adoptionReportData.length === 0) return null;
    const totalUsers = adoptionReportData.reduce((sum, item) => sum + item.totalUsers, 0);
    const adoptedUsers = adoptionReportData.reduce((sum, item) => sum + item.adoptedUsers, 0);
    const adoptionRate = totalUsers > 0 ? (adoptedUsers / totalUsers) * 100 : 0;

    const prevTotalUsers = adoptionReportData.reduce((sum, item) => {
        const rate = item.prevAdoptionRate;
        if(rate !== null && item.totalUsers > 0) {
           return sum + (item.totalUsers * rate / (item.adoptionRate || 1))
        }
        return sum;
    }, 0);

    const prevAdoptedUsers = adoptionReportData.reduce((sum, item) => {
        if(item.prevAdoptionRate !== null) {
            // This is a rough estimate of previous adopted users
             return sum + (item.totalUsers * item.prevAdoptionRate / 100);
        }
        return sum;
    }, 0)

    const prevAdoptionRate = adoptionReportData.some(d => d.prevAdoptionRate !== null) ?
         (adoptionReportData.reduce((acc, item) => acc + (item.prevAdoptionRate || 0), 0) / adoptionReportData.filter(i => i.prevAdoptionRate !== null).length) : null;


    return {
        totalUsers,
        adoptedUsers,
        adoptionRate,
        prevAdoptionRate
    }
  }, [adoptionReportData]);

  const ChangeIndicator = ({ current, previous }: { current: number, previous: number | null }) => {
    if (previous === null) return <Minus className="h-4 w-4 text-muted-foreground" />;
    
    const change = current - previous;
    if (Math.abs(change) < 0.01) return <Minus className="h-4 w-4 text-muted-foreground" />;

    if (change > 0) {
        return <ArrowUp className="h-4 w-4 text-green-500" />;
    } else {
        return <ArrowDown className="h-4 w-4 text-red-500" />;
    }
  };


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
                Month-on-month user adoption breakdown by Line of Business Technology (LOBT).
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {!isLoading && adoptionReportData.length === 0 && (
              <div className="text-center text-muted-foreground p-8">
                  No data available to generate this report. Please upload data for at least one month.
              </div>
            )}

            {!isLoading && adoptionReportData.length > 0 && (
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>LOBT</TableHead>
                                <TableHead className="text-right"># DTI Users</TableHead>
                                <TableHead className="text-right"># JA Adoption</TableHead>
                                <TableHead className="text-right">% Adoption (Current)</TableHead>
                                <TableHead className="text-right">% Adoption (Previous)</TableHead>
                                <TableHead className="text-right">Change</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {adoptionReportData.map((item) => (
                                <TableRow key={item.lobt}>
                                    <TableCell className="font-medium">{item.lobt}</TableCell>
                                    <TableCell className="text-right">{item.totalUsers}</TableCell>
                                    <TableCell className="text-right">{item.adoptedUsers}</TableCell>
                                    <TableCell className="text-right">{item.adoptionRate.toFixed(2)}%</TableCell>
                                    <TableCell className="text-right text-muted-foreground">
                                        {item.prevAdoptionRate !== null ? `${item.prevAdoptionRate.toFixed(2)}%` : 'N/A'}
                                    </TableCell>
                                    <TableCell className="flex justify-end">
                                        <ChangeIndicator current={item.adoptionRate} previous={item.prevAdoptionRate} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        {totalRow && (
                           <tfoot className="border-t">
                                <TableRow className="font-bold bg-secondary/50">
                                    <TableCell>Total</TableCell>
                                    <TableCell className="text-right">{totalRow.totalUsers}</TableCell>
                                    <TableCell className="text-right">{totalRow.adoptedUsers}</TableCell>
                                    <TableCell className="text-right">{totalRow.adoptionRate.toFixed(2)}%</TableCell>
                                    <TableCell className="text-right text-muted-foreground">
                                        {totalRow.prevAdoptionRate !== null ? `${totalRow.prevAdoptionRate.toFixed(2)}%` : 'N/A'}
                                    </TableCell>
                                     <TableCell className="flex justify-end">
                                        <ChangeIndicator current={totalRow.adoptionRate} previous={totalRow.prevAdoptionRate} />
                                    </TableCell>
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

