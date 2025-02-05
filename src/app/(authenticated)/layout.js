"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNav";
import { GoHome } from "react-icons/go";
import { IoAddCircleOutline } from "react-icons/io5";
import { usePathname } from "next/navigation";

const navigationItems = [
  { href: "/dashboard", label: "Dashboard", icon: GoHome },
  { href: "/dashboard/create", label: "Create New", icon: IoAddCircleOutline },
];

export default function AuthenticatedLayout({ children }) {
  const pathname = usePathname();

  const isActive = (path) => {
    if (path === "/dashboard" && pathname === "/dashboard") return true;
    return pathname.startsWith(path) && path !== "/dashboard";
  };

  return (
    <div>
      <DashboardNavbar />
      {/* Mobile Sheet/Drawer */}
      <Sheet>
        <SheetTrigger asChild className="fixed left-4 top-4 lg:hidden z-40">
          <Button variant="outline" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px] pt-16">
          <nav className="flex flex-col gap-4">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-lg rounded-md px-2 py-1 ${
                  isActive(item.href) ? "bg-blue-50 text-blue-700" : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-[calc(100vh-64px)] w-64 flex-col fixed left-0 top-16 bottom-0 border-r bg-background">
        <nav className="flex flex-col gap-4 p-6">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-lg flex items-center gap-2 rounded-md px-2 py-1 ${
                  isActive(item.href) ? "bg-blue-50 text-blue-700" : ""
                }`}
              >
                <Icon
                  className={`h-6 w-6 ${
                    isActive(item.href) ? "text-blue-700" : ""
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      {/* Main Content */}
      <div className="lg:pl-64 pt-16">{children}</div>
    </div>
  );
}
