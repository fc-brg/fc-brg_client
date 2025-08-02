<template>
  <v-container>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <span>거래 내역 (5천억 이상)</span>
        <v-btn @click="refresh" color="primary" prepend-icon="mdi-magnify">
          조회
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-select
              v-model="selectedNickname"
              :items="nicknames"
              label="닉네임 선택"
              density="compact"
              variant="outlined"
              @update:model-value="loadTrades"
            ></v-select>
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="tradeType"
              :items="tradeTypes"
              label="거래 유형"
              density="compact"
              variant="outlined"
            ></v-select>
          </v-col>
        </v-row>

        <v-row v-if="loading" class="justify-center">
          <v-col cols="12" class="text-center">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
            <div class="mt-2">거래 내역을 불러오는 중...</div>
          </v-col>
        </v-row>

        <v-row v-else-if="error" class="justify-center">
          <v-col cols="12" class="text-center">
            <v-alert type="error" variant="tonal">
              {{ error }}
            </v-alert>
          </v-col>
        </v-row>

        <v-row v-else>
          <v-col cols="12">
            <div class="d-flex align-center justify-space-between mb-4">
              <div>
                <h3>{{ selectedNickname }}의 거래 내역 (5천억 이상)</h3>
                <p class="text-caption text-grey-darken-1">
                  총 {{ trades.length }}개 중 {{ filteredTrades.length }}개 거래 내역 표시
                </p>
              </div>
              <div class="text-right">
                <div class="text-h6">
                  {{ formatKoreanMoney(Math.abs(totalProfit)) }}
                </div>
              </div>
            </div>

            <v-data-table
              :headers="headers"
              :items="filteredTrades"
              item-key="saleSn"
              :loading="loading"
              :sort-by="sortBy"
              class="elevation-1"
            >
              <template #[`item.seasonImg`]="{ item }">
                <v-avatar size="32" v-if="item.seasonImg">
                  <img :src="item.seasonImg" :alt="item.className || '시즌'" />
                </v-avatar>
                <v-avatar size="32" v-else color="grey-lighten-2">
                  <v-icon>mdi-help</v-icon>
                </v-avatar>
              </template>

              <template #[`item.value`]="{ item }">
                <span :style="{ color: getTradeTypeColor(item), fontWeight: 'bold' }">
                  {{ item.value.toLocaleString() }}
                </span>
                <div class="text-caption text-grey-darken-1">
                  ({{ formatKoreanMoney(item.value) }})
                </div>
              </template>

              <template #[`item.tradeDate`]="{ item }">
                <div>
                  <div>{{ formatDate(item.tradeDate) }}</div>
                  <div class="text-caption text-grey-darken-1">
                    {{ formatTime(item.tradeDate) }}
                  </div>
                </div>
              </template>

              <template #[`item.grade`]="{ item }">
                <v-chip
                  :color="getGradeColor(item.grade)"
                  :class="`bg-${getGradeBackgroundColor(item.grade)}`"
                  size="small"
                  variant="tonal"
                >
                  {{ item.grade }}
                </v-chip>
              </template>

              <template #[`item.tradetype`]="{ item }">
                <v-chip
                  :color="getTradeTypeColor(item)"
                  size="small"
                  variant="tonal"
                >
                  {{ getTradeTypeText(item) }}
                </v-chip>
              </template>
            </v-data-table>

            <!-- 안내 메시지 -->
            <v-alert
              type="info"
              variant="tonal"
              class="mt-4"
              icon="mdi-information"
            >
              <div class="text-body-2">
                <strong>📊 거래 내역 필터링 안내</strong><br>
                • <strong>5000억(500,000,000,000) 이상의 거래만 표시됩니다.</strong><br>
                • 총 {{ trades.length }}개 중 {{ filteredTrades.length }}개 거래가 표시됩니다.<br>
                • {{ trades.length - filteredTrades.length }}개 거래는 5000억 미만으로 필터링되었습니다.<br>
                • 더 많은 거래 내역을 보려면 관리자에게 문의하세요.
              </div>
            </v-alert>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import api from '@/api/index.js'

const selectedNickname = ref('')
const nicknames = ref([])
const trades = ref([])
const tradeType = ref('all')
const loading = ref(false)
const error = ref(null)

const tradeTypes = [
  { title: '전체', value: 'all' },
  { title: '구매', value: 'buy' },
  { title: '판매', value: 'sell' }
]

const headers = [
  { title: '거래일자', value: 'tradeDate', sortable: true, width: '150px' },
  { title: '타입', value: 'tradetype', sortable: true, width: '100px' },
  { title: '선수명', value: 'name', sortable: true },
  { title: '시즌', value: 'seasonImg', sortable: false, width: '80px' },
  { title: '등급', value: 'grade', sortable: true, width: '100px' },
  { title: '거래금액', value: 'value', sortable: true, width: '150px' }
]

// default sort 설정
const sortBy = ref([{ key: 'tradeDate', order: 'desc' }])

const filteredTrades = computed(() => {
  let filtered = trades.value;

  // 5000억 이상만 필터링
  filtered = filtered.filter(trade => trade.value >= 500000000000);

  // 거래 유형 필터링
  if (tradeType.value !== 'all') {
    filtered = filtered.filter(trade => {
      const type = getTradeType(trade);
      return type === tradeType.value;
    });
  }

  return filtered;
})

