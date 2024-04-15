// import { Footer } from "@/components/Footer";

import Link from "next/link";
import { ChevronRightIcon, HomeIcon } from "lucide-react";

export default function About() {
  return (
    <main className="min-h-full sm:mx-auto max-w-2xl mt-2 md:mt-6 px-2">
      <nav className="flex pb-4" aria-label="Breadcrumb">
        <ol role="list" className="flex items-center space-x-4">
          <li>
            <div>
              <Link href="/" className="text-gray-400 hover:text-gray-500">
                <HomeIcon
                  className="h-5 w-5 flex-shrink-0"
                  aria-hidden="true"
                />
                <span className="sr-only">Home</span>
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <ChevronRightIcon
                className="h-5 w-5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              <Link
                href="/about"
                className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                aria-current="page"
              >
                About
              </Link>
            </div>
          </li>
        </ol>
      </nav>

      <div className="border-b border-gray-200 pb-5 md:max-w-screen-xl">
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          Why <a href="https://songlink.cc">songlink.cc</a>?
        </h3>
        <div className="mt-2 max-w-4xl text-md text-gray-800">
          Besides the obvious <em>why not</em> answer. I wanted to create a
          simple tool to share music with my friends across different platforms.
          <p>
            <br />I wanted to build this tool to avoid lock-in, and to make it
            easier to share music without having to remember which platform each
            person uses.
          </p>
        </div>
      </div>

      <div className="border-b border-gray-200 py-5 md:max-w-screen-xl">
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          What data do you store?
        </h3>
        <div className="mt-2 max-w-4xl text-md text-gray-800">
          <p>
            I store the links you generate, the source and target platforms. I
            do not store any personal information.
          </p>
          <p>
            I use Vercel for hosting and analytics. You can read their{" "}
            <a
              className="text-indigo-600"
              href="https://vercel.com/docs/analytics/privacy-policy"
            >
              privacy policy
            </a>
            .
            <br />I use axiom.co for error logging. You can read their{" "}
            <a className="text-indigo-600" href="https://axiom.co/privacy">
              privacy policy
            </a>
            .
          </p>
        </div>
      </div>

      <div className="border-b border-gray-200 py-5 md:max-w-screen-xl">
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          How do you make money from this?
        </h3>
        <div className="mt-2 max-w-4xl text-md text-gray-800">
          <p>I do not</p>
        </div>
      </div>

      <div className="border-b border-gray-200 py-5 md:max-w-screen-xl">
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          How can I support this project?
        </h3>
        <div className="mt-2 max-w-4xl text-md text-gray-800">
          The best way to support is to share music with your friends.
          <br />
          Second best, is to star the project on{" "}
          <a
            className="text-indigo-600"
            href="https://github.com/raed667/songlink"
          >
            Github
          </a>
          .
          <br />I am highly motivated by stars and feedback.
        </div>
      </div>

      <div className="border-b border-gray-200 py-5 md:max-w-screen-xl">
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          Something is broken
        </h3>
        <div className="mt-2 max-w-4xl text-md text-gray-800">
          Please open an issue on{" "}
          <a
            className="text-indigo-600"
            href="https://github.com/raed667/songlink"
          >
            Github
          </a>
        </div>
      </div>
      {/* <Footer /> */}
    </main>
  );
}
