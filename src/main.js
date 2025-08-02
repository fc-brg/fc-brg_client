import { createApp, h } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './index.css'
import './styles/fonts.css'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Material Design Icons
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
    components,
    directives,
    theme: {
        defaultTheme: 'light',
        themes: {
            light: {
                colors: {
                    primary: '#1976D2',
                    secondary: '#424242',
                    accent: '#82B1FF',
                    error: '#FF5252',
                    info: '#2196F3',
                    success: '#4CAF50',
                    warning: '#FFC107'
                }
            }
        }
    },
    defaults: {
        global: {
            ripple: false
        },
        VApp: {
            fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif"
        }
    }
})

const app = createApp(App)

// 전역 에러 핸들러
app.config.errorHandler = (error, instance, info) => {
    console.error('🚨 [Vue] 전역 에러 발생:', {
        error: error.message,
        stack: error.stack,
        component: instance ? instance.$options.name || 'Unknown' : 'Unknown',
        info: info,
        timestamp: new Date().toISOString()
    })

    // 사용자에게 에러 알림 (개발 환경에서만)
    if (
        import.meta.env.DEV) {
        console.error('개발 모드 - 에러 발생:', error.message)
    }
}

// 전역 경고 핸들러
app.config.warnHandler = (msg, instance, trace) => {
    console.warn('⚠️ [Vue] 경고 발생:', {
        message: msg,
        component: instance ? instance.$options.name || 'Unknown' : 'Unknown',
        trace: trace,
        timestamp: new Date().toISOString()
    })
}

// 성능 모니터링 (개발 환경에서만)
if (
    import.meta.env.DEV) {
    console.log('🚀 [Vue] 앱 시작:', {
        version: import.meta.env.VITE_APP_VERSION || '1.0.0',
        environment: import.meta.env.MODE,
        timestamp: new Date().toISOString()
    })
}

app.use(createPinia())
app.use(router)
app.use(vuetify)

app.mount('#app')