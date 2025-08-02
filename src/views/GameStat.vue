<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card class="mx-auto pa-4">
          <v-card-title class="text-h5 mb-4">게임 통계</v-card-title>

          <!-- 조회 박스 -->
          <v-card class="mb-6 pa-4" variant="outlined">
            <v-row>
              <!-- 경기 타입 탭 -->
              <v-col cols="12" md="6">
                <v-tabs v-model="matchType" class="mb-4">
                  <v-tab value="52">감독모드</v-tab>
                  <v-tab value="50">공식경기</v-tab>
                </v-tabs>
              </v-col>

              <!-- 닉네임 선택 -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="selectedNickname"
                  :items="defaultNicknames"
                  label="닉네임 선택"
                  variant="outlined"
                  density="compact"
                ></v-select>
              </v-col>

              <!-- 경기수 입력 -->
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="limit"
                  type="number"
                  label="경기수"
                  min="1"
                  max="1000"
                  variant="outlined"
                  density="compact"
                  @input="handleLimitInput"
                ></v-text-field>
              </v-col>

              <!-- offset 입력 -->
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="offset"
                  type="number"
                  label="시작 위치"
                  min="0"
                  variant="outlined"
                  density="compact"
                  @input="handleOffsetInput"
                ></v-text-field>
              </v-col>

              <!-- 조회 버튼 -->
              <v-col cols="12" md="6" class="d-flex align-center">
                <v-btn
                  color="primary"
                  :loading="loading"
                  @click="loadMatches"
                  class="mr-2"
                >
                  <v-icon class="mr-1">mdi-magnify</v-icon>
                  조회
                </v-btn>

                <v-btn
                  v-if="isLoggedIn"
                  color="success"
                  :disabled="selectedMatches.length === 0"
                  @click="showSaveDialog = true"
                >
                  <v-icon class="mr-1">mdi-content-save</v-icon>
                  저장
                </v-btn>
              </v-col>
            </v-row>
          </v-card>

          <!-- 선택된 매치 통계 -->
          <div v-if="selectedMatches.length > 0" class="mb-6">
            <v-card class="pa-4" variant="outlined">
              <v-card-title class="text-h6 mb-4">선택된 게임 통계</v-card-title>

              <v-row class="align-center justify-center">
                <v-col cols="auto">
                  <div class="d-flex align-center" style="font-size:2.5em;">
                    <span class="font-weight-bold text-primary">{{ stats.win }}승</span>
                    <span class="mx-2 font-weight-bold text-warning">{{ stats.draw }}무</span>
                    <span class="font-weight-bold text-error">{{ stats.lose }}패</span>
                    <span v-if="stats.nogame > 0" class="ml-2 font-weight-bold text-grey">{{ stats.nogame }}오류</span>
                  </div>
                </v-col>

                <v-col cols="auto">
                  <div style="width:100px; height:100px;">
                    <PieChart :data="pieChartData" :options="pieChartOptions" />
                  </div>
                </v-col>

                <v-col cols="auto" class="d-flex align-center">
                  <div class="text-center">
                    <div class="text-h4 font-weight-bold text-primary">
                      {{ winRate }}%
                    </div>
                    <div class="text-caption text-grey-darken-1">
                      승률
                    </div>
                  </div>
                </v-col>

                <v-col cols="auto" class="d-flex align-center">
                  <div class="text-center">
                    <div class="text-h4 font-weight-bold text-success">
                      {{ expectedPoints }}
                    </div>
                    <div class="text-caption text-grey-darken-1">
                      기대승점
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-card>
          </div>

          <!-- 매치 목록 -->
          <div v-if="matches.length > 0">
            <v-card-title class="text-h6 mb-4 d-flex justify-space-between">
              <span>매치 목록 ({{ matches.length }}경기)</span>
              <v-btn
                v-if="selectedMatches.length > 0"
                color="info"
                variant="outlined"
                size="small"
                @click="clearSelection"
              >
                선택 해제
              </v-btn>
            </v-card-title>

            <v-row>
              <v-col
                v-for="(match, index) in matches"
                :key="match.matchId"
                cols="12"
              >
                <v-card
                  :color="getMatchCardColor(match.result)"
                  variant="elevated"
                  class="match-card mb-2"
                  @click="toggleMatchSelection(match.matchId)"
                  :class="{ 'selected-match': selectedMatches.includes(match.matchId) }"
                  style="border-left: 4px solid;"
                  :style="{ 'border-left-color': getMatchBorderColor(match.result) }"
                >
                  <v-card-text class="py-3">
                    <div class="d-flex align-center justify-space-between">
                      <div class="d-flex align-center" style="min-width: 60px;">
                        <v-checkbox
                          :model-value="selectedMatches.includes(match.matchId)"
                          @click.stop
                          @change="toggleMatchSelection(match.matchId)"
                          hide-details
                          density="compact"
                          color="primary"
                          class="match-checkbox"
                        ></v-checkbox>
                      </div>

                      <div class="text-caption text-grey-darken-1" style="min-width: 100px;">
                        {{ formatMatchDate(match.matchDate) }}
                      </div>

                      <div class="text-center flex-grow-1">
                        <div class="text-h6 mb-1 font-weight-bold">
                          {{ match.myGoals }} VS {{ match.opponentGoals }}
                        </div>
                        <div class="text-caption mb-2">
                          {{ match.myTeamName }} VS {{ match.opponentTeamName }}
                        </div>
                      </div>

                      <div class="text-center" style="min-width: 80px;">
                        <v-chip
                          :color="getResultChipColor(match.result)"
                          size="small"
                          variant="elevated"
                          class="font-weight-bold"
                        >
                          {{ match.result }}
                        </v-chip>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <div v-else-if="!loading" class="text-center py-8">
            <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-gamepad-variant</v-icon>
            <div class="text-body-1 text-medium-emphasis">
              조회 버튼을 눌러 매치 데이터를 불러오세요.
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 저장 다이얼로그 -->
    <v-dialog v-model="showSaveDialog" max-width="500px">
      <v-card>
        <v-card-title>통계 저장</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="saveForm.name"
            label="저장할 이름"
            variant="outlined"
            required
          ></v-text-field>

          <v-select
            v-model="saveForm.category"
            :items="categories"
            label="카테고리"
            variant="outlined"
          ></v-select>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showSaveDialog = false">취소</v-btn>
          <v-btn color="primary" @click="saveStat" :loading="saving">저장</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useFCStore } from '@/stores/fc'
