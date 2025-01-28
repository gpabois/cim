
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'node:path';

export default defineConfig({
    main: {
        plugins: [tsconfigPaths(), externalizeDepsPlugin()],
        build: {
            lib: {
                entry: './src/main/index.ts'
            }
        }
    },
    preload: {
        plugins: [externalizeDepsPlugin()],
        build: {
            lib: {
                entry: './src/preload/index.ts'
            }
        }
    },
    renderer: {
        root: './src/renderer',
        plugins: [tsconfigPaths(), react()],
        resolve: {
          alias: {
            '@app': path.resolve(__dirname, "./src/renderer"),
            '@interface': path.resolve(__dirname, "./src/interface")
          }
        },
        test: {
          environment: "jsdom",
          globals: true,
          setupFiles: "./tests/renderer/setup.ts",
          typecheck: {
            tsconfig: "tsconfig.web.vitest.json"
          }
        }
    }
});