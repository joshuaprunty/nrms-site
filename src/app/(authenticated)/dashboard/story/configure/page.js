"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ConfigurePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const encodedUnits = searchParams.get("units");
  const storyType = searchParams.get("type") || "article";
  const processedUnits = encodedUnits ? JSON.parse(decodeURIComponent(encodedUnits)) : [];
  
  const [minLength, setMinLength] = useState("");
  const [maxLength, setMaxLength] = useState("");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  if (processedUnits.length === 0) {
    return <div>No story units found</div>;
  }

  const handleGenerate = async () => {
    // Validate inputs
    if (minLength && maxLength && parseInt(minLength) > parseInt(maxLength)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Minimum length cannot be greater than maximum length",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Prepare configuration options
      const configOptions = {};
      
      if (minLength) configOptions.minLength = parseInt(minLength);
      if (maxLength) configOptions.maxLength = parseInt(maxLength);
      if (additionalInstructions) configOptions.additionalInstructions = additionalInstructions;
      
      const response = await fetch("/api/storygen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          inputs: processedUnits,
          storyType: storyType,
          config: configOptions
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
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Configure Story Generation</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Story Configuration</CardTitle>
          <CardDescription>
            Configure how your story will be generated. All settings are optional.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Story Length</h3>
              <p className="text-sm text-gray-500 mb-2">
                Set the desired word count range for your story
              </p>
              <div className="flex gap-4 items-center">
                <div className="space-y-2">
                  <Label htmlFor="min-length">Minimum Words</Label>
                  <Input
                    id="min-length"
                    type="number"
                    placeholder="e.g., 300"
                    value={minLength}
                    onChange={(e) => setMinLength(e.target.value)}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-length">Maximum Words</Label>
                  <Input
                    id="max-length"
                    type="number"
                    placeholder="e.g., 800"
                    value={maxLength}
                    onChange={(e) => setMaxLength(e.target.value)}
                    min="0"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Additional Instructions</h3>
              <p className="text-sm text-gray-500 mb-2">
                Provide any additional instructions for the AI to consider when generating your story
              </p>
              <Textarea
                placeholder="e.g., Use a formal tone, focus on the human interest angle, include more quotes from the interview..."
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end gap-4">
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          disabled={isGenerating}
        >
          Back
        </Button>
        <Button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Story"
          )}
        </Button>
      </div>
    </div>
  );
} 