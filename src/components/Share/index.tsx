"use client";

import clsx from "clsx";
import { ForwardIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

export const Share: React.FC = () => {
  const pathname = usePathname();
  const url = `https://songlink.cc${pathname}`;
  const [isCopySuccess, setIsCopySuccess] = useState(false);

  const onCopy = () => {
    try {
      navigator.clipboard.writeText(url).then(
        function () {
          setIsCopySuccess(true);
          setTimeout(() => {
            setIsCopySuccess(false);
          }, 2000);
        },
        function (err) {
          console.error("Async: Could not copy text: ", err);
        }
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center text-lg font-semibold mt-4 mb-2">
        <ForwardIcon size={22} className="inline-block me-1.5" />
        Share
      </div>
      <div className="relative">
        <input
          type="text"
          className="col-span-6 bg-gray-50 border border-gray-300 text-gray-500 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-4 "
          value={url}
          disabled
          readOnly
        />
        <button
          className="absolute end-2.5 top-1/2 -translate-y-1/2 text-gray-900  hover:bg-gray-100 rounded-lg py-2 px-2.5 inline-flex items-center justify-center bg-white border-gray-200 border"
          onClick={onCopy}
        >
          <span
            className={clsx(
              "items-center",
              isCopySuccess ? "hidden" : "inline-flex"
            )}
          >
            <svg
              className="w-3 h-3 me-1.5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 18 20"
            >
              <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z" />
            </svg>
            <span className="text-xs font-semibold">Copy</span>
          </span>
          <span
            id="success-message"
            className={clsx(
              " items-center",
              isCopySuccess ? "inline-flex" : "hidden"
            )}
          >
            <svg
              className="w-3 h-3 text-blue-700 "
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 16 12"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 5.917 5.724 10.5 15 1.5"
              />
            </svg>
            <span className="text-xs font-semibold text-blue-700">Copied</span>
          </span>
        </button>
      </div>
    </div>
  );
};
