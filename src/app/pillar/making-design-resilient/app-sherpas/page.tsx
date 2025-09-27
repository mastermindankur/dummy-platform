
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
import { ArrowLeft, CalendarClock, Loader2, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { ExcelData, Pillar, SubItem, ExcelRow } from '@/types';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

const fetchSherpasData = async (): Promise<ExcelData | null> => {
  const res = await fetch('/api/data?key=app-sherpas');
  if (res.status === 404) {
    return null; // No data uploaded yet
  }
  if (!res.ok) {
    throw new Error('Failed to fetch App Sherpas data');
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

const fetchMetadata = async (key: string) => {
    const res = await fetch(`/api/data?key=${key}&meta=true`);
    if (!res.ok) return null;
    const { lastUpdated } = await res.json();
    return lastUpdated;
};


export default function AppSherpasPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [sherpaSubItem, setSherpaSubItem] = useState<SubItem | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [data, pillars, metadata] = await Promise.all([
            fetchSherpasData(),
            fetchPillarsData(),
            fetchMetadata('app-sherpas')
        ]);
        
        setExcelData(data);
        setLastUpdated(metadata);

        if (pillars) {
            const resilientPillar = pillars.find(p => p.id === 'making-design-resilient');
            const subItem = resilientPillar?.subItems.find(s => s.id === 'app-sherpas') || null;
            setSherpaSubItem(subItem);
        }

      } catch (error) {
        console.error('Failed to load page data', error);
        toast({
          title: 'Error',
          description: 'Could not load the App Sherpas data.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const totalSherpas = excelData?.rows.length || 0;
  const annualTarget = sherpaSubItem?.annualTarget || 0;
  const progressPercentage = annualTarget > 0 ? (totalSherpas / annualTarget) * 100 : 0;


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
            <div className="flex flex-wrap items-center gap-4">
                <CardTitle className="text-3xl">
                  App Sherpas
                </CardTitle>
                {lastUpdated && (
                    <Badge variant="outline" className="font-normal">
                        <CalendarClock className="mr-2 h-4 w-4" />
                        Last updated: {new Date(lastUpdated).toLocaleDateString()}
                    </Badge>
                )}
            </div>
            <CardDescription>
              This page displays the current data for App Sherpas.
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
                    <Card>
                        <CardHeader>
                            <CardTitle>Overall Progress</CardTitle>
                            <CardDescription>Total App Sherpas against the annual target.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center h-full">
                               <div className="text-center">
                                    <p className="text-5xl font-bold">{totalSherpas}</p>
                                    <p className="text-lg text-muted-foreground">out of {annualTarget} App Sherpas</p>
                                    <Progress value={progressPercentage} className="mt-4 h-3" />
                               </div>
                            </div>
                        </CardContent>
                    </Card>
                 
                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                    Spreadsheet Data ({totalSherpas} App Sherpas)
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
