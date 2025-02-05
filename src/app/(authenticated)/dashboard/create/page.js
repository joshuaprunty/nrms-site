import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Create() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Create New Story</h1>
      <p className="mt-4">Initialize story generation</p>
      <FileUpload />
    </div>
  );
}
