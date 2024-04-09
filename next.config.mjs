import { withAxiom } from "next-axiom";

/** @type {import('next').NextConfig} */
const nextConfig = withAxiom({
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
});

export default nextConfig;
