<template>
  <v-container fluid>
    <v-row>
      <!-- 사이드바 -->
      <v-col cols="12" md="3" lg="2">
        <v-card class="mb-4">
          <v-list>
            <v-list-item
              prepend-icon="mdi-account-group"
              title="사용자 관리"
              :to="{ name: 'UserAdmin' }"
              :active="currentRoute === 'UserAdmin'"
            ></v-list-item>
            <v-list-item
              prepend-icon="mdi-cog"
              title="시스템 관리"
              :to="{ name: 'SystemAdmin' }"
              :active="currentRoute === 'SystemAdmin'"
            ></v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- 메인 컨텐츠 -->
      <v-col cols="12" md="9" lg="10">
        <router-view></router-view>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const currentRoute = computed(() => route.name)
</script>

<style scoped>
.v-list-item--active {
  background-color: rgb(var(--v-theme-primary));
  color: white;
}
</style>