import axios from 'axios'
import { Pie as PieChart } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'

// Stores
const authStore = useAuthStore()
const fcStore = useFCStore()

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

// Chart.js 등록
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  ChartDataLabels,
  Title,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement
)

// 반응형 데이터
const matchType = ref('52') // 감독모드 기본값
const selectedNickname = ref('')
const limit = ref('100')
const offset = ref('0')
const loading = ref(false)
const matches = ref([])
const selectedMatches = ref([])
const showSaveDialog = ref(false)
const saving = ref(false)

// 저장 폼
const saveForm = ref({
  name: '',
  category: '기타'
})

// 카테고리 목록
const categories = ['기타', '시즌', '월별', '주별', '커스텀']

// 기본 닉네임 목록 (서버에서 동적으로 가져옴)
const defaultNicknames = ref([])

// 사용자 정보 (ouid 매핑)
const userInfo = ref({})

// 로그인 상태
const isLoggedIn = computed(() => authStore.isLoggedIn)

// 통계 계산
const stats = computed(() => {
  if (selectedMatches.value.length === 0) {
    return { win: 0, draw: 0, lose: 0, nogame: 0 }
  }

  const selectedMatchData = matches.value.filter(match =>
    selectedMatches.value.includes(match.matchId)
  )

  let win = 0, draw = 0, lose = 0, nogame = 0

  selectedMatchData.forEach(match => {
    if (match.result === '승' || match.result === '몰수승') {
      win++
    } else if (match.result === '무') {
      draw++
    } else if (match.result === '패' || match.result === '몰수패') {
      lose++
    } else {
      nogame++
    }
  })

  return { win, draw, lose, nogame }
})

