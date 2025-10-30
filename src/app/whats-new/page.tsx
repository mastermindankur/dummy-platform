
'use client';

import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserPlus, Loader2 } from "lucide-react";
import { useState, useEffect } from 'react';
import type { WhatsNewEntry } from "@/types";
import { toast } from "@/hooks/use-toast";

async function fetchWhatsNewData(): Promise<WhatsNewEntry[]> {
    try {
        const res = await fetch(`/api/data?key=whats-new`);
        if (!res.ok) {
            toast({ title: 'Failed to fetch What\'s New data', variant: 'destructive' });
            return [];
        }
        return res.json();
    } catch (error) {
        console.error(`Failed to fetch What's New data`, error);
        toast({ title: 'Error loading What\'s New data', variant: 'destructive' });
        return [];
    }
}

export default function WhatsNewPage() {
  const [entries, setEntries] = useState<WhatsNewEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const data = await fetchWhatsNewData();
      // Sort by date descending
      data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setEntries(data);
      setIsLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto w-full max-w-4xl space-y-8">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold">What's New in the Dashboard</CardTitle>
              <CardDescription className="text-md text-muted-foreground pt-1">
                A log of the latest updates and improvements.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : entries.length > 0 ? (
                    entries.map(entry => (
                        <div key={entry.id}>
                            <h2 className="text-base font-semibold text-muted-foreground border-b pb-2 mb-4">
                                {new Date(entry.date).toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' })}
                            </h2>
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-foreground">{entry.title}</h3>
                                <ol className="list-decimal list-inside space-y-2 pl-4 text-muted-foreground">
                                    {entry.items.map((item, index) => (
                                        <li key={index}><span className="text-foreground">{item}</span></li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-muted-foreground p-8 border-dashed border-2 rounded-md mt-8">
                        <p>No updates have been posted yet. Check back soon!</p>
                    </div>
                )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground">What's Coming Soon</CardTitle>
              <CardDescription>A look at the features and improvements on our roadmap.</CardDescription>
            </CardHeader>
            <CardContent>
                <ol className="list-decimal list-inside space-y-2 pl-4 text-muted-foreground">
                  <li><span className="text-foreground">Productivity Dashboard Completion:</span> The "Improving Productivity" dashboard will be finalized and rolled out.</li>
                  <li><span className="text-foreground">WCCG Dashboard Enhancements:</span> The "World Class Corporate Governance" dashboard will be enhanced to include awards and other relevant metrics.</li>
                  <li><span className="text-foreground">Integrated View:</span> Create a direct inter-relationship between the "Value Map" and the "WCE YTD Progress" dashboards for seamless navigation.</li>
                  <li><span className="text-foreground">Expanded Impact Metrics:</span> The "Impact Showcase" will support a wider variety of units of measurement for more flexible quantification of success.</li>
                  <li><span className="text-foreground">Linked-Up Impact:</span> Initiatives on the "Impact Showcase" will be linkable back to the "Value Map" and "WCE YTD Progress" to show direct connections.</li>
                  <li><span className="text-foreground">Personalized Action View:</span> A "person-wide" view will be added to the "Action Items & Status" page, allowing individuals to see all tasks assigned to them.</li>
                  <li><span className="text-foreground">LOBT-Specific Dashboards:</span> A new "LOBT-wide" view will allow different Lines of Business Technology to see a dashboard tailored to their specific data.</li>
                  <li><span className="text-foreground">Time-Based Progress Tracking:</span> Implement a time-series comparison feature to visualize how progress is made over different time scales.</li>
                </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
                <UserPlus className="h-8 w-8 text-accent" />
                <div>
                    <CardTitle className="text-2xl font-bold text-foreground">Join Our Team!</CardTitle>
                    <CardDescription>Help us shape the future of this dashboard.</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground">We are looking for passionate individuals to help build this dashboard further. The application is built with a modern tech stack, including Next.js (App Router), React (Server Components), TypeScript, ShadCN for UI components, and Tailwind CSS for styling. If you have skills in these areas and are interested in contributing, please reach out to the project lead.</p>
                <p className="text-muted-foreground">We are also looking for a <span className="text-foreground">Product person</span> to help enhance the user experience and understand the needs of our different users. If you have a knack for product management and a passion for creating great user-centric tools, we'd love to have you on board.</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
