"use client";
import * as React from "react";
import { User, CreditCard, Key } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "./ui/button";
import Image from "next/image";

interface NavigationItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  subPaths?: string[];
}

export function AdminAppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const pathname = usePathname();
  const { open } = useSidebar();

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", {
        method: "DELETE",
      });
      window.location.href = "/admin/login";
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const navigationItems: NavigationItem[] = [
    {
      path: "#",
      label: "Key Bundles",
      icon: Key,
    },
    { path: "#", label: "Subscriptions", icon: CreditCard },
  ];

  const isActive = (item: NavigationItem) => {
    if (item.exact) {
      return pathname === item.path;
    }
    return (
      pathname.startsWith(item.path) ||
      (item.subPaths &&
        item.subPaths.some((subPath: string) => pathname.startsWith(subPath)))
    );
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/" className="">
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent cursor-pointer data-[state=open]:text-sidebar-accent-foreground"
              >
                <Image
                  alt="APE Dashboard Logo"
                  height={14}
                  width={200}
                  src={"/logo.svg"}
                  className="  font-serif font-bold"
                />
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <div className={open ? "px-3" : ""}>
          <SidebarMenu>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={active}
                    className="w-full mx-auto"
                  >
                    <button
                      onClick={() => router.push(item.path)}
                      className={`flex cursor-pointer items-center space-x-3 w-full px-3 py-2 rounded-md transition-colors ${
                        active
                          ? "bg-[#F1F0FB] text-[#6BADA0] font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {open && <span>{item.label}</span>}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </div>
      </SidebarContent>
      <SidebarFooter>
        <Button
          variant="outline"
          className="w-full mt-8"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
