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
import { generateExecutiveSummary } from "@/ai/flows/generate-executive-summary";
import { Sparkles, Loader2 } from "lucide-react";

type Props = {
  pillarStatuses: Record<string, "Green" | "Amber" | "Red">;
  subItemStatuses: Record<string, "Green" | "Amber" | "Red">;
};

export function ExecutiveSummary({ pillarStatuses, subItemStatuses }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState("");

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setSummary("");
    try {
      const result = await generateExecutiveSummary({
        pillarStatuses,
        subItemStatuses,
      });
      setSummary(result.summary);
    } catch (error) {
      console.error("Error generating executive summary:", error);
      toast({
        title: "Error",
        description: "Failed to generate executive summary. Please try again.",
        variant: "destructive",
      });
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => handleGenerateSummary()}>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Executive Summary
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Executive Summary</DialogTitle>
          <DialogDescription>
            AI-generated summary of the WCE 2025 program health.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          {isLoading && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          {summary && (
            <div className="prose prose-sm prose-invert max-w-none whitespace-pre-wrap">
              {summary}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
