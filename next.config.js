/** @type {import('next').NextConfig} */
const webpack = require('webpack');

const nextConfig = {
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      buffer: require.resolve('buffer/'),
    };

    config.plugins.push(
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      })
    );

    // Ignore warnings about defaultProps
    config.ignoreWarnings = [
      {
        message: /Support for defaultProps/,
      },
    ];

    return config;
  },
};

module.exports = nextConfig;