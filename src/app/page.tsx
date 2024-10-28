"use client";

import React from "react";

export default function Home() {
  return (
    <main>
      <div className="mt-8 mx-auto px-4 sm:px-8">
        SongLink is now read-only. Services will be shut down on{" "}
        <a
          className="text-blue-500"
          href="https://github.com/raed667/songlink/pull/12"
        >
          Apr 2, 2025
        </a>
        <br />
        You can use{" "}
        <a className="text-blue-500" href="https://odesli.co/">
          odesli.co
        </a>{" "}
      </div>
    </main>
  );
}
