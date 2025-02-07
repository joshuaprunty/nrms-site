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
import Link from "next/link";

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
      <div className="flex justify-center">
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-12 w-full max-w-4xl"
          size="lg"
        >
          <Plus className="w-5 h-5" />
          Add Story Unit
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New Story Unit</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Select
              value={unitType}
              onValueChange={setUnitType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select unit type" />
              </SelectTrigger>
              <SelectContent>
                {UNIT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              value={unitText}
              onChange={(e) => setUnitText(e.target.value)}
              placeholder="Paste your content here..."
              className="min-h-[200px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!unitText.trim() || !unitType}>
              Add Unit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 gap-4 max-w-4xl mx-auto">
        {storyUnits.map((unit) => (
          <Card key={unit.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {UNIT_TYPES.find(t => t.value === unit.type)?.label}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteUnit(unit.id)}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {getPreviewText(unit.text)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <Link href="/dashboard/generation">
          <Button
            className="flex items-center gap-2 px-12 shadow-lg"
            size="lg"
          >
            Continue
          </Button>
        </Link>
      </div>
    </div>
  );
}