// import { Footer } from "@/components/Footer";

export default function About() {
  return (
    <div className="p-4">
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
      {/* <Footer /> */}
    </div>
  );
}
