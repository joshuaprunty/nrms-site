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
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/context/AuthContext";
import saveStory from "@/firebase/firestore/saveStory";
import SaveStoryModal from "./SaveStoryModal";
import { Separator } from "@/components/ui/separator";
const UNIT_TYPES = [
  { value: "interview", label: "Interview Transcript" },
  { value: "quote", label: "Quote" },
  { value: "snippet", label: "Writing Snippet" },
  { value: "background", label: "Background Information" },
  { value: "note", label: "Short Note" },
];

export default function StoryUnitUpload() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unitText, setUnitText] = useState("");
  const [unitType, setUnitType] = useState("");
  const [unitTitle, setUnitTitle] = useState("");
  const [storyUnits, setStoryUnits] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedStory, setGeneratedStory] = useState("");
  const [storyType, setStoryType] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuthContext();
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveDisabled, setSaveDisabled] = useState(false);
  const [fullStoryObject, setFullStoryObject] = useState(null);

  useEffect(() => {
    // Get the story type from URL query parameter
    const type = searchParams.get('type');
    if (type) {
      setStoryType(type);
    }
  }, [searchParams]);

  const handleSubmit = () => {
    if (!unitText.trim() || !unitType) return;

    // Add new unit with the lowest priority (highest number)
    const newPriority = storyUnits.length + 1;
    setStoryUnits([
      ...storyUnits, 
      { 
        type: unitType,
        title: unitTitle.trim() || `Unit ${storyUnits.length + 1}`,
        content: unitText.trim(),
        priority: newPriority 
      }
    ]);
    setUnitText("");
    setUnitType("");
    setUnitTitle("");
    setIsModalOpen(false);
  };

  const handleDeleteUnit = (index) => {
    if (confirm("Are you sure you want to delete this story unit?")) {
      // Remove the unit and recalculate priorities
      const updatedUnits = storyUnits.filter((_, i) => i !== index);
      
      // Reassign priorities to ensure they're sequential
      const reorderedUnits = updatedUnits.map((unit, idx) => ({
        ...unit,
        priority: idx + 1
      }));
      
      setStoryUnits(reorderedUnits);
    }
  };

  const handleMoveUnit = (index, direction) => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === storyUnits.length - 1)
    ) {
      return; // Can't move beyond boundaries
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedUnits = [...storyUnits];
    
    // Swap the units
    [updatedUnits[index], updatedUnits[newIndex]] = [updatedUnits[newIndex], updatedUnits[index]];
    
    // Update priorities to match new positions
    const reorderedUnits = updatedUnits.map((unit, idx) => ({
      ...unit,
      priority: idx + 1
    }));
    
    setStoryUnits(reorderedUnits);
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

    // Include the story type in the URL when redirecting to the processing page
    router.push(`/dashboard/story/process?units=${encodeURIComponent(JSON.stringify(storyUnits))}${storyType ? `&type=${storyType}` : ''}`);
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
    <div className="space-y-6 mt-12">
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New Story Unit</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <label htmlFor="unit-title" className="text-sm font-medium mb-2 block">
                Name
              </label>
              <Input
                id="unit-title"
                value={unitTitle}
                onChange={(e) => setUnitTitle(e.target.value)}
                placeholder="Enter a name for this story unit"
              />
            </div>
            
            <div>
              <label htmlFor="unit-type" className="text-sm font-medium mb-2 block">
                Type
              </label>
              <Select id="unit-type" value={unitType} onValueChange={setUnitType}>
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
            </div>
            
            <div>
              <label htmlFor="unit-content" className="text-sm font-medium mb-2 block">
                Content
              </label>
              <Textarea
                id="unit-content"
                value={unitText}
                onChange={(e) => setUnitText(e.target.value)}
                placeholder="Enter your story unit text..."
                className="min-h-[200px]"
              />
            </div>
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

      <div className="grid grid-cols-1 gap-4 max-w-4xl">
        <h2 className="text-lg font-semibold">Story Units</h2>
        <Separator />
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-12 w-full max-w-4xl"
          size="lg"
        >
          <Plus className="w-5 h-5" />
          Add Story Unit
        </Button>
        {storyUnits.map((unit, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base font-medium">
                  {unit.title}
                </CardTitle>
                <CardDescription className="text-xs text-gray-500 mt-1">
                  {UNIT_TYPES.find(t => t.value === unit.type)?.label || unit.type} 
                  <span className="ml-2">(Priority: {unit.priority})</span>
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleMoveUnit(index, 'up')}
                  disabled={index === 0}
                  className="h-8 w-8 p-0"
                >
                  <ChevronUp className="h-4 w-4 text-gray-500 hover:text-blue-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleMoveUnit(index, 'down')}
                  disabled={index === storyUnits.length - 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronDown className="h-4 w-4 text-gray-500 hover:text-blue-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteUnit(index)}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative h-[100px] overflow-hidden bg-white">
                <p className="text-sm text-gray-600 line-clamp-8">
                  {unit.content}
                </p>
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
              </div>
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