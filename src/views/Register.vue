<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-3 pa-6">
          <v-card-title class="text-center text-h5 mb-6">
            회원가입
          </v-card-title>

          <v-form @submit.prevent="handleSubmit" v-model="isFormValid">
            <v-text-field
              v-model="name"
              label="이름"
              :rules="[rules.required]"
              variant="outlined"
              class="mb-4"
              prepend-inner-icon="mdi-account"
            ></v-text-field>

            <v-text-field
              v-model="email"
              label="이메일"
              type="email"
              :rules="[rules.required, rules.email]"
              variant="outlined"
              class="mb-4"
              prepend-inner-icon="mdi-email"
            ></v-text-field>

            <v-text-field
              v-model="password"
              label="비밀번호"
              type="password"
              :rules="[rules.required, rules.min]"
              variant="outlined"
              class="mb-4"
              prepend-inner-icon="mdi-lock"
            ></v-text-field>

            <v-text-field
              v-model="confirmPassword"
              label="비밀번호 확인"
              type="password"
              :rules="[rules.required, rules.passwordMatch]"
              variant="outlined"
              class="mb-6"
              prepend-inner-icon="mdi-lock-check"
            ></v-text-field>

            <v-alert
              v-if="error"
              type="error"
              class="mb-4"
              closable
            >
              {{ error }}
            </v-alert>

            <v-btn
              type="submit"
              color="primary"
              block
              :loading="loading"
              :disabled="!isFormValid"
              class="mb-4"
              size="large"
            >
              회원가입
            </v-btn>

            <div class="text-center">
              <router-link to="/login" class="text-decoration-none">
                이미 계정이 있으신가요? 로그인
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

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const isFormValid = ref(false)
const error = ref('')

const rules = {
  required: v => !!v || '필수 입력 항목입니다',
  email: v => /.+@.+\..+/.test(v) || '유효한 이메일 주소를 입력해주세요',
  min: v => v.length >= 6 || '최소 6자 이상 입력해주세요',
  passwordMatch: v => v === password.value || '비밀번호가 일치하지 않습니다'
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  loading.value = true
  error.value = ''

  try {
    const result = await authStore.register({
      name: name.value,
      email: email.value,
      password: password.value
    })

    if (result.success) {
      router.push('/login')
    } else {
      error.value = '회원가입에 실패했습니다.'
    }
  } catch (err) {
    console.error('회원가입 실패:', err)
    error.value = err.response?.data?.error || '회원가입 중 오류가 발생했습니다.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.v-card {
  border-radius: 16px;
}

.v-text-field {
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
}

.v-btn {
  font-weight: 500;
  letter-spacing: -0.3px;
}

.v-card-title {
  font-weight: 700;
  letter-spacing: -0.5px;
}
</style>