import { Info } from "lucide-react";
import Link from "next/link";

type Props = {
  announcement?: {
    title: string;
    linkText?: string;
    href?: string;
  };
};

export const Hero: React.FC<Props> = ({ announcement }) => {
  return (
    <>
      <div className="mx-auto max-w-2xl">
        {announcement && (
          <div className="hidden mt-4 sm:mb-2 sm:flex sm:justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20 flex">
              <Info className="inline mr-2 stroke-gray-400" />
              {announcement.title}
              {announcement.href && announcement.linkText && (
                <a
                  href={announcement.href}
                  className="font-semibold text-indigo-600 ml-1"
                >
                  <span className="absolute inset-0" aria-hidden="true" />
                  {announcement.linkText} <span aria-hidden="true">&rarr;</span>
                </a>
              )}
            </div>
          </div>
        )}
        <div className="text-center">
          <h1 className="md:text-4xl text-3xl font-bold tracking-tight text-gray-900 sm:text-6xl mt-4 md:mt-0">
            🎧 share the vibes
          </h1>
          <p className="mt-2 text-lg leading-8 text-gray-600 hidden md:block">
            share your favorite <b>song, album or artist</b> with your friends
            without worrying about which music streaming service they use
          </p>
          <p className="text-lg leading-8 text-gray-600 block md:hidden">
            share your favorite <b>song, album or artist</b>
          </p>
          <div className="flex items-center justify-center gap-x-6">
            <Link
              href="/about"
              className="text-sm font-semibold leading-6 text-gray-900 hidden sm:inline"
            >
              Why SongLink ? <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
      <div
        className="absolute inset-x-0 -z-10 transform-gpu overflow-hidden blur-3xl"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%+3rem)] aspect-[1440/900] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#9089fc] to-[#ff89b5] opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>
    </>
  );
};
