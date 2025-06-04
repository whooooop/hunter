const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');

module.exports = (env) => {
  const isProduction = env.production;
  const SERVER_HOST = isProduction ? '162.244.31.93:3434' : 'localhost:3434';

  return {
    mode: isProduction ? 'production' : 'development',
    entry: './src/index.ts',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
        {
          test: /\.(vert|frag|geom)$/,
          use: 'raw-loader',
          exclude: /node_modules/
        },
        {
          test: /\.mp3$/,
          type: 'asset/resource',
          generator: {
            filename: 'assets/sounds/[hash][ext]'
          }
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg)$/,
          type: 'asset/resource',
          generator: {
            filename: 'assets/images/[hash][ext]'
          }
        },
        {
          test: /\.(ttf|woff|woff2)$/,
          type: 'asset/resource',
          generator: {
            filename: 'assets/fonts/[hash][ext]'
          }
        },
        {
          test: /\.atlas\.png$/,
          type: 'asset/resource',
          generator: {
            filename: 'assets/atlas/[name][ext]'
          }
        },
        {
          test: /\.atlas$/,
          type: 'asset/resource',
          generator: {
            filename: 'assets/atlas/[hash][ext]'
          }
        },
        {
          test: /\.json$/,
          type: 'asset/resource',
          generator: {
            filename: 'assets/json/[hash][ext]'
          }
        }
      ]
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.vert', '.frag', '.glsl', '.geom'],
      modules: [path.resolve(__dirname, 'src'), 'node_modules'],
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: './src/index.html'
      }),
      new webpack.DefinePlugin({
        'window.SERVER_HOST': JSON.stringify(SERVER_HOST)
      })
    ],
    output: {
      filename: '[name].[contenthash].js',
      path: path.resolve(__dirname, './dist')
    },
    devServer: {
      static: [
        {
          directory: path.join(__dirname, './'),
          watch: true
        }
      ],
      compress: true,
      port: 8080
    }
  };
}; 