const totalProfit = computed(() => {
  return filteredTrades.value.reduce((total, trade) => {
    const type = getTradeType(trade);
    if (type === 'sell') {
      return total + trade.value
    } else {
      return total - trade.value
    }
  }, 0)
})

const loadNicknames = async () => {
  try {
    const { data } = await api.get('/api/fc/users/with-api-key')
    if (data.success) {
      nicknames.value = data.data.map(user => user.nickName)
      if (nicknames.value.length > 0 && !selectedNickname.value) {
        selectedNickname.value = nicknames.value[0]
      }
    }
  } catch (error) {
    console.error('API 키가 있는 사용자 목록 로드 실패:', error)
    // 기본 닉네임 설정
    nicknames.value = ['junspapa', 'junnypapa']
    if (nicknames.value.length > 0) {
      selectedNickname.value = nicknames.value[0]
    }
  }
}

const loadTrades = async () => {
  if (!selectedNickname.value) return

  loading.value = true
  error.value = null

  try {
    // 새로운 중복 방지 조회 API 사용
    const params = {
      limit: 100,
      offset: 0
    }

    // 거래 타입이 선택된 경우 tradetype 파라미터 추가
    if (tradeType.value !== 'all') {
      params.tradetype = tradeType.value
    }

    const { data } = await api.get(`/api/fc/trade/web/${selectedNickname.value}`, {
      params: params
    })

    if (data.success) {
      trades.value = data.data

      // 새로운 거래 내역이 추가된 경우 알림
      if (data.newTradesCount > 0) {
        console.log(`새로운 거래 내역 ${data.newTradesCount}개 추가됨`)
      }

      // 중복 발견 시 더 이상 조회할 데이터가 없음을 알림
      if (data.duplicateFound) {
        console.log('중복된 거래 내역 발견 - 모든 데이터 조회 완료')
      }
    } else {
      error.value = data.error || '거래 내역을 불러올 수 없습니다.'
    }
  } catch (err) {
    console.error('거래 내역 로드 실패:', err)
    error.value = '거래 내역을 불러오는 중 오류가 발생했습니다.'
  } finally {
    loading.value = false
  }
}

const refresh = async () => {
  await loadTrades()
}

const formatKoreanMoney = (value) => {
  if (!value || isNaN(value)) return '';
  value = Number(value);
  if (value < 10000) return value.toLocaleString();

  const jo = Math.floor(value / 1000000000000); // 조
  const eok = Math.floor((value % 1000000000000) / 100000000); // 억
  const chun = Math.floor((value % 100000000) / 10000000); // 천
  const man = Math.floor((value % 100000000) / 10000) % 10; // 만

  let result = '';
  if (jo > 0) result += `${jo}조`;
  if (eok > 0) result += ` ${eok}억`;
  if (chun > 0) result += ` ${chun}천`;
  else if (man > 0 && (jo > 0 || eok > 0)) result += ` ${man}만`;
  if (!result) result = value.toLocaleString();
  return result.trim();
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const formatTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getGradeColor = (grade) => {
  const gradeColors = {
    '레전드': 'purple',
    '유니크': 'orange',
    '에픽': 'blue',
    '레어': 'green',
    '노말': 'grey'
  }
  return gradeColors[grade] || 'grey'
}

const getGradeBackgroundColor = (grade) => {
  const gradeNum = parseInt(grade)
  if (gradeNum >= 1 && gradeNum <= 4) return 'bronze'
  if (gradeNum >= 5 && gradeNum <= 7) return 'silver'
  if (gradeNum >= 8 && gradeNum <= 10) return 'gold'
  if (gradeNum >= 11 && gradeNum <= 13) return 'rainbow'
  return 'default'
}

// 거래 타입 관련 함수들
const getTradeType = (trade) => {
  // tradeType을 우선 사용하고, 없으면 tradetype 사용
  return trade.tradeType || trade.tradetype || 'unknown'
}

const getTradeTypeText = (trade) => {
  const type = getTradeType(trade)
  switch (type) {
    case 'sell':
      return '판매'
    case 'buy':
      return '구매'
    default:
      return '알 수 없음'
  }
}

const getTradeTypeColor = (trade) => {
  const type = getTradeType(trade)
  switch (type) {
    case 'sell':
      return 'blue'
    case 'buy':
      return 'red'
    default:
      return 'grey'
  }
}

watch(selectedNickname, loadTrades)
watch(tradeType, loadTrades)

onMounted(() => {
  loadNicknames()
})
</script>

<style scoped>
.v-data-table {
  margin-top: 1rem;
}

/* 등급별 배경색 */
:deep(.v-chip.bg-bronze) {
  background-color: #cd7f32 !important;
  color: white !important;
}

:deep(.v-chip.bg-silver) {
  background-color: #c0c0c0 !important;
  color: black !important;
}

:deep(.v-chip.bg-gold) {
  background-color: #ffd700 !important;
  color: black !important;
}

:deep(.v-chip.bg-rainbow) {
  background: linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3) !important;
  color: white !important;
}
</style>