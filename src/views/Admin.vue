<template>
  <v-layout class="admin-layout">
    <v-navigation-drawer app permanent width="220">
      <v-list dense nav>
        <v-list-item-group v-model="selectedMenu" color="primary">
          <v-list-item value="user">
            <v-list-item-icon><v-icon>mdi-account-multiple</v-icon></v-list-item-icon>
            <v-list-item-title>사용자 관리</v-list-item-title>
          </v-list-item>
          <v-list-item value="system">
            <v-list-item-icon><v-icon>mdi-cog</v-icon></v-list-item-icon>
            <v-list-item-title>시스템 관리</v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <component :is="currentComponent" />
    </v-main>
  </v-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import UserAdmin from './admin/UserAdmin.vue'
import SystemAdmin from './admin/SystemAdmin.vue'

const selectedMenu = ref('user')
const currentComponent = computed(() => {
  if (selectedMenu.value === 'user') return UserAdmin
  if (selectedMenu.value === 'system') return SystemAdmin
  return UserAdmin
})
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
}
</style>