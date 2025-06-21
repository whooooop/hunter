const path = require('path');

const baseConfig = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      fs: false,
      path: false
    }
  }
};

// Клиентская сборка
const clientConfig = {
  ...baseConfig,
  name: 'client',
  target: 'web',
  entry: './src/client.ts',
  output: {
    filename: 'client.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      type: 'module'
    },
    globalObject: 'this'
  },
  experiments: {
    outputModule: true
  },
  resolve: {
    ...baseConfig.resolve,
    alias: {
      './metrics': path.resolve(__dirname, 'src/metrics-client.ts')
    }
  },
  externals: {
    'ws': 'WebSocket',
    'prom-client': '{}'
  }
};

// Серверная сборка
const serverConfig = {
  ...baseConfig,
  name: 'server',
  target: 'node',
  entry: './src/server.ts',
  output: {
    filename: 'server.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      type: 'commonjs2'
    }
  },
  resolve: {
    ...baseConfig.resolve,
    alias: {
      './metrics': path.resolve(__dirname, 'src/metrics-server.ts')
    }
  },
  externals: {
    'ws': 'ws',
    'prom-client': 'prom-client'
  }
};

module.exports = [clientConfig, serverConfig]; 