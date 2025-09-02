"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { analyzeRootCause } from "@/ai/flows/root-cause-analysis";
import type { SubItem, Pillar } from "@/types";
import { Search, Loader2 } from "lucide-react";

type Props = {
  subItem: SubItem;
  pillar: Pillar;
};

export function RootCauseAnalysis({ subItem, pillar }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rootCauses, setRootCauses] = useState<string[]>([]);

  const handleGenerate = async () => {
    setIsLoading(true);
    setRootCauses([]);
    try {
      const result = await analyzeRootCause({
        pillarName: pillar.name,
        statusDescription: `The sub-item '${subItem.name}' has a status of ${subItem.status}. This item tracks: ${subItem.description}.`,
      });
      setRootCauses(result.rootCauses);
    } catch (error) {
      console.error("Error generating root cause analysis:", error);
      toast({
        title: "Error",
        description: "Failed to generate root cause analysis. Please try again.",
        variant: "destructive",
      });
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (subItem.status === "Green") {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={handleGenerate} variant="ghost" size="sm">
          <Search className="mr-2 h-4 w-4" />
          Analyze Root Cause
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Root Cause Analysis for {subItem.name}</DialogTitle>
          <DialogDescription>
            AI-generated potential root causes for the '{subItem.status}'
            status.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          {isLoading && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          {rootCauses.length > 0 && (
            <ul className="list-disc space-y-2 pl-5 text-sm">
              {rootCauses.map((cause, index) => (
                <li key={index}>{cause}</li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
