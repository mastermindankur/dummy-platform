

'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import type { Pillar, SubItem, Status, ExcelData, ValueMapData, ValueMapItem, ValueMapLever, ValueMapDriver, ValueMapOutcome, ValueMapGroup, User, ActionItem, MeetingEvent } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Plus, Trash2, Upload, ArrowRight, ChevronsUpDown, Filter, X, Edit, GripVertical, Settings2, Users, CalendarIcon, Briefcase } from 'lucide-react';
import { processExcelFile, getExcelSheetNames } from '@/lib/excel-utils';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';


type FilterState = {
    id: number;
    column: string;
    value: string;
};

// ## ACTION ITEMS DATA MANAGEMENT ##

function CreateActionItemDialog({ users, pillars, events, onActionItemCreate, onActionItemUpdate, existingItem }: { 
    users: User[], 
    pillars: Pillar[], 
    events: MeetingEvent[],
    onActionItemCreate: (item: ActionItem) => void,
    onActionItemUpdate?: (item: ActionItem) => void,
    existingItem?: ActionItem | null,
}) {
    const [task, setTask] = useState('');
    const [assignedTo, setAssignedTo] = useState<string[]>([]);
    const [dueDate, setDueDate] = useState<Date | undefined>();
    const [pillarId, setPillarId] = useState('');
    const [eventId, setEventId] = useState<string | undefined>();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (existingItem) {
            setTask(existingItem.task);
            setAssignedTo(existingItem.assignedTo);
            setDueDate(new Date(existingItem.dueDate));
            setPillarId(existingItem.pillarId);
            setEventId(existingItem.eventId);
        } else {
            // Reset for creation
            setTask('');
            setAssignedTo([]);
            setDueDate(undefined);
            setPillarId('');
            setEventId(undefined);
        }
    }, [existingItem, isOpen]);


    const handleSave = () => {
        if (!task || assignedTo.length === 0 || !dueDate || !pillarId) {
            toast({ title: "Missing fields", description: "Please fill out all required fields.", variant: "destructive" });
            return;
        }

        if (existingItem && onActionItemUpdate) {
             let updatedItem: ActionItem = {...existingItem, task, assignedTo, pillarId, eventId: eventId === 'none' ? undefined : eventId };
             const newDueDateStr = format(dueDate, 'yyyy-MM-dd');
             if (updatedItem.dueDate !== newDueDateStr) {
                if (!updatedItem.originalDueDate) {
                     updatedItem.originalDueDate = updatedItem.dueDate;
                }
                updatedItem.dueDate = newDueDateStr;
                updatedItem.status = 'Delayed';
             }
             onActionItemUpdate(updatedItem);
             toast({ title: "Action Item Updated" });
        } else {
            const newActionItem: ActionItem = {
                id: `action-${Date.now()}`,
                task,
                assignedTo,
                dueDate: format(dueDate, 'yyyy-MM-dd'),
                status: 'Backlog',
                pillarId,
                eventId: eventId === 'none' ? undefined : eventId,
                createdAt: new Date().toISOString(),
            };
            onActionItemCreate(newActionItem);
            toast({ title: "Action Item Created", description: "Don't forget to save your changes." });
        }
        
        setIsOpen(false);
    };
    
    const getUserName = (email: string) => users.find(u => u.email === email)?.name || email;

    const handleUserSelect = (email: string) => {
        setAssignedTo(prev => {
            const isSelected = prev.includes(email);
            if (isSelected) {
                return prev.filter(e => e !== email);
            } else {
                return [...prev, email];
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {existingItem ? (
                     <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                ) : (
                    <Button><Plus className="mr-2 h-4 w-4" /> Create Action Item</Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>{existingItem ? 'Edit' : 'Create New'} Action Item</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div>
                        <Label htmlFor="task-description">Task Description</Label>
                        <Textarea id="task-description" value={task} onChange={e => setTask(e.target.value)} placeholder="Describe the action item..."/>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Pillar</Label>
                            <Select value={pillarId} onValueChange={setPillarId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a pillar" />
                                </SelectTrigger>
                                <SelectContent>
                                    {pillars.map(pillar => (
                                        <SelectItem key={pillar.id} value={pillar.id}>{pillar.name}</SelectItem>
                                    ))}
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Event (Optional)</Label>
                            <Select value={eventId} onValueChange={setEventId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an event" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Event</SelectItem>
                                    {events.map(event => (
                                        <SelectItem key={event.id} value={event.id}>{event.name} ({format(new Date(event.date), 'PP')})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                     </div>
                     <div>
                        <Label>Assign To</Label>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                    {assignedTo.length > 0 ? `${assignedTo.length} user(s) selected` : "Select users"}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                                <ScrollArea className="h-60">
                                    {users.map(user => (
                                        <DropdownMenuItem key={user.email} onSelect={(e) => e.preventDefault()}>
                                            <div className="flex items-center space-x-2 w-full" onClick={() => handleUserSelect(user.email)}>
                                                <Checkbox
                                                    id={`user-assign-${user.email}-${existingItem?.id || 'new'}`}
                                                    checked={assignedTo.includes(user.email)}
                                                    onCheckedChange={() => handleUserSelect(user.email)}
                                                />
                                                <Label htmlFor={`user-assign-${user.email}-${existingItem?.id || 'new'}`} className="flex-1 cursor-pointer font-normal">{user.name} <span className="text-xs text-muted-foreground">({user.email})</span></Label>
                                            </div>
                                        </DropdownMenuItem>
                                    ))}
                                </ScrollArea>
                            </DropdownMenuContent>
                        </DropdownMenu>
                         {assignedTo.length > 0 && (
                            <div className="p-2 mt-2 border rounded-md text-sm">
                                {assignedTo.map(email => <Badge key={email} variant="secondary" className="mr-1 mb-1">{getUserName(email)}</Badge>)}
                            </div>
                        )}
                    </div>
                     <div>
                        <Label>Due Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !dueDate && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus/>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                    <Button onClick={handleSave}>{existingItem ? 'Save Changes' : 'Create'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ActionItemsDataManagement({ 
    users, 
    onUsersChange,
    onDataProcessed,
    pillars,
    actionItems,
    onActionItemsChange,
    events,
    onEventsChange,
}: { 
    users: User[];
    onUsersChange: (users: User[]) => void;
    onDataProcessed: (key: string, data: ExcelData) => void;
    pillars: Pillar[];
    actionItems: ActionItem[];
    onActionItemsChange: (items: ActionItem[]) => void;
    events: MeetingEvent[];
    onEventsChange: (events: MeetingEvent[]) => void;
}) {
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserLOBT, setNewUserLOBT] = useState('');
    
    const [newEventName, setNewEventName] = useState('');
    const [newEventDate, setNewEventDate] = useState<Date | undefined>();

    const [searchTerm, setSearchTerm] = useState('');
    const [pillarFilter, setPillarFilter] = useState('all');
    const [eventFilter, setEventFilter] = useState('all');

    const handleAddUser = () => {
        if (!newUserName || !newUserEmail || !newUserLOBT) {
            toast({ title: "Missing fields", description: "Please fill in all fields to add a user.", variant: "destructive" });
            return;
        }
        if (users.some(u => u.email === newUserEmail)) {
            toast({ title: "User exists", description: "A user with this email already exists.", variant: "destructive" });
            return;
        }
        const newUser: User = {
            name: newUserName,
            email: newUserEmail,
            lobt: newUserLOBT,
        };
        onUsersChange([...users, newUser]);
        setNewUserName('');
        setNewUserEmail('');
        setNewUserLOBT('');
    };

    const handleRemoveUser = (email: string) => {
        onUsersChange(users.filter(u => u.email !== email));
    };

    const handleAddEvent = () => {
        if (!newEventName || !newEventDate) {
            toast({ title: "Missing fields", description: "Please provide a name and date for the event.", variant: "destructive" });
            return;
        }
        const newEvent: MeetingEvent = {
            id: `event-${Date.now()}`,
            name: newEventName,
            date: format(newEventDate, 'yyyy-MM-dd'),
        };
        onEventsChange([...events, newEvent].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setNewEventName('');
        setNewEventDate(undefined);
    };
    
    const handleRemoveEvent = (id: string) => {
        onEventsChange(events.filter(e => e.id !== id));
    };

    const handleActionItemCreate = (item: ActionItem) => {
      onActionItemsChange([item, ...actionItems]);
    };
    
    const handleActionItemUpdate = (updatedItem: ActionItem) => {
      onActionItemsChange(actionItems.map(item => item.id === updatedItem.id ? updatedItem : item));
    };
    
    const handleRemoveActionItem = (id: string) => {
      onActionItemsChange(actionItems.filter(item => item.id !== id));
      toast({ title: "Action Item Removed", description: "Don't forget to save your changes." });
    };
    
    const handleStatusChange = (id: string, status: ActionItem['status']) => {
        onActionItemsChange(actionItems.map(item => item.id === id ? {...item, status} : item));
    };
    
    const getUserName = (email: string) => users.find(u => u.email === email)?.name || email;
    const getPillarName = (pillarId: string) => {
        if (pillarId === 'other') return 'Other';
        return pillars.find(p => p.id === pillarId)?.name || 'Unknown Pillar';
    };
    const getEventName = (eventId?: string) => {
        if (!eventId) return 'N/A';
        return events.find(e => e.id === eventId)?.name || 'Unknown Event';
    }
    
    const filteredActionItems = useMemo(() => {
        return actionItems.filter(item => {
            const searchTermMatch = item.task.toLowerCase().includes(searchTerm.toLowerCase());
            const pillarMatch = pillarFilter === 'all' || item.pillarId === pillarFilter;
            
            let eventMatch = true;
            if (eventFilter === 'all') {
                eventMatch = true;
            } else if (eventFilter === 'none') {
                eventMatch = !item.eventId;
            } else {
                eventMatch = item.eventId === eventFilter;
            }

            return searchTermMatch && pillarMatch && eventMatch;
        });
    }, [actionItems, searchTerm, pillarFilter, eventFilter]);


    return (
        <div className="space-y-6">
            <Accordion type="multiple" className="w-full space-y-4">
                <AccordionItem value="manage-events" className="border-b-0">
                    <AccordionTrigger className="px-4 py-3 bg-secondary/30 rounded-md font-medium text-lg hover:no-underline">Manage Events ({events.length})</AccordionTrigger>
                    <AccordionContent className="pt-2">
                        <Card>
                             <CardHeader>
                                <CardTitle>Event List</CardTitle>
                                <CardDescription>Add or remove events to associate with action items.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="border rounded-md max-h-96 overflow-auto">
                                    <Table>
                                        <TableHeader className="sticky top-0 bg-secondary">
                                            <TableRow>
                                                <TableHead>Event Name</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {events.map((event) => (
                                                <TableRow key={event.id}>
                                                    <TableCell>{event.name}</TableCell>
                                                    <TableCell>{format(new Date(event.date), 'PP')}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveEvent(event.id)}>
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                {events.length === 0 && (
                                    <div className="text-center p-4 text-muted-foreground">
                                        No events created yet.
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="flex flex-col items-start gap-4">
                                <div className="w-full">
                                    <h4 className="font-medium text-lg">Add New Event</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                                        <div className="md:col-span-2">
                                            <Label>Event Name</Label>
                                            <Input value={newEventName} onChange={e => setNewEventName(e.target.value)} placeholder="e.g., Project Phoenix Sync" />
                                        </div>
                                        <div>
                                            <Label>Date</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !newEventDate && "text-muted-foreground")}>
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {newEventDate ? format(newEventDate, "PPP") : <span>Pick a date</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={newEventDate} onSelect={setNewEventDate} initialFocus/></PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="self-end">
                                            <Button onClick={handleAddEvent} className="w-full sm:w-auto"><Plus className="mr-2"/>Add Event</Button>
                                        </div>
                                    </div>
                                </div>
                            </CardFooter>
                        </Card>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="manage-users" className="border-b-0">
                    <AccordionTrigger className="px-4 py-3 bg-secondary/30 rounded-md font-medium text-lg hover:no-underline">Manage Users ({users.length})</AccordionTrigger>
                    <AccordionContent className="pt-2">
                        <Card>
                             <CardHeader>
                                <CardTitle>Upload and Manage Users</CardTitle>
                                <CardDescription>Bulk upload users via Excel or add them manually.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ExcelUploadSection
                                    title="Bulk Upload Users"
                                    description="Upload an Excel file with user details. The file must contain columns: 'Name', 'Email', and 'LOBT'."
                                    fileKey="users"
                                    onDataProcessed={onDataProcessed}
                                />

                                <div className="mt-6">
                                    <h4 className="font-medium text-lg mb-2">User List</h4>
                                    <div className="border rounded-md max-h-96 overflow-auto">
                                        <Table>
                                            <TableHeader className="sticky top-0 bg-secondary">
                                                <TableRow>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Email</TableHead>
                                                    <TableHead>LOBT</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {users.map((user) => (
                                                    <TableRow key={user.email}>
                                                        <TableCell>{user.name}</TableCell>
                                                        <TableCell>{user.email}</TableCell>
                                                        <TableCell>{user.lobt}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Button variant="ghost" size="icon" onClick={() => handleRemoveUser(user.email)}>
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                    {users.length === 0 && (
                                        <div className="text-center p-4 text-muted-foreground">
                                            No users loaded. Upload an Excel file or add them manually.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col items-start gap-4">
                                <div className="w-full">
                                    <h4 className="font-medium text-lg">Add New User</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                                        <div>
                                            <Label>Name</Label>
                                            <Input value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="John Doe" />
                                        </div>
                                        <div>
                                            <Label>Email</Label>
                                            <Input type="email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} placeholder="john.doe@example.com" />
                                        </div>
                                        <div>
                                            <Label>LOBT</Label>
                                            <Input value={newUserLOBT} onChange={e => setNewUserLOBT(e.target.value)} placeholder="e.g., GB & WM" />
                                        </div>
                                        <div className="self-end">
                                            <Button onClick={handleAddUser} className="w-full sm:w-auto"><Plus className="mr-2"/>Add User</Button>
                                        </div>
                                    </div>
                                </div>
                            </CardFooter>
                        </Card>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Action Log ({actionItems.length})</CardTitle>
                        <CreateActionItemDialog users={users} pillars={pillars} events={events} onActionItemCreate={handleActionItemCreate}/>
                    </div>
                    <CardDescription>All tracked action items across all pillars.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <Input 
                            placeholder="Search by task name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                         <Select value={pillarFilter} onValueChange={setPillarFilter}>
                            <SelectTrigger className="w-full sm:w-[280px]">
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
                        <Select value={eventFilter} onValueChange={setEventFilter}>
                            <SelectTrigger className="w-full sm:w-[280px]">
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

                    {filteredActionItems.length > 0 ? (
                        <div className="border rounded-lg max-h-[50vh] overflow-auto">
                            <Table>
                                <TableHeader className="sticky top-0 bg-secondary">
                                    <TableRow>
                                        <TableHead className="w-[30%]">Task</TableHead>
                                        <TableHead>Pillar</TableHead>
                                        <TableHead>Event</TableHead>
                                        <TableHead>Assigned To</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Due Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredActionItems.map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.task}</TableCell>
                                            <TableCell>{getPillarName(item.pillarId)}</TableCell>
                                            <TableCell>{getEventName(item.eventId)}</TableCell>
                                            <TableCell>
                                                {item.assignedTo.map(email => (
                                                    <Badge key={email} variant="secondary" className="mr-1 mb-1 font-normal">
                                                        {getUserName(email)}
                                                    </Badge>
                                                ))}
                                            </TableCell>
                                            <TableCell>{format(new Date(item.createdAt), "PP")}</TableCell>
                                            <TableCell>
                                                <div className={cn(new Date(item.dueDate) < new Date() && item.status !== 'Completed' && 'text-destructive font-semibold')}>
                                                   {format(new Date(item.dueDate), "PP")}
                                                </div>
                                                {item.originalDueDate && <s className="text-xs text-muted-foreground">{format(new Date(item.originalDueDate), "PP")}</s>}
                                            </TableCell>
                                            <TableCell>
                                                <Select value={item.status} onValueChange={(status: ActionItem['status']) => handleStatusChange(item.id, status)}>
                                                    <SelectTrigger className="w-[130px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Backlog">Backlog</SelectItem>
                                                        <SelectItem value="In progress">In progress</SelectItem>
                                                        <SelectItem value="Completed">Completed</SelectItem>
                                                        <SelectItem value="Deferred">Deferred</SelectItem>
                                                        <SelectItem value="Delayed">Delayed</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end items-center">
                                                    <CreateActionItemDialog users={users} pillars={pillars} events={events} onActionItemUpdate={handleActionItemUpdate} existingItem={item} />
                                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveActionItem(item.id)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground p-8 border-dashed border-2 rounded-md">
                             <p>
                                {actionItems.length > 0
                                    ? "No action items match your current filters."
                                    : 'No action items created yet. Click "Create Action Item" to get started.'
                                }
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

        </div>
    )
}

// ## VALUE MAP SECTION ##

function ValueMapManager() {
    const [valueMapData, setValueMapData] = useState<ValueMapData>({ outcomes: [], drivers: [], levers: [], outcomeGroups: [], driverGroups: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isGroupEditorOpen, setIsGroupEditorOpen] = useState(false);
    const dragItem = React.useRef<number | null>(null);
    const dragOverItem = React.useRef<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const res = await fetch('/api/data?key=value-map');
                const data = await res.json();
                setValueMapData(prev => ({...prev, ...data}));
            } catch (e) {
                toast({ title: 'Error fetching value map data', variant: 'destructive' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ valueMap: valueMapData }),
            });
            if (!res.ok) throw new Error('Failed to save');
            toast({ title: 'Value Map Saved!' });
        } catch (e) {
            toast({ title: 'Error saving value map', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleGroupUpdate = (newGroups: Partial<ValueMapData>) => {
        setValueMapData(prev => ({...prev, ...newGroups}));
    };

    const handleItemChange = <T extends ValueMapItem>(
        type: 'outcomes' | 'drivers' | 'levers',
        updatedItem: T
    ) => {
        setValueMapData(prev => ({
            ...prev,
            [type]: prev[type].map((item: T) => item.id === updatedItem.id ? updatedItem : item),
        }));
    };
    
    const handleItemAdd = (type: 'outcomes' | 'drivers' | 'levers') => {
        const newItem: ValueMapItem = {
            id: `${type.slice(0, -1)}-${Date.now()}`,
            name: `New ${type.slice(0, -1)}`,
            description: '',
            isWceBookOfWork: false,
        };
        
        if (type === 'outcomes') {
            (newItem as ValueMapOutcome).connectedDriverIds = [];
        } else if (type === 'drivers') {
            (newItem as ValueMapDriver).connectedLeverIds = [];
        }

        setValueMapData(prev => ({
            ...prev,
            [type]: [...prev[type], newItem],
        }));
    };

    const handleItemDelete = (type: 'outcomes' | 'drivers' | 'levers', id: string) => {
        setValueMapData(prev => ({
            ...prev,
            [type]: prev[type].filter((item: ValueMapItem) => item.id !== id),
            ...(type === 'levers' && {
                drivers: prev.drivers.map(d => ({...d, connectedLeverIds: d.connectedLeverIds.filter(leverId => leverId !== id) }))
            }),
            ...(type === 'drivers' && {
                outcomes: prev.outcomes.map(o => ({...o, connectedDriverIds: o.connectedDriverIds.filter(driverId => driverId !== id) }))
            }),
        }));
    };

    const handleSort = (type: 'outcomes' | 'drivers' | 'levers') => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        
        setValueMapData(prev => {
            const items = [...prev[type]];
            const dragItemContent = items.splice(dragItem.current!, 1)[0];
            items.splice(dragOverItem.current!, 0, dragItemContent);
            dragItem.current = null;
            dragOverItem.current = null;
            return {...prev, [type]: items };
        });
    };

    if (isLoading) {
        return <Skeleton className="h-96 w-full" />;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-end gap-2">
                <Dialog open={isGroupEditorOpen} onOpenChange={setIsGroupEditorOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline"><Settings2 className="mr-2 h-4 w-4"/>Manage Groups</Button>
                    </DialogTrigger>
                    <ValueMapGroupEditor 
                        outcomeGroups={valueMapData.outcomeGroups || []}
                        driverGroups={valueMapData.driverGroups || []}
                        onSave={handleGroupUpdate}
                        onClose={() => setIsGroupEditorOpen(false)}
                    />
                </Dialog>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Value Map Changes
                </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <ValueMapColumn
                    title="Levers"
                    items={valueMapData.levers}
                    onAdd={() => handleItemAdd('levers')}
                    onDelete={(id) => handleItemDelete('levers', id)}
                    onUpdate={(item) => handleItemChange('levers', item as ValueMapLever)}
                    dragItem={dragItem}
                    dragOverItem={dragOverItem}
                    handleSort={() => handleSort('levers')}
                />
                 <ValueMapColumn
                    title="Drivers"
                    items={valueMapData.drivers}
                    groups={valueMapData.driverGroups}
                    onAdd={() => handleItemAdd('drivers')}
                    onDelete={(id) => handleItemDelete('drivers', id)}
                    onUpdate={(item) => handleItemChange('drivers', item as ValueMapDriver)}
                    levers={valueMapData.levers}
                    dragItem={dragItem}
                    dragOverItem={dragOverItem}
                    handleSort={() => handleSort('drivers')}
                />
                 <ValueMapColumn
                    title="Outcomes"
                    items={valueMapData.outcomes}
                    groups={valueMapData.outcomeGroups}
                    onAdd={() => handleItemAdd('outcomes')}
                    onDelete={(id) => handleItemDelete('outcomes', id)}
                    onUpdate={(item) => handleItemChange('outcomes', item as ValueMapOutcome)}
                    drivers={valueMapData.drivers}
                    dragItem={dragItem}
                    dragOverItem={dragOverItem}
                    handleSort={() => handleSort('outcomes')}
                />
            </div>
        </div>
    );
}

function ValueMapGroupEditor({ outcomeGroups, driverGroups, onSave, onClose }: {
    outcomeGroups: ValueMapGroup[],
    driverGroups: ValueMapGroup[],
    onSave: (data: {outcomeGroups: ValueMapGroup[], driverGroups: ValueMapGroup[]}) => void,
    onClose: () => void
}) {
    const [localOutcomeGroups, setLocalOutcomeGroups] = useState(outcomeGroups);
    const [localDriverGroups, setLocalDriverGroups] = useState(driverGroups);

    const handleAddGroup = (type: 'outcome' | 'driver') => {
        const newGroup = { id: `${type}-group-${Date.now()}`, name: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Group`};
        if (type === 'outcome') {
            setLocalOutcomeGroups(prev => [...prev, newGroup]);
        } else {
            setLocalDriverGroups(prev => [...prev, newGroup]);
        }
    };
    
    const handleRemoveGroup = (type: 'outcome' | 'driver', id: string) => {
        if (type === 'outcome') {
            setLocalOutcomeGroups(prev => prev.filter(g => g.id !== id));
        } else {
            setLocalDriverGroups(prev => prev.filter(g => g.id !== id));
        }
    };
    
    const handleGroupNameChange = (type: 'outcome' | 'driver', id: string, name: string) => {
        if (type === 'outcome') {
            setLocalOutcomeGroups(prev => prev.map(g => g.id === id ? {...g, name} : g));
        } else {
            setLocalDriverGroups(prev => prev.map(g => g.id === id ? {...g, name} : g));
        }
    };
    
    const handleSaveChanges = () => {
        onSave({ outcomeGroups: localOutcomeGroups, driverGroups: localDriverGroups });
        onClose();
    };

    return (
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>Manage Value Map Groups</DialogTitle>
                <DialogDescription>Create, edit, or delete groups for your Outcomes and Drivers.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6 py-4">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="font-medium">Outcome Groups</h4>
                        <Button size="sm" variant="outline" onClick={() => handleAddGroup('outcome')}><Plus className="mr-2 h-4 w-4"/> Add</Button>
                    </div>
                    <div className="space-y-2">
                        {localOutcomeGroups.map(group => (
                            <div key={group.id} className="flex items-center gap-2">
                                <Input value={group.name} onChange={e => handleGroupNameChange('outcome', group.id, e.target.value)} />
                                <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleRemoveGroup('outcome', group.id)}>
                                    <Trash2 className="h-4 w-4"/>
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="font-medium">Driver Groups</h4>
                        <Button size="sm" variant="outline" onClick={() => handleAddGroup('driver')}><Plus className="mr-2 h-4 w-4"/> Add</Button>
                    </div>
                     <div className="space-y-2">
                        {localDriverGroups.map(group => (
                            <div key={group.id} className="flex items-center gap-2">
                                <Input value={group.name} onChange={e => handleGroupNameChange('driver', group.id, e.target.value)} />
                                <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleRemoveGroup('driver', group.id)}>
                                    <Trash2 className="h-4 w-4"/>
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                <Button onClick={handleSaveChanges}>Save Changes</Button>
            </DialogFooter>
        </DialogContent>
    );
}

function ValueMapColumn({ title, items, groups, onAdd, onDelete, onUpdate, drivers, levers, dragItem, dragOverItem, handleSort }: {
    title: 'Outcomes' | 'Drivers' | 'Levers';
    items: ValueMapItem[];
    groups?: ValueMapGroup[];
    onAdd: () => void;
    onDelete: (id: string) => void;
    onUpdate: (item: ValueMapItem) => void;
    drivers?: ValueMapDriver[];
    levers?: ValueMapLever[];
    dragItem: React.MutableRefObject<number | null>;
    dragOverItem: React.MutableRefObject<number | null>;
    handleSort: () => void;
}) {
    return (
        <Card className="bg-secondary/30">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    {title}
                    <Button size="icon" variant="ghost" onClick={onAdd}><Plus className="h-4 w-4" /></Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {items.map((item, index) => (
                    <div 
                        key={item.id} 
                        className="group flex items-center gap-2"
                        draggable
                        onDragStart={() => dragItem.current = index}
                        onDragEnter={() => dragOverItem.current = index}
                        onDragEnd={handleSort}
                        onDragOver={(e) => e.preventDefault()}
                    >
                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                         <ValueMapItemCard
                            item={item}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                            levers={levers}
                            drivers={drivers}
                            driverGroups={groups?.length && title === 'Drivers' ? groups : undefined}
                            outcomeGroups={groups?.length && title === 'Outcomes' ? groups : undefined}
                         />
                    </div>
                ))}
                {items.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No {title.toLowerCase()} yet.</p>}
            </CardContent>
        </Card>
    );
}

function ValueMapItemCard({ item, onUpdate, onDelete, levers, drivers, driverGroups, outcomeGroups }: {
    item: ValueMapItem;
    onUpdate: (item: any) => void;
    onDelete: (id: string) => void;
    levers?: ValueMapLever[];
    drivers?: ValueMapDriver[];
    driverGroups?: ValueMapGroup[];
    outcomeGroups?: ValueMapGroup[];
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedItem, setEditedItem] = useState(item);

    const isOutcome = 'connectedDriverIds' in item;
    const isDriver = 'connectedLeverIds' in item;

    const handleSave = () => {
        onUpdate(editedItem);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedItem(item);
        setIsEditing(false);
    };

    const handleCheckboxChange = (type: 'drivers' | 'levers', id: string) => {
        if (isOutcome && type === 'drivers') {
            const currentIds = (editedItem as ValueMapOutcome).connectedDriverIds || [];
            const isSelected = currentIds.includes(id);
            const newIds = isSelected ? currentIds.filter(driverId => driverId !== id) : [...currentIds, id];
            setEditedItem(prev => ({...prev, connectedDriverIds: newIds }));
        }
        if (isDriver && type === 'levers') {
            const currentIds = (editedItem as ValueMapDriver).connectedLeverIds || [];
            const isSelected = currentIds.includes(id);
            const newIds = isSelected ? currentIds.filter(leverId => leverId !== id) : [...currentIds, id];
            setEditedItem(prev => ({...prev, connectedLeverIds: newIds }));
        }
    };
    
    return (
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <Card className="flex-1 cursor-pointer bg-background">
                <div className="flex items-center justify-between p-3">
                    <p className="font-medium text-sm flex-1">{item.name}</p>
                    <div className="flex">
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon"><Edit className="h-4 w-4"/></Button>
                        </DialogTrigger>
                         <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => onDelete(item.id)}>
                            <Trash2 className="h-4 w-4"/>
                        </Button>
                    </div>
                </div>
            </Card>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit {item.name}</DialogTitle>
                    <DialogDescription>Update the details and connections for this item.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <Label>Name</Label>
                        <Input value={editedItem.name} onChange={e => setEditedItem({...editedItem, name: e.target.value })}/>
                    </div>
                    <div>
                        <Label>Description</Label>
                        <Textarea value={editedItem.description} onChange={e => setEditedItem({...editedItem, description: e.target.value })}/>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id={`wce-switch-${editedItem.id}`}
                            checked={editedItem.isWceBookOfWork}
                            onCheckedChange={checked => setEditedItem({...editedItem, isWceBookOfWork: checked})}
                        />
                        <Label htmlFor={`wce-switch-${editedItem.id}`}>Part of WCE 2025 Book of Work</Label>
                    </div>
                    
                    {isOutcome && drivers && (
                        <div>
                            <Label>Connected Drivers</Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start">
                                        {((editedItem as ValueMapOutcome).connectedDriverIds || []).length} selected
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                                    <ScrollArea className="h-72">
                                        {drivers.map(d => (
                                            <DropdownMenuItem key={d.id} onSelect={(e) => e.preventDefault()}>
                                                <div className="flex items-center space-x-2 w-full" onClick={() => handleCheckboxChange('drivers', d.id)}>
                                                    <Checkbox
                                                        checked={((editedItem as ValueMapOutcome).connectedDriverIds || []).includes(d.id)}
                                                        onCheckedChange={() => handleCheckboxChange('drivers', d.id)}
                                                    />
                                                    <Label className="flex-1 cursor-pointer font-normal">{d.name}</Label>
                                                </div>
                                            </DropdownMenuItem>
                                        ))}
                                    </ScrollArea>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                     {isOutcome && outcomeGroups && (
                        <div>
                            <Label>Outcome Group</Label>
                            <Select
                                value={editedItem.groupId}
                                onValueChange={groupId => setEditedItem({ ...editedItem, groupId: groupId === 'none' ? undefined : groupId })}
                            >
                                <SelectTrigger><SelectValue placeholder="Assign to a group..."/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Group</SelectItem>
                                    {outcomeGroups.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {isDriver && levers && (
                        <div>
                            <Label>Connected Levers</Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start">
                                        {((editedItem as ValueMapDriver).connectedLeverIds || []).length} selected
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                                    <ScrollArea className="h-72">
                                        {levers.map(l => (
                                            <DropdownMenuItem key={l.id} onSelect={(e) => e.preventDefault()}>
                                                <div className="flex items-center space-x-2" onClick={() => handleCheckboxChange('levers', l.id)}>
                                                    <Checkbox
                                                        checked={((editedItem as ValueMapDriver).connectedLeverIds || []).includes(l.id)}
                                                        onCheckedChange={() => handleCheckboxChange('levers', l.id)}
                                                    />
                                                    <Label className="flex-1 cursor-pointer font-normal">{l.name}</Label>
                                                </div>
                                            </DropdownMenuItem>
                                        ))}
                                    </ScrollArea>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}

                    {isDriver && driverGroups && (
                        <div>
                            <Label>Driver Group</Label>
                             <Select
                                value={editedItem.groupId}
                                onValueChange={groupId => setEditedItem({ ...editedItem, groupId: groupId === 'none' ? undefined : groupId })}
                            >
                                <SelectTrigger><SelectValue placeholder="Assign to a group..."/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Group</SelectItem>
                                    {driverGroups.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost" onClick={handleCancel}>Cancel</Button></DialogClose>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


// ## EXCEL UPLOAD SECTION ##

function ExcelUploadSection({
  title,
  description,
  fileKey,
  onDataProcessed,
  isMonthly = false,
}: {
  title: string;
  description: string;
  fileKey: string;
  onDataProcessed: (key: string, data: ExcelData) => void;
  isMonthly?: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [fileDataUri, setFileDataUri] = useState<string>('');
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState[]>([]);
  const [filterCounter, setFilterCounter] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [month, setMonth] = useState<string>(isMonthly ? new Date().toISOString().slice(0, 7) : '');

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
        const selectedFile = files[0];
        setFile(selectedFile);
        // Reset subsequent steps
        setSheetNames([]);
        setSelectedSheet('');
        setHeaders([]);
        setFilters([]);
        setIsLoading(true);
        try {
            const dataUri = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = (error) => reject(error);
                reader.readAsDataURL(selectedFile);
            });
            setFileDataUri(dataUri);
            const names = await getExcelSheetNames(dataUri);
            setSheetNames(names);
            if (names.length > 0) {
                // Automatically select first sheet and process headers
                setSelectedSheet(names[0]);
                await handleSheetChange(names[0], dataUri);
            }
        } catch (error) {
            console.error('Error processing file for sheet names:', error);
            toast({ title: 'Error reading file', description: 'Could not read sheet names from the file.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    }
  };

  const handleSheetChange = async (sheetName: string, dataUri = fileDataUri) => {
    setSelectedSheet(sheetName);
    setHeaders([]); // Reset headers and filters if sheet changes
    setFilters([]);
    
    if (!dataUri) return;
    setIsLoading(true);
    try {
        const result = await processExcelFile(dataUri, sheetName);
        setHeaders(result.headers);
    } catch(error) {
        console.error('Error processing sheet for headers:', error);
        toast({ title: 'Error reading sheet', description: 'Could not read headers from the selected sheet.', variant: 'destructive' });
    } finally {
        setIsLoading(false);
    }
  }
  
  const handleAddFilter = () => {
      setFilters([...filters, { id: filterCounter, column: '', value: ''}]);
      setFilterCounter(prev => prev + 1);
  }
  
  const handleRemoveFilter = (id: number) => {
      setFilters(filters.filter(f => f.id !== id));
  }

  const handleFilterChange = (id: number, type: 'column' | 'value', value: string) => {
      setFilters(filters.map(f => f.id === id ? {...f, [type]: value} : f));
  }


  const handleProcessAndLoad = async () => {
    if (!file || !fileDataUri || !selectedSheet) {
      toast({
        title: 'Missing information',
        description: 'Please select a file and a sheet to process.',
        variant: 'destructive',
      });
      return;
    }
    if (isMonthly && !month) {
        toast({
        title: 'No month selected',
        description: 'Please select a month for the data upload.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
        const validFilters = filters.filter(f => f.column && f.value).map(({column, value}) => ({column, value}));
        const result = await processExcelFile(fileDataUri, selectedSheet, validFilters);
        const finalFileKey = isMonthly ? `${fileKey}:${month}` : fileKey;
        onDataProcessed(finalFileKey, result);
        toast({
            title: `"${file.name}" processed`,
            description: `${result.rows.length} rows loaded from sheet "${selectedSheet}". Remember to save all changes.`,
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

  return (
      <Card className="bg-secondary/30">
        <CardHeader>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           {isMonthly && (
                <div>
                    <Label htmlFor={`month-select-${fileKey}`}>Select Month</Label>
                    <Input 
                        id={`month-select-${fileKey}`} 
                        type="month" 
                        value={month}
                        onChange={e => setMonth(e.target.value)}
                        className="w-full max-w-xs"
                    />
                </div>
            )}
          <div>
            <Label htmlFor={`excel-upload-${fileKey}`}>1. Upload Excel File</Label>
            <Input
                id={`excel-upload-${fileKey}`}
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
            />
          </div>

          {isLoading && !sheetNames.length && <Loader2 className="h-6 w-6 animate-spin" />}

          {sheetNames.length > 0 && (
              <div className="space-y-4 p-4 border rounded-md bg-background/50">
                <div>
                    <Label>2. Select Sheet</Label>
                    <Select onValueChange={(value) => handleSheetChange(value)} value={selectedSheet}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a sheet" />
                        </SelectTrigger>
                        <SelectContent>
                            {sheetNames.map(name => (
                                <SelectItem key={name} value={name}>{name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                 {isLoading && !headers.length && <Loader2 className="h-6 w-6 animate-spin" />}

                {headers.length > 0 && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                           <div className="flex items-center justify-between">
                             <Label>3. Filter Data (Optional)</Label>
                             <Button variant="outline" size="sm" onClick={handleAddFilter}><Filter className="mr-2 h-3 w-3" /> Add Filter</Button>
                           </div>
                           {filters.map((filter) => (
                               <div key={filter.id} className="flex gap-2 items-center">
                                   <Select onValueChange={(value) => handleFilterChange(filter.id, 'column', value)} value={filter.column}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Column" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {headers.map(header => <SelectItem key={header} value={header}>{header}</SelectItem>)}
                                        </SelectContent>
                                   </Select>
                                   <Input 
                                        placeholder="Filter Value" 
                                        value={filter.value} 
                                        onChange={(e) => handleFilterChange(filter.id, 'value', e.target.value)}
                                   />
                                   <Button variant="ghost" size="icon" onClick={() => handleRemoveFilter(filter.id)}><X className="h-4 w-4 text-destructive"/></Button>
                               </div>
                           ))}
                        </div>
                        <Button onClick={handleProcessAndLoad} disabled={isLoading || !file}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                            Process & Load Data
                        </Button>
                        <p className="text-xs text-muted-foreground">Process the file here, then click the main 'Save All Changes' button to update the dashboard.</p>
                    </div>
                )}
              </div>
          )}
        </CardContent>
      </Card>
  );
}

export default function UpdateDataPage() {
  const [data, setData] = useState<Pillar[] | null>(null);
  const [excelData, setExcelData] = useState<Record<string, ExcelData | null>>({
      'explore-resiliency-program': null,
      'dti-tech-blogs': null,
      'tech-sphere-sessions': null,
      'squad-onboarding': null,
      'arc-trainings': null,
      'app-sherpas': null,
      'jira-assistant-adoption': null,
      'regression-testing-automation': null,
      'junit-adoption': null,
      'maintenance-screens': null,
      'api-performance': null,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<MeetingEvent[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string | undefined>('action-items');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [pillarRes, usersRes, actionItemsRes, eventsRes] = await Promise.all([
          fetch('/api/data'),
          fetch('/api/data?key=users'),
          fetch('/api/data?key=action-items'),
          fetch('/api/data?key=events'),
      ]);

      if (!pillarRes.ok) throw new Error('Failed to fetch pillar data');
      const pillarJsonData = await pillarRes.json();
      setData(pillarJsonData);

      if (usersRes.ok) setUsers(await usersRes.json());
      if (actionItemsRes.ok) setActionItems(await actionItemsRes.json());
      if (eventsRes.ok) setEvents(await eventsRes.json());

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
      metricUnit: '%',
      dataKey: '',
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
    if (key === 'users') {
        const newUsers = processedData.rows.map(row => ({
            name: row['Name'],
            email: row['Email'],
            lobt: row['LOBT'],
        })).filter(u => u.name && u.email && u.lobt);
        
        // Create a Map to ensure uniqueness by email, letting newer entries override older ones.
        const userMap = new Map<string, User>();

        // Add existing users to the map first
        users.forEach(user => userMap.set(user.email, user));

        // Then add new users, overwriting any duplicates
        newUsers.forEach(user => userMap.set(user.email, user));
        
        setUsers(Array.from(userMap.values()));
    } else {
        setExcelData(prev => ({ ...prev, [key]: processedData }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload: {
        pillars: Pillar[] | null;
        actionItems: ActionItem[];
        events: MeetingEvent[];
        excelData: Record<string, any>;
      } = {
        pillars: data,
        actionItems: actionItems,
        events: events,
        excelData: {
            ...excelData,
            users: {
                headers: ['Name', 'Email', 'LOBT'],
                rows: users.map(u => ({ 'Name': u.name, 'Email': u.email, 'LOBT': u.lobt })),
            }
        }
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
          <CardHeader className="flex flex-row items-start sm:items-center justify-between">
            <div className="space-y-1">
                <CardTitle className="text-3xl">Update Dashboard Data</CardTitle>
                <CardDescription>Modify pillar details, sub-items, value map, and upload new data from Excel files.</CardDescription>
            </div>
            <Button onClick={handleSave} disabled={isSaving || isLoading}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSaving ? 'Saving...' : 'Save All Changes'}
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
                    <TabsList className="grid w-full grid-cols-3 md:grid-cols-7 h-auto mb-6">
                        <TabsTrigger value="value-map">Value Map</TabsTrigger>
                        <TabsTrigger value="action-items">Action Items</TabsTrigger>
                        {data?.map((pillar) => (
                            <TabsTrigger key={pillar.id} value={pillar.id} className="text-xs sm:text-sm">
                                {pillar.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <TabsContent value="value-map">
                        <ValueMapManager />
                    </TabsContent>

                     <TabsContent value="action-items">
                        <ActionItemsDataManagement 
                            users={users} 
                            onUsersChange={setUsers}
                            onDataProcessed={handleExcelDataProcessed}
                            pillars={data || []}
                            actionItems={actionItems}
                            onActionItemsChange={setActionItems}
                            events={events}
                            onEventsChange={setEvents}
                        />
                    </TabsContent>

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
                                    <h4 className="text-xl font-semibold mb-2">Sub-Items</h4>
                                    <Accordion type="multiple" className="w-full">
                                    {pillar.subItems.map((item, sIndex) => {
                                      const isAutoCalculated = !!item.dataKey;

                                      return (
                                        <AccordionItem value={item.id} key={item.id} className="border-b-0 mb-2">
                                            <div className="flex items-center group bg-background rounded-md border">
                                                <AccordionTrigger className="flex-1 px-4 py-3 hover:no-underline font-medium">
                                                    <span>{item.name}</span>
                                                </AccordionTrigger>
                                                <Button variant="ghost" size="icon" className="mr-2 text-destructive hover:text-destructive" onClick={() => removeSubItem(pIndex, sIndex)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <AccordionContent>
                                                <div className="border border-t-0 rounded-b-md p-4 bg-background/50 relative">
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
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                        <div>
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
                                                        <div>
                                                            <Label htmlFor={`item-datakey-${pIndex}-${sIndex}`}>Data Key (for auto-calculation)</Label>
                                                            <Input
                                                                id={`item-datakey-${pIndex}-${sIndex}`}
                                                                value={item.dataKey || ''}
                                                                placeholder="e.g., dti-tech-blogs"
                                                                onChange={(e) =>
                                                                    handleSubItemChange(pIndex, sIndex, 'dataKey', e.target.value)
                                                                }
                                                            />
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                Use a permanent key to link this item to an Excel upload. Leave empty if not applicable.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                      )
                                    })}
                                    </Accordion>
                                    <div className="mt-4">
                                        <Button variant="outline" onClick={() => addSubItem(pIndex)}>
                                            <Plus className="mr-2 h-4 w-4" /> Add Sub-Item
                                        </Button>
                                    </div>

                                    {pillar.id === 'building-reliable-products' && (
                                        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <ExcelUploadSection
                                                title="Regression Testing Automation"
                                                description="Upload Excel sheet for Regression Testing Automation."
                                                fileKey="regression-testing-automation"
                                                onDataProcessed={handleExcelDataProcessed}
                                            />
                                             <ExcelUploadSection
                                                title="JUnit Adoption"
                                                description="Upload Excel sheet for JUnit Adoption."
                                                fileKey="junit-adoption"
                                                onDataProcessed={handleExcelDataProcessed}
                                            />
                                             <ExcelUploadSection
                                                title="Maintenance Screens"
                                                description="Upload Excel sheet for Maintenance Screens."
                                                fileKey="maintenance-screens"
                                                onDataProcessed={handleExcelDataProcessed}
                                            />
                                             <ExcelUploadSection
                                                title="API Performance"
                                                description="Upload Excel sheet for API Performance."
                                                fileKey="api-performance"
                                                onDataProcessed={handleExcelDataProcessed}
                                            />
                                        </div>
                                    )}

                                    {pillar.id === 'making-design-resilient' && (
                                        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <ExcelUploadSection
                                                title="SQUAD Onboarding"
                                                description="Upload the Excel sheet for CAT1/CAT2 app onboarding to SQUAD."
                                                fileKey="squad-onboarding"
                                                onDataProcessed={handleExcelDataProcessed}
                                            />
                                            <ExcelUploadSection
                                                title="ARC Trainings"
                                                description="Upload the Excel sheet for ARC Training sessions."
                                                fileKey="arc-trainings"
                                                onDataProcessed={handleExcelDataProcessed}
                                            />
                                            <ExcelUploadSection
                                                title="App Sherpas"
                                                description="Upload the Excel sheet for App Sherpas."
                                                fileKey="app-sherpas"
                                                onDataProcessed={handleExcelDataProcessed}
                                            />
                                            <ExcelUploadSection
                                                title="Jira Assistant Adoption"
                                                description="Upload monthly Excel sheets for Jira Assistant Adoption."
                                                fileKey="jira-assistant-adoption"
                                                onDataProcessed={handleExcelDataProcessed}
                                                isMonthly={true}
                                            />
                                        </div>
                                    )}

                                    {pillar.id === 'adopting-emerging-technologies' && (
                                        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <Card className="bg-secondary/30">
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
                                             <Card className="bg-secondary/30">
                                                <CardHeader>
                                                    <CardTitle className="text-xl">Manage Industry Events</CardTitle>
                                                    <CardDescription>
                                                        Add and manage industry event details.
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <Button asChild>
                                                        <Link href="/industry-events">
                                                            Go to Event Management
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
                                        </div>
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
