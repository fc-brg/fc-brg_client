<template>
  <v-navigation-drawer v-model="modelValue" app>
    <v-list>
      <v-list-item
        v-for="item in menuItems"
        :key="item.title"
        :to="item.to"
        :prepend-icon="item.icon"
        :title="item.title"
      />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  drawer: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:drawer'])

const modelValue = computed({
  get: () => props.drawer,
  set: (value) => emit('update:drawer', value)
})

const authStore = useAuthStore()

// menuItems를 computed로 변경하여 반응형으로 만들기
const menuItems = computed(() => {
  const items = [
    {
      title: '공식경기',
      icon: 'mdi-soccer',
      to: '/'
    },
    {
      title: '감독모드',
      icon: 'mdi-strategy',
      to: '/manager'
    },
    {
      title: '게임 통계',
      icon: 'mdi-chart-pie',
      to: '/gamestat'
    },
    {
      title: '통계 히스토리',
      icon: 'mdi-chart-line',
      to: '/stathis'
    },
    {
      title: '거래내역',
      icon: 'mdi-cash-multiple',
      to: '/trade-detail'
    },
    {
      title: '현재 등급',
      icon: 'mdi-trophy',
      to: '/ranking'
    }
  ]

  // 로그인한 경우에만 프로필 메뉴 추가
  if (authStore.isLoggedIn) {
    items.push({
      title: '프로필',
      icon: 'mdi-account',
      to: '/profile'
    })
  }

  // 관리자인 경우에만 관리자 메뉴 추가
  if (authStore.isAdmin) {
    items.push({
      title: '관리자',
      icon: 'mdi-shield-account',
      to: '/admin'
    })
  }

  return items
})
</script>