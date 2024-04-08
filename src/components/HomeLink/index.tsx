import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export const HomeLink: React.FC = () => {
  return (
    <div className="text-black text-xl mb-2 md:mb-8 hover:text-indigo-600 group-hover:opacity-100">
      <Link href="/" className="flex justify-start items-center">
        <ChevronLeft className="active:stroke-indigo-600" />
        <span>songlink.cc</span>
      </Link>
    </div>
  );
};
