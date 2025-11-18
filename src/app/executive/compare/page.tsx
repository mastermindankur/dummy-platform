
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, GitCommit, Plus, Minus, Pencil } from 'lucide-react';
import { ValueMapData, ValueMapItem, ValueMapOutcome } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

type Diff<T> = {
  added: T[];
  removed: T[];
  modified: { before: T; after: T; changes: string[] }[];
};

function diffItems<T extends ValueMapItem>(base: T[], compare: T[]): Diff<T> {
  const baseMap = new Map(base.map(item => [item.id, item]));
  const compareMap = new Map(compare.map(item => [item.id, item]));

  const added: T[] = [];
  const removed: T[] = [];
  const modified: { before: T; after: T; changes: string[] }[] = [];

  for (const [id, item] of compareMap.entries()) {
    if (!baseMap.has(id)) {
      added.push(item);
    }
  }

  for (const [id, item] of baseMap.entries()) {
    if (!compareMap.has(id)) {
      removed.push(item);
    } else {
      const compareItem = compareMap.get(id)!;
      const changes: string[] = [];

      const isOutcome = 'connectedDriverIds' in item;

      // Define keys to compare, including impact metrics for outcomes
      const keysToCompare: (keyof T)[] = ['name', 'description', 'groupId', 'isWceBookOfWork', 'isNew', 'isRetired'];
      if (isOutcome) {
          keysToCompare.push(
              'metric' as keyof T,
              'metricUnit' as keyof T,
              'metricDescription' as keyof T,
              'impactCategory' as keyof T
          );
      }
      
      for (const key of keysToCompare) {
        if ((item as any)[key] !== (compareItem as any)[key]) {
          changes.push(key as string);
        }
      }
      
      // Special handling for array connections
      const baseConnections = (item as any).connectedDriverIds || (item as any).connectedLeverIds;
      const compareConnections = (compareItem as any).connectedDriverIds || (compareItem as any).connectedLeverIds;
      if (JSON.stringify(baseConnections?.sort()) !== JSON.stringify(compareConnections?.sort())) {
        changes.push('connections');
      }

      if (changes.length > 0) {
        modified.push({ before: item, after: compareItem, changes });
      }
    }
  }
  return { added, removed, modified };
}


