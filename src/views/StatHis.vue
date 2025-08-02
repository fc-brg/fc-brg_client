<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card class="mx-auto pa-4">
          <v-card-title class="text-h5 mb-4">통계 히스토리</v-card-title>

          <!-- 닉네임 선택 -->
          <v-card class="mb-6 pa-4" variant="outlined">
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="selectedNickname"
                  :items="defaultNicknames"
                  label="닉네임 선택"
                  variant="outlined"
                  density="compact"
                  @update:model-value="loadHistory"
                ></v-select>
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="sortBy"
                  :items="sortOptions"
                  label="정렬 기준"
                  variant="outlined"
                  density="compact"
                  @update:model-value="loadHistory"
                ></v-select>
              </v-col>
            </v-row>
          </v-card>

          <!-- 통계 테이블 -->
          <div v-if="stats.length > 0">
            <v-data-table
              :headers="headers"
              :items="stats"
              :loading="loading"
              class="elevation-1 rounded-lg"
              density="comfortable"
              hover
              no-data-text="저장된 통계가 없습니다."
            >
              <template #[`item.matchType`]="{ item }">
                <v-chip
                  :color="item.matchType === 52 ? 'primary' : 'secondary'"
                  size="small"
                  variant="elevated"
                >
                  {{ item.matchType === 52 ? '감독모드' : '공식경기' }}
                </v-chip>
              </template>

              <template #[`item.winRate`]="{ item }">
                <span class="font-weight-bold text-primary">{{ item.winRate }}%</span>
              </template>

              <template #[`item.expectedPoints`]="{ item }">
                <span class="font-weight-bold text-success">{{ item.expectedPoints }}</span>
              </template>

              <template #[`item.matchStartAt`]="{ item }">
                {{ formatDateTime(item.matchStartAt) }}
              </template>

              <template #[`item.matchEndAt`]="{ item }">
                {{ formatDateTime(item.matchEndAt) }}
              </template>

              <template #[`item.createdAt`]="{ item }">
                {{ formatDateTime(item.createdAt) }}
              </template>

              <template #[`item.actions`]="{ item }">
                <v-btn
                  color="error"
                  size="small"
                  variant="outlined"
                  @click="deleteStat(item._id)"
                  :loading="deletingId === item._id"
                >
                  <v-icon size="small">mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-data-table>

            <!-- 이름별 종합 통계 -->
            <v-card class="mt-6 pa-4" variant="outlined">
              <v-card-title class="text-h6 mb-4">전술별 종합 통계</v-card-title>

              <v-data-table
                :headers="summaryHeaders"
                :items="summaryStats"
                class="elevation-1 rounded-lg"
                density="comfortable"
                hover
                no-data-text="종합 통계가 없습니다."
              >
                <template #[`item.totalMatches`]="{ item }">
                  <span class="font-weight-bold text-primary">{{ item.totalMatches }}경기</span>
                </template>

                <template #[`item.winRate`]="{ item }">
                  <span class="font-weight-bold text-primary">{{ item.winRate }}%</span>
                </template>

                <template #[`item.expectedPoints`]="{ item }">
                  <span class="font-weight-bold text-success">{{ item.expectedPoints }}</span>
                </template>
              </v-data-table>
            </v-card>
          </div>

          <div v-else-if="!loading" class="text-center py-8">
            <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-chart-line</v-icon>
            <div class="text-body-1 text-medium-emphasis">
              저장된 통계가 없습니다.
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'
import { formatKoreanTime } from '../utils/timezone'

// Stores
const authStore = useAuthStore()

// API 인스턴스 생성
const api = axios.create({
  baseURL: window.location.hostname === 'localhost' ?
    'http://localhost:3000' :
    window.location.origin,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  },
  withCredentials: true
})

// API 요청에 토큰 추가
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 반응형 데이터
const selectedNickname = ref('')
const sortBy = ref('createdAt')
const loading = ref(false)
const stats = ref([])
const deletingId = ref(null)

// 기본 닉네임 목록 (서버에서 동적으로 가져옴)
const defaultNicknames = ref([])

// 정렬 옵션
const sortOptions = [
  { title: '생성일 (최신순)', value: 'createdAt' },
  { title: '승률 (높은순)', value: 'winRate' },
  { title: '기대승점 (높은순)', value: 'expectedPoints' }
]

// 테이블 헤더
const headers = [
  { title: '이름', key: 'name', sortable: true },
  { title: '승', key: 'win', sortable: true },
  { title: '무', key: 'draw', sortable: true },
  { title: '패', key: 'lose', sortable: true },
  { title: '오류', key: 'nogame', sortable: true },
  { title: '승률', key: 'winRate', sortable: true },
  { title: '기대승점', key: 'expectedPoints', sortable: true },
  { title: '경기타입', key: 'matchType', sortable: true },
  { title: '시작일', key: 'matchStartAt', sortable: true },
  { title: '종료일', key: 'matchEndAt', sortable: true },
  { title: '생성일', key: 'createdAt', sortable: true },
  { title: '작업', key: 'actions', sortable: false }
]

