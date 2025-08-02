"use client"; 
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "../ui/button";

const NotFound = () => {
  const pathname = usePathname();
  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      pathname
    );
  }, [pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <Link href={"/"} className="mt-10 ">
          <Button className="cursor-pointer bg-[#6BADA0]">Return Home</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
