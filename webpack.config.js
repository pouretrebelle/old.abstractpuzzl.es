'use strict'

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = (webpackEnv) => {
  const isProduction = webpackEnv === 'production'

  return {
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? 'source-map' : 'inline-source-map',
    entry: [path.join(__dirname, 'src/main.ts')],
    output: {
      path: path.join(__dirname, '/docs/'),
      filename: isProduction ? '[name].[contenthash:8].js' : 'bundle.js',
      filename: '[name].js',
      publicPath: '/',
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].css',
      }),
      new HtmlWebpackPlugin({
        template: 'src/index.pug',
        inject: 'body',
      }),
    ],
    module: {
      rules: [
        {
          test: /\.[tj]s$/,
          exclude: /node_modules/,
          loader: 'ts-loader',
        },
        {
          test: /\.pug?$/,
          loader: 'html-loader!pug-html-loader',
        },
        {
          test: /\.s[ca]ss$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            {
              loader: 'css-loader',
              options: { importLoaders: 1 },
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: ['postcss-preset-env'],
                },
              },
            },
            'sass-loader',
          ],
        },
        {
          test: /puzzle\.png$/,
          loader: 'responsive-loader',
        },
        {
          test: /\.(jpe?g|gif|png|svg|woff|ttf|wav|mp3)$/,
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
          },
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
  }
}
