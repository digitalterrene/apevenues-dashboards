"use client";
import React from "react";
import { Button } from "../ui/button";
import { usePathname, useRouter } from "next/navigation";
import { Search, User } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Header() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const pathname = usePathname();
  const isPropertyLisitngPage = pathname === "/listings" ? true : false;
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
              onClick={() =>
                isPropertyLisitngPage
                  ? router.push("/service-listings")
                  : router.push("/listings")
              }
              variant="outline"
              className="border-[#6BADA0] lg:h-auto lg:w-auto h-8 w-8 lg:ml-0 ml-4 cursor-pointer text-[#6BADA0] hover:bg-[#6BADA0] hover:text-white"
            >
              <Search className="h-4 w-4 lg:mr-2" />
              <span className="hidden lg:block">
                Find {isPropertyLisitngPage ? "Services" : "Venues"}
              </span>
            </Button>
            <Link href={!(user?._id || user?.id) ? "/login" : "/dashboard"}>
              <Button
                variant={!(user?._id || user?.id) ? "outline" : "default"}
                className={`lg:h-auto lg:w-auto h-8 w-8 cursor-pointer ${
                  user?._id || user?.id
                    ? "bg-[#6BADA0] cursor-pointer hover:bg-[#6BADA0]/60 hover:text-black "
                    : ""
                }`}
              >
                <User className="lg:hidden  block" />
                <span className="hidden lg:block">
                  {!(user?._id || user?.id) ? "Sign In" : "Go To Dashboard"}
                </span>
              </Button>
            </Link>
            {!(user?._id || user?.id) && (
              <Link href="/signup">
                <Button className="bg-[#6BADA0] lg:h-auto  h-8  cursor-pointer hover:bg-[#6BADA0]/60 hover:text-black ">
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
