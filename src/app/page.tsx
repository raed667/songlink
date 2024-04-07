"use client";

import { LinkInput } from "@/components/LinkInput";
import { LinkValidation } from "@/util/validators/type";
import React from "react";
import { useRouter } from "next/navigation";
import { SearchResult } from "@/util/services/type";
import { Hero } from "@/components/Hero";
import { SupportedServices } from "@/components/SupportedServices";
import clsx from "clsx";
import { CircleX } from "lucide-react";

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
  const [validation, setValidation] = React.useState<LinkValidation | null>(
    null
  );

  const [source, setSource] = React.useState<SearchResult | null>(null);

  const onSubmit = async (link: string) => {
    if (!link) return;
    try {
      setIsLoading(true);
      setError(null);

      const { source: _source, validation: _validation } = await validate(link);
      setValidation(_validation);
      setSource(_source);

      if (_validation.isValid === false) throw new Error(_validation.error);

      if (_validation.isValid === true && _source != null) {
        router.push(`/${_validation.type}/${_source?.key}`);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-full">
      <Hero
        announcement={{
          title: "song link is open-source",
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
    </main>
  );
}
