<template>
  <v-container>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        사용자 관리
        <v-btn color="primary" @click="refreshUsers">
          <v-icon>mdi-refresh</v-icon>
          새로고침
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="users"
          :loading="loading"
          class="elevation-1"
        >
          <template v-slot:item.role="{ item }">
            <v-select
              v-model="item.role"
              :items="roleOptions"
              @change="updateUserRole(item)"
              :disabled="!isAdmin"
              density="compact"
            ></v-select>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn
              icon
              color="error"
              @click="deleteUser(item)"
              :disabled="!isAdmin"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

const authStore = useAuthStore()
const users = ref([])
const loading = ref(false)
const isAdmin = ref(false)

const headers = [
  { title: '이름', key: 'name' },
  { title: '이메일', key: 'email' },
  { title: '권한', key: 'role' },
  { title: '가입일', key: 'createdAt' },
  { title: '관리', key: 'actions', sortable: false }
]

const roleOptions = [
  { title: '일반 사용자', value: 'user' },
  { title: '관리자', value: 'admin' }
]

const fetchUsers = async () => {
  try {
    loading.value = true
    const response = await axios.get('http://localhost:3000/api/users')
    users.value = response.data.map(user => ({
      ...user,
      createdAt: new Date(user.createdAt).toLocaleDateString()
    }))
  } catch (error) {
    console.error('사용자 목록 조회 실패:', error)
  } finally {
    loading.value = false
  }
}

const updateUserRole = async (user) => {
  try {
    await axios.put(`http://localhost:3000/api/users/${user._id}/role`, {
      role: user.role
    })
    // 성공 메시지 표시
  } catch (error) {
    console.error('사용자 권한 변경 실패:', error)
    // 실패 시 원래 값으로 복구
    await fetchUsers()
  }
}

const deleteUser = async (user) => {
  if (!confirm('정말로 이 사용자를 삭제하시겠습니까?')) return

  try {
    await axios.delete(`http://localhost:3000/api/users/${user._id}`)
    await fetchUsers()
    // 성공 메시지 표시
  } catch (error) {
    console.error('사용자 삭제 실패:', error)
  }
}

const refreshUsers = () => {
  fetchUsers()
}

onMounted(async () => {
  const user = await authStore.fetchUser()
  isAdmin.value = user?.role === 'admin'
  if (isAdmin.value) {
    await fetchUsers()
  }
})
</script>