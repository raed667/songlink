"use client";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { ChevronRight, LoaderCircle, CircleX } from "lucide-react";
import { useFormStatus, useFormState } from "react-dom";
import { useEffect, useRef, useState } from "react";
// import { useDebounce } from "@uidotdev/usehooks";
import Image from "next/image";
import Link from "next/link";
import { submitLink } from "@/app/actions";
import { findSourceItem } from "@/util/services";

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
            hidden: !state.errorMessage,
          }
        )}
      >
        {state.errorMessage && <CircleX className="inline mr-2" />}
        {state.errorMessage}
        <Link
          className="ml-1 text-indigo-600"
          href="https://github.com/raed667/songlink/issues/new"
        >
          Report an issue
        </Link>
      </div>
    </>
  );
};

const search = async (text: string, signal: AbortSignal) => {
  AbortController;
  const params = new URLSearchParams();
  params.set("term", text);
  params.set("media", "music");
  params.set("explicit", "Yes");

  const response = await fetch(
    `https://itunes.apple.com/search?${params.toString()}`
  );
  const data = await response.json();
  console.log(data);
  return data;
};

const InnerForm: React.FC<{
  shouldRedirect: boolean;
}> = ({ shouldRedirect }) => {
  const { pending } = useFormStatus();
  const inputRef = useRef<HTMLInputElement>(null);

  const [_text, setText] = useState("");
  // const text = useDebounce(_text, 300);
  // const [searchResults, setSearchResults] = useState([]);

  const isLoading = shouldRedirect || pending;

  // useEffect(() => {
  //   if (!text) {
  //     setSearchResults([]);
  //     return;
  //   }

  //   const abortController = new AbortController();
  //   search(text, abortController.signal).then((data) => {
  //     setSearchResults(data.results);
  //   });
  //   return () => {
  //     abortController.abort();
  //   };
  // }, [text]);

  const inputWidth = inputRef.current?.offsetWidth ?? 0;

  return (
    <>
      <div className="w-full flex flex-col">
        <input
          ref={inputRef}
          autoComplete="off"
          id="input_link"
          type="url"
          name="link"
          disabled={isLoading}
          placeholder="search or paste a link to share (example: open.spotify.com/track/...)"
          className="w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-2"
          value={_text}
          onChange={(e) => setText(e.target.value)}
        />
        {/* {searchResults.length > 0 && (
          <ul className="bg-white border-[1px] rounded-lg shadow-lg absolute max-h-[200px] overflow-y-auto overflow-x-hidden z-10 mt-10">
            {searchResults.map((result: any) => (
              <li
                key={result.collectionId}
                className="border-b-[1px] border-solid border-l-gray-300 py-2 hover:bg-slate-100 p-4 cursor-pointer"
                style={{ width: inputWidth }}
              >
                <Suggestion data={result} width={inputWidth} />
              </li>
            ))}
          </ul>
        )} */}
      </div>
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

const Suggestion = ({ data, width }: { width: number; data: any }) => {
  // href={`/track/appleMusic_track_${data.collectionId}`}

  const router = useRouter();

  const onClick = async () => {
    const source = await findSourceItem(
      data.collectionId,
      "track",
      "appleMusic"
    );
    if (!source) return;

    const shouldRedirect = !!source.key;
    if (shouldRedirect) {
      router.push(`/track/${source.key}`);
    }
  };

  if (data.kind === "song") {
    return (
      <div
        className="flex items-center gap-4"
        style={{
          width: width,
        }}
        onClick={() => onClick()}
      >
        <div>
          <Image
            alt=""
            width={40}
            height={40}
            src={data.artworkUrl100}
            className="h-10 w-10 rounded-md"
          />
        </div>
        <div className="truncate">{data.trackName}</div>
      </div>
    );
  }
  console.log(data);

  return null;
};
