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
  const [isProcessingComplete, setIsProcessingComplete] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleUnitProcessed = async (processedContent) => {
    const newProcessedUnits = [...processedUnits, processedContent];
    setProcessedUnits(newProcessedUnits);
    
    if (currentUnitIndex < storyUnits.length - 1) {
      setCurrentUnitIndex(currentUnitIndex + 1);
    } else {
      // All units processed, mark processing as complete
      setIsProcessingComplete(true);
    }
  };

  const handleContinue = () => {
    // Redirect to the configuration page
    const encodedUnits = encodeURIComponent(JSON.stringify(processedUnits));
    router.push(`/dashboard/story/configure?units=${encodedUnits}${storyType ? `&type=${storyType}` : ''}`);
  };

  const currentUnit = storyUnits[currentUnitIndex];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {isProcessingComplete 
            ? "Processing Complete" 
            : `Processing Unit ${currentUnitIndex + 1} of ${storyUnits.length}`}
        </h2>
        {!isProcessingComplete && (
          <p className="text-sm text-gray-500">
            Type: {currentUnit.type}
          </p>
        )}
      </div>

      {isProcessingComplete ? (
        <div className="text-center space-y-6 py-8">
          <h3 className="text-xl font-medium">All units have been processed successfully!</h3>
          <p className="text-gray-500">
            You can now configure and generate your story.
          </p>
          <Button 
            size="lg"
            onClick={handleContinue}
          >
            Configure & Continue
          </Button>
        </div>
      ) : currentUnit.type === "interview" ? (
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