'use strict';

var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  devtool: 'eval-source-map',
  entry: [
    path.join(__dirname, 'src/main.js'),
  ],
  output: {
    path: path.join(__dirname, '/docs/'),
    filename: '[name].js',
    publicPath: '/',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.pug',
      inject: 'body',
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
  ],
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.pug?$/,
        loader: 'html-loader!pug-html-loader',
      },
      {
        test: /\.s[ca]ss$/,
        loader: 'style-loader!css-loader!postcss-loader!sass-loader',
      },
      {
        test: /\.(jpe?g|gif|png|svg|woff|ttf|wav|mp3)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]'
        },
      },
    ],
  },
  resolve: {
    modules: ['src', 'node_modules'],
    alias: {
      styles: path.resolve('src', 'styles'),
    },
  },
};
