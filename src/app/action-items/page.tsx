
'use client';

import { useState, useEffect } from 'react';
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
import { ArrowLeft, Plus, CalendarIcon, Loader2, Trash2 } from "lucide-react";
import type { ActionItem, User, Pillar } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';


function CreateActionItemDialog({ users, pillars, onActionItemCreate }: { users: User[], pillars: Pillar[], onActionItemCreate: (item: ActionItem) => void }) {
    const [task, setTask] = useState('');
    const [assignedTo, setAssignedTo] = useState<string[]>([]);
    const [dueDate, setDueDate] = useState<Date | undefined>();
    const [pillarId, setPillarId] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const handleCreate = () => {
        if (!task || assignedTo.length === 0 || !dueDate || !pillarId) {
            toast({ title: "Missing fields", description: "Please fill out all fields.", variant: "destructive" });
            return;
        }
        const newActionItem: ActionItem = {
            id: `action-${Date.now()}`,
            task,
            assignedTo,
            dueDate: format(dueDate, 'yyyy-MM-dd'),
            status: 'Open',
            pillarId,
            createdAt: new Date().toISOString(),
        };
        onActionItemCreate(newActionItem);
        setTask('');
        setAssignedTo([]);
        setDueDate(undefined);
        setPillarId('');
        setIsOpen(false);
        toast({ title: "Action Item Created", description: "Don't forget to save your changes." });
    };
    
    const getUserName = (email: string) => users.find(u => u.email === email)?.name || email;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" /> Create Action Item</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Create New Action Item</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div>
                        <Label htmlFor="task-description">Task Description</Label>
                        <Textarea id="task-description" value={task} onChange={e => setTask(e.target.value)} placeholder="Describe the action item..."/>
                    </div>
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
                            </SelectContent>
                        </Select>
                    </div>
                     <div>
                        <Label>Assign To</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                    {assignedTo.length > 0 ? `${assignedTo.length} user(s) selected` : "Select users"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <div className="p-2 space-y-1 h-60 overflow-y-auto">
                                {users.map(user => (
                                    <div key={user.email} className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md">
                                        <Checkbox
                                            id={`user-${user.email}`}
                                            checked={assignedTo.includes(user.email)}
                                            onCheckedChange={(checked) => {
                                                setAssignedTo(prev => checked ? [...prev, user.email] : prev.filter(email => email !== user.email));
                                            }}
                                        />
                                        <Label htmlFor={`user-${user.email}`} className="flex-1 cursor-pointer">{user.name} <span className="text-xs text-muted-foreground">({user.email})</span></Label>
                                    </div>
                                ))}
                                </div>
                            </PopoverContent>
                        </Popover>
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
                    <Button onClick={handleCreate}>Create</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function ActionItemsPage() {
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
        setIsLoading(true);
        try {
            const [itemsRes, usersRes, pillarsRes] = await Promise.all([
                fetch('/api/data?key=action-items'),
                fetch('/api/data?key=users'),
                fetch('/api/data'),
            ]);
            if (itemsRes.ok) setActionItems(await itemsRes.json());
            if (usersRes.ok) setUsers(await usersRes.json());
            if (pillarsRes.ok) setPillars(await pillarsRes.json());
        } catch (error) {
            console.error(error);
            toast({ title: 'Error loading data', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    }
    fetchData();
  }, []);

  const handleActionItemCreate = (item: ActionItem) => {
      setActionItems(prev => [...prev, item]);
  };
  
  const handleRemoveActionItem = (id: string) => {
    setActionItems(prev => prev.filter(item => item.id !== id));
    toast({ title: "Action Item Removed", description: "Don't forget to save your changes." });
  };
  
  const handleStatusChange = (id: string, status: ActionItem['status']) => {
      setActionItems(prev => prev.map(item => item.id === id ? {...item, status} : item));
  };
  
  const handleDueDateChange = (id: string, newDueDate: string) => {
      setActionItems(prev => prev.map(item => {
          if (item.id === id) {
              return {...item, dueDate: newDueDate, originalDueDate: item.originalDueDate || item.dueDate };
          }
          return item;
      }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
        const payload = { actionItems };
        const res = await fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to save');
        toast({ title: "Changes Saved", description: "Action items have been updated successfully." });
    } catch (error) {
        console.error(error);
        toast({ title: 'Error Saving Changes', variant: 'destructive' });
    } finally {
        setIsSaving(false);
    }
  };

  const getUserName = (email: string) => users.find(u => u.email === email)?.name || email;
  const getPillarName = (pillarId: string) => pillars.find(p => p.id === pillarId)?.name || 'Unknown Pillar';

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Action Items & Status</h1>
            <p className="text-muted-foreground">Track key action items and their completion status.</p>
          </div>
            <div className="flex items-center gap-2">
                 <Button asChild variant="outline">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </Link>
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    Save Changes
                </Button>
            </div>
        </div>
        
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Action Log</CardTitle>
                    <CreateActionItemDialog users={users} pillars={pillars} onActionItemCreate={handleActionItemCreate}/>
                </div>
                <CardDescription>All tracked action items across all pillars.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : actionItems.length > 0 ? (
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[40%]">Task</TableHead>
                                    <TableHead>Pillar</TableHead>
                                    <TableHead>Assigned To</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {actionItems.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.task}</TableCell>
                                        <TableCell>{getPillarName(item.pillarId)}</TableCell>
                                        <TableCell>
                                            {item.assignedTo.map(email => (
                                                <Badge key={email} variant="secondary" className="mr-1">{getUserName(email)}</Badge>
                                            ))}
                                        </TableCell>
                                        <TableCell>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="link" className={cn("p-0 h-auto", new Date(item.dueDate) < new Date() && item.status !== 'Completed' && 'text-destructive')}>
                                                        {format(new Date(item.dueDate), "PPP")}
                                                        {item.originalDueDate && <s className="text-muted-foreground ml-2">{format(new Date(item.originalDueDate), "PPP")}</s>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar mode="single" selected={new Date(item.dueDate)} onSelect={(date) => date && handleDueDateChange(item.id, format(date, 'yyyy-MM-dd'))} />
                                                </PopoverContent>
                                            </Popover>
                                        </TableCell>
                                        <TableCell>
                                            <Select value={item.status} onValueChange={(status: ActionItem['status']) => handleStatusChange(item.id, status)}>
                                                <SelectTrigger className="w-[120px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Open">Open</SelectItem>
                                                    <SelectItem value="Completed">Completed</SelectItem>
                                                    <SelectItem value="Delayed">Delayed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleRemoveActionItem(item.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground p-8 border-dashed border-2 rounded-md">
                        <p>No action items created yet. Click "Create Action Item" to get started.</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </main>
    </div>
  );
}

