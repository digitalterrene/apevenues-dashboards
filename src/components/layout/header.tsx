"use client";
import React from "react";
import { Button } from "../ui/button";
import { usePathname, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import path from "path";
import Link from "next/link";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href={"/"}
              className="w-10 h-10  rounded-lg flex items-center justify-center"
            >
              <img src="/logo.svg" className="text-white font-bold text-xl" />
            </Link>
            <h1 className="text-2xl font-bold text-orange-600">
              {pathname !== "/listings"
                ? "Dashboard"
                : "Amalgamated Properties & Events"}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => router.push("/listings")}
              variant="outline"
              className="border-orange-600 text-orange-600 hover:bg-orange-50"
            >
              <Search className="h-4 w-4 mr-2" />
              Find Venues
            </Button>
            <Button onClick={() => router.push("/login")} variant="outline">
              Sign In
            </Button>
            <Button
              onClick={() => router.push("/signup")}
              className="bg-orange-600 hover:bg-orange-700"
            >
              List Your Venue
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
