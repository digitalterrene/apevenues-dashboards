"use client";
import * as React from "react";
import {
  Home,
  Building2,
  User,
  LogOut,
  CreditCard,
  Calendar,
  Luggage,
  Sparkles,
  Bell,
  LayoutList,
} from "lucide-react";
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
import { NavUser } from "@/components/nav-user";
import Image from "next/image";

interface NavigationItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  subPaths?: string[];
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { open } = useSidebar();
  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const propertyProviderSpecificNavigationItems: NavigationItem[] = [
    {
      path: "/dashboard/properties",
      label: "Properties",
      icon: Building2,
      subPaths: ["/dashboard/properties/create", "/dashboard/properties/edit"],
    },
    { path: "/dashboard/bookings", label: "Bookings", icon: Calendar },
  ];

  const serviceProviderSpecificNavigationItems: NavigationItem[] = [
    {
      path: "/dashboard/services",
      label: "Services Offered",
      icon: Luggage,
    },
    {
      path: "/dashboard/service-requests",
      label: "Service Requests",
      icon: Bell,
    },
  ];

  const commonNavigationItems: NavigationItem[] = [
    { path: "/dashboard", label: "Dashboard", icon: Home, exact: true },
  ];

  const additionalNavigationItems =
    user?.businessType === "service-provider"
      ? serviceProviderSpecificNavigationItems
      : propertyProviderSpecificNavigationItems;

  const navigationItems: NavigationItem[] = [
    ...commonNavigationItems,
    ...additionalNavigationItems,
    {
      path: "/dashboard/subscriptions",
      label: "Subscriptions",
      icon: CreditCard,
    },
    { path: "/dashboard/profile", label: "Profile", icon: User },
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
                <div className="bg-[#6BADA0] font-bold text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  APE
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    Amalgamated Properties & Events
                  </span>
                  <span className="truncate text-xs">Business Dashboard</span>
                </div>
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
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
