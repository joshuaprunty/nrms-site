import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default function InterviewProcessor({ content, onProcessed }) {
  const [splitUnits, setSplitUnits] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  const processInterview = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/split_atomic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: editedContent }),
      });
      
      const data = await response.json();
      console.log('Split Interview Response:', {
        type: typeof data,
        value: data,
        isArray: Array.isArray(data)
      });
      setSplitUnits(data);
    } catch (error) {
      console.error("Error processing interview:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = () => {
    onProcessed({
      type: "interview",
      content: editedContent,
      processedUnits: splitUnits
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="min-h-[300px]"
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          onClick={processInterview}
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Process Interview"}
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={!splitUnits}
        >
          Confirm & Continue
        </Button>
      </div>

      {splitUnits && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">Processed Q&A Pairs</h3>
            {splitUnits.map((unit, index) => (
              <div key={index} className="mb-4 p-2 border rounded">
                <p className="font-medium">Q: {unit.question}</p>
                <p>A: {unit.answer}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 