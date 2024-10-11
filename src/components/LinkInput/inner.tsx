"use client";

import { useFormStatus } from "react-dom";
import clsx from "clsx";
import { ChevronRight, LoaderCircle } from "lucide-react";

export const Inner: React.FC = () => {
  "use client";
  const { pending } = useFormStatus();

  return (
    <>
      <input
        id="input_link"
        type="url"
        name="link"
        disabled={pending}
        placeholder="link to share (example: open.spotify.com/track/...)"
        className="w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-2"
      />
      <button
        className={clsx(
          "rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 w-full md:w-20 mt-2 md:mt-0 min-w-[85px]",
          {
            "bg-indigo-600 hover:bg-indigo-500": !pending,
            "bg-gray-400 flex justify-center": pending,
          }
        )}
        type="submit"
        disabled={pending}
      >
        {pending ? (
          <LoaderCircle size={21} className="animate-spin" />
        ) : (
          <span className="flex justify-center text-center text-white">
            Share
            <ChevronRight size={21} />
          </span>
        )}
      </button>
    </>
  );
};
