import StoryInit from "@/components/StoryInit";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import StoryUnitUpload from "@/components/StoryUnitUpload";

export default function Create() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Create New Story</h1>
      <p className="mt-4">Upload your source materials.</p>
      <StoryUnitUpload />
    </div>
  );
}
