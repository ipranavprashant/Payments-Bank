/** @type {import('next').NextConfig} */
// next.config.mjs
export default {
  webpack: (config, {}) => {
    config.module.rules.push({
      test: /\.html$/,
      use: ["html-loader"],
    });

    return config;
  },
};
