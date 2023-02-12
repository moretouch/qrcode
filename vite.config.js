import path from 'path'
import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'


// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    assetsInclude: ['src/assets'],
    server: {
        host: '0.0.0.0',
        port: 8080,
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        }
    },
    css:{
        modules:{
            generateScopedName: '[name]__[local]___[hash:base64:8]',
        }
    }
})
