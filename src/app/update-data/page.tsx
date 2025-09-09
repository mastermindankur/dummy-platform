
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import type { Pillar, SubItem, Status, ExcelData, ExcelRow } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Plus, Trash2, Upload, ArrowRight, ChevronsUpDown, Filter, X } from 'lucide-react';
import { processExcelFile, getExcelSheetNames } from '@/lib/excel-utils';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type FilterState = {
    id: number;
    column: string;
    value: string;
};

function ExcelUploadSection({
  title,
  description,
  fileKey,
  onDataProcessed,
  isMonthly = false,
}: {
  title: string;
  description: string;
  fileKey: string;
  onDataProcessed: (key: string, data: ExcelData) => void;
  isMonthly?: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [fileDataUri, setFileDataUri] = useState<string>('');
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState[]>([]);
  const [filterCounter, setFilterCounter] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [month, setMonth] = useState<string>(isMonthly ? new Date().toISOString().slice(0, 7) : '');

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
        const selectedFile = files[0];
        setFile(selectedFile);
        // Reset subsequent steps
        setSheetNames([]);
        setSelectedSheet('');
        setHeaders([]);
        setFilters([]);
        setIsLoading(true);
        try {
            const dataUri = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = (error) => reject(error);
                reader.readAsDataURL(selectedFile);
            });
            setFileDataUri(dataUri);
            const names = await getExcelSheetNames(dataUri);
            setSheetNames(names);
            if (names.length > 0) {
                // Automatically select first sheet and process headers
                setSelectedSheet(names[0]);
                await handleSheetChange(names[0], dataUri);
            }
        } catch (error) {
            console.error('Error processing file for sheet names:', error);
            toast({ title: 'Error reading file', description: 'Could not read sheet names from the file.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    }
  };

  const handleSheetChange = async (sheetName: string, dataUri = fileDataUri) => {
    setSelectedSheet(sheetName);
    setHeaders([]); // Reset headers and filters if sheet changes
    setFilters([]);
    
    if (!dataUri) return;
    setIsLoading(true);
    try {
        const result = await processExcelFile(dataUri, sheetName);
        setHeaders(result.headers);
    } catch(error) {
        console.error('Error processing sheet for headers:', error);
        toast({ title: 'Error reading sheet', description: 'Could not read headers from the selected sheet.', variant: 'destructive' });
    } finally {
        setIsLoading(false);
    }
  }
  
  const handleAddFilter = () => {
      setFilters([...filters, { id: filterCounter, column: '', value: ''}]);
      setFilterCounter(prev => prev + 1);
  }
  
  const handleRemoveFilter = (id: number) => {
      setFilters(filters.filter(f => f.id !== id));
  }

  const handleFilterChange = (id: number, type: 'column' | 'value', value: string) => {
      setFilters(filters.map(f => f.id === id ? {...f, [type]: value} : f));
  }


  const handleProcessAndLoad = async () => {
    if (!file || !fileDataUri || !selectedSheet) {
      toast({
        title: 'Missing information',
        description: 'Please select a file and a sheet to process.',
        variant: 'destructive',
      });
      return;
    }
    if (isMonthly && !month) {
        toast({
        title: 'No month selected',
        description: 'Please select a month for the data upload.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
        const validFilters = filters.filter(f => f.column && f.value).map(({column, value}) => ({column, value}));
        const result = await processExcelFile(fileDataUri, selectedSheet, validFilters);
        const finalFileKey = isMonthly ? `${fileKey}:${month}` : fileKey;
        onDataProcessed(finalFileKey, result);
        toast({
            title: `"${file.name}" processed`,
            description: `${result.rows.length} rows loaded from sheet "${selectedSheet}". Remember to save all changes.`,
        });
    } catch (error) {
        console.error('Error processing file:', error);
        toast({
        title: 'Error',
        description:
            'Failed to process the Excel file. Please ensure it is a valid .xlsx or .xls file.',
        variant: 'destructive',
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
      <Card className="bg-secondary/30">
        <CardHeader>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           {isMonthly && (
                <div>
                    <Label htmlFor={`month-select-${fileKey}`}>Select Month</Label>
                    <Input 
                        id={`month-select-${fileKey}`} 
                        type="month" 
                        value={month}
                        onChange={e => setMonth(e.target.value)}
                        className="w-full max-w-xs"
                    />
                </div>
            )}
          <div>
            <Label htmlFor={`excel-upload-${fileKey}`}>1. Upload Excel File</Label>
            <Input
                id={`excel-upload-${fileKey}`}
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
            />
          </div>

          {isLoading && !sheetNames.length && <Loader2 className="h-6 w-6 animate-spin" />}

          {sheetNames.length > 0 && (
              <div className="space-y-4 p-4 border rounded-md bg-background/50">
                <div>
                    <Label>2. Select Sheet</Label>
                    <Select onValueChange={(value) => handleSheetChange(value)} value={selectedSheet}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a sheet" />
                        </SelectTrigger>
                        <SelectContent>
                            {sheetNames.map(name => (
                                <SelectItem key={name} value={name}>{name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                 {isLoading && !headers.length && <Loader2 className="h-6 w-6 animate-spin" />}

                {headers.length > 0 && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                           <div className="flex items-center justify-between">
                             <Label>3. Filter Data (Optional)</Label>
                             <Button variant="outline" size="sm" onClick={handleAddFilter}><Filter className="mr-2 h-3 w-3" /> Add Filter</Button>
                           </div>
                           {filters.map((filter) => (
                               <div key={filter.id} className="flex gap-2 items-center">
                                   <Select onValueChange={(value) => handleFilterChange(filter.id, 'column', value)} value={filter.column}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Column" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {headers.map(header => <SelectItem key={header} value={header}>{header}</SelectItem>)}
                                        </SelectContent>
                                   </Select>
                                   <Input 
                                        placeholder="Filter Value" 
                                        value={filter.value} 
                                        onChange={(e) => handleFilterChange(filter.id, 'value', e.target.value)}
                                   />
                                   <Button variant="ghost" size="icon" onClick={() => handleRemoveFilter(filter.id)}><X className="h-4 w-4 text-destructive"/></Button>
                               </div>
                           ))}
                        </div>
                        <Button onClick={handleProcessAndLoad} disabled={isLoading || !file}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                            Process & Load Data
                        </Button>
                        <p className="text-xs text-muted-foreground">Process the file here, then click the main 'Save All Changes' button to update the dashboard.</p>
                    </div>
                )}
              </div>
          )}
        </CardContent>
      </Card>
  );
}

export default function UpdateDataPage() {
  const [data, setData] = useState<Pillar[] | null>(null);
  const [excelData, setExcelData] = useState<Record<string, ExcelData | null>>({
      'explore-resiliency-program': null,
      'dti-tech-blogs': null,
      'tech-sphere-sessions': null,
      'squad-onboarding': null,
      'arc-trainings': null,
      'app-sherpas': null,
      'jira-assistant-adoption': null,
      'regression-testing-automation': null,
      'junit-adoption': null,
      'maintenance-screens': null,
      'api-performance': null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/data');
      if (!res.ok) throw new Error('Failed to fetch data');
      const jsonData = await res.json();
      setData(jsonData);
      if (jsonData.length > 0) {
          setActiveTab(jsonData[0].id);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Could not load dashboard data.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePillarChange = (
    pillarIndex: number,
    field: keyof Pillar,
    value: string
  ) => {
    if (!data) return;
    const newData = [...data];
    (newData[pillarIndex] as any)[field] = value;
    setData(newData);
  };

  const handleSubItemChange = (
    pillarIndex: number,
    subItemIndex: number,
    field: keyof SubItem,
    value: string | number
  ) => {
    if (!data) return;
    const newData = [...data];
    (newData[pillarIndex].subItems[subItemIndex] as any)[field] = value;
    setData(newData);
  };

  const addSubItem = (pillarIndex: number) => {
    if(!data) return;
    const newData = [...data];
    const newSubItem: SubItem = {
      id: `new-sub-item-${Date.now()}`,
      name: 'New Sub-Item',
      description: '',
      status: 'Green',
      trend: 'flat',
      owner: '',
      lastUpdate: new Date().toISOString().split('T')[0],
      comments: '',
      percentageComplete: 0,
      annualTarget: 100,
      metricName: 'YTD Progress',
      metricUnit: '%',
      dataKey: '',
    };
    newData[pillarIndex].subItems.push(newSubItem);
    setData(newData);
  };

  const removeSubItem = (pillarIndex: number, subItemIndex: number) => {
    if(!data) return;
    const newData = [...data];
    newData[pillarIndex].subItems.splice(subItemIndex, 1);
    setData(newData);
  };

  const handleExcelDataProcessed = async (key: string, processedData: ExcelData) => {
    setExcelData(prev => ({ ...prev, [key]: processedData }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload: {
        pillars: Pillar[] | null;
        excelData: Record<string, any>;
      } = {
        pillars: data,
        excelData: excelData
      };
      
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save data');
      toast({
        title: 'Success',
        description: 'Dashboard data has been updated.',
      });
      // Refetch data to show the latest state, including auto-calculations
      await fetchData();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Could not save dashboard data.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
                <CardTitle className="text-3xl">Update Dashboard Data</CardTitle>
                <CardDescription>Modify pillar details, edit sub-items, and upload new data from Excel files.</CardDescription>
            </div>
            <Button onClick={handleSave} disabled={isSaving || isLoading}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSaving ? 'Saving...' : 'Save All Changes'}
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                 <Skeleton className="h-10 w-full mb-4" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-1 md:grid-cols-5 h-auto mb-6">
                        {data?.map((pillar) => (
                            <TabsTrigger key={pillar.id} value={pillar.id} className="text-xs md:text-sm">
                                {pillar.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {data?.map((pillar, pIndex) => (
                        <TabsContent key={pillar.id} value={pillar.id}>
                            <div className="space-y-6">
                                <Card className="bg-secondary/30">
                                    <CardHeader>
                                        <CardTitle className="text-xl">Pillar Details</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <Label htmlFor={`pillar-name-${pIndex}`}>Pillar Name</Label>
                                          <Input
                                            id={`pillar-name-${pIndex}`}
                                            value={pillar.name}
                                            onChange={(e) =>
                                              handlePillarChange(pIndex, 'name', e.target.value)
                                            }
                                          />
                                        </div>
                                        <div>
                                          <Label htmlFor={`pillar-desc-${pIndex}`}>
                                            Pillar Description
                                          </Label>
                                          <Textarea
                                            id={`pillar-desc-${pIndex}`}
                                            value={pillar.description}
                                            onChange={(e) =>
                                              handlePillarChange(pIndex, 'description', e.target.value)
                                            }
                                          />
                                        </div>
                                      </div>
                                    </CardContent>
                                </Card>

                                <div>
                                    <h4 className="text-xl font-semibold mb-2">Sub-Items</h4>
                                    <Accordion type="multiple" className="w-full">
                                    {pillar.subItems.map((item, sIndex) => {
                                      const isAutoCalculated = !!item.dataKey;

                                      return (
                                        <AccordionItem value={item.id} key={item.id} className="border-b-0 mb-2">
                                            <div className="flex items-center group bg-background rounded-md border">
                                                <AccordionTrigger className="flex-1 px-4 py-3 hover:no-underline font-medium">
                                                    <span>{item.name}</span>
                                                </AccordionTrigger>
                                                <Button variant="ghost" size="icon" className="mr-2 text-destructive hover:text-destructive" onClick={() => removeSubItem(pIndex, sIndex)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <AccordionContent>
                                                <div className="border border-t-0 rounded-b-md p-4 bg-background/50 relative">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    <div>
                                                        <Label htmlFor={`item-name-${pIndex}-${sIndex}`}>Name</Label>
                                                        <Input
                                                        id={`item-name-${pIndex}-${sIndex}`}
                                                        value={item.name}
                                                        onChange={(e) =>
                                                            handleSubItemChange(pIndex, sIndex, 'name', e.target.value)
                                                        }
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor={`item-status-${pIndex}-${sIndex}`}>Status</Label>
                                                        <Select
                                                        value={item.status}
                                                        onValueChange={(value) =>
                                                            handleSubItemChange(
                                                            pIndex,
                                                            sIndex,
                                                            'status',
                                                            value
                                                            )
                                                        }
                                                        >
                                                        <SelectTrigger id={`item-status-${pIndex}-${sIndex}`}>
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Green">Green</SelectItem>
                                                            <SelectItem value="Amber">Amber</SelectItem>
                                                            <SelectItem value="Red">Red</SelectItem>
                                                        </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <Label htmlFor={`item-metric-name-${pIndex}-${sIndex}`}>Metric Name</Label>
                                                        <Input
                                                        id={`item-metric-name-${pIndex}-${sIndex}`}
                                                        value={item.metricName}
                                                        onChange={(e) =>
                                                            handleSubItemChange(pIndex, sIndex, 'metricName', e.target.value)
                                                        }
                                                        />
                                                    </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                                    <div>
                                                        <Label htmlFor={`item-progress-${pIndex}-${sIndex}`}>
                                                            Current Value {isAutoCalculated && '(Auto-calculated)'}
                                                        </Label>
                                                        <Input
                                                        id={`item-progress-${pIndex}-${sIndex}`}
                                                        type="number"
                                                        value={item.percentageComplete}
                                                        onChange={(e) =>
                                                            handleSubItemChange(pIndex, sIndex, 'percentageComplete', parseInt(e.target.value, 10) || 0)
                                                        }
                                                        disabled={isAutoCalculated}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor={`item-target-${pIndex}-${sIndex}`}>
                                                        Annual Target
                                                        </Label>
                                                        <Input
                                                        id={`item-target-${pIndex}-${sIndex}`}
                                                        type="number"
                                                        value={item.annualTarget}
                                                        onChange={(e) =>
                                                            handleSubItemChange(pIndex, sIndex, 'annualTarget', parseInt(e.target.value, 10) || 0)
                                                        }
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor={`item-metric-unit-${pIndex}-${sIndex}`}>Unit</Label>
                                                        <Input
                                                        id={`item-metric-unit-${pIndex}-${sIndex}`}
                                                        value={item.metricUnit}
                                                        onChange={(e) =>
                                                            handleSubItemChange(pIndex, sIndex, 'metricUnit', e.target.value)
                                                        }
                                                        />
                                                    </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                        <div>
                                                        <Label htmlFor={`item-desc-${pIndex}-${sIndex}`}>
                                                            Description
                                                        </Label>
                                                        <Textarea
                                                            id={`item-desc-${pIndex}-${sIndex}`}
                                                            value={item.description}
                                                            onChange={(e) =>
                                                            handleSubItemChange(
                                                                pIndex,
                                                                sIndex,
                                                                'description',
                                                                e.target.value
                                                            )
                                                            }
                                                        />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor={`item-datakey-${pIndex}-${sIndex}`}>Data Key (for auto-calculation)</Label>
                                                            <Input
                                                                id={`item-datakey-${pIndex}-${sIndex}`}
                                                                value={item.dataKey || ''}
                                                                placeholder="e.g., dti-tech-blogs"
                                                                onChange={(e) =>
                                                                    handleSubItemChange(pIndex, sIndex, 'dataKey', e.target.value)
                                                                }
                                                            />
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                Use a permanent key to link this item to an Excel upload. Leave empty if not applicable.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                      )
                                    })}
                                    </Accordion>
                                    <div className="mt-4">
                                        <Button variant="outline" onClick={() => addSubItem(pIndex)}>
                                            <Plus className="mr-2 h-4 w-4" /> Add Sub-Item
                                        </Button>
                                    </div>

                                    {pillar.id === 'building-reliable-products' && (
                                        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <ExcelUploadSection
                                                title="Regression Testing Automation"
                                                description="Upload Excel sheet for Regression Testing Automation."
                                                fileKey="regression-testing-automation"
                                                onDataProcessed={handleExcelDataProcessed}
                                            />
                                             <ExcelUploadSection
                                                title="JUnit Adoption"
                                                description="Upload Excel sheet for JUnit Adoption."
                                                fileKey="junit-adoption"
                                                onDataProcessed={handleExcelDataProcessed}
                                            />
                                             <ExcelUploadSection
                                                title="Maintenance Screens"
                                                description="Upload Excel sheet for Maintenance Screens."
                                                fileKey="maintenance-screens"
                                                onDataProcessed={handleExcelDataProcessed}
                                            />
                                             <ExcelUploadSection
                                                title="API Performance"
                                                description="Upload Excel sheet for API Performance."
                                                fileKey="api-performance"
                                                onDataProcessed={handleExcelDataProcessed}
                                            />
                                        </div>
                                    )}

                                    {pillar.id === 'making-design-resilient' && (
                                        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <ExcelUploadSection
                                                title="SQUAD Onboarding"
                                                description="Upload the Excel sheet for CAT1/CAT2 app onboarding to SQUAD."
                                                fileKey="squad-onboarding"
                                                onDataProcessed={handleExcelDataProcessed}
                                            />
                                            <ExcelUploadSection
                                                title="ARC Trainings"
                                                description="Upload the Excel sheet for ARC Training sessions."
                                                fileKey="arc-trainings"
                                                onDataProcessed={handleExcelDataProcessed}
                                            />
                                            <ExcelUploadSection
                                                title="App Sherpas"
                                                description="Upload the Excel sheet for App Sherpas."
                                                fileKey="app-sherpas"
                                                onDataProcessed={handleExcelDataProcessed}
                                            />
                                            <ExcelUploadSection
                                                title="Jira Assistant Adoption"
                                                description="Upload monthly Excel sheets for Jira Assistant Adoption."
                                                fileKey="jira-assistant-adoption"
                                                onDataProcessed={handleExcelDataProcessed}
                                                isMonthly={true}
                                            />
                                        </div>
                                    )}

                                    {pillar.id === 'adopting-emerging-technologies' && (
                                        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <Card className="bg-secondary/30">
                                                <CardHeader>
                                                    <CardTitle className="text-xl">Manage Hackathons</CardTitle>
                                                    <CardDescription>
                                                        Add, edit, and upload team data for company hackathons.
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <Button asChild>
                                                        <Link href="/hackathons">
                                                            Go to Hackathon Management
                                                            <ArrowRight className="ml-2 h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                             <Card className="bg-secondary/30">
                                                <CardHeader>
                                                    <CardTitle className="text-xl">Manage Industry Events</CardTitle>
                                                    <CardDescription>
                                                        Add and manage industry event details.
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <Button asChild>
                                                        <Link href="/industry-events">
                                                            Go to Event Management
                                                            <ArrowRight className="ml-2 h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                            <ExcelUploadSection
                                                title="Explore Resiliency Program"
                                                description="Upload the Excel sheet for the Resiliency Program."
                                                fileKey="explore-resiliency-program"
                                                onDataProcessed={handleExcelDataProcessed}
                                            />
                                            <ExcelUploadSection
                                                title="DTI Tech Blogs"
                                                description="Upload the Excel sheet for Blogs, URLs, and LOBTs."
                                                fileKey="dti-tech-blogs"
                                                onDataProcessed={handleExcelDataProcessed}
                                            />
                                            <ExcelUploadSection
                                                title="Tech Sphere Sessions"
                                                description="Upload the Excel sheet for Tech Sphere sessions."
                                                fileKey="tech-sphere-sessions"
                                                onDataProcessed={handleExcelDataProcessed}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
