
'use client';

import { useState, useEffect } from 'react';
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Plus, Users, Upload, Loader2 } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { toast } from '@/hooks/use-toast';
import type { User, ActionItem } from '@/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { processExcelFile } from '@/lib/excel-utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/data?key=users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            toast({ title: "Error fetching users", variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            setFile(files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setIsProcessing(true);
        try {
            const fileAsDataUri = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = (error) => reject(error);
            });

            const result = await processExcelFile(fileAsDataUri, file.name);

            const requiredHeaders = ['Name', 'Email', 'LOBT'];
            const hasRequiredHeaders = requiredHeaders.every(h => result.headers.includes(h));

            if (!hasRequiredHeaders) {
                toast({ title: 'Invalid Excel file', description: 'File must contain "Name", "Email", and "LOBT" columns.', variant: 'destructive'});
                return;
            }

            const newUsers = result.rows.map(row => ({
                name: row['Name'],
                email: row['Email'],
                lobt: row['LOBT'],
            }));

            setUsers(newUsers);
            toast({ title: "Users loaded from file", description: "Click 'Save Changes' to persist the new user list."});

        } catch (error) {
            toast({ title: 'Error processing file', variant: 'destructive' });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ users: users }),
            });
            if (!res.ok) throw new Error('Failed to save');
            toast({ title: 'User list saved!' });
        } catch (e) {
            toast({ title: 'Error saving users', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Users</CardTitle>
                <CardDescription>Upload an Excel file with user details to populate the assignee list for action items. The file must contain columns: "Name", "Email", and "LOBT".</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Input type="file" accept=".xlsx, .xls" onChange={handleFileChange} className="flex-grow"/>
                    <Button onClick={handleUpload} disabled={!file || isProcessing}>
                        {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Upload className="mr-2 h-4 w-4" />}
                        Upload & Preview
                    </Button>
                </div>
                 {isLoading ? (
                    <Skeleton className="h-48 w-full" />
                ) : (
                    <div className="border rounded-md max-h-96 overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>LOBT</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.length > 0 ? (
                                    users.map((user, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{user.lobt}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">No users found. Upload a file to get started.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button onClick={handleSave} disabled={isSaving || isLoading}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save User List
                </Button>
            </CardFooter>
        </Card>
    );
}


export default function ActionItemsPage() {
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch action items in the future
    setIsLoading(false);
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Action Items & Status</h1>
            <p className="text-muted-foreground">Track key action items and their completion status.</p>
          </div>
            <Button asChild variant="outline">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </Link>
            </Button>
        </div>
        
        <Tabs defaultValue="actions">
            <TabsList>
                <TabsTrigger value="actions">Action Items</TabsTrigger>
                <TabsTrigger value="users">Manage Users</TabsTrigger>
            </TabsList>
            <TabsContent value="actions" className="mt-6">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Action Log</CardTitle>
                            <Button><Plus className="mr-2 h-4 w-4" /> Create Action Item</Button>
                        </div>
                        <CardDescription>All tracked action items across all pillars.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <div className="text-center text-muted-foreground p-8 border-dashed border-2 rounded-md">
                            <p>Coming Soon: Action items will be displayed here.</p>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="users" className="mt-6">
                <UserManagement />
            </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
