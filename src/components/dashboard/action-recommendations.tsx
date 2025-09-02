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
import { getActionRecommendations } from "@/ai/flows/action-recommendations";
import type { Pillar } from "@/types";
import { Lightbulb, Loader2 } from "lucide-react";

export function ActionRecommendations({ pillar }: { pillar: Pillar }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const handleGenerate = async () => {
    setIsLoading(true);
    setRecommendations([]);
    try {
      const pillarStatus = pillar.subItems.some((s) => s.status === "Red")
        ? "Red"
        : pillar.subItems.some((s) => s.status === "Amber")
        ? "Amber"
        : "Green";

      const result = await getActionRecommendations({
        pillarName: pillar.name,
        pillarStatus: pillarStatus,
        subItems: pillar.subItems.map((s) => ({
          name: s.name,
          status: s.status,
        })),
      });
      setRecommendations(result.recommendations);
    } catch (error) {
      console.error("Error generating recommendations:", error);
      toast({
        title: "Error",
        description:
          "Failed to generate action recommendations. Please try again.",
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
        <Button onClick={handleGenerate} variant="outline">
          <Lightbulb className="mr-2 h-4 w-4" />
          Get Action Recommendations
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Action Recommendations for {pillar.name}</DialogTitle>
          <DialogDescription>
            AI-generated actions to improve pillar health.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          {isLoading && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          {recommendations.length > 0 && (
            <ul className="list-disc space-y-2 pl-5 text-sm">
              {recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
