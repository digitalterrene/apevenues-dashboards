"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  return (
    <>
      {!pathname?.includes("dashboard") && (
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-3">
                  <Link className="" href={"/"}>
                    <h1 className="text-xl lg:text-2xl font-bold text-white">
                      APE{" "}
                      {pathname !== "/listings"
                        ? "Dashboard"
                        : "Book Properties"}
                    </h1>
                  </Link>
                </div>
                <p className="text-gray-400">
                  Connecting venues with perfect events since 2024.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-4">For Venues</h3>
                <ul className="space-y-2 text-gray-400">
                  <li className="hover:text-[#6BADA0]">
                    <Link href={"/signup"}>List Your Venue</Link>
                  </li>
                  <li className="hover:text-[#6BADA0]">
                    <Link href={"/login"}> List Your Service</Link>
                  </li>
                  <li className="hover:text-[#6BADA0]">
                    <Link href={"/login"}> Business Login</Link>
                  </li>
                  <li className="hover:text-[#6BADA0]">
                    <Link href={"/dashboard/subscriptions"}>
                      Subscription Plans
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">For Customers</h3>
                <ul className="space-y-2 text-gray-400">
                  <li className="hover:text-[#6BADA0]">
                    <Link href={"/listings"}> Find Venues</Link>
                  </li>
                  <li className="hover:text-[#6BADA0]">
                    <Link href={"https://apevenues.com/about"}>About Us </Link>
                  </li>
                  <li></li>
                  {/* <li>Event Planning Tips</li> */}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Support</h3>
                <ul className="space-y-2 text-gray-400">
                  <li className="hover:text-[#6BADA0]">
                    <Link href={"/listings"}>Requently Asked Questions</Link>
                  </li>
                  <li className="hover:text-[#6BADA0]">
                    <Link href={"https://apevenues.com/contact"}>
                      Contact Us
                    </Link>
                  </li>
                  {/* <li>Contact Us</li>
              <li>Terms of Service</li>
              <li>Privacy Policy</li> */}
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 lg:text-center text-gray-400">
              <div className="lg:flex flex-col md:flex-row justify-between items-center">
                <p className="text-gray-400 mb-4 md:mb-0">
                  &copy; {currentYear} APE - Amalgamated Property & Events. All
                  rights reserved.
                </p>
                <div className="flex space-x-6">
                  <Link
                    href="/privacy-policy"
                    className="text-gray-400 hover:text-ape-teal transition-colors"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href="/terms"
                    className="text-gray-400 hover:text-ape-teal transition-colors"
                  >
                    Terms of Service
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </footer>
      )}
    </>
  );
}
