"use client";

import StoryUnitUpload from "@/components/StoryUnitUpload";
import { useSearchParams } from "next/navigation";

export default function Create() {
  const searchParams = useSearchParams();
  const storyType = searchParams.get("type") || "article"; // Default to article if no type provided
  
  // Format the story type for display (capitalize first letter)
  const formattedStoryType = storyType.charAt(0).toUpperCase() + storyType.slice(1);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold my-4">Create New Story</h1>
      <p className="font-medium text-primary my-4">Type: {formattedStoryType}</p>
      <p className="mt-4">
        Upload your source materials.
      </p>
      <StoryUnitUpload />
    </div>
  );
}
