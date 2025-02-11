"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/context/AuthContext";
import getStory from "@/firebase/firestore/getStory";

export default function StoryView() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    };

    fetchStory();
  }, [user, params.id, router, toast]);

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
      
      <Card>
        <CardContent className="prose prose-sm max-w-none p-6">
          {story.story.split('\n').map((paragraph, index) => (
            paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
} 