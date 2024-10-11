"use client";

import React from "react";
import { LinkInput } from "@/components/LinkInput";
import { Hero } from "@/components/Hero";
import { SupportedServices } from "@/components/SupportedServices";
import { Counter } from "@/components/Counter";

export default function Home() {
  return (
    <main>
      <Hero
        announcement={{
          title: "SongLink.cc is open-source",
          href: "https://github.com/raed667/songlink",
          linkText: "Github",
        }}
      />

      <LinkInput />

      <SupportedServices />
      <Counter />
    </main>
  );
}
