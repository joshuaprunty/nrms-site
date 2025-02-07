import FileUpload from "@/components/FileUpload";
import StoryInit from "@/components/StoryInit";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import StoryUnitUpload from "@/components/StoryUnitUpload";

export default function Create() {
  return (
    <div className="p-8">
      <StoryUnitUpload />
    </div>
  );
}
