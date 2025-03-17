import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "PG.chat",
  description: "An AI version of Paul Graham, based on his essays.",
  openGraph: {
    title: "PG.chat",
    description: "An AI version of Paul Graham, based on his essays.",
    images: [{ url: "/thumb.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PG.chat",
    description: "An AI version of Paul Graham, based on his essays.",
    images: ["/thumb.png"],
  },
  themeColor: "#f26522",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={cn("flex min-h-svh flex-col antialiased", inter.className)}
      >
        <TooltipProvider delayDuration={0}>
          {children}
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}

import "./globals.css";