// 승률 계산
const winRate = computed(() => {
  const total = stats.value.win + stats.value.draw + stats.value.lose
  if (total === 0) return 0
  return ((stats.value.win / total) * 100).toFixed(1)
})

// 기대승점 계산
const expectedPoints = computed(() => {
  const total = stats.value.win + stats.value.draw + stats.value.lose
  if (total === 0) return 0
  const points = (stats.value.win * 3) + (stats.value.draw * 1)
  return (points / total).toFixed(1)
})

// 파이차트 데이터
const pieChartData = computed(() => {
  const data = [stats.value.win, stats.value.draw, stats.value.lose]
  const labels = ['승', '무', '패']
  const backgroundColor = ['#4CAF50', '#FFC107', '#F44336']

  // 오류가 있는 경우 추가
  if (stats.value.nogame > 0) {
    data.push(stats.value.nogame)
    labels.push('오류')
    backgroundColor.push('#BDBDBD')
  }

  return {
    labels,
    datasets: [{
      data,
      backgroundColor,
      borderWidth: 1
    }]
  }
})

// 파이차트 옵션
const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    datalabels: {
      color: '#fff',
      font: { weight: 'bold', size: 12 },
      formatter: (value, ctx) => value > 0 ? value : ''
    }
  }
}

// 매치 카드 색상
const getMatchCardColor = (result) => {
  switch (result) {
    case '승':
    case '몰수승':
      return 'blue-lighten-4'
    case '패':
    case '몰수패':
      return 'red-lighten-4'
    case '무':
      return 'grey-lighten-3'
    default:
      return 'purple-lighten-4'
  }
}

// 매치 테두리 색상
const getMatchBorderColor = (result) => {
  switch (result) {
    case '승':
    case '몰수승':
      return '#1976d2' // blue
    case '패':
    case '몰수패':
      return '#d32f2f' // red
    case '무':
      return '#f57c00' // orange
    default:
      return '#7b1fa2' // purple
  }
}

// 결과 칩 색상
const getResultChipColor = (result) => {
  switch (result) {
    case '승':
    case '몰수승':
      return 'success'
    case '패':
    case '몰수패':
      return 'error'
    case '무':
      return 'warning'
    default:
      return 'grey'
  }
}

// 매치 날짜 포맷 (한국시간)
const formatMatchDate = (dateString) => {
  // DB에 저장된 날짜는 이미 UTC 형식이므로 Date 객체로 변환
  const date = new Date(dateString)

  // 한국 시간대로 직접 포맷팅
  return date.toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace(/\. /g, '월 ').replace(/\./g, '일 ')
}

// 사용자 정보 로드
const loadUserInfo = async () => {
  try {
    // 기본 닉네임 목록이 로드된 후에만 사용자 정보 로드
    if (defaultNicknames.value.length === 0) {
      console.log('기본 닉네임 목록이 비어있어 사용자 정보 로드를 건너뜁니다.');
      return;
    }

    const nicknameList = defaultNicknames.value
    console.log('사용자 정보 로드 시작:', nicknameList);

    const response = await api.get('/api/fc/users')
    console.log('서버 응답:', response.data);

    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      // 닉네임 목록에 있는 사용자만 필터링
      const filteredUsers = response.data.data.filter(user =>
        nicknameList.includes(user.nickName)
      );

      filteredUsers.forEach(userData => {
        console.log('사용자 데이터 처리:', userData);
        if (userData.nickName && userData.ouid) {
          userInfo.value[userData.nickName] = {
            ouid: userData.ouid,
            userType: userData.userType,
            source: userData.source
          }
          console.log(`사용자 정보 저장: ${userData.nickName} -> ${userData.ouid}`);
        } else {
          console.warn('유효하지 않은 사용자 데이터:', userData);
        }
      })
      console.log('사용자 정보 로드 완료:', userInfo.value);
    } else {
      console.error('서버 응답이 올바르지 않습니다:', response.data);
    }
  } catch (error) {
    console.error('사용자 정보 로드 실패:', error)
  }
}

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

