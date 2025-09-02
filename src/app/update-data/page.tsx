
'use client';

import { useState, useEffect } from 'react';
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
import type { Pillar, SubItem, Status, ExcelData } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Plus, Trash2, Upload, Trophy, ArrowRight } from 'lucide-react';
import { processExcelFile } from '@/lib/excel-utils';
import Link from 'next/link';

function ExcelUploadSection({
  title,
  description,
  fileKey,
  onDataProcessed,
}: {
  title: string;
  description: string;
  fileKey: string;
  onDataProcessed: (key: string, data: ExcelData) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const fileAsDataUri = reader.result as string;
        try {
          const result = await processExcelFile(fileAsDataUri);
          onDataProcessed(fileKey, result);
           toast({
             title: `"${file.name}" processed`,
             description: 'Data loaded from Excel. Remember to save all changes.',
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
      <Card className="bg-secondary/30 mt-6">
        <CardHeader>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full max-w-sm items-center gap-2">
            <Label htmlFor={`excel-upload-${fileKey}`}>{`Upload ${title} Data`}</Label>
            <div className="flex gap-2">
              <Input
                id={`excel-upload-${fileKey}`}
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="flex-grow"
              />
              <Button onClick={handleFileUpload} disabled={isLoading || !file}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Process
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Process the file here, then click the main 'Save Changes' button to update the dashboard.</p>
          </div>

        </CardContent>
      </Card>
  );
}

export default function UpdateDataPage() {
  const [data, setData] = useState<Pillar[] | null>(null);
  const [excelData, setExcelData] = useState<Record<string, ExcelData | null>>({
      'explore-resiliency-program': null,
      'dti-tech-blogs': null,
      'tech-sphere-sessions': null
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
      metricUnit: '%'
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
    toast({
        title: `Data processed for ${key}`,
        description: 'Click "Save Changes" to update the dashboard.',
    });
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
            <CardTitle className="text-3xl">Update Dashboard Data</CardTitle>
            <Button onClick={handleSave} disabled={isSaving || isLoading}>
              {isSaving ? 'Saving...' : 'Save Changes'}
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
                                    <h4 className="text-xl font-semibold mb-4">Sub-Items</h4>
                                    <div className="space-y-4">
                                    {pillar.subItems.map((item, sIndex) => {
                                      const isResiliencyProgram = item.id === 'explore-resiliency-program';
                                      const isBlogs = item.id === 'blogs-open-source';
                                      const isHackathons = item.id === 'hackathons';
                                      const isAutoCalculated = isResiliencyProgram || isBlogs || isHackathons;

                                      return (
                                        <div key={item.id} className="border rounded-md p-4 bg-secondary/50 relative">
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
                                            <div className="mt-4">
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
                                            <div className="absolute top-4 right-4">
                                                <Button variant="destructive" size="icon" onClick={() => removeSubItem(pIndex, sIndex)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                      )
                                    })}
                                    </div>
                                    <div className="mt-4">
                                        <Button variant="outline" onClick={() => addSubItem(pIndex)}>
                                            <Plus className="mr-2 h-4 w-4" /> Add Sub-Item
                                        </Button>
                                    </div>

                                    {pillar.id === 'adopting-emerging-technologies' && (
                                        <>
                                            <Card className="bg-secondary/30 mt-6">
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
                                        </>
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
