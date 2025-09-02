
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import type { Pillar, SubItem, Status } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';

export default function UpdateDataPage() {
  const [data, setData] = useState<Pillar[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/data');
        if (!res.ok) throw new Error('Failed to fetch data');
        const jsonData = await res.json();
        setData(jsonData);
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


  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to save data');
      toast({
        title: 'Success',
        description: 'Dashboard data has been updated.',
      });
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
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : (
              <div className="space-y-6">
                {data?.map((pillar, pIndex) => (
                  <Collapsible key={pillar.id} defaultOpen={pIndex === 0} className="border rounded-lg p-4">
                    <CollapsibleTrigger className="flex justify-between items-center w-full text-xl font-semibold">
                      {pillar.name}
                      <ChevronDown className="h-6 w-6 transition-transform [&[data-state=open]]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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

                      <h4 className="text-lg font-semibold mb-2">Sub-Items</h4>
                      <div className="space-y-4">
                        {pillar.subItems.map((item, sIndex) => (
                          <div key={item.id} className="border rounded-md p-4 bg-secondary/50">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                <Label htmlFor={`item-progress-${pIndex}-${sIndex}`}>
                                  YTD Progress (%)
                                </Label>
                                <Input
                                  id={`item-progress-${pIndex}-${sIndex}`}
                                  type="number"
                                  value={item.percentageComplete}
                                  onChange={(e) =>
                                    handleSubItemChange(pIndex, sIndex, 'percentageComplete', parseInt(e.target.value, 10))
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
                             <div className="flex justify-end mt-2">
                                <Button variant="destructive" size="icon" onClick={() => removeSubItem(pIndex, sIndex)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                       <div className="mt-4">
                            <Button variant="outline" onClick={() => addSubItem(pIndex)}>
                                <Plus className="mr-2 h-4 w-4" /> Add Sub-Item
                            </Button>
                        </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
