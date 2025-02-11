"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { storage } from "@/firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import UserProfileForm from "@/components/auth/UserProfileForm";
import { useRouter } from "next/navigation";
import logout from "@/firebase/auth/logout";

export default function Profile() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [profileUrl, setProfileUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;
    
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      setUserData(userDoc.data());
      if (userDoc.data().profilePicture) {
        setProfileUrl(userDoc.data().profilePicture);
      }
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select an image file.",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Upload to Firebase Storage
      const storageRef = ref(storage, `profile-pictures/${user.uid}`);
      await uploadBytes(storageRef, file);
      
      // Get download URL
      const downloadUrl = await getDownloadURL(storageRef);
      
      // Check if user document exists
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // Create new user document if it doesn't exist
        await setDoc(userDocRef, {
          email: user.email,
          profilePicture: downloadUrl,
          createdAt: new Date().toISOString()
        });
      } else {
        // Update existing document
        await updateDoc(userDocRef, {
          profilePicture: downloadUrl
        });
      }

      setProfileUrl(downloadUrl);
      
      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload profile picture",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await logout();
    if (!error) {
      router.push("/");
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Profile</h1>
      
      <div className="flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-4">
          <Avatar className="h-32 w-32">
            <AvatarImage src={profileUrl} />
            <AvatarFallback>
              {userData?.firstName?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col items-center gap-2">
            <Button variant="outline" className="relative">
              {isUploading ? "Uploading..." : "Change Profile Picture"}
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleImageUpload}
                accept="image/*"
                disabled={isUploading}
              />
            </Button>
          </div>
        </div>

        <UserProfileForm 
          user={user} 
          userData={userData} 
          onUpdate={(newData) => setUserData(prev => ({ ...prev, ...newData }))}
        />

        <Button 
          variant="destructive" 
          onClick={handleLogout}
          className="mt-8"
        >
          Log out
        </Button>
      </div>
    </div>
  );
}