import axios from 'axios'

const api = axios.create({
        baseURL: import.meta.env.VITE_API_URL ||
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ?
        'http://localhost:3000' :
        window.location.hostname === 'fc-brg.github.io' ?
        'http://175.236.207.185:3000' : // Mac Mini 서버 IP
        `https://${window.location.hostname}`),
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 30000, // 30초 타임아웃으로 증가
    retry: 3, // 재시도 횟수
    retryDelay: 2000 // 재시도 간격 (2초로 증가)
})

// 요청 인터셉터
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        // 요청 로깅 (개발 환경에서만)
        if (
            import.meta.env.DEV) {
            console.log('🚀 [API] 요청:', {
                method: config.method ? config.method.toUpperCase() : 'GET',
                url: config.url,
                timestamp: new Date().toISOString()
            })
        }

        return config
    },
    error => {
        console.error('❌ [API] 요청 에러:', error)
        return Promise.reject(error)
    }
)

// 응답 인터셉터
api.interceptors.response.use(
    response => {
        // 응답 로깅 (개발 환경에서만)
        if (
            import.meta.env.DEV) {
            console.log('✅ [API] 응답:', {
                status: response.status,
                url: response.config.url,
                timestamp: new Date().toISOString()
            })
        }
        return response
    },
    async error => {
        const originalRequest = error.config

        // 재시도 로직 (서버 에러 또는 타임아웃)
        if ((error.response && error.response.status >= 500) ||
            error.code === 'ECONNABORTED' ||
            error.message.includes('timeout')) {

            if (!originalRequest.retry) {
                originalRequest.retry = 3;
            }

            if (originalRequest.retry > 0) {
                originalRequest.retry -= 1
                console.log(`🔄 [API] 재시도 중... (남은 횟수: ${originalRequest.retry})`)

                await new Promise(resolve => setTimeout(resolve, originalRequest.retryDelay || 2000))
                return api(originalRequest)
            }
        }

        // 인증 에러 처리
        if (error.response && error.response.status === 401) {
            console.log('🔐 [API] 인증 만료 - 로그인 페이지로 리다이렉트')
            localStorage.removeItem('token')
            localStorage.removeItem('user')

            // 현재 페이지가 로그인 페이지가 아닌 경우에만 리다이렉트
            if (window.location.pathname !== '/login') {
                window.location.href = '/login'
            }
        }

        // 에러 로깅
        console.error('❌ [API] 응답 에러:', {
            status: error.response ? error.response.status : 'unknown',
            message: error.response && error.response.data && error.response.data.error ? error.response.data.error : error.message,
            url: error.config ? error.config.url : 'unknown',
            timestamp: new Date().toISOString()
        })

        return Promise.reject(error)
    }
)

export default api