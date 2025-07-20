"use client";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
export default function Dashboard_Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // Function to generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    if (!pathname) return [];

    // Remove /dashboard prefix and split into segments
    const segments = pathname
      .replace(/^\/dashboard/, "")
      .split("/")
      .filter(Boolean);

    // Filter out numeric segments and empty strings
    const filteredSegments = segments.filter(
      (segment) => !/^\d+$/.test(segment)
    );

    // Generate breadcrumb items
    let accumulatedPath = "/dashboard";
    return filteredSegments.map((segment, index) => {
      accumulatedPath += `/${segment}`;
      const isLast = index === filteredSegments.length - 1;
      const displayName = segment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());

      return {
        name: displayName,
        path: accumulatedPath,
        isLast,
      };
    });
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <>
      <ProtectedRoute>
        <Toaster position="top-right" />
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mr-2 data-[orientation=vertical]:h-4"
                />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/dashboard">
                        Dashboard
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {breadcrumbs.map((crumb, index) => (
                      <React.Fragment key={index}>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          {crumb.isLast ? (
                            <BreadcrumbPage className="capitalize">
                              {crumb.name}
                            </BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink
                              href={crumb.path}
                              className="capitalize"
                            >
                              {crumb.name}
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                      </React.Fragment>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </ProtectedRoute>
    </>
  );
}
