"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react"; // Make sure to install lucide-react
import { MdOutlineDelete } from "react-icons/md";


const UNIT_TYPES = [
  { value: "interview", label: "Interview Transcript" },
  { value: "data", label: "Data/Statistics" },
  { value: "quote", label: "Quote" },
  { value: "snippet", label: "Writing Snippet" },
  { value: "research", label: "Research Notes" },
];

export default function StoryUnitUpload() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unitText, setUnitText] = useState("");
  const [unitType, setUnitType] = useState("");
  const [storyUnits, setStoryUnits] = useState([]);

  const handleSubmit = () => {
    if (!unitText.trim() || !unitType) return;

    const newUnit = {
      id: Date.now(),
      text: unitText.trim(),
      type: unitType,
      timestamp: new Date().toISOString(),
    };

    setStoryUnits([...storyUnits, newUnit]);
    setUnitText("");
    setUnitType("");
    setIsModalOpen(false);
  };

  const getPreviewText = (text) => {
    return text.length > 150 ? text.substring(0, 150) + "..." : text;
  };

  const handleDeleteUnit = (id) => {
    if (confirm("Are you sure you want to delete this story unit?")) {
      setStoryUnits(storyUnits.filter(unit => unit.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      Loading
    </div>
  );
}