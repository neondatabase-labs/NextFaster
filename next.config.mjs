/** @type {import('next').NextConfig} */
const nextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  images: {
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bevgyjm5apuichhj.public.blob.vercel-storage.com",
        port: "",
        pathname: "/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
