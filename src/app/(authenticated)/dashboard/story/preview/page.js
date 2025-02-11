"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SaveStoryModal from "@/components/SaveStoryModal";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import saveStory from "@/firebase/firestore/saveStory";

export default function StoryPreview() {
  const searchParams = useSearchParams();
  const encodedData = searchParams.get("data");
  const storyData = encodedData ? JSON.parse(decodeURIComponent(encodedData)) : null;
  
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuthContext();

  const handleSaveStory = async (title) => {
    if (!user || !storyData) return;

    setIsSaving(true);
    try {
      const { error } = await saveStory(user.uid, {
        title,
        ...storyData,
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

  if (!storyData) {
    return <div>No story data found</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Story Preview</h1>
      
      <Card>
        <CardContent className="prose prose-sm max-w-none p-6">
          {storyData.story.split('\n').map((paragraph, index) => (
            paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          Edit
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