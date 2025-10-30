

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
import type { WhatsNewEntry, WhatsNewSectionContent } from "@/types";
import { toast } from "@/hooks/use-toast";

async function fetchWhatsNewData(): Promise<{ entries: WhatsNewEntry[], sections: WhatsNewSectionContent }> {
    try {
        const [entriesRes, sectionsRes] = await Promise.all([
            fetch(`/api/data?key=whats-new`),
            fetch(`/api/data?key=whats-new-sections`),
        ]);

        const entries = entriesRes.ok ? await entriesRes.json() : [];
        const sections = sectionsRes.ok ? await sectionsRes.json() : { comingSoonItems: [], joinTeamParagraphs: [] };

        return { entries, sections };
    } catch (error) {
        console.error(`Failed to fetch What's New data`, error);
        toast({ title: "Error loading What's New data", variant: 'destructive' });
        return { entries: [], sections: { comingSoonItems: [], joinTeamParagraphs: [] } };
    }
}

export default function WhatsNewPage() {
  const [entries, setEntries] = useState<WhatsNewEntry[]>([]);
  const [sections, setSections] = useState<WhatsNewSectionContent>({ comingSoonItems: [], joinTeamParagraphs: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const { entries: fetchedEntries, sections: fetchedSections } = await fetchWhatsNewData();
      // Sort by date descending
      fetchedEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setEntries(fetchedEntries);
      setSections(fetchedSections);
      setIsLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="w-full space-y-8">
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
                {isLoading ? (
                     <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                        <div className="h-4 bg-muted rounded w-2/3"></div>
                    </div>
                ) : sections.comingSoonItems.length > 0 ? (
                    <ol className="list-decimal list-inside space-y-2 pl-4 text-muted-foreground">
                        {sections.comingSoonItems.map((item, index) => (
                           <li key={index}><span className="text-foreground">{item}</span></li>
                        ))}
                    </ol>
                ) : (
                    <p className="text-sm text-muted-foreground">No upcoming features have been announced yet.</p>
                )}
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
                 {isLoading ? (
                    <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-full"></div>
                        <div className="h-4 bg-muted rounded w-full"></div>
                        <div className="h-4 bg-muted rounded w-5/6"></div>
                    </div>
                 ) : sections.joinTeamParagraphs.length > 0 ? (
                    sections.joinTeamParagraphs.map((paragraph, index) => (
                        <p key={index} className="text-muted-foreground">{paragraph}</p>
                    ))
                 ) : (
                    <p className="text-sm text-muted-foreground">Information about joining the team is not available at the moment.</p>
                 )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
