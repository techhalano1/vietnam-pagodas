/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: "/", destination: "/vi", permanent: false },
      { source: "/chua/:slug", destination: "/vi/chua/:slug", permanent: true },
      { source: "/danh-muc", destination: "/vi/danh-muc", permanent: true },
      { source: "/gioi-thieu", destination: "/vi/gioi-thieu", permanent: true },
    ];
  },
};

export default nextConfig;
