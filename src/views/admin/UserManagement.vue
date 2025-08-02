<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-xl font-semibold text-gray-900">회원 관리</h1>
        <p class="mt-2 text-sm text-gray-700">
          회원 목록을 확인하고 권한을 관리할 수 있습니다.
        </p>
      </div>
    </div>

    <div class="mt-8 flex flex-col">
      <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">이름</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">이메일</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">권한</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">가입일</th>
                  <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span class="sr-only">관리</span>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-for="user in users" :key="user._id">
                  <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {{ user.name }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ user.email }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <select
                      v-model="user.role"
                      @change="updateUserRole(user)"
                      class="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="user">일반 사용자</option>
                      <option value="admin">관리자</option>
                    </select>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {{ new Date(user.createdAt).toLocaleDateString() }}
                  </td>
                  <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <button
                      @click="resetPassword(user)"
                      class="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      비밀번호 재설정
                    </button>
                    <button
                      @click="deleteUser(user)"
                      class="text-red-600 hover:text-red-900"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const users = ref([])

const fetchUsers = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/users', {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    users.value = response.data
  } catch (error) {
    console.error('Failed to fetch users:', error)
  }
}

const updateUserRole = async (user) => {
  try {
    await axios.put(
      `http://localhost:3000/api/users/${user._id}/role`,
      { role: user.role },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )
  } catch (error) {
    console.error('Failed to update user role:', error)
  }
}

const resetPassword = async (user) => {
  if (confirm(`${user.name}님의 비밀번호를 재설정하시겠습니까?`)) {
    try {
      await axios.post(
        'http://localhost:3000/api/reset-password',
        { email: user.email },
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        }
      )
      alert('비밀번호 재설정 이메일이 발송되었습니다.')
    } catch (error) {
      console.error('Failed to reset password:', error)
    }
  }
}

const deleteUser = async (user) => {
  if (confirm(`${user.name}님을 삭제하시겠습니까?`)) {
    try {
      await axios.delete(`http://localhost:3000/api/users/${user._id}`, {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })
      users.value = users.value.filter(u => u._id !== user._id)
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }
}

onMounted(() => {
  fetchUsers()
})
</script>