// 종합 통계 헤더
const summaryHeaders = [
  { title: '이름', key: 'name', sortable: true },
  { title: '총 매치수', key: 'totalMatches', sortable: true },
  { title: '승', key: 'win', sortable: true },
  { title: '무', key: 'draw', sortable: true },
  { title: '패', key: 'lose', sortable: true },
  { title: '오류', key: 'nogame', sortable: true },
  { title: '승률', key: 'winRate', sortable: true },
  { title: '기대승점', key: 'expectedPoints', sortable: true }
]

// 종합 통계 계산
const summaryStats = computed(() => {
  if (!stats.value.length) return []

  // 이름별로 그룹핑
  const groupedStats = stats.value.reduce((acc, stat) => {
    if (!acc[stat.name]) {
      acc[stat.name] = {
        name: stat.name,
        win: 0,
        draw: 0,
        lose: 0,
        nogame: 0
      }
    }

    acc[stat.name].win += stat.win || 0
    acc[stat.name].draw += stat.draw || 0
    acc[stat.name].lose += stat.lose || 0
    acc[stat.name].nogame += stat.nogame || 0

    return acc
  }, {})

  // 승률과 기대승점 계산
  return Object.values(groupedStats).map(group => {
    const totalMatches = group.win + group.draw + group.lose + group.nogame
    const winRate = totalMatches > 0 ? ((group.win / totalMatches) * 100).toFixed(1) : 0
    const expectedPoints = totalMatches > 0 ? ((group.win * 3 + group.draw * 1) / totalMatches).toFixed(2) : 0

    return {
      ...group,
      totalMatches,
      winRate: parseFloat(winRate),
      expectedPoints: parseFloat(expectedPoints)
    }
  }).sort((a, b) => b.winRate - a.winRate) // 승률 높은 순으로 정렬
})

// 날짜/시간 포맷팅 함수
const formatDateTime = (dateString) => {
  if (!dateString) return '-';

  console.log('formatDateTime 입력:', {
    dateString,
    type: typeof dateString,
    isDate: dateString instanceof Date
  });

  const result = formatKoreanTime(dateString, 'datetime');

  console.log('formatDateTime 결과:', {
    input: dateString,
    output: result
  });

  return result;
};

// 기본 닉네임 목록 로드
const loadDefaultNicknames = async () => {
  try {
    const response = await api.get('/api/fc/users/default')
    if (response.data.success) {
      defaultNicknames.value = response.data.data.map(user => user.nickName)
      console.log('기본 닉네임 목록 로드 완료:', defaultNicknames.value)
    } else {
      console.error('기본 닉네임 목록 로드 실패:', response.data.error)
      // 에러 시 기본값 설정
      defaultNicknames.value = ['junspapa', 'junnypapa', '마곡아이언맨', '마곡퍼터맨', '머니트렌드', '절대월클아니다']
    }
  } catch (error) {
    console.error('기본 닉네임 목록 로드 오류:', error)
    // 에러 시에도 기본값 설정
    defaultNicknames.value = ['junspapa', 'junnypapa', '마곡아이언맨', '마곡퍼터맨', '머니트렌드', '절대월클아니다']
  }
}

// 통계 히스토리 로드
const loadHistory = async () => {
  if (!selectedNickname.value) return

  loading.value = true
  try {
    const response = await api.get('/api/gamestat/history', {
      params: {
        sortBy: sortBy.value,
        sortOrder: 'desc',
        targetNickname: selectedNickname.value
      }
    })

    if (response.data.success) {
      // 서버에서 이미 닉네임 필터링된 데이터가 오므로 바로 할당
      stats.value = response.data.data

      // 디버깅: 받은 데이터 확인
      if (stats.value.length > 0) {
        const sampleStat = stats.value[0];
        console.log('StatHis 받은 데이터 샘플:', {
          matchStartAt: sampleStat.matchStartAt,
          matchStartAtType: typeof sampleStat.matchStartAt,
          matchStartAtInstance: sampleStat.matchStartAt instanceof Date,
          matchEndAt: sampleStat.matchEndAt,
          matchEndAtType: typeof sampleStat.matchEndAt,
          matchEndAtInstance: sampleStat.matchEndAt instanceof Date
        });
      }

      console.log('통계 히스토리 로드 완료:', stats.value.length)
    } else {
      console.error('통계 히스토리 로드 실패:', response.data.error)
    }
  } catch (error) {
    console.error('통계 히스토리 로드 오류:', error)
  } finally {
    loading.value = false
  }
}

// 통계 삭제
const deleteStat = async (statId) => {
  if (!confirm('이 통계를 삭제하시겠습니까?')) return

  deletingId.value = statId
  try {
    const response = await api.delete(`/api/gamestat/${statId}`)

    if (response.data.success) {
      alert('통계가 삭제되었습니다.')
      await loadHistory() // 목록 새로고침
    } else {
      alert('삭제 실패: ' + response.data.error)
    }
  } catch (error) {
    console.error('통계 삭제 오류:', error)
    alert('통계 삭제 중 오류가 발생했습니다.')
  } finally {
    deletingId.value = null
  }
}

// 컴포넌트 마운트 시 초기화
onMounted(async () => {
  await loadDefaultNicknames()
  if (defaultNicknames.value.length > 0) {
    selectedNickname.value = defaultNicknames.value[0]
    // 기본 닉네임 설정 후 자동으로 통계 로드
    await loadHistory()
  }
})
</script>

<style scoped>
.v-data-table {
  border-radius: 8px;
}
</style>