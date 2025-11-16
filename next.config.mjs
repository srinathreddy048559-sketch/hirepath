/** @type {import('next').NextConfig} */
const nextConfig = {
  // Let Next bundle pdf-parse as a server external package
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