// 매치 데이터 로드
const loadMatches = async () => {
  if (!selectedNickname.value) {
    alert('닉네임을 선택해주세요.')
    return
  }

  console.log('매치 데이터 로드 시작:', {
    selectedNickname: selectedNickname.value,
    userInfo: userInfo.value,
    userInfoKeys: Object.keys(userInfo.value)
  });

  const targetOuid = userInfo.value[selectedNickname.value]?.ouid
  console.log('targetOuid 조회 결과:', targetOuid);

  if (!targetOuid) {
    console.error('사용자 정보를 찾을 수 없음:', {
      selectedNickname: selectedNickname.value,
      userInfo: userInfo.value,
      availableNicknames: Object.keys(userInfo.value)
    });
    alert('선택한 닉네임의 정보를 찾을 수 없습니다.')
    return
  }

  loading.value = true
  try {
    const response = await api.post('/api/gamestat/matches', {
      targetOuid,
      matchType: parseInt(matchType.value),
      limit: parseInt(limit.value),
      offset: parseInt(offset.value)
    })

    if (response.data.success) {
      matches.value = response.data.data
      selectedMatches.value = [] // 선택 초기화
      console.log('매치 데이터 로드 완료:', matches.value.length)
      console.log('첫 번째 매치 데이터 샘플:', matches.value[0])
    } else {
      alert('매치 데이터 로드 실패: ' + response.data.error)
    }
  } catch (error) {
    console.error('매치 데이터 로드 오류:', error)
    alert('매치 데이터 로드 중 오류가 발생했습니다.')
  } finally {
    loading.value = false
  }
}

// 매치 선택 토글
const toggleMatchSelection = (matchId) => {
  const currentIndex = selectedMatches.value.indexOf(matchId)

  if (currentIndex > -1) {
    // 이미 선택된 경우: 선택 해제
    selectedMatches.value.splice(currentIndex, 1)
  } else {
    // 선택되지 않은 경우: 범위 선택 로직
    const matchIndex = matches.value.findIndex(match => match.matchId === matchId)
    const selectedIndices = selectedMatches.value.map(id =>
      matches.value.findIndex(match => match.matchId === id)
    ).filter(index => index !== -1)

    if (selectedIndices.length === 0) {
      // 첫 번째 선택: 단일 선택
      selectedMatches.value.push(matchId)
    } else if (selectedIndices.length === 1) {
      // 두 번째 선택: 범위 선택
      const firstIndex = selectedIndices[0]
      const secondIndex = matchIndex
      const startIndex = Math.min(firstIndex, secondIndex)
      const endIndex = Math.max(firstIndex, secondIndex)

      // 범위 내 모든 매치 선택
      selectedMatches.value = []
      for (let i = startIndex; i <= endIndex; i++) {
        selectedMatches.value.push(matches.value[i].matchId)
      }
    } else {
      // 세 번째 이상 선택: 기존 선택 유지하고 새로 추가
      selectedMatches.value.push(matchId)
    }
  }
}

// 숫자 입력 핸들러
const handleLimitInput = (event) => {
  const value = event.target.value
  if (value !== '') {
    const numValue = parseInt(value)
    if (numValue >= 1 && numValue <= 1000) {
      limit.value = numValue.toString()
    }
  }
}

const handleOffsetInput = (event) => {
  const value = event.target.value
  if (value !== '') {
    const numValue = parseInt(value)
    if (numValue >= 0) {
      offset.value = numValue.toString()
    }
  }
}

// 선택 해제
const clearSelection = () => {
  selectedMatches.value = []
}

