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
import type { SubItem } from "@/types";
import { Lightbulb, Loader2 } from "lucide-react";

type ActionRecommendationsProps = {
  pillarName: string;
  pillarSubItems: Pick<SubItem, 'name' | 'status'>[];
};

export function ActionRecommendations({ pillarName, pillarSubItems }: ActionRecommendationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const handleGenerate = async () => {
    setIsLoading(true);
    setRecommendations([]);
    try {
      const pillarStatus = pillarSubItems.some((s) => s.status === "Red")
        ? "Red"
        : pillarSubItems.some((s) => s.status === "Amber")
        ? "Amber"
        : "Green";

      const result = await getActionRecommendations({
        pillarName: pillarName,
        pillarStatus: pillarStatus,
        subItems: pillarSubItems.map((s) => ({
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
          <DialogTitle>Action Recommendations for {pillarName}</DialogTitle>
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
