/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // deezer
      {
        protocol: "https",
        hostname: "e-cdns-images.dzcdn.net",
      },
      // spotify
      {
        protocol: "https",
        hostname: "i.scdn.co",
      },
    ],
  },
};

export default nextConfig;
