
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
import type { ExcelData, MonthlyExcelData, Hackathon } from '@/types';

type ImpactMetrics = {
  jiraAdoption: number;
  squadOnboarded: number;
  developerEngagement: number;
  hackathonParticipants: number;
};

async function fetchData(key: string): Promise<any> {
    try {
        const res = await fetch(`/api/data?key=${key}`);
        if (!res.ok || res.status === 404) {
            return null;
        }
        return res.json();
    } catch (error) {
        console.error(`Failed to fetch ${key}`, error);
        return null;
    }
}

export default function ImpactShowcasePage() {
  const [metrics, setMetrics] = useState<ImpactMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      setIsLoading(true);
      try {
        const [
          jiraData,
          squadData,
          arcTrainingsData,
          techSphereData,
          hackathonsData,
        ] = await Promise.all([
          fetchData('jira-assistant-adoption') as Promise<MonthlyExcelData | null>,
          fetchData('squad-onboarding') as Promise<ExcelData | null>,
          fetchData('arc-trainings') as Promise<ExcelData | null>,
          fetchData('tech-sphere-sessions') as Promise<ExcelData | null>,
          fetchData('hackathons') as Promise<Hackathon[] | null>,
        ]);

        let jiraAdoption = 0;
        if (jiraData && Object.keys(jiraData).length > 0) {
            const latestMonth = Object.keys(jiraData).sort().pop();
            if (latestMonth && jiraData[latestMonth]) {
                const latestMonthRows = jiraData[latestMonth].rows;
                const testCases = latestMonthRows.filter(row => row['Test'] === 1);
                const totalTestCases = testCases.length;
                const jaTestCases = testCases.filter(row => row['is_created_via_JA'] === 1).length;
                if (totalTestCases > 0) {
                    jiraAdoption = Math.round((jaTestCases / totalTestCases) * 100);
                }
            }
        }
        
        const squadOnboarded = squadData?.rows.length || 0;

        const arcParticipants = arcTrainingsData?.rows.reduce((sum, row) => sum + (Number(row['Participation']) || 0), 0) || 0;
        const techSphereParticipants = techSphereData?.rows.reduce((sum, row) => sum + (Number(row['Participation']) || 0), 0) || 0;
        const developerEngagement = arcParticipants + techSphereParticipants;

        const hackathonParticipants = hackathonsData?.reduce((sum: number, h: any) => sum + (h.participants || 0), 0) || 0;

        setMetrics({
          jiraAdoption,
          squadOnboarded,
          developerEngagement,
          hackathonParticipants,
        });

      } catch (error) {
        console.error("Failed to calculate metrics", error);
        toast({ title: 'Error loading impact data', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    }
    loadMetrics();
  }, []);

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
        ) : metrics ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Jira Assistant Adoption</CardTitle>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{metrics.jiraAdoption}%</div>
                        <p className="text-xs text-muted-foreground">of test cases created via JA (latest month)</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Critical App Onboarding</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{metrics.squadOnboarded}</div>
                        <p className="text-xs text-muted-foreground">CAT1/CAT2 applications onboarded to SQUAD</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Developer Engagement</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{metrics.developerEngagement.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">participants in ARC & Tech Sphere sessions</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Innovation Community</CardTitle>
                        <BrainCircuit className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{metrics.hackathonParticipants.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">participants across all hackathons</p>
                    </CardContent>
                </Card>
            </div>
        ) : (
             <div className="text-center text-muted-foreground p-8 border-dashed border-2 rounded-md mt-8">
                <p>No impact data available yet. Upload data in the "Update Data" page to see metrics here.</p>
            </div>
        )}
      </main>
    </div>
  );
}
