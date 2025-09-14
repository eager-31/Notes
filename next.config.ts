/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add this eslint section
  eslint: {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
};

export default nextConfig;