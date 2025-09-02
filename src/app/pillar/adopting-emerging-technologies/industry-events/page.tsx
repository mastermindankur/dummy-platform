
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Loader2, Calendar, MapPin, Briefcase, Building } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { IndustryEvent, Pillar, SubItem } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const fetchEventsData = async (): Promise<IndustryEvent[]> => {
  const res = await fetch('/api/data?key=industry-events');
  if (!res.ok) {
    throw new Error('Failed to fetch industry events data');
  }
  return res.json();
};

const fetchPillarsData = async (): Promise<Pillar[] | null> => {
    const res = await fetch('/api/data');
    if (!res.ok) {
      throw new Error('Failed to fetch pillars data');
    }
    return res.json();
};

export default function IndustryEventsDetailsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<IndustryEvent[]>([]);
  const [eventSubItem, setEventSubItem] = useState<SubItem | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [eventsData, pillarsData] = await Promise.all([
          fetchEventsData(),
          fetchPillarsData()
        ]);
        
        setEvents(eventsData);

        if (pillarsData) {
            const emergingTechPillar = pillarsData.find(p => p.id === 'adopting-emerging-technologies');
            const subItem = emergingTechPillar?.subItems.find(s => s.id === 'industry-events') || null;
            setEventSubItem(subItem);
        }

      } catch (error) {
        console.error('Failed to load page data', error);
        toast({
          title: 'Error',
          description: 'Could not load the industry events data.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const { totalEvents, internalEvents, externalEvents, annualTarget, progressPercentage } = useMemo(() => {
    const total = events.length;
    const internal = events.filter(e => e.type === 'internal').length;
    const external = events.filter(e => e.type === 'external').length;
    const target = eventSubItem?.annualTarget || 0;
    const percentage = target > 0 ? (total / target) * 100 : 0;

    return {
        totalEvents: total,
        internalEvents: internal,
        externalEvents: external,
        annualTarget: target,
        progressPercentage: percentage,
    };
  }, [events, eventSubItem]);

  const formatDateRange = (startDate: string, endDate?: string) => {
    const start = new Date(startDate).toLocaleDateString(undefined, { timeZone: 'UTC' });
    if (endDate && startDate !== endDate) {
      const end = new Date(endDate).toLocaleDateString(undefined, { timeZone: 'UTC' });
      return `${start} - ${end}`;
    }
    return start;
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="mb-4">
          <Button asChild variant="outline">
            <Link href="/pillar/adopting-emerging-technologies">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Pillar
            </Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Industry Events</CardTitle>
            <CardDescription>
              Overview of all internal and external industry events. To add or update data, go to the Manage Industry Events page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {!isLoading && events.length === 0 && (
              <div className="text-center text-muted-foreground p-8">
                No industry event data is available yet.
              </div>
            )}
            
            {!isLoading && events.length > 0 && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Overall Progress</CardTitle>
                            <CardDescription>Total events against the annual target.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center h-full">
                               <div className="text-center">
                                    <p className="text-5xl font-bold">{totalEvents}</p>
                                    <p className="text-lg text-muted-foreground">out of {annualTarget} events</p>
                                    <Progress value={progressPercentage} className="mt-4 h-3" />
                               </div>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Internal Events</CardTitle>
                            <Building className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{internalEvents}</div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">External Events</CardTitle>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{externalEvents}</div>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold">Event Details</h3>
                    {events.map((event) => (
                        <Card key={event.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <CardTitle>{event.name}</CardTitle>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground pt-2">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                <span>{formatDateRange(event.startDate, event.endDate)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                <span>{event.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant={event.type === 'internal' ? 'secondary' : 'outline'} className="shrink-0">
                                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                               <p className="text-muted-foreground">{event.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
