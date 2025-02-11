"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/context/AuthContext";
import saveStory from "@/firebase/firestore/saveStory";
import SaveStoryModal from "./SaveStoryModal";

const UNIT_TYPES = [
  { value: "interview", label: "Interview Transcript" },
  { value: "data", label: "Data/Statistics" },
  { value: "quote", label: "Quote" },
  { value: "snippet", label: "Writing Snippet" },
  { value: "research", label: "Research Notes" },
  { value: "background", label: "Background Information" },
];

export default function StoryUnitUpload() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unitText, setUnitText] = useState("");
  const [unitType, setUnitType] = useState("");
  const [storyUnits, setStoryUnits] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedStory, setGeneratedStory] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuthContext();
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveDisabled, setSaveDisabled] = useState(false);
  const [fullStoryObject, setFullStoryObject] = useState(null);

  const handleSubmit = () => {
    if (!unitText.trim() || !unitType) return;

    setStoryUnits([...storyUnits, { type: unitType, content: unitText.trim() }]);
    setUnitText("");
    setUnitType("");
    setIsModalOpen(false);
  };

  const handleDeleteUnit = (index) => {
    if (confirm("Are you sure you want to delete this story unit?")) {
      setStoryUnits(storyUnits.filter((_, i) => i !== index));
    }
  };

  const handleProcessUnits = async () => {
    if (storyUnits.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please add at least one story unit before processing.",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const response = await fetch("/api/storygen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: storyUnits }),
      });

      if (!response.ok) throw new Error("Story generation failed");

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      // Instead of setting state, redirect to the preview page with the story data
      const encodedStory = encodeURIComponent(JSON.stringify(data));
      router.push(`/dashboard/story/preview?data=${encodedStory}`);
      
    } catch (error) {
      console.error("Error generating story:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate story",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveStory = async (title) => {
    if (!user) {
      console.error("User not authenticated");
      return;
    }

    setIsSaving(true);
    try {
      const storyData = {
        title,
        ...fullStoryObject,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { error } = await saveStory(user.uid, storyData);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error,
        });
        return;
      }

      setIsSaveModalOpen(false);
      setSaveDisabled(true);

      toast({
        variant: "success",
        title: "Story Saved",
        description: "Your story has been successfully saved. Navigating to dashboard...",
      });

      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    } catch (error) {
      console.error("Error saving story:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-12 w-full max-w-4xl"
          size="lg"
        >
          <Plus className="w-5 h-5" />
          Add Story Unit
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New Story Unit</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Select value={unitType} onValueChange={setUnitType}>
              <SelectTrigger>
                <SelectValue placeholder="Select unit type" />
              </SelectTrigger>
              <SelectContent>
                {UNIT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              value={unitText}
              onChange={(e) => setUnitText(e.target.value)}
              placeholder="Enter your story unit text..."
              className="min-h-[200px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!unitText.trim() || !unitType}>
              Add Unit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 gap-4 max-w-4xl mx-auto">
        <h2 className="text-lg font-semibold">Story Units</h2>
        {storyUnits.map((unit, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {UNIT_TYPES.find(t => t.value === unit.type)?.label || unit.type} - Unit {index + 1}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteUnit(index)}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{unit.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {generatedStory && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold mb-4">Generated Story</h2>
          <Card>
            <CardContent className="prose prose-sm max-w-none p-6">
              {generatedStory.split('\n').map((paragraph, index) => (
                paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {generatedStory && (
        <div className="flex justify-center mt-4">
          <Button
            onClick={() => setIsSaveModalOpen(true)}
            className="px-12"
            disabled={saveDisabled}
          >
            Save Story
          </Button>
        </div>
      )}

      {storyUnits.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <Button
            onClick={handleProcessUnits}
            disabled={isProcessing}
            className="flex items-center gap-2 px-12 shadow-lg"
            size="lg"
          >
            {isProcessing ? "Processing..." : "Process Story Units"}
          </Button>
        </div>
      )}

      <SaveStoryModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSaveStory}
        loading={isSaving}
      />
    </div>
  );
}