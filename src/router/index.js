import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import TradeDetail from '@/views/TradeDetail.vue'
import Register from '@/views/Register.vue'

// 에러 컴포넌트
const ErrorComponent = {
    template: `
        <div class="error-container">
            <h2>페이지 로딩 중 오류가 발생했습니다</h2>
            <p>잠시 후 다시 시도해주세요.</p>
            <button @click="reload" class="reload-btn">새로고침</button>
        </div>
    `,
    methods: {
        reload() {
            window.location.reload()
        }
    }
}

// 안전한 동적 import 함수
const safeImport = (importFn) => {
    return () => importFn().catch(error => {
        console.error('모듈 로딩 실패:', error)
        return Promise.resolve(ErrorComponent)
    })
}

const routes = [{
        path: '/',
        name: 'home',
        component: safeImport(() =>
            import ('@/views/Home.vue'))
    },
    {
        path: '/manager',
        name: 'manager',
        component: safeImport(() =>
            import ('@/views/Manager.vue'))
    },
    {
        path: '/gamestat',
        name: 'gamestat',
        component: safeImport(() =>
            import ('@/views/GameStat.vue'))
    },
    {
        path: '/stathis',
        name: 'stathis',
        component: safeImport(() =>
            import ('@/views/StatHis.vue'))
    },
    {
        path: '/login',
        name: 'login',
        component: safeImport(() =>
            import ('@/views/Login.vue'))
    },
    {
        path: '/register',
        name: 'register',
        component: Register
    },
    {
        path: '/profile',
        name: 'profile',
        component: safeImport(() =>
            import ('@/views/Profile.vue')),
        meta: { requiresAuth: true }
    },
    {
        path: '/admin',
        name: 'Admin',
        component: safeImport(() =>
            import ('@/views/admin/Admin.vue')),
        meta: { requiresAuth: true, requiresAdmin: true },
        children: [{
                path: '',
                name: 'UserAdmin',
                component: safeImport(() =>
                    import ('@/views/admin/UserAdmin.vue'))
            },
            {
                path: 'system',
                name: 'SystemAdmin',
                component: safeImport(() =>
                    import ('@/views/admin/SystemAdmin.vue'))
            }
        ]
    },
    {
        path: '/trade-detail',
        name: 'TradeDetail',
        component: TradeDetail,
        meta: { requiresAuth: true }
    },
    {
        path: '/ranking',
        name: 'ranking',
        component: safeImport(() =>
            import ('@/views/Ranking.vue'))
    }
]

const router = createRouter({
    history: createWebHistory(
        import.meta.env.BASE_URL),
    routes
})

router.beforeEach(async(to, from, next) => {
    const authStore = useAuthStore()
    console.log('라우터 가드 - 현재 경로:', to.path)
    console.log('인증 상태:', {
        hasToken: !!authStore.token,
        hasUser: !!authStore.user,
        isAdmin: authStore.isAdmin
    })

    // 토큰이 있지만 사용자 정보가 없는 경우
    if (authStore.token && !authStore.user) {
        try {
            console.log('사용자 정보 로드 시도...')
            await authStore.fetchUser()
            console.log('사용자 정보 로드 성공:', authStore.user)
        } catch (error) {
            console.error('사용자 정보 로드 실패:', error)
            authStore.logout()
            next('/login')
            return
        }
    }

    // 인증이 필요한 페이지
    if (to.meta.requiresAuth && !authStore.isLoggedIn) {
        console.log('인증 필요 - 로그인 페이지로 리다이렉트')
        next('/login')
        return
    }

    // 관리자 권한이 필요한 페이지
    if (to.meta.requiresAdmin && !authStore.isAdmin) {
        console.log('관리자 권한 필요 - 홈으로 리다이렉트')
        next('/')
        return
    }

    console.log('라우터 가드 통과')
    next()
})

// 전역 에러 핸들러
router.onError((error) => {
    console.error('라우터 에러:', error)

    // 모듈 로딩 실패 시 홈으로 리다이렉트
    if (error.message.includes('Failed to fetch dynamically imported module')) {
        console.log('모듈 로딩 실패 - 홈으로 리다이렉트')
        router.push('/')
    }
})

export default router