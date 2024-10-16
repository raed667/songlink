"use client";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { ChevronRight, LoaderCircle, CircleX } from "lucide-react";
import { useFormStatus, useFormState } from "react-dom";
import { submitLink } from "@/app/actions";

export const LinkInput: React.FC = () => {
  const router = useRouter();

  const [state, formAction] = useFormState(submitLink, {
    errorMessage: "",
  });
  const shouldRedirect = !!state.type && !!state.key;
  if (shouldRedirect) {
    router.push(`/${state.type}/${state?.key}`);
  }

  return (
    <>
      <div className="mt-4 flex items-center justify-center mx-4">
        <form
          action={formAction}
          className="md:min-w-96 md:w-1/2 w-full md:flex items-center justify-center gap-2"
        >
          <InnerForm shouldRedirect={shouldRedirect} />
        </form>
      </div>
      <div
        className={clsx(
          "text-center mt-4 mx-auto max-w-2xl text-red-500 h-[2rem] font-semibold",
          {
            invisible: !state.errorMessage,
          }
        )}
      >
        {state.errorMessage && <CircleX className="inline mr-2" />}
        {state.errorMessage}
      </div>
    </>
  );
};

const InnerForm: React.FC<{
  shouldRedirect: boolean;
}> = ({ shouldRedirect }) => {
  const { pending } = useFormStatus();

  const isLoading = shouldRedirect || pending;
  return (
    <>
      <input
        id="input_link"
        type="url"
        name="link"
        disabled={isLoading}
        placeholder="link to share (example: open.spotify.com/track/...)"
        className="w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-2"
      />
      <button
        className={clsx(
          "rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 w-full md:w-20 mt-2 md:mt-0 min-w-[85px]",
          {
            "bg-indigo-600 hover:bg-indigo-500": !isLoading,
            "bg-gray-400 flex justify-center": isLoading,
          }
        )}
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? (
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
