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
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown, Beaker } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/context/AuthContext";
import saveStory from "@/firebase/firestore/saveStory";
import SaveStoryModal from "./SaveStoryModal";
import { Separator } from "@/components/ui/separator";
const UNIT_TYPES = [
  { value: "interview", label: "Interview Transcript" },
  { value: "quote", label: "Quote" },
  { value: "snippet", label: "Writing Snippet" },
  { value: "background", label: "Background Information" },
  { value: "note", label: "Short Note" },
];

export default function StoryUnitUpload() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unitText, setUnitText] = useState("");
  const [unitType, setUnitType] = useState("");
  const [unitTitle, setUnitTitle] = useState("");
  const [storyUnits, setStoryUnits] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedStory, setGeneratedStory] = useState("");
  const [storyType, setStoryType] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuthContext();
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveDisabled, setSaveDisabled] = useState(false);
  const [fullStoryObject, setFullStoryObject] = useState(null);

  useEffect(() => {
    // Get the story type from URL query parameter
    const type = searchParams.get('type');
    if (type) {
      setStoryType(type);
    }
  }, [searchParams]);

  const handleSubmit = () => {
    if (!unitText.trim() || !unitType) return;

    // Add new unit with the lowest priority (highest number)
    const newPriority = storyUnits.length + 1;
    setStoryUnits([
      ...storyUnits, 
      { 
        type: unitType,
        title: unitTitle.trim() || `Unit ${storyUnits.length + 1}`,
        content: unitText.trim(),
        priority: newPriority 
      }
    ]);
    setUnitText("");
    setUnitType("");
    setUnitTitle("");
    setIsModalOpen(false);
  };

  const handleDeleteUnit = (index) => {
    if (confirm("Are you sure you want to delete this story unit?")) {
      // Remove the unit and recalculate priorities
      const updatedUnits = storyUnits.filter((_, i) => i !== index);
      
      // Reassign priorities to ensure they're sequential
      const reorderedUnits = updatedUnits.map((unit, idx) => ({
        ...unit,
        priority: idx + 1
      }));
      
      setStoryUnits(reorderedUnits);
    }
  };

  const handleMoveUnit = (index, direction) => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === storyUnits.length - 1)
    ) {
      return; // Can't move beyond boundaries
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedUnits = [...storyUnits];
    
    // Swap the units
    [updatedUnits[index], updatedUnits[newIndex]] = [updatedUnits[newIndex], updatedUnits[index]];
    
    // Update priorities to match new positions
    const reorderedUnits = updatedUnits.map((unit, idx) => ({
      ...unit,
      priority: idx + 1
    }));
    
    setStoryUnits(reorderedUnits);
  };

  const handleProcessUnits = async () => {
    if (storyUnits.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please add at least one story unit before processing.",
      });
      return;
    }

    // Include the story type in the URL when redirecting to the processing page
    router.push(`/dashboard/story/process?units=${encodeURIComponent(JSON.stringify(storyUnits))}${storyType ? `&type=${storyType}` : ''}`);
  };

  const handleSaveStory = async (title) => {
    if (!user) {
      console.error("User not authenticated");
      return;
    }

    setIsSaving(true);
    try {
      const storyData = {
        title,
        ...fullStoryObject,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { error } = await saveStory(user.uid, storyData);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error,
        });
        return;
      }

      setIsSaveModalOpen(false);
      setSaveDisabled(true);

      toast({
        variant: "success",
        title: "Story Saved",
        description: "Your story has been successfully saved. Navigating to dashboard...",
      });

      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    } catch (error) {
      console.error("Error saving story:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrefillExamples = () => {
    // Add example story units for testing
    const exampleUnits = [
      {
        type: "background",
        title: "Test_BG",
        content: "Dr. Evelyn Carter is a leading oncologist and cancer researcher specializing in immunotherapy. She has spent the past two decades studying how the immune system can be harnessed to fight cancer, particularly focusing on personalized cancer vaccines and CAR-T cell therapy. Currently, she leads a research team at the National Cancer Institute, where her latest work involves using AI-driven predictive models to design individualized treatment plans for cancer patients.\nThis interview is conducted by Sarah Jennings, a science journalist with The Medical Times. She has covered advancements in oncology for over a decade and is known for her in-depth and accessible reporting on complex medical topics.",
        priority: 1
      },
      {
        type: "interview",
        title: "Test_Int",
        content: "Sarah Jennings: Dr. Carter, thank you for taking the time to speak with me today. Your research in immunotherapy has been groundbreaking. Can you start by explaining what immunotherapy is and why it has been such a game-changer in cancer treatment?\n\nDr. Evelyn Carter: Thank you, Sarah. Immunotherapy is a type of cancer treatment that leverages the body's own immune system to recognize and destroy cancer cells. Unlike traditional treatments like chemotherapy and radiation, which target both healthy and cancerous cells, immunotherapy is designed to be more precise, reducing collateral damage. It has been revolutionary because it offers long-term remission for some patients, particularly those with aggressive cancers like melanoma and certain types of leukemia.\n\nSarah Jennings: One of the biggest challenges in cancer treatment has been its adaptability—cancer cells mutate quickly and can evade treatment. How does immunotherapy address this issue?\n\nDr. Evelyn Carter: That's an excellent question. Cancer is incredibly dynamic, which makes it difficult to treat with static approaches. Immunotherapy, particularly personalized treatments like CAR-T cell therapy and cancer vaccines, can adapt to these changes.\n\nCAR-T cell therapy, for instance, involves extracting a patient's T cells, genetically modifying them to recognize specific cancer markers, and then reinfusing them into the patient. These engineered cells can persist in the body, continuing to fight cancer even if it mutates. Similarly, personalized cancer vaccines are designed based on a patient's tumor DNA, allowing the immune system to target the unique mutations present in their cancer.\n\nSarah Jennings: CAR-T therapy has seen impressive success in blood cancers, but solid tumors have been more challenging. What are the biggest hurdles, and how is your team working to overcome them?\n\nDr. Evelyn Carter: You're absolutely right—CAR-T therapy has shown remarkable success in treating leukemias and lymphomas, but solid tumors pose additional challenges. One major obstacle is the tumor microenvironment. Solid tumors create a highly suppressive environment that prevents immune cells from attacking them effectively. They also lack well-defined surface markers like blood cancers, making it harder to train CAR-T cells to recognize and attack them.\n\nOur lab is working on multiple strategies to tackle this. One promising avenue is engineering CAR-T cells to resist immunosuppressive signals within the tumor microenvironment. We're also exploring bispecific T-cell engagers (BiTEs), which can help bridge T cells to tumor cells more effectively, enhancing their ability to attack.\n\nSarah Jennings: That's fascinating. You also mentioned AI-driven predictive models earlier. How is artificial intelligence changing the landscape of cancer research and treatment?\n\nDr. Evelyn Carter: AI is becoming an invaluable tool in oncology. One of the most exciting applications is in designing personalized treatment plans. AI algorithms can analyze vast amounts of patient data—genomic information, tumor progression, immune system response—to predict which therapies are most likely to work for an individual patient.\n\nFor example, our team has developed a machine learning model that can predict a patient's response to immunotherapy based on their unique tumor genetics and immune profile. This allows us to move away from a one-size-fits-all approach and toward precision medicine, where treatments are tailored to the patient's specific biology.\n\nAI is also accelerating drug discovery. Instead of spending years in trial-and-error, AI can identify promising drug candidates and optimize them much more quickly. This means that in the future, we could see new, effective treatments reach patients at a much faster pace.\n\nSarah Jennings: That's incredibly promising. Speaking of new treatments, there's been a lot of buzz around cancer vaccines. How close are we to having widely available personalized cancer vaccines?\n\nDr. Evelyn Carter: We are making significant progress. Cancer vaccines work by training the immune system to recognize and attack cancer cells, much like how traditional vaccines protect against infectious diseases. The key to making them effective is personalization—designing a vaccine based on a patient's specific tumor mutations.\n\nSeveral clinical trials are showing great promise. One example is mRNA-based cancer vaccines, similar to the technology used in COVID-19 vaccines. These vaccines can be customized quickly and have shown encouraging early results, particularly in melanoma and lung cancer. I believe that within the next decade, we will see personalized cancer vaccines become a routine part of cancer care.\n\nSarah Jennings: That's a bold prediction! So, looking ahead, what do you think the future of cancer treatment will look like in the next 10 to 20 years?\n\nDr. Evelyn Carter: I truly believe we are entering an era where cancer treatment will be predominantly personalized and less toxic. In the next 10 to 20 years, I expect we will have a suite of targeted therapies that can eradicate many cancers without the severe side effects of traditional treatments. Immunotherapy will likely be the backbone of cancer care, used in combination with AI-driven diagnostics to ensure the right treatment is given to the right patient at the right time.\n\nWe may even reach a point where we can detect and eliminate cancer at its earliest stages before it ever becomes life-threatening. With advancements in liquid biopsies—where we analyze a simple blood sample for cancer markers—early detection could become routine, allowing us to intervene before tumors develop or spread.\n\nSarah Jennings: That would be a game-changer. Dr. Carter, this has been a truly enlightening conversation. Thank you for sharing your expertise and for all the incredible work you and your team are doing.\n\nDr. Evelyn Carter: Thank you, Sarah. It's always a pleasure to discuss these exciting developments. The future of cancer treatment is bright, and I'm optimistic that we are making real strides toward a world where cancer is no longer a deadly disease but a manageable condition.",
        priority: 2
      }
    ];
    
    setStoryUnits(exampleUnits);
    
    toast({
      title: "Example Data Loaded",
      description: "Test story units have been added for testing purposes.",
    });
  };

  return (
    <div className="space-y-6 mt-12">
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New Story Unit</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <label htmlFor="unit-title" className="text-sm font-medium mb-2 block">
                Name
              </label>
              <Input
                id="unit-title"
                value={unitTitle}
                onChange={(e) => setUnitTitle(e.target.value)}
                placeholder="Enter a name for this story unit"
              />
            </div>
            
            <div>
              <label htmlFor="unit-type" className="text-sm font-medium mb-2 block">
                Type
              </label>
              <Select id="unit-type" value={unitType} onValueChange={setUnitType}>
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
            </div>
            
            <div>
              <label htmlFor="unit-content" className="text-sm font-medium mb-2 block">
                Content
              </label>
              <Textarea
                id="unit-content"
                value={unitText}
                onChange={(e) => setUnitText(e.target.value)}
                placeholder="Enter your story unit text..."
                className="min-h-[200px]"
              />
            </div>
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

      <div className="grid grid-cols-1 gap-4 max-w-4xl">
        <h2 className="text-lg font-semibold">Story Units</h2>
        <Separator />
        <div className="flex gap-2">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-12 w-full"
            size="lg"
          >
            <Plus className="w-5 h-5" />
            Add Story Unit
          </Button>
          <Button
            onClick={handlePrefillExamples}
            variant="outline"
            className="flex items-center gap-2"
            size="lg"
          >
            <Beaker className="w-5 h-5" />
            Load Test Data
          </Button>
        </div>
        {storyUnits.map((unit, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base font-medium">
                  {unit.title}
                </CardTitle>
                <CardDescription className="text-xs text-gray-500 mt-1">
                  {UNIT_TYPES.find(t => t.value === unit.type)?.label || unit.type} 
                  <span className="ml-2">(Priority: {unit.priority})</span>
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleMoveUnit(index, 'up')}
                  disabled={index === 0}
                  className="h-8 w-8 p-0"
                >
                  <ChevronUp className="h-4 w-4 text-gray-500 hover:text-blue-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleMoveUnit(index, 'down')}
                  disabled={index === storyUnits.length - 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronDown className="h-4 w-4 text-gray-500 hover:text-blue-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteUnit(index)}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative h-[100px] overflow-hidden bg-white">
                <p className="text-sm text-gray-600 line-clamp-8">
                  {unit.content}
                </p>
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {generatedStory && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold mb-4">Generated Story</h2>
          <Card>
            <CardContent className="prose prose-sm max-w-none p-6">
              {generatedStory.split('\n').map((paragraph, index) => (
                paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {generatedStory && (
        <div className="flex justify-center mt-4">
          <Button
            onClick={() => setIsSaveModalOpen(true)}
            className="px-12"
            disabled={saveDisabled}
          >
            Save Story
          </Button>
        </div>
      )}

      {storyUnits.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <Button
            onClick={handleProcessUnits}
            disabled={isProcessing}
            className="flex items-center gap-2 px-12 shadow-lg"
            size="lg"
          >
            {isProcessing ? "Processing..." : "Process Story Units"}
          </Button>
        </div>
      )}

      <SaveStoryModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSaveStory}
        loading={isSaving}
      />
    </div>
  );
}