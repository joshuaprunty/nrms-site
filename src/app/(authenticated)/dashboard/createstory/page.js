import StoryInit from "@/components/StoryInit";

export default function Create() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Create New Story</h1>
      <p className="mt-4">Select a story type to get started.</p>
      <StoryInit />
    </div>
  );
}
