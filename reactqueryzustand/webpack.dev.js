const { merge } = require('webpack-merge'),
  webpack = require('webpack'),
  common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devServer: {
    // contentBase: '/dist',
    port: 3030,
    open: true,
    hot: false,
    liveReload: true,
    historyApiFallback: true,
  },
  plugins: [
    new webpack.SourceMapDevToolPlugin({

    }),
  ],
});