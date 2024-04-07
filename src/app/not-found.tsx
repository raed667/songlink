import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative isolate flex flex-auto flex-col items-center justify-center overflow-hidden bg-white text-center">
      <svg
        aria-hidden="true"
        className="absolute left-1/2 top-[-10vh] -z-10 h-[120vh] w-[120vw] min-w-[60rem] -translate-x-1/2"
      >
        <defs>
          <radialGradient id="gradient" cy="0%">
            <stop offset="0%" stopColor="rgba(56, 189, 248, 0.45)" />
            <stop offset="53.95%" stopColor="rgba(0, 71, 255, 0.09)" />
            <stop offset="100%" stopColor="rgba(10, 14, 23, 0.05)" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#gradient)" />
      </svg>

      <p className="font-display text-4xl/tight font-light ">404</p>
      <h1 className="mt-4 font-display text-xl/8 font-bold ">Page not found</h1>
      <p className="mt-2 text-sm/2 text-gray-900">
        Sorry, we couldn’t find what you’re looking for
      </p>
      <Link
        href="/?source=not-found"
        className="group relative isolate flex items-center rounded-lg px-2 py-0.5 text-[0.8125rem]/6 font-medium transition-colors hover:text-sky-400 mt-4"
      >
        <span className="absolute inset-0 -z-10 scale-75 rounded-lg  opacity-0 transition group-hover:scale-100 group-hover:opacity-100" />
        <span className="self-baseline text-xl flex items-center">
          <ChevronLeft size={28} />
          Go back
        </span>
      </Link>
    </div>
  );
}
