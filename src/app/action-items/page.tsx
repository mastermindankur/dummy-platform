
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2, Filter, GripVertical, CalendarDays, Briefcase } from "lucide-react";
import type { ActionItem, User, Pillar, MeetingEvent } from '@/types';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const KANBAN_COLUMNS: ActionItem['status'][] = ['Backlog', 'In progress', 'Delayed', 'Completed', 'Deferred'];

function ActionItemCard({ item, users, events }: { item: ActionItem, users: User[], events: MeetingEvent[] }) {
    const isOverdue = new Date(item.dueDate) < new Date() && item.status !== 'Completed';
    const getUserName = (email: string) => users.find(u => u.email === email)?.name || email;
    const getEventDetails = (eventId?: string) => {
        if (!eventId) return null;
        return events.find(e => e.id === eventId) || null;
    }
    const eventDetails = getEventDetails(item.eventId);
    
    return (
        <Card className="mb-4">
            <CardContent className="p-3">
                <p className="text-sm font-medium mb-2">{item.task}</p>
                <div className="text-xs text-muted-foreground space-y-2">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <div className="flex items-center gap-2">
                            <CalendarDays className="h-3.5 w-3.5"/>
                            <span className={cn(isOverdue && 'text-destructive font-semibold')}>
                                Due: {format(new Date(item.dueDate), "PPP")}
                            </span>
                            {item.originalDueDate && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <s className="cursor-help">{format(new Date(item.originalDueDate), "PP")}</s>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Original due date</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                    </div>
                     <div>
                        {item.assignedTo.map(email => (
                            <Badge key={email} variant="secondary" className="mr-1 mb-1 font-normal">
                                {getUserName(email)}
                            </Badge>
                        ))}
                    </div>
                     {eventDetails && (
                        <div className="flex items-center gap-2">
                            <Briefcase className="h-3.5 w-3.5" />
                            <span>{eventDetails.name} ({format(new Date(eventDetails.date), 'PP')})</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export default function ActionItemsPage() {
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [events, setEvents] = useState<MeetingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPillar, setSelectedPillar] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<string>('all');

  useEffect(() => {
    async function fetchData() {
        setIsLoading(true);
        try {
            const [itemsRes, usersRes, pillarsRes, eventsRes] = await Promise.all([
                fetch('/api/data?key=action-items'),
                fetch('/api/data?key=users'),
                fetch('/api/data'),
                fetch('/api/data?key=events'),
            ]);
            if (itemsRes.ok) setActionItems(await itemsRes.json());
            if (usersRes.ok) setUsers(await usersRes.json());
            if (pillarsRes.ok) setPillars(await pillarsRes.json());
            if (eventsRes.ok) setEvents(await eventsRes.json());
        } catch (error) {
            console.error(error);
            toast({ title: 'Error loading data', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    }
    fetchData();
  }, []);

  const filteredItems = useMemo(() => {
    let items = actionItems;
    if (selectedPillar !== 'all') {
      items = items.filter(item => item.pillarId === selectedPillar);
    }
    if (selectedEvent !== 'all') {
      if (selectedEvent === 'none') {
        items = items.filter(item => !item.eventId);
      } else {
        items = items.filter(item => item.eventId === selectedEvent);
      }
    }
    return items;
  }, [actionItems, selectedPillar, selectedEvent]);

  const itemsByStatus = useMemo(() => {
      const grouped: Record<ActionItem['status'], ActionItem[]> = {
          'Backlog': [],
          'In progress': [],
          'Completed': [],
          'Deferred': [],
          'Delayed': []
      };
      filteredItems.forEach(item => {
          if (grouped[item.status]) {
              grouped[item.status].push(item);
          }
      });
      return grouped;
  }, [filteredItems]);


  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 flex flex-col p-4 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Action Items & Status</h1>
            <p className="text-muted-foreground">A Kanban board for tracking key action items.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mb-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <Select value={selectedPillar} onValueChange={setSelectedPillar}>
                <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Filter by pillar..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Pillars</SelectItem>
                    {pillars.map(pillar => (
                        <SelectItem key={pillar.id} value={pillar.id}>{pillar.name}</SelectItem>
                    ))}
                     <SelectItem value="other">Other</SelectItem>
                </SelectContent>
            </Select>
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Filter by event..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="none">No Event</SelectItem>
                    {events.map(event => (
                        <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        
        {isLoading ? (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        ) : actionItems.length > 0 ? (
             <div className="flex-1 overflow-x-auto">
                <div className="grid grid-cols-5 gap-6 min-w-[1200px]">
                    {KANBAN_COLUMNS.map(status => (
                        <div key={status} className="bg-muted/50 rounded-lg p-4">
                            <h2 className="font-semibold text-lg mb-4">{status} ({itemsByStatus[status].length})</h2>
                            <div className="space-y-4 h-full">
                                {itemsByStatus[status].map(item => (
                                    <ActionItemCard key={item.id} item={item} users={users} events={events} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ) : (
            <div className="text-center text-muted-foreground p-8 border-dashed border-2 rounded-md mt-8">
                <p>No action items created yet. Go to the "Update Data" page to add one.</p>
            </div>
        )}
      </main>
    </div>
  );
}
