
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
import { Loader2, Zap, ShieldCheck, Users, BrainCircuit } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { ImpactInitiative, ImpactCategory } from '@/types';

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

const categoryDetails: Record<ImpactCategory, { title: string, icon: React.ElementType }> = {
    productivity: { title: 'Productivity & Efficiency Gains', icon: Zap },
    quality: { title: 'Quality & Reliability Improvement', icon: ShieldCheck },
    engagement: { title: 'Developer Engagement & Skill Uplift', icon: Users },
};

export default function ImpactShowcasePage() {
  const [initiatives, setInitiatives] = useState<ImpactInitiative[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      setIsLoading(true);
      const data = await fetchImpactData();
      setInitiatives(data);
      setIsLoading(false);
    }
    loadMetrics();
  }, []);

  const groupedInitiatives = initiatives.reduce((acc, initiative) => {
    (acc[initiative.category] = acc[initiative.category] || []).push(initiative);
    return acc;
  }, {} as Record<ImpactCategory, ImpactInitiative[]>);

  const orderedCategories: ImpactCategory[] = ['productivity', 'quality', 'engagement'];

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
        ) : initiatives.length > 0 ? (
            <div className="space-y-10">
                {orderedCategories.map(category => {
                    const details = categoryDetails[category];
                    const categoryInitiatives = groupedInitiatives[category];

                    if (!categoryInitiatives || categoryInitiatives.length === 0) {
                        return null;
                    }

                    return (
                        <div key={category}>
                            <div className="flex items-center gap-3 mb-4">
                                <details.icon className="h-7 w-7 text-primary"/>
                                <h2 className="text-2xl font-semibold">{details.title}</h2>
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
            </div>
        ) : (
             <div className="text-center text-muted-foreground p-8 border-dashed border-2 rounded-md mt-8">
                <p>No impact initiatives have been added yet. Go to the "Update Data" page to add them.</p>
            </div>
        )}
      </main>
    </div>
  );
}
