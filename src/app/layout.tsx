import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Footer from "@/components/footer";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "APE Dashboard – Manage Your Venues | Amalgamated Property & Events",
  description:
    "Access your APE dashboard to list, manage, and promote your venues across South Africa. Streamline your property management and connect with event planners effortlessly.",
  keywords: [
    "APE dashboard",
    "venue management",
    "property listing",
    "event venues South Africa",
    "APEvenues",
    "Amalgamated Property & Events",
    "business dashboard",
  ],
  metadataBase: new URL("https://apevenues.com"),
  alternates: {
    canonical: "https://apevenues.com/dashboard",
  },
  openGraph: {
    title: "APE Dashboard – Manage Your Venues | Amalgamated Property & Events",
    description:
      "List and manage your event venues with APE. Reach event planners and clients across South Africa through our streamlined dashboard.",
    url: "https://apevenues.com/dashboard",
    siteName: "APE – Amalgamated Property & Events",
    type: "website",
    locale: "en_ZA",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "APE Dashboard – Venue Management",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "APE Dashboard – Manage Your Venues | Amalgamated Property & Events",
    description:
      "Easily list and manage your venues on APE. Connect with event planners and clients across South Africa.",
    images: ["https://apevenues.com/og-image.jpg"],
  },
  themeColor: "#ffffff",
  viewport: "width=device-width, initial-scale=1.0",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SidebarProvider>
          <AuthProvider>{children}</AuthProvider>
        </SidebarProvider>
        <Footer />
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
