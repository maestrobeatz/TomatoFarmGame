const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const fs = require('fs');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'images/',
              publicPath: 'images/',
            },
          },
        ],
      },
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
        exclude: [
          /node_modules\/eosjs/, // Exclude eosjs from source map processing
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    fallback: {
      assert: require.resolve('assert'),
      buffer: require.resolve('buffer'),
      crypto: require.resolve('crypto-browserify'),
      path: require.resolve('path-browserify'),
      stream: require.resolve('stream-browserify'),
      url: require.resolve('url'),
      util: require.resolve('util'),
      zlib: require.resolve('browserify-zlib'),
      https: require.resolve('https-browserify'),
      vm: require.resolve('vm-browserify'),
      http: require.resolve('stream-http'),
      fs: false, // fs module can't be polyfilled for frontend use
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new Dotenv(),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 3000,
    hot: true, // Enable hot module replacement
    open: true, // Automatically open the browser
    historyApiFallback: true, // Enable support for history API fallback
    client: {
      overlay: true, // Show errors and warnings in the browser
    },
    server: {
      type: 'https',
      options: {
        key: fs.readFileSync(path.resolve(__dirname, 'server.key')),
        cert: fs.readFileSync(path.resolve(__dirname, 'server.crt')),
      },
    },
    host: '0.0.0.0', // Bind to all network interfaces
  },
};
