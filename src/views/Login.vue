<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-3 pa-6">
          <v-card-title class="text-center text-h5 mb-6">
            로그인
          </v-card-title>

          <v-form @submit.prevent="handleSubmit" v-model="isFormValid">
            <v-text-field
              v-model="email"
              label="이메일"
              type="email"
              :rules="[rules.required, rules.email]"
              variant="outlined"
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model="password"
              label="비밀번호"
              :type="showPassword ? 'text' : 'password'"
              :rules="[rules.required, rules.min]"
              variant="outlined"
              class="mb-6"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
            ></v-text-field>

            <v-btn
              type="submit"
              color="primary"
              block
              :loading="loading"
              :disabled="!isFormValid"
              class="mb-4"
            >
              로그인
            </v-btn>

            <div class="text-center">
              <router-link to="/register" class="text-decoration-none">
                계정이 없으신가요? 회원가입
              </router-link>
            </div>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const isFormValid = ref(false)
const showPassword = ref(false)

const rules = {
  required: v => !!v || '필수 입력 항목입니다',
  email: v => /.+@.+\..+/.test(v) || '유효한 이메일 주소를 입력해주세요',
  min: v => v.length >= 6 || '최소 6자 이상 입력해주세요'
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  loading.value = true
  try {
    const success = await authStore.login(email.value, password.value)
    if (success) {
      router.push('/')
    }
  } catch (error) {
    console.error('로그인 실패:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.v-card {
  border-radius: 12px;
}
</style>