"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/context/AuthContext";
import getStory from "@/firebase/firestore/getStory";
import saveStory from "@/firebase/firestore/saveStory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Send, RotateCcw, Check } from "lucide-react";

export default function StoryView() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State for AI editing
  const [editInstructions, setEditInstructions] = useState("");
  const [isProcessingEdit, setIsProcessingEdit] = useState(false);
  const [currentStory, setCurrentStory] = useState("");
  const [editedStory, setEditedStory] = useState("");
  const [editHistory, setEditHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("current");
  const [isSaving, setIsSaving] = useState(false);
  
  const instructionsRef = useRef(null);

  useEffect(() => {
    if (!user || !params.id) {
      router.push("/dashboard");
      return;
    }

    const fetchStory = async () => {
      const { result, error } = await getStory(user.uid, params.id);
      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch story",
        });
        router.push("/dashboard");
        return;
      }
      setStory(result);
      setCurrentStory(result.story);
      setLoading(false);
    };

    fetchStory();
  }, [user, params.id, router, toast]);

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
          storyUnits: story.storyUnits
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

  const handleAcceptEdit = async () => {
    setIsSaving(true);
    try {
      // Update the current story with the edited version
      setCurrentStory(editedStory);
      
      // Save to database
      const updatedStory = {
        ...story,
        story: editedStory,
        updatedAt: new Date().toISOString()
      };
      
      const { error } = await saveStory(user.uid, updatedStory);
      
      if (error) {
        throw new Error(error);
      }
      
      // Update local state
      setStory(updatedStory);
      setEditedStory("");
      setActiveTab("current");
      
      toast({
        title: "Success",
        description: "Edits applied and saved successfully!",
      });
    } catch (error) {
      console.error("Error saving edited story:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save edited story",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevertEdit = () => {
    setEditedStory("");
    setActiveTab("current");
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!story) {
    return <div className="p-8">Story not found</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{story.title}</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>
      
      {/* Tabs for current and edited versions */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current">Current Version</TabsTrigger>
          <TabsTrigger value="edited" disabled={!editedStory}>Edited Version</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current">
          <Card>
            <CardContent className="prose prose-sm max-w-none p-6">
              {currentStory.split('\n').map((paragraph, index) => (
                paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />
              ))}
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
              disabled={isSaving}
            >
              <RotateCcw className="h-4 w-4" />
              Revert
            </Button>
            <Button 
              onClick={handleAcceptEdit}
              className="flex items-center gap-2"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Accept & Save Changes
                </>
              )}
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
    </div>
  );
} 