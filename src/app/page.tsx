"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { CircleX } from "lucide-react";
import { track } from "@vercel/analytics";
import { LinkInput } from "@/components/LinkInput";
import { LinkValidation } from "@/util/validators/type";
import { SearchResult } from "@/util/services/type";
import { Hero } from "@/components/Hero";
import { SupportedServices } from "@/components/SupportedServices";
import { Counter } from "@/components/Counter";

const validate = async (
  link: string
): Promise<{
  validation: LinkValidation;
  source: SearchResult | null;
}> => {
  const response = await fetch("/validate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ link }),
  });
  if (response.ok) return response.json();

  const { error } = await response.json();
  throw new Error(error ?? "Unexpected error occurred.");
};

export default function Home() {
  const router = useRouter();

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (link: string) => {
    if (!link) return;
    try {
      setIsLoading(true);
      setError(null);

      track("Submit Link", { link });

      const { source, validation } = await validate(link);

      if (validation.isValid === false) throw new Error(validation.error);
      if (source == null) throw new Error("Not found.");
      if (validation.isValid === true && source != null) {
        track("Link valid", { link });
        router.push(`/${validation.type}/${source?.key}`);
      }
    } catch (error: any) {
      track("Link Error", { link });
      setError(error.message);
      setIsLoading(false);
    }
  };

  return (
    <main>
      <Hero
        announcement={{
          title: "SongLink.cc is open-source",
          href: "https://github.com/raed667/songlink",
          linkText: "Github",
        }}
      />

      <LinkInput isLoading={isLoading} onSubmit={onSubmit} />

      <div
        className={clsx(
          "text-center mt-4 mx-auto max-w-2xl text-red-500 h-[2rem] font-semibold",
          {
            invisible: !error,
          }
        )}
      >
        {error && <CircleX className="inline mr-2" />}
        {error}
      </div>

      <SupportedServices />
      <Counter />
    </main>
  );
}