// 통계 저장
const saveStat = async () => {
  if (!saveForm.value.name.trim()) {
    alert('저장할 이름을 입력해주세요.')
    return
  }

  if (selectedMatches.value.length === 0) {
    alert('저장할 매치를 선택해주세요.')
    return
  }

  const selectedMatchData = matches.value.filter(match =>
    selectedMatches.value.includes(match.matchId)
  )

  if (selectedMatchData.length === 0) {
    alert('선택된 매치 데이터가 없습니다.')
    return
  }

  // 날짜 범위 계산 (matchDate는 이미 UTC로 저장되어 있음)
  const dates = selectedMatchData.map(match => {
    console.log('매치 데이터 디버깅:', {
      matchId: match.matchId,
      matchDate: match.matchDate,
      matchDateType: typeof match.matchDate,
      matchDateInstance: match.matchDate instanceof Date
    });

    // matchDate는 이미 UTC 형식이므로 그대로 사용
    return new Date(match.matchDate);
  });

  const matchStartAt = new Date(Math.min(...dates.map(d => d.getTime())));
  const matchEndAt = new Date(Math.max(...dates.map(d => d.getTime())));

  console.log('날짜 범위 계산:', {
    selectedMatches: selectedMatches.value.length,
    matchStartAt: matchStartAt.toISOString(),
    matchEndAt: matchEndAt.toISOString(),
    originalDates: dates.map(d => d.toISOString())
  });

  saving.value = true
  try {
    const response = await api.post('/api/gamestat/save', {
      name: saveForm.value.name,
      category: saveForm.value.category,
      win: stats.value.win,
      draw: stats.value.draw,
      lose: stats.value.lose,
      nogame: stats.value.nogame,
      matchStartAt: matchStartAt.toISOString(), // UTC로 저장
      matchEndAt: matchEndAt.toISOString(), // UTC로 저장
      winRate: parseFloat(winRate.value),
      expectedPoints: parseFloat(expectedPoints.value),
      matchType: parseInt(matchType.value),
      targetOuid: userInfo.value[selectedNickname.value]?.ouid,
      targetNickname: selectedNickname.value,
      selectedMatches: selectedMatches.value
    })

    if (response.data.success) {
      alert('통계가 저장되었습니다.')
      showSaveDialog.value = false
      saveForm.value.name = ''
      saveForm.value.category = '기타'
    } else {
      alert('저장 실패: ' + response.data.error)
    }
  } catch (error) {
    console.error('통계 저장 오류:', error)
    alert('통계 저장 중 오류가 발생했습니다.')
  } finally {
    saving.value = false
  }
}

// 컴포넌트 마운트 시 사용자 정보 로드
onMounted(async () => {
  await loadDefaultNicknames()
  await loadUserInfo()
  if (defaultNicknames.value.length > 0) {
    selectedNickname.value = defaultNicknames.value[0]
  }
})
</script>

<style scoped>
.match-card {
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.match-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.selected-match {
  border: 2px solid #1976d2 !important;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3) !important;
}

.match-checkbox {
  z-index: 10;
  position: relative;
}

.match-checkbox :deep(.v-selection-control) {
  opacity: 1 !important;
  visibility: visible !important;
}

.match-checkbox :deep(.v-selection-control__input) {
  opacity: 1 !important;
  visibility: visible !important;
}

/* 카드 텍스트 가독성 개선 */
.match-card :deep(.v-card-text) {
  color: rgba(0, 0, 0, 0.87) !important;
}

.match-card :deep(.text-caption) {
  color: rgba(0, 0, 0, 0.6) !important;
}

/* 승/패/무별 텍스트 색상 강화 */
.match-card[style*="blue"] :deep(.text-h6) {
  color: #1565c0 !important;
}

.match-card[style*="red"] :deep(.text-h6) {
  color: #c62828 !important;
}

.match-card[style*="grey"] :deep(.text-h6) {
  color: #424242 !important;
}

.match-card[style*="purple"] :deep(.text-h6) {
  color: #6a1b9a !important;
}
</style>