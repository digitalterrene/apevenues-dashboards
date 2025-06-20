"use client";
import React from "react";
import { Button } from "../ui/button";
import { usePathname, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import path from "path";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const router = useRouter();
  const { user } = useAuth();
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href={"/"} className="flex items-center  ">
              <span className="text-3xl font-serif font-bold">
                A<span className="text-[#6BADA0]">P</span>E
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => router.push("/listings")}
              variant="outline"
              className="border-[#6BADA0] cursor-pointer text-[#6BADA0] hover:bg-[#6BADA0] hover:text-white"
            >
              <Search className="h-4 w-4 mr-2" />
              Find Venues
            </Button>
            <Link href={!(user?._id || user?.id) ? "/login" : "dashboard"}>
              <Button
                variant={!(user?._id || user?.id) ? "outline" : "default"}
                className={`cursor-pointer ${
                  user?._id || user?.id
                    ? "bg-[#6BADA0] cursor-pointer hover:bg-[#6BADA0]/60 hover:text-black "
                    : ""
                }`}
              >
                {!(user?._id || user?.id) ? "Sign In" : "Go To Dashboard"}
              </Button>
            </Link>
            {!(user?._id || user?.id) && (
              <Link href="/signup">
                <Button className="bg-[#6BADA0] cursor-pointer hover:bg-[#6BADA0]/60 hover:text-black ">
                  List Your Venue
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
