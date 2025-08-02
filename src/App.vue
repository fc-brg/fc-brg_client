<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-app-bar-title>FC BRG</v-app-bar-title>
      <v-spacer></v-spacer>
      <template v-if="!authStore.isLoggedIn">
        <v-btn to="/login" variant="text">로그인</v-btn>
        <v-btn to="/register" variant="text">회원가입</v-btn>
      </template>
      <template v-else>
        <v-btn @click="handleLogout" variant="text">로그아웃</v-btn>
      </template>
    </v-app-bar>

    <Navigation :drawer="drawer" @update:drawer="drawer = $event" />

    <v-main>
      <v-container fluid class="fill-height">
        <router-view></router-view>
      </v-container>
    </v-main>

    <v-footer app class="d-flex flex-column">
      <div class="d-flex w-100 align-center px-4">
        <strong>FC BRG &copy; {{ new Date().getFullYear() }}</strong>
        <v-spacer></v-spacer>
        <span class="text-body-2 text-medium-emphasis me-4">Data based on NEXON Open API</span>
        <v-btn icon class="me-4">
          <v-icon>mdi-github</v-icon>
        </v-btn>
        <v-btn icon>
          <v-icon>mdi-twitter</v-icon>
        </v-btn>
      </div>
    </v-footer>
  </v-app>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Navigation from '@/components/Navigation.vue'

const authStore = useAuthStore()
const router = useRouter()
const drawer = ref(true) // 기본적으로 열려있도록 설정

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

onMounted(async () => {
  console.log('App.vue 마운트됨')
  console.log('초기 상태:', {
    hasToken: !!authStore.token,
    hasUser: !!authStore.user,
    isAdmin: authStore.isAdmin
  })

  if (authStore.token) {
    console.log('토큰 존재, 사용자 정보 로드 시도...')
    await authStore.fetchUser()
    console.log('사용자 정보 로드 후:', {
      hasUser: !!authStore.user,
      isAdmin: authStore.isAdmin
    })
  }
})
</script>

<style>
.v-application {
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif !important;
}

.v-main {
  background-color: #f5f5f5;
}

.v-container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>