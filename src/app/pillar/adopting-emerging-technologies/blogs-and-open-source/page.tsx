
'use client';

import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  processExcelFile,
  type ExcelRow,
} from '@/ai/flows/process-excel-file';
import { Label } from '@/components/ui/label';

export default function BlogsAndOpenSourcePage() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [excelData, setExcelData] = useState<{
    headers: string[];
    rows: ExcelRow[];
  } | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select an Excel file to upload.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setExcelData(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const fileAsDataUri = reader.result as string;
        try {
          const result = await processExcelFile({ fileAsDataUri });
          setExcelData(result);
        } catch (error) {
           console.error('Error processing file:', error);
           toast({
             title: 'Error',
             description: 'Failed to process the Excel file. Please ensure it is a valid .xlsx or .xls file.',
             variant: 'destructive',
           });
        } finally {
          setIsLoading(false);
        }
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        toast({
          title: 'Error',
          description: 'Failed to read the selected file.',
          variant: 'destructive',
        });
        setIsLoading(false);
      };
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred during file upload.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

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
              Upload and view data from your Excel spreadsheet for blogs, URLs, links, and LOBTs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-8 max-w-2xl">
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="excel-file">Upload Excel File</Label>
                <div className="flex gap-2">
                  <Input
                    id="excel-file"
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileChange}
                    className="flex-grow"
                  />
                  <Button
                    onClick={handleFileUpload}
                    disabled={isLoading || !file}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    Upload
                  </Button>
                </div>
              </div>
            </div>

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
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
