
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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Pie, PieChart, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const fetchMaintenanceData = async (): Promise<ExcelData | null> => {
  const res = await fetch('/api/data?key=maintenance-screens');
  if (res.status === 404) {
    return null; 
  }
  if (!res.ok) {
    throw new Error('Failed to fetch maintenance screens data');
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


export default function MaintenanceScreensPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [subItemData, setSubItemData] = useState<SubItem | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [data, pillars] = await Promise.all([
            fetchMaintenanceData(),
            fetchPillarsData()
        ]);
        
        setExcelData(data);

        if (pillars) {
            const reliableProductsPillar = pillars.find(p => p.id === 'building-reliable-products');
            const subItem = reliableProductsPillar?.subItems.find(s => s.dataKey === 'maintenance-screens') || null;
            setSubItemData(subItem);
        }

      } catch (error) {
        console.error('Failed to load page data', error);
        toast({
          title: 'Error',
          description: 'Could not load the maintenance screens data.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const { statusDistribution, lobtDistribution, implementedCount } = useMemo(() => {
    if (!excelData?.rows) return { statusDistribution: [], lobtDistribution: [], implementedCount: 0 };
    
    const statusCounts: { [key: string]: number } = {};
    const lobtCounts: { [key: string]: number } = {};
    let liveCount = 0;

    excelData.rows.forEach((row: ExcelRow) => {
        const status = row['Status'] as string;
        if (status) {
            statusCounts[status] = (statusCounts[status] || 0) + 1;
            if (String(status).toLowerCase().includes('live')) {
              liveCount++;
            }
        }

        const lobt = row['LOBT'] as string;
        if (lobt) {
            lobtCounts[lobt] = (lobtCounts[lobt] || 0) + 1;
        }
    });

    return {
        statusDistribution: Object.entries(statusCounts).map(([name, value]) => ({ name, value })),
        lobtDistribution: Object.entries(lobtCounts).map(([name, value]) => ({ name, value })),
        implementedCount: liveCount
    };
  }, [excelData]);
  
  const totalScreens = excelData?.rows.length || 0;
  const annualTarget = subItemData?.annualTarget || 0;
  const progressPercentage = annualTarget > 0 ? (implementedCount / annualTarget) * 100 : 0;
  
  const statusColors = {
      'Completed': 'hsl(var(--chart-1))',
      'In Progress': 'hsl(var(--chart-2))',
      'Not Started': 'hsl(var(--chart-3))',
      'On Hold': 'hsl(var(--chart-4))',
      'Implemented': 'hsl(var(--chart-5))'
  };


  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="mb-4">
            <Button asChild variant="outline">
                <Link href="/pillar/building-reliable-products">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Pillar
                </Link>
            </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">
              Maintenance Screens
            </CardTitle>
            <CardDescription>
              This page displays the current data for Maintenance Screens. To update this data, please use the Excel upload feature on the &quot;Update Data&quot; page.
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
                            <CardDescription>Screens implemented against the annual target.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center h-full">
                               <div className="text-center">
                                    <p className="text-5xl font-bold">{implementedCount}</p>
                                    <p className="text-lg text-muted-foreground">out of {annualTarget} screens</p>
                                    <Progress value={progressPercentage} className="mt-4 h-3" />
                               </div>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Status Distribution</CardTitle>
                            <CardDescription>Breakdown of screens by their current status.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <ChartContainer config={{}} className="min-h-[300px] w-full">
                            <ResponsiveContainer width="100%" height={300}>
                              <PieChart>
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Pie
                                  data={statusDistribution}
                                  dataKey="value"
                                  nameKey="name"
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={100}
                                  label
                                >
                                  {statusDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={statusColors[entry.name as keyof typeof statusColors] || '#8884d8'} />
                                  ))}
                                </Pie>
                              </PieChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </CardContent>
                      </Card>
                       <Card>
                        <CardHeader>
                            <CardTitle>LOBT-wise Distribution</CardTitle>
                            <CardDescription>Number of screens per Line of Business Technology.</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ChartContainer config={{}} className="min-h-[300px] w-full">
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={lobtDistribution} layout="vertical" margin={{ right: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </CardContent>
                      </Card>
                 </div>
                 
                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                    Spreadsheet Data ({totalScreens} screens)
                    </h3>
                    <div className="border rounded-lg max-h-[600px] overflow-auto">
                    <Table>
                        <TableHeader className="sticky top-0 bg-secondary">
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
