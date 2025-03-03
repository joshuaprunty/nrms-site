"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import SaveStoryModal from "@/components/SaveStoryModal";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import saveStory from "@/firebase/firestore/saveStory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Send, RotateCcw, Check } from "lucide-react";

export default function StoryPreview() {
  const searchParams = useSearchParams();
  const encodedData = searchParams.get("data");
  const storyType = searchParams.get("type") || "article"; // Default to article if no type provided
  const storyData = encodedData ? JSON.parse(decodeURIComponent(encodedData)) : null;
  
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuthContext();

  // State for manual editing
  const [isManualEditing, setIsManualEditing] = useState(false);
  
  // State for AI editing
  const [editInstructions, setEditInstructions] = useState("");
  const [isProcessingEdit, setIsProcessingEdit] = useState(false);
  const [currentStory, setCurrentStory] = useState(storyData?.story || "");
  const [editedStory, setEditedStory] = useState("");
  const [editHistory, setEditHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("current");
  
  const instructionsRef = useRef(null);

  const handleSaveStory = async (title) => {
    if (!user || !storyData) return;

    setIsSaving(true);
    try {
      const { error } = await saveStory(user.uid, {
        title,
        ...storyData,
        storyType, // Include the story type when saving
        story: currentStory, // Use the current story content
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error,
        });
        return;
      }

      toast({
        title: "Success",
        description: "Story saved successfully!",
      });
      
      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving story:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save story",
      });
    } finally {
      setIsSaving(false);
      setIsSaveModalOpen(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!editInstructions.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter edit instructions",
      });
      return;
    }

    setIsProcessingEdit(true);
    try {
      const response = await fetch("/api/storyedit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalStory: currentStory,
          editInstructions: editInstructions,
          storyUnits: storyData.storyUnits
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to edit story");
      }

      const result = await response.json();
      
      // Add to edit history
      setEditHistory([
        ...editHistory,
        {
          instructions: editInstructions,
          before: currentStory,
          after: result.editedStory
        }
      ]);
      
      // Update edited story
      setEditedStory(result.editedStory);
      
      // Switch to edited tab
      setActiveTab("edited");
      
      // Clear instructions
      setEditInstructions("");
      
    } catch (error) {
      console.error("Error editing story:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to edit story",
      });
    } finally {
      setIsProcessingEdit(false);
    }
  };

  const handleAcceptEdit = () => {
    setCurrentStory(editedStory);
    setEditedStory("");
    setActiveTab("current");
    
    toast({
      title: "Success",
      description: "Edits applied successfully!",
    });
  };

  const handleRevertEdit = () => {
    setEditedStory("");
    setActiveTab("current");
  };

  const handleManualEdit = (e) => {
    setCurrentStory(e.target.value);
  };

  if (!storyData) {
    return <div>No story data found</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Story Preview</h1>
      
      {/* Display the story type */}
      <p className="text-gray-500">Type: {storyType.charAt(0).toUpperCase() + storyType.slice(1)}</p>
      
      {/* Tabs for current and edited versions */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current">Current Version</TabsTrigger>
          <TabsTrigger value="edited" disabled={!editedStory}>Edited Version</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current">
          <Card>
            <CardContent className="prose prose-sm max-w-none p-6">
              {isManualEditing ? (
                <Textarea
                  value={currentStory}
                  onChange={handleManualEdit}
                  className="w-full h-[500px] p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                currentStory.split('\n').map((paragraph, index) => (
                  paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="edited">
          <Card>
            <CardContent className="prose prose-sm max-w-none p-6">
              {editedStory.split('\n').map((paragraph, index) => (
                paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />
              ))}
            </CardContent>
          </Card>
          
          <div className="flex justify-end gap-4 mt-4">
            <Button 
              variant="outline" 
              onClick={handleRevertEdit}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Revert
            </Button>
            <Button 
              onClick={handleAcceptEdit}
              className="flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Accept Changes
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* AI Edit Interface */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">AI-Assisted Editing</h2>
          <p className="text-sm text-gray-500 mb-4">
            Describe the changes you want to make to the story, and our AI will help you implement them.
          </p>
          
          <div className="flex flex-col gap-4">
            <Textarea
              ref={instructionsRef}
              value={editInstructions}
              onChange={(e) => setEditInstructions(e.target.value)}
              placeholder="e.g., Make the tone more formal, add more details about the main subject, fix grammar issues..."
              className="min-h-[100px]"
              disabled={isProcessingEdit}
            />
            
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmitEdit} 
                disabled={isProcessingEdit || !editInstructions.trim()}
                className="flex items-center gap-2"
              >
                {isProcessingEdit ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Edit Request
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Edit History */}
      {editHistory.length > 0 && (
        <Card className="mt-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Edit History</h2>
            <div className="space-y-4">
              {editHistory.map((edit, index) => (
                <div key={index} className="p-4 border rounded-md">
                  <p className="font-medium">Edit Request {index + 1}:</p>
                  <p className="text-sm text-gray-600 mt-1">{edit.instructions}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="flex justify-end gap-4">
        <Button 
          variant="outline" 
          onClick={() => setIsManualEditing(!isManualEditing)}
          disabled={activeTab !== "current"}
        >
          {isManualEditing ? 'Preview' : 'Manual Edit'}
        </Button>
        <Button onClick={() => setIsSaveModalOpen(true)}>
          Save Story
        </Button>
      </div>

      <SaveStoryModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSaveStory}
        loading={isSaving}
      />
    </div>
  );
} 