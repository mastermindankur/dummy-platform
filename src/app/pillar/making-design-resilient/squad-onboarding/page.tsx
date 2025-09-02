
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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const fetchSquadData = async (): Promise<ExcelData | null> => {
  const res = await fetch('/api/data?key=squad-onboarding');
  if (res.status === 404) {
    return null; // No data uploaded yet
  }
  if (!res.ok) {
    throw new Error('Failed to fetch SQUAD onboarding data');
  }
  return res.json();
};

// Fetch all pillar data to find the specific sub-item for targets
const fetchPillarsData = async (): Promise<Pillar[] | null> => {
    const res = await fetch('/api/data');
    if (!res.ok) {
      throw new Error('Failed to fetch pillars data');
    }
    return res.json();
};


export default function SquadOnboardingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [squadSubItem, setSquadSubItem] = useState<SubItem | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [data, pillars] = await Promise.all([
            fetchSquadData(),
            fetchPillarsData()
        ]);
        
        setExcelData(data);

        if (pillars) {
            const resilientDesignPillar = pillars.find(p => p.id === 'making-design-resilient');
            const subItem = resilientDesignPillar?.subItems.find(s => s.id === 'system-scalability') || null;
            setSquadSubItem(subItem);
        }

      } catch (error) {
        console.error('Failed to load page data', error);
        toast({
          title: 'Error',
          description: 'Could not load the SQUAD onboarding data.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);
  
  const { categoryDistributionData } = useMemo(() => {
    if (!excelData?.rows) return { categoryDistributionData: [] };

    const categoryCounts: { [key: string]: number } = {};
    
    excelData.rows.forEach((row: ExcelRow) => {
        const category = row['Category'] as string;
        if (category) {
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        }
    });

    const data = Object.entries(categoryCounts).map(([name, value]) => ({
      name,
      value,
    }));
    
    return { categoryDistributionData: data };
  }, [excelData]);


  const totalOnboarded = excelData?.rows.length || 0;
  const annualTarget = squadSubItem?.annualTarget || 0;
  const progressPercentage = annualTarget > 0 ? (totalOnboarded / annualTarget) * 100 : 0;

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
            <CardTitle className="text-3xl">
              Onboarding CAT1/CAT2 to SQUAD
            </CardTitle>
            <CardDescription>
              This page displays the current data for SQUAD onboarding. To update this data, please use the Excel upload feature on the &quot;Update Data&quot; page.
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
                            <CardDescription>Total applications onboarded against the annual target.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center h-full">
                               <div className="text-center">
                                    <p className="text-5xl font-bold">{totalOnboarded}</p>
                                    <p className="text-lg text-muted-foreground">out of {annualTarget} applications</p>
                                    <Progress value={progressPercentage} className="mt-4 h-3" />
                               </div>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Onboarding by Category</CardTitle>
                            <CardDescription>Number of applications onboarded for each category.</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ChartContainer config={{}} className="min-h-[200px] w-full">
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={categoryDistributionData} layout="vertical" margin={{ right: 20, left: 20 }}>
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
                    Spreadsheet Data
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
