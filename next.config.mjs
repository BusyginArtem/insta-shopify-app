/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: false,
  basePath: process.env.BASEPATH,
  env: {
    NEXT_PUBLIC_HOST: process.env.HOST,
    NEXT_PUBLIC_SHOPIFY_API_KEY: process.env.NEXT_PUBLIC_SHOPIFY_CLIENT_ID
  }
  // redirects: async () => {
  //   return [
  //     {
  //       source: '/',
  //       destination: '/',
  //       permanent: true,
  //       locale: false
  //     }
  //   ]
  // }
};

export default nextConfig;
