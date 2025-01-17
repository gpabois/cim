
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

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
        plugins: [tsconfigPaths(), react()]
    }
});