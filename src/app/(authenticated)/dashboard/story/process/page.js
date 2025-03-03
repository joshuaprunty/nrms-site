"use client";

import { useSearchParams } from "next/navigation";
import ProcessingWorkflow from "@/components/ProcessingWorkflow";

export default function ProcessPage() {
  const searchParams = useSearchParams();
  const encodedUnits = searchParams.get("units");
  const storyType = searchParams.get("type");
  const storyUnits = encodedUnits ? JSON.parse(decodeURIComponent(encodedUnits)) : [];

  if (storyUnits.length === 0) {
    return <div>No story units found</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Process Story Units</h1>
      <ProcessingWorkflow storyUnits={storyUnits} storyType={storyType} />
    </div>
  );
} 