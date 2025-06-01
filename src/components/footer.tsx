"use client";
import { useRouter } from "next/navigation";
import React from "react";

export default function Footer() {
  const router = useRouter();
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
              <span className="text-xl font-bold">APE Dashboard</span>
            </div>
            <p className="text-gray-400">
              Connecting venues with perfect events since 2024.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">For Venues</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button onClick={() => router.push("/signup")}>
                  List Your Venue
                </button>
              </li>
              <li>
                <button onClick={() => router.push("/login")}>
                  Business Login
                </button>
              </li>
              <li>Pricing Plans</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">For Customers</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button onClick={() => router.push("/listings")}>
                  Find Venues
                </button>
              </li>
              <li>Browse by Location</li>
              <li>Event Planning Tips</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Help Center</li>
              <li>Contact Us</li>
              <li>Terms of Service</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 APE Dashboard. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
