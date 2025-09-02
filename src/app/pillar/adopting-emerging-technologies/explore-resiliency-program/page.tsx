
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

// This is a placeholder for where you might fetch your data from
// In a real app, this would likely be an API call that retrieves the processed
// excel data which was uploaded on the "Update Data" page.
const fetchProgramData = async () => {
  // Simulate fetching data
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Return mock data since we don't have a backend to store the uploaded file
  return {
    headers: ['ID', 'Task', 'Owner', 'Status', 'Due Date'],
    rows: [
      { ID: '1', Task: 'Review cloud architecture', Owner: 'Alice', Status: 'In Progress', 'Due Date': '2024-08-15' },
      { ID: '2', Task: 'Update firewall rules', Owner: 'Bob', Status: 'Completed', 'Due Date': '2024-08-01' },
      { ID: '3', Task: 'Conduct penetration test', Owner: 'Charlie', Status: 'Not Started', 'Due Date': '2024-09-01' },
    ],
  };
};


export default function ExploreResiliencyProgramPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [excelData, setExcelData] = useState<{
    headers: string[];
    rows: Record<string, any>[];
  } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchProgramData();
        setExcelData(data);
      } catch (error) {
        console.error('Failed to load program data', error);
        toast({
          title: 'Error',
          description: 'Could not load the program data.',
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
              Explore Resiliency Program
            </CardTitle>
            <CardDescription>
              This page displays the current data for the Explore Resiliency Program. To update this data, please use the Excel upload feature on the &quot;Update Data&quot; page.
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
                  Program Data
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
                    No data has been uploaded for this program yet.
                </div>
             )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
