import Link from "next/link"
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu"
import { FaRegUserCircle } from "react-icons/fa"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation";
import logout from "@/firebase/auth/logout";


export default function DashboardNavbar() {
  const { user } = useAuthContext();
  const [profileUrl, setProfileUrl] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchProfilePicture();
    }
  }, [user]);

  const fetchProfilePicture = async () => {
    if (!user) return;
    
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists() && userDoc.data().profilePicture) {
      setProfileUrl(userDoc.data().profilePicture);
    }
  };

  const handleLogout = async () => {
    const { error } = await logout();
    if (!error) {
      router.push("/login");
    }
  };

  return (
    <div className="border-b bg-background fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-shrink-0">
            <Link href="/" className="font-bold text-2xl">
              NRMS
            </Link>
          </div>
          <NavigationMenu className="ml-auto">
            <NavigationMenuList className="gap-6">
              <NavigationMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center">
                    <Avatar>
                      <AvatarImage src={profileUrl} />
                      <AvatarFallback>
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </div>
  )
}