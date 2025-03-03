"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import FormatCard from "./FormatCard";
import Link from "next/link";
export default function TextInput() {
  const { toast } = useToast();

  return (
    <div className="space-y-8 my-12 max-w-7xl">
      <h1 className="text-4xl font-semibold text-center">Select the format that best matches your project.</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/createstory/upload?type=article">
          <FormatCard title="Article" description="Create an article covering a specific topic." />
        </Link>
        <Link href="/dashboard/createstory/upload?type=blog">
          <FormatCard title="Blog Post" description="Create a blog-style post with a narrative structure." />
        </Link>
        <Link href="/dashboard/createstory/upload?type=social">
          <FormatCard title="Social Media Post" description="Create captions or standalone posts for common platforms." />
        </Link>
      </div>
      <div className="flex justify-center">
        <Button disabled>
          Advanced Configuration
        </Button>
      </div>
    </div>
  );
}
