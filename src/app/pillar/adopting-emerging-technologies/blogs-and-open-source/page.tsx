
'use client';

import { useState, useEffect } from 'react';
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
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { ExcelData } from '@/types';

const fetchBlogsData = async (): Promise<ExcelData | null> => {
  const res = await fetch('/api/data?key=dti-tech-blogs');
  if (res.status === 404) {
    return null; // No data uploaded yet
  }
  if (!res.ok) {
    throw new Error('Failed to fetch blogs data');
  }
  return res.json();
};

export default function BlogsAndOpenSourcePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [excelData, setExcelData] = useState<ExcelData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchBlogsData();
        setExcelData(data);
      } catch (error) {
        console.error('Failed to load blogs data', error);
        toast({
          title: 'Error',
          description: 'Could not load the blogs and open source data.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">
              Blogs and Open Source
            </CardTitle>
            <CardDescription>
              This page displays the current data for blogs and open source contributions. To update this data, please use the Excel upload feature on the &quot;Update Data&quot; page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {excelData && (
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
            )}
             {!isLoading && !excelData && (
                <div className="text-center text-muted-foreground p-8">
                    No data has been uploaded for this section yet.
                </div>
             )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
