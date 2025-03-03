import Link from "next/link"
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"
import Image from "next/image"

export default function Navbar() {
  return (
    <div>
      <div className="border-b bg-background fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex flex-row gap-3">
              <Image src="/Abstract.png" alt="NRMS Logo" layout="fixed" width={32} height={32} />
              <Link href="/" className="font-bold text-2xl">
                NRMS
              </Link>
            </div>
            <NavigationMenu className="ml-auto">
              <NavigationMenuList className="gap-6">
                <NavigationMenuItem>
                  <Link href="/login" legacyBehavior passHref>
                    <NavigationMenuLink className={cn(
                      "group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition-colors bg-gray-900 hover:bg-black text-white"
                    )}>
                      Log In
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
      </div>
    </div>
  )
}