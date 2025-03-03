import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InterviewProcessor from "./processors/InterviewProcessor";
import GenericProcessor from "./processors/GenericProcessor";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function ProcessingWorkflow({ storyUnits, storyType }) {
  const [currentUnitIndex, setCurrentUnitIndex] = useState(0);
  const [processedUnits, setProcessedUnits] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleUnitProcessed = async (processedContent) => {
    const newProcessedUnits = [...processedUnits, processedContent];
    setProcessedUnits(newProcessedUnits);
    
    if (currentUnitIndex < storyUnits.length - 1) {
      setCurrentUnitIndex(currentUnitIndex + 1);
    } else {
      // All units processed, generate story
      setIsGenerating(true);
      try {
        const response = await fetch("/api/storygen", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            inputs: newProcessedUnits,
            storyType: storyType || 'article' // Default to article if no type provided
          }),
        });

        if (!response.ok) throw new Error("Failed to generate story");
        
        const storyData = await response.json();
        const encodedStory = encodeURIComponent(JSON.stringify(storyData));
        router.push(`/dashboard/story/preview?data=${encodedStory}${storyType ? `&type=${storyType}` : ''}`);
      } catch (error) {
        console.error("Error generating story:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to generate story",
        });
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const currentUnit = storyUnits[currentUnitIndex];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {isGenerating ? "Generating Story..." : `Processing Unit ${currentUnitIndex + 1} of ${storyUnits.length}`}
        </h2>
        <p className="text-sm text-gray-500">
          Type: {currentUnit.type}
        </p>
      </div>

      {currentUnit.type === "interview" ? (
        <InterviewProcessor 
          content={currentUnit.content}
          onProcessed={handleUnitProcessed}
        />
      ) : (
        <GenericProcessor 
          unit={currentUnit}
          onProcessed={handleUnitProcessed}
        />
      )}
    </div>
  );
} 