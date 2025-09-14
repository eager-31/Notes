/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Yeh production build ko safal hone dega, bhale hi project mein ESLint errors hon.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;