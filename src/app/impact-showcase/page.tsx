
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, Zap, ShieldCheck, Users, BrainCircuit, DollarSign, Smile } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { ImpactInitiative, ImpactCategory, ValueMapData } from '@/types';
import { cn } from '@/lib/utils';

async function fetchImpactData(): Promise<ImpactInitiative[]> {
    try {
        const res = await fetch(`/api/data?key=impact-initiatives`);
        if (!res.ok) {
            toast({ title: 'Failed to fetch impact data', variant: 'destructive' });
            return [];
        }
        return res.json();
    } catch (error) {
        console.error(`Failed to fetch impact initiatives`, error);
        toast({ title: 'Error loading impact data', variant: 'destructive' });
        return [];
    }
}

async function fetchValueMapData(): Promise<ValueMapData | null> {
    try {
        const res = await fetch(`/api/data?key=value-map&version=latest`);
        if (!res.ok) {
            toast({ title: 'Failed to fetch value map data', variant: 'destructive' });
            return null;
        }
        return res.json();
    } catch (error) {
        console.error(`Failed to fetch value map data`, error);
        toast({ title: 'Error loading value map data', variant: 'destructive' });
        return null;
    }
}

const categoryDetails: Record<ImpactCategory, { title: string, icon: React.ElementType }> = {
    productivity: { title: 'Productivity & Efficiency Gains', icon: Zap },
    quality: { title: 'Quality & Reliability Improvement', icon: ShieldCheck },
    engagement: { title: 'Developer Engagement & Skill Uplift', icon: Users },
    financial: { title: 'Financial & Business Impact', icon: DollarSign },
    customer: { title: 'Customer & Experience Impact', icon: Smile },
};

export default function ImpactShowcasePage() {
  const [initiatives, setInitiatives] = useState<ImpactInitiative[]>([]);
  const [valueMapData, setValueMapData] = useState<ValueMapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('highlight');

  useEffect(() => {
    async function loadMetrics() {
      setIsLoading(true);
      const [initiativesData, mapData] = await Promise.all([
          fetchImpactData(),
          fetchValueMapData()
      ]);
      setInitiatives(initiativesData);
      setValueMapData(mapData);
      setIsLoading(false);
    }
    loadMetrics();
  }, []);

  const groupedInitiatives = initiatives.reduce((acc, initiative) => {
    (acc[initiative.category] = acc[initiative.category] || []).push(initiative);
    return acc;
  }, {} as Record<ImpactCategory, ImpactInitiative[]>);

  const valueMapOutcomes = valueMapData?.outcomes.filter(o => o.metric && o.impactCategory) || [];
  const groupedOutcomes = valueMapOutcomes.reduce((acc, outcome) => {
    const category = outcome.impactCategory!;
    (acc[category] = acc[category] || []).push(outcome);
    return acc;
  }, {} as Record<ImpactCategory, typeof valueMapOutcomes>);

  const orderedCategories: ImpactCategory[] = ['financial', 'customer', 'productivity', 'quality', 'engagement'];

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="mb-6">
            <h1 className="text-3xl font-bold">Impact Showcase</h1>
            <p className="text-muted-foreground">Quantifying the value and success of our engineering initiatives.</p>
        </div>

        {isLoading ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        ) : (initiatives.length > 0 || valueMapOutcomes.length > 0) ? (
            <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Value Map Outcome Impact</CardTitle>
                    <CardDescription>These metrics are generated directly from the strategic outcomes defined in the Executive Value Map.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-10">
                    {orderedCategories.map(category => {
                        const details = categoryDetails[category];
                        const categoryOutcomes = groupedOutcomes[category];

                        if (!categoryOutcomes || categoryOutcomes.length === 0) return null;

                        return (
                            <div key={`outcome-${category}`}>
                                <div className="flex items-center gap-3 mb-4">
                                    <details.icon className="h-7 w-7 text-primary"/>
                                    <h3 className="text-xl font-semibold">{details.title}</h3>
                                </div>
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {categoryOutcomes.map(outcome => (
                                        <Card key={outcome.id} className={cn(
                                            'transition-all', 
                                            highlightId === outcome.id && 'ring-2 ring-primary shadow-lg'
                                        )}>
                                            <CardHeader>
                                                <CardTitle className="text-lg">{outcome.name}</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-4xl font-bold">{outcome.metric}</div>
                                                <p className="text-sm text-muted-foreground">{outcome.metricUnit}</p>
                                                <p className="text-sm text-muted-foreground mt-2">{outcome.metricDescription || outcome.description}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                     {valueMapOutcomes.length === 0 && (
                        <div className="text-center text-muted-foreground p-8 border-dashed border-2 rounded-md">
                            <p>No impact metrics have been defined for Value Map outcomes yet. Go to the "Update Data" page to add them.</p>
                        </div>
                    )}
                  </CardContent>
                </Card>
                <Card>
                   <CardHeader>
                    <CardTitle className="text-2xl">Standalone Impact Initiatives</CardTitle>
                    <CardDescription>These are key metrics being tracked that are not directly tied to a Value Map outcome.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-10">
                    {orderedCategories.map(category => {
                        const details = categoryDetails[category];
                        const categoryInitiatives = groupedInitiatives[category];

                        if (!categoryInitiatives || categoryInitiatives.length === 0) {
                            return null;
                        }

                        return (
                            <div key={`initiative-${category}`}>
                                <div className="flex items-center gap-3 mb-4">
                                    <details.icon className="h-7 w-7 text-primary"/>
                                    <h3 className="text-xl font-semibold">{details.title}</h3>
                                </div>
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {categoryInitiatives.map(initiative => (
                                        <Card key={initiative.id}>
                                            <CardHeader>
                                                <CardTitle className="text-lg">{initiative.name}</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-4xl font-bold">{initiative.metric}</div>
                                                <p className="text-sm text-muted-foreground">{initiative.metricUnit}</p>
                                                <p className="text-sm text-muted-foreground mt-2">{initiative.description}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                     {initiatives.length === 0 && (
                        <div className="text-center text-muted-foreground p-8 border-dashed border-2 rounded-md">
                            <p>No standalone impact initiatives have been added yet.</p>
                        </div>
                    )}
                   </CardContent>
                </Card>
            </div>
        ) : (
             <div className="text-center text-muted-foreground p-8 border-dashed border-2 rounded-md mt-8">
                <p>No impact metrics have been added yet. Go to the "Update Data" page to add them.</p>
            </div>
        )}
      </main>
    </div>
  );
}
