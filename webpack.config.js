const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: 'development',
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
    extensions: ['.ts', '.tsx', '.js', '.vert', '.frag', '.glsl', '.geom']
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './index.html'
    })
  ],
  output: {
    filename: 'bundle.js',
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