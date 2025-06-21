import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  const SERVER_HOST = isProduction ? 'second-survival.hzberg.com' : 'localhost:3434';

  return {
    root: 'src',
    publicDir: '../public',
    plugins: [
      {
        name: 'audio-assets',
        load(id) {
          if (id.endsWith('.mp3') || id.endsWith('.wav') || id.endsWith('.ogg')) {
            return `export default new URL('${id}', import.meta.url).href`;
          }
        }
      }
    ],
    build: {
      outDir: '../dist',
      emptyOutDir: true,
      assetsInlineLimit: 0,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'src/index.html'),
          bridge: resolve(__dirname, 'src/libs/playgama-bridge.js')
        },
        output: {
          entryFileNames: '[name].[hash].js',
          chunkFileNames: '[name].[hash].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split('.') || [];
            const ext = info[info.length - 1];

            if (/\.(mp3)$/.test(assetInfo.name || '')) {
              return 'assets/sounds/[name].[hash][extname]';
            }
            if (/\.(mp4)$/.test(assetInfo.name || '')) {
              return 'assets/videos/[name].[hash][extname]';
            }
            if (/\.(png|jpe?g|gif|svg)$/.test(assetInfo.name || '')) {
              return 'assets/images/[name].[hash][extname]';
            }
            if (/\.(ttf|woff|woff2)$/.test(assetInfo.name || '')) {
              return 'assets/fonts/[name].[hash][extname]';
            }
            if (/\.atlas\.png$/.test(assetInfo.name || '')) {
              return 'assets/atlas/[name][extname]';
            }
            if (/\.atlas$/.test(assetInfo.name || '')) {
              return 'assets/atlas/[name].[hash][extname]';
            }
            if (/\.json$/.test(assetInfo.name || '')) {
              return 'assets/json/[name].[hash][extname]';
            }
            if (/playgama-bridge\.js$/.test(assetInfo.name || '')) {
              return '[name][extname]';
            }

            return 'assets/[name].[hash][extname]';
          }
        }
      }
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@hunter/multiplayer': resolve(__dirname, '../multiplayer/dist/client.js')
      }
    },
    define: {
      'window.SERVER_HOST': JSON.stringify(SERVER_HOST)
    },
    server: {
      port: 8080,
      host: true
    },
    assetsInclude: ['**/*.vert', '**/*.frag', '**/*.geom', '**/*.atlas', '**/*.mp3', '**/*.wav', '**/*.ogg'],
    optimizeDeps: {
      include: ['@hunter/multiplayer']
    }
  };
}); 