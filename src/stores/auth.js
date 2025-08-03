import { defineStore } from 'pinia'
import axios from 'axios'

// API 인스턴스 생성
export const api = axios.create({
    baseURL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ?
        'http://localhost:3000' :
        window.location.hostname === 'fc-brg.github.io' ?
        'https://cors-anywhere.herokuapp.com/http://localhost:3000' : // CORS 프록시 사용
        `https://${window.location.hostname}`,
    headers: {
        'Content-Type': 'application/json'
    }
})

// 요청 인터셉터 추가 - 모든 요청에 자동으로 토큰 포함
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('axios 인터셉터 - 요청 에러:', error);
        return Promise.reject(error);
    }
);

// 응답 인터셉터 추가 - 401 에러 시 자동 로그아웃
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // 401 에러 시 토큰 제거
            localStorage.removeItem('token');
            // 페이지 새로고침하여 로그인 페이지로 이동
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: localStorage.getItem('token')
    }),

    getters: {
        isLoggedIn: (state) => !!state.token,
        isAdmin: (state) => state.user && state.user.role === 'admin'
    },

    actions: {
        async login(email, password) {
            try {
                console.log('로그인 시도:', { email });
                const response = await api.post('/api/login', {
                    email,
                    password
                });

                this.token = response.data.token;
                localStorage.setItem('token', this.token);
                console.log('로그인 성공, 토큰 저장됨');

                await this.fetchUser();
                return true;
            } catch (error) {
                console.error('로그인 실패:', error);
                throw error;
            }
        },

        async register({ email, password, name }) {
            try {
                console.log('회원가입 시도:', { email, name });
                const response = await api.post('/api/register', {
                    email,
                    password,
                    name
                });
                console.log('회원가입 응답:', response.data);
                return response.data;
            } catch (error) {
                console.error('회원가입 실패:', error.response || error);
                throw error;
            }
        },

        async fetchUser() {
            if (!this.token) {
                console.log('토큰이 없어 사용자 정보를 가져올 수 없습니다.');
                return null;
            }

            try {
                console.log('사용자 정보 요청 중...');
                // 인터셉터가 자동으로 토큰을 추가하므로 별도 헤더 설정 불필요
                const response = await api.get('/api/me');
                console.log('사용자 정보 수신:', response.data);

                // 서버 응답 구조에 맞게 수정
                if (response.data.success && response.data.user) {
                    this.user = response.data.user;
                    return response.data.user;
                } else {
                    console.error('잘못된 사용자 정보 응답:', response.data);
                    this.logout();
                    return null;
                }
            } catch (error) {
                console.error('사용자 정보 조회 실패:', error);
                // 401 에러가 아닌 경우에만 로그아웃 (401은 인터셉터에서 처리)
                if (error.response && error.response.status !== 401) {
                    this.logout();
                }
                return null;
            }
        },

        async logout() {
            try {
                console.log('로그아웃 시도');
                // 서버에 로그아웃 요청
                await api.post('/api/logout');
                console.log('로그아웃 성공');
            } catch (error) {
                console.error('로그아웃 API 호출 실패:', error);
                // API 호출 실패해도 클라이언트에서는 로그아웃 처리
            } finally {
                // 클라이언트 상태 정리
                this.user = null;
                this.token = null;
                localStorage.removeItem('token');
            }
        },

        async resetPassword(email) {
            try {
                await api.post('/api/reset-password', { email })
                return true
            } catch (error) {
                console.error('Password reset failed:', error)
                return false
            }
        }
    }
})