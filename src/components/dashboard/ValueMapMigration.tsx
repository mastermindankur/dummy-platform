
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { FileCog, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function ValueMapMigration() {
    const [isMigrating, setIsMigrating] = useState(false);

    const handleMigration = async () => {
        setIsMigrating(true);
        try {
            const res = await fetch('/api/data', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'migrate-value-map-filenames' }),
            });

            if (!res.ok) {
                throw new Error('Migration request failed');
            }

            const result = await res.json();
            toast({
                title: 'Migration Complete',
                description: `${result.migrated} file(s) were successfully renamed. ${result.errors} error(s) occurred.`,
            });

        } catch (error) {
            console.error('Migration failed:', error);
            toast({
                title: 'Migration Failed',
                description: 'An error occurred while renaming files. Check the console for details.',
                variant: 'destructive',
            });
        } finally {
            setIsMigrating(false);
        }
    };

    return (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" disabled={isMigrating}>
                {isMigrating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileCog className="mr-2 h-4 w-4"/>}
                Run File Name Migration
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to run the migration?</AlertDialogTitle>
              <AlertDialogDescription>
                This will scan for value map version files with colons (:) in their names and rename them to use hyphens (-) for Windows compatibility. This is a one-time operation and is safe to run.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleMigration} disabled={isMigrating}>
                {isMigrating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Yes, Run Migration
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    )
}
