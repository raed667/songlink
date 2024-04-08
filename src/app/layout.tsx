import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React from "react";
import clsx from "clsx";
import { Analytics } from "@vercel/analytics/react";

import "./globals.css";
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Song Link",
  description:
    "Share your favorite music with your friends without worrying about which music streaming service they use",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={clsx(inter.className, "h-full antialiased")}>
      <body className="h-full">
        <div className="flex flex-col min-h-full">{children}</div>
        <Analytics />
      </body>
    </html>
  );
}
