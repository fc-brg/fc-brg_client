import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
    base: '/fc-brg_client/',
    plugins: [vue()],
    server: {
        port: 5173,
        host: true,
        allowedHosts: [
            '.ngrok-free.app',
            'localhost',
            '127.0.0.1'
        ],
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                secure: false
            }
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    },
    build: {
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor': ['vue', 'vue-router', 'pinia'],
                    'admin': [
                        './src/views/admin/Admin.vue',
                        './src/views/admin/UserAdmin.vue',
                        './src/views/admin/SystemAdmin.vue'
                    ]
                },
                chunkFileNames: (chunkInfo) => {
                    const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk'
                    return `assets/[name]-[hash].js`
                },
                assetFileNames: (assetInfo) => {
                    const info = assetInfo.name.split('.')
                    const ext = info[info.length - 1]

                    // Material Design Icons 폰트 파일들은 원본 이름 유지
                    if (assetInfo.name && assetInfo.name.includes('materialdesignicons-webfont')) {
                        return `assets/[name].[ext]`
                    }

                    return `assets/[name]-[hash].${ext}`
                }
            }
        },
        assetsDir: 'assets',
        copyPublicDir: true,
        sourcemap: false,
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: false,
                drop_debugger: true
            }
        }
    },
    preview: {
        port: 5173,
        host: true,
        strictPort: true,
        https: false
    },
    optimizeDeps: {
        exclude: ['@vueuse/core']
    }
})