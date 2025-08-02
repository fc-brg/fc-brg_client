<template>
  <div class="admin-page">
    <h1 class="text-h4 mb-6">사용자 관리</h1>
    <v-card class="admin-card">
      <v-card-title class="d-flex align-center">
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="검색"
          single-line
          hide-details
          class="search-field"
        ></v-text-field>
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="users"
        :search="search"
        :loading="loading"
        class="elevation-1"
        :items-per-page="10"
        :items-per-page-options="[10, 20, 50, 100]"
      >
        <template v-slot:item.role="{ item }">
          <v-select
            v-model="item.role"
            :items="roles"
            @update:model-value="updateUserRole(item)"
            density="compact"
            variant="outlined"
            hide-details
            class="role-select"
          ></v-select>
        </template>
        <template v-slot:item.actions="{ item }">
          <div class="d-flex">
            <v-btn
              icon="mdi-refresh"
              color="primary"
              variant="text"
              @click="resetPassword(item)"
              class="mr-2"
              size="small"
            ></v-btn>
            <v-btn
              icon="mdi-delete"
              color="error"
              variant="text"
              @click="deleteUser(item)"
              size="small"
            ></v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>
    <!-- 비밀번호 초기화 다이얼로그 -->
    <v-dialog v-model="resetDialog" max-width="400">
      <v-card>
        <v-card-title>비밀번호 초기화</v-card-title>
        <v-card-text>
          <p>{{ selectedUser?.name }}님의 비밀번호를 초기화하시겠습니까?</p>
          <p class="text-caption text-grey">초기화된 비밀번호는 이메일로 전송됩니다.</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="resetDialog = false">취소</v-btn>
          <v-btn color="primary" @click="confirmResetPassword">확인</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- 사용자 삭제 다이얼로그 -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title>사용자 삭제</v-card-title>
        <v-card-text>
          <p>{{ selectedUser?.name }}님을 삭제하시겠습니까?</p>
          <p class="text-caption text-red">이 작업은 되돌릴 수 없습니다.</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="deleteDialog = false">취소</v-btn>
          <v-btn color="error" @click="confirmDeleteUser">삭제</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const users = ref([])
const loading = ref(false)
const search = ref('')
const resetDialog = ref(false)
const deleteDialog = ref(false)
const selectedUser = ref(null)

const headers = [
  { title: '이름', key: 'name', sortable: true },
  { title: '이메일', key: 'email', sortable: true },
  { title: '권한', key: 'role', sortable: true },
  { title: '가입일', key: 'createdAt', sortable: true },
  { title: '관리', key: 'actions', sortable: false, align: 'center' }
]

const roles = [
  { title: '일반 사용자', value: 'user' },
  { title: '관리자', value: 'admin' }
]

const fetchUsers = async () => {
  try {
    loading.value = true
    const response = await api.get('/api/users')
    if (response.data.success && response.data.data) {
      users.value = response.data.data.map(user => ({
        ...user,
        createdAt: new Date(user.createdAt).toLocaleDateString()
      }))
    } else {
      console.error('사용자 목록 조회 실패:', response.data.error)
    }
  } catch (error) {
    console.error('사용자 목록 조회 실패:', error)
  } finally {
    loading.value = false
  }
}

const updateUserRole = async (user) => {
  try {
    await api.put(`/api/users/${user._id}/role`, { role: user.role })
  } catch (error) {
    console.error('권한 변경 실패:', error)
    await fetchUsers()
  }
}

const resetPassword = (user) => {
  selectedUser.value = user
  resetDialog.value = true
}

const confirmResetPassword = async () => {
  try {
    await api.post(`/api/users/${selectedUser.value._id}/reset-password`)
    resetDialog.value = false
  } catch (error) {
    console.error('비밀번호 초기화 실패:', error)
  }
}

const deleteUser = (user) => {
  selectedUser.value = user
  deleteDialog.value = true
}

const confirmDeleteUser = async () => {
  try {
    await api.delete(`/api/users/${selectedUser.value._id}`)
    deleteDialog.value = false
    await fetchUsers()
  } catch (error) {
    console.error('사용자 삭제 실패:', error)
  }
}

onMounted(() => {
  fetchUsers()
})
</script>
<style scoped>
.admin-page {
  width: 100%;
  height: 100%;
  padding: 20px;
}
.admin-card {
  width: 100%;
  margin-bottom: 20px;
}
.search-field {
  max-width: 300px;
}
.role-select {
  min-width: 150px;
}
:deep(.v-data-table) {
  width: 100%;
}
:deep(.v-data-table__wrapper) {
  overflow-x: auto;
}
:deep(.v-data-table__td) {
  white-space: nowrap;
}
</style>