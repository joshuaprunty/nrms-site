"use client";
import DeleteQuizModal from "@/components/DeleteQuizModal";
import { useAuthContext } from "@/context/AuthContext";
import deleteQuiz from "@/firebase/firestore/deleteQuiz";
import getUserStories from "@/firebase/firestore/getUserStories";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TbSettings } from "react-icons/tb";

import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { user } = useAuthContext();
  const router = useRouter();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user == null) {
      router.push("/");
      return;
    }

    const fetchStories = async () => {
      const { result, error } = await getUserStories(user.uid);
      if (error) {
        console.error("Error fetching stories:", error);
        return;
      }
      setStories(result);
      setLoading(false);
    };

    fetchStories();
  }, [user, router]);

  const handleDeleteClick = (story) => {
    setSelectedStory(story);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStory) return;

    setIsDeleting(true);
    try {
      const { error } = await deleteStory(user.uid, selectedStory.id);
      if (error) {
        console.error("Error deleting story:", error);
        return;
      }

      // Refresh stories list
      const { result } = await getUserStories(user.uid);
      setStories(result);
      
      toast({
        title: "Success",
        description: "Story deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting story:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete story.",
      });
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setSelectedStory(null);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold my-2">Dashboard</h1>
      <p className="my-2">Welcome to your dashboard!</p>
      <Link href="/dashboard/createstory">
        <Button className="w-full max-w-7xl my-2">+ Create New Story</Button>
      </Link>
      <Separator className="my-6 max-w-7xl" />
      
      {stories.length === 0 ? (
        <p className="text-gray-500">
          No stories created yet. Create your first story!
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl">
          {stories.map((story) => (
            <Card key={story.id} className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="relative h-[200px] md:h-full p-4 bg-white overflow-hidden">
                  <p className="text-xs text-gray-600 line-clamp-[12]">
                    {story.story}
                  </p>
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />
                </div>
                <div className="p-6 flex flex-col justify-center">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-2xl whitespace-nowrap overflow-hidden text-ellipsis">
                      {story.title}
                    </CardTitle>
                  </CardHeader>
                  <CardFooter className="p-0 mt-4 flex gap-2">
                    <Link
                      href={`/dashboard/story/${story.id}`}
                      className="flex-1"
                    >
                      <Button className="w-full">View</Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <TbSettings className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteClick(story)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardFooter>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <DeleteQuizModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedStory(null);
        }}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
        quizTitle={selectedStory?.title}
      />
    </div>
  );
}