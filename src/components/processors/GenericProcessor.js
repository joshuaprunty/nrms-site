import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const IMPORTANCE_LEVELS = [
  { value: "5", label: "Critical" },
  { value: "4", label: "High" },
  { value: "3", label: "Medium" },
  { value: "2", label: "Low" },
  { value: "1", label: "Background" },
];

export default function GenericProcessor({ unit, onProcessed }) {
  const [editedContent, setEditedContent] = useState(unit.content);
  const [importance, setImportance] = useState("3"); // Default to medium importance
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedContent, setProcessedContent] = useState(null);

  const handleProcess = async () => {
    setIsProcessing(true);
    
    // If content is longer than 300 words, attempt to summarize
    const wordCount = editedContent.split(/\s+/).length;
    
    if (wordCount > 300) {
      try {
        const response = await fetch("/api/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            content: editedContent,
            type: unit.type
          }),
        });
        
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        
        setProcessedContent(data.summary);
      } catch (error) {
        console.error("Error processing content:", error);
        // If error, just use the original content
        setProcessedContent(editedContent);
      }
    } else {
      // If content is short enough, use as is
      setProcessedContent(editedContent);
    }
    
    setIsProcessing(false);
  };

  const handleConfirm = () => {
    onProcessed({
      type: unit.type,
      content: processedContent || editedContent,
      importance: parseInt(importance),
      originalContent: unit.content
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Original Content</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="min-h-[200px]"
          />
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <Select value={importance} onValueChange={setImportance}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select importance" />
          </SelectTrigger>
          <SelectContent>
            {IMPORTANCE_LEVELS.map((level) => (
              <SelectItem key={level.value} value={level.value}>
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={handleProcess}
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Process Content"}
        </Button>
      </div>

      {processedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Processed Content</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <p className="whitespace-pre-wrap">{processedContent}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleConfirm}
          disabled={isProcessing}
        >
          Confirm & Continue
        </Button>
      </div>
    </div>
  );
} 