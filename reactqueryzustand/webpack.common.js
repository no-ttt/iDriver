const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const {
  title
} = require('./config.json');

module.exports = {
  output: {
    path: path.join(__dirname, "/dist"), // the bundle output path
    filename: '[name].js', // the name of the bundle
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: title,
      template: "src/index.html", // to import index.html file inside index.js
    }),
  ],
  entry: {
    vendors: ['react', 'react-dom'],
    app: [__dirname + '/src/index.jsx'],

  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      Config: __dirname + '/config.dev.json',
    }
  },
  devtool: 'source-map',
  cache: false,
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/, // .js and .jsx files
        exclude: /node_modules/, // excluding the node_modules folder
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.styl?/,
        use: ['style-loader', 'css-loader', 'stylus-loader']
      },
      {
        test: /\.(sa|sc|c)ss$/, // styles files
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/, // to import images and fonts
        loader: "url-loader",
        options: { limit: false },
      },
    ],
  },
};