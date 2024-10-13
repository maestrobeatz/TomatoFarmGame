const webpack = require('webpack');
const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Add fallbacks for Node.js core modules to support browser polyfills
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "stream": require.resolve("stream-browserify"),
        "buffer": require.resolve("buffer"),
        "process": require.resolve("process/browser"),
        "crypto": require.resolve("crypto-browserify"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "os": require.resolve("os-browserify/browser"),
        "url": require.resolve("url"),
      };

      // Add necessary plugins for Node.js polyfills
      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        })
      );

      // Update the alias to point to the `src/process/browser.js`
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        'process/browser': path.resolve(__dirname, 'src/process/browser.js'), // Updated alias
      };

      return webpackConfig;
    },
  },
};