function DiffTable<T extends ValueMapItem>({ title, diff, baseData, compareData }: { 
    title: string; 
    diff: Diff<T>,
    baseData: ValueMapData,
    compareData: ValueMapData
}) {
    
    const getConnections = (item: T) => {
        if ('connectedDriverIds' in item) {
           return (item.connectedDriverIds || []).map(id => compareData.drivers.find(d => d.id === id)?.name || baseData.drivers.find(d => d.id === id)?.name || 'Unknown Driver');
        }
        if ('connectedLeverIds' in item) {
           return (item.connectedLeverIds || []).map(id => compareData.levers.find(l => l.id === id)?.name || baseData.levers.find(l => l.id === id)?.name || 'Unknown Lever');
        }
        return [];
    }

    const getGroupName = (item: T, data: ValueMapData) => {
        if (!item.groupId) return 'N/A';
        const groups = 'connectedDriverIds' in item ? data.outcomeGroups : data.driverGroups;
        return (groups || []).find(g => g.id === item.groupId)?.name || 'Unknown Group';
    }


  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Change Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {diff.added.map(item => (
              <TableRow key={item.id} className="bg-green-950/30">
                <TableCell><Badge variant="secondary" className="bg-green-500/20 text-green-300"><Plus className="mr-1 h-3 w-3"/>Added</Badge></TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>
                    <ul className="text-xs list-disc list-inside">
                        <li><strong>Description:</strong> {item.description || 'N/A'}</li>
                        <li><strong>Group:</strong> {getGroupName(item, compareData)}</li>
                        <li><strong>Connections:</strong> {getConnections(item).join(', ') || 'None'}</li>
                    </ul>
                </TableCell>
              </TableRow>
            ))}
            {diff.removed.map(item => (
              <TableRow key={item.id} className="bg-red-950/30">
                <TableCell><Badge variant="destructive"><Minus className="mr-1 h-3 w-3"/>Removed</Badge></TableCell>
                <TableCell className="line-through">{item.name}</TableCell>
                 <TableCell>
                    <ul className="text-xs list-disc list-inside">
                        <li><strong>Description:</strong> {item.description || 'N/A'}</li>
                        <li><strong>Group:</strong> {getGroupName(item, baseData)}</li>
                        <li><strong>Connections:</strong> {getConnections(item).join(', ') || 'None'}</li>
                    </ul>
                </TableCell>
              </TableRow>
            ))}
            {diff.modified.map(({ before, after, changes }) => (
              <TableRow key={before.id} className="bg-yellow-950/30">
                <TableCell><Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300"><Pencil className="mr-1 h-3 w-3"/>Modified</Badge></TableCell>
                <TableCell>{after.name}</TableCell>
                <TableCell>
                  <ul className="text-xs list-disc list-inside space-y-1">
                    {changes.map(change => {
                        const beforeValue = (before as any)[change] || 'none';
                        const afterValue = (after as any)[change] || 'none';

                        if (change === 'connections') {
                             return <li key={change}><strong>Connections:</strong> 
                                <span className="line-through">{getConnections(before).join(', ')}</span> {'->'} {getConnections(after).join(', ')}
                             </li>
                        }
                         if (change === 'groupId') {
                             return <li key={change}><strong>Group:</strong> 
                                <span className="line-through">{getGroupName(before, baseData)}</span> {'->'} {getGroupName(after, compareData)}
                             </li>
                        }
                        return <li key={change}><strong>{change}:</strong> <span className="line-through">{beforeValue}</span> {'->'} {afterValue}</li>
                    })}
                  </ul>
                </TableCell>
              </TableRow>
            ))}
             {(diff.added.length + diff.removed.length + diff.modified.length) === 0 && (
                <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">No changes in this category.</TableCell>
                </TableRow>
             )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ComparePageClient() {
  const searchParams = useSearchParams();
  const baseVersion = searchParams.get('base');
  const compareVersion = searchParams.get('compare');

  const [baseData, setBaseData] = useState<ValueMapData | null>(null);
  const [compareData, setCompareData] = useState<ValueMapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!baseVersion || !compareVersion) return;
    async function fetchData() {
      setIsLoading(true);
      try {
        const [baseRes, compareRes] = await Promise.all([
          fetch(`/api/data?key=value-map&version=${baseVersion}`),
          fetch(`/api/data?key=value-map&version=${compareVersion}`)
        ]);
        if (baseRes.ok) setBaseData(await baseRes.json());
        if (compareRes.ok) setCompareData(await compareRes.json());
      } catch (error) {
        console.error("Failed to fetch value map data for comparison", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [baseVersion, compareVersion]);

  if (isLoading) {
    return <div className="p-8"><Skeleton className="h-96 w-full" /></div>;
  }
  
  if (!baseData || !compareData || !baseVersion || !compareVersion) {
    return <div className="p-8 text-center">Could not load data for comparison. Please select two valid versions.</div>;
  }
  
  const outcomesDiff = diffItems(baseData.outcomes, compareData.outcomes);
  const driversDiff = diffItems(baseData.drivers, compareData.drivers);
  const leversDiff = diffItems(baseData.levers, compareData.levers);

  const formatVersionLabel = (version: string) => {
    try {
        return format(new Date(version.replace('.json', '')), "MMM d, yyyy h:mm a");
    } catch(e) {
        return version;
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <Button asChild variant="outline">
          <Link href="/executive">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Value Map
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Value Map Comparison</CardTitle>
          <CardDescription>
            Showing differences between version from <Badge variant="outline">{formatVersionLabel(baseVersion)}</Badge> and <Badge variant="outline">{formatVersionLabel(compareVersion)}</Badge>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <DiffTable title="Outcomes" diff={outcomesDiff} baseData={baseData} compareData={compareData}/>
          <DiffTable title="Drivers" diff={driversDiff} baseData={baseData} compareData={compareData}/>
          <DiffTable title="Levers" diff={leversDiff} baseData={baseData} compareData={compareData}/>
        </CardContent>
      </Card>
    </div>
  );
}


export default function ComparePage() {
    return (
        <div className="flex min-h-screen w-full flex-col">
            <Header />
            <main className="flex-1 p-4 md:p-8">
                <Suspense fallback={<Skeleton className="h-screen w-full" />}>
                    <ComparePageClient />
                </Suspense>
            </main>
        </div>
    )
}
