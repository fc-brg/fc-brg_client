<template>
  <v-container fluid class="pa-6">
    <v-row>
      <v-col cols="12">
        <v-card class="mb-6">
          <v-card-title class="text-h4 font-weight-bold primary--text">
            <v-icon large class="mr-3">mdi-trophy</v-icon>
            FC Online 등급 현황
          </v-card-title>
        </v-card>

        <!-- 최근 데이터 테이블 -->
        <v-card class="mb-6">
          <v-card-title class="text-h5 font-weight-medium">
            <v-icon class="mr-2">mdi-account-group</v-icon>
            최근 등급 현황
          </v-card-title>

          <v-card-text>
            <v-data-table
              :headers="latestHeaders"
              :items="latestFriends"
              :loading="loading"
              :items-per-page="10"
              class="elevation-1"
              hide-default-footer
            >
              <template v-slot:item.icon_rank="{ item }">
                <div class="d-flex align-center">
                  <v-avatar size="24" class="mr-2">
                    <v-img v-if="item.icon_rank_url" :src="item.icon_rank_url" :alt="item.icon_rank"></v-img>
                    <v-icon v-else>mdi-trophy-outline</v-icon>
                  </v-avatar>
                  <v-chip
                    :color="getRankColor(item.icon_rank)"
                    text-color="white"
                    small
                    label
                  >
                    {{ item.icon_rank }}
                  </v-chip>
                </div>
              </template>

              <template v-slot:item.access_on="{ item }">
                <v-chip
                  :color="item.access_on === '접속중' ? 'success' : 'grey'"
                  text-color="white"
                  small
                  label
                >
                  <v-icon left small>{{ item.access_on === '접속중' ? 'mdi-circle' : 'mdi-circle-outline' }}</v-icon>
                  {{ item.access_on }}
                </v-chip>
              </template>

              <template v-slot:item.in_date="{ item }">
                <span class="text-caption">{{ formatDate(item.in_date) }}</span>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>

        <!-- 히스토리 섹션 -->
        <v-card>
          <v-card-title class="text-h5 font-weight-medium">
            <v-icon class="mr-2">mdi-history</v-icon>
            등급 히스토리
          </v-card-title>

          <v-card-text>
            <!-- 닉네임 선택 -->
            <v-row class="mb-4">
              <v-col cols="12" md="6">
                <v-select
                  v-model="selectedNickname"
                  :items="availableNicknames"
                  label="닉네임 선택"
                  prepend-icon="mdi-account"
                  clearable
                  @update:model-value="loadHistory"
                  outlined
                  dense
                ></v-select>
              </v-col>
            </v-row>

            <!-- 히스토리 데이터 -->
            <div v-if="historyData.length > 0">
              <!-- 히스토리 카드 뷰 -->
              <v-row>
                <v-col cols="12" md="8">
                  <v-timeline dense>
                    <v-timeline-item
                      v-for="(item, index) in historyData"
                      :key="item._id"
                      :color="getTimelineDotColorHex(index)"
                      small
                      fill-dot
                      class="custom-timeline-item"
                    >
                      <template v-slot:opposite>
                        <span class="text-caption">{{ formatDate(item.in_date) }}</span>
                      </template>

                      <v-card class="elevation-2 timeline-card">
                        <v-card-text class="pa-4">
                          <!-- 1줄: 등급 + 접속여부 -->
                          <div class="d-flex align-center justify-space-between mb-1">
                            <div class="d-flex align-center">
                              <v-avatar size="32" class="mr-3">
                                <v-img v-if="item.icon_rank_url" :src="item.icon_rank_url" :alt="item.icon_rank"></v-img>
                                <v-icon v-else>mdi-trophy-outline</v-icon>
                              </v-avatar>
                              <v-chip
                                :color="getRankColor(item.icon_rank)"
                                text-color="white"
                                small
                                label
                                class="mb-0"
                              >
                                {{ item.icon_rank }}
                              </v-chip>
                            </div>
                            <v-chip
                              :color="item.access_on === '접속중' ? 'success' : 'grey'"
                              text-color="white"
                              small
                              label
                            >
                              <v-icon left x-small>{{ item.access_on === '접속중' ? 'mdi-circle' : 'mdi-circle-outline' }}</v-icon>
                              {{ item.access_on }}
                            </v-chip>
                          </div>
                          <!-- 2줄: 레벨 -->
                          <div class="text-caption mb-1">레벨: {{ item.level || '-' }}</div>
                          <!-- 3줄: 등급 변화 설명 (맨 아래 카드 제외 항상 표시) -->
                          <div v-if="index < historyData.length - 1">
                            <template v-if="getRankNumber(item.icon_rank_url) !== getRankNumber(historyData[index+1].icon_rank_url)">
                              <span :class="getRankNumber(item.icon_rank_url) < getRankNumber(historyData[index+1].icon_rank_url) ? 'change-indicator-up' : 'change-indicator-down'">
                                {{ getRankNumber(item.icon_rank_url) < getRankNumber(historyData[index+1].icon_rank_url) ? '▲' : '▼' }}
                                {{ historyData[index+1].icon_rank }} → {{ item.icon_rank }}
                              </span>
                            </template>
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-timeline-item>
                  </v-timeline>
                </v-col>

                <!-- 통계 카드 -->
                <v-col cols="12" md="4">
                  <v-card class="elevation-2">
                    <v-card-title class="text-h6">
                      <v-icon class="mr-2">mdi-chart-line</v-icon>
                      통계
                    </v-card-title>
                    <v-card-text>
                      <div class="text-h4 font-weight-bold primary--text mb-2">
                        {{ historyData.length }}
                      </div>
                      <div class="text-caption grey--text">총 기록 수</div>

                      <v-divider class="my-3"></v-divider>

                      <div v-if="currentRank">
                        <div class="text-subtitle-2 font-weight-medium">현재 등급</div>
                        <v-chip
                          :color="getRankColor(currentRank)"
                          text-color="white"
                          small
                          label
                          class="mt-1"
                        >
                          {{ currentRank }}
                        </v-chip>
                      </div>

                      <v-divider class="my-3"></v-divider>

                      <div v-if="firstSeen">
                        <div class="text-subtitle-2 font-weight-medium">첫 기록</div>
                        <div class="text-caption grey--text">{{ formatDate(firstSeen) }}</div>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </div>

            <!-- 데이터 없음 -->
            <v-alert
              v-else-if="selectedNickname"
              type="info"
              outlined
              class="text-center"
            >
              <v-icon large class="mb-2">mdi-information-outline</v-icon>
              <div class="text-h6">히스토리 데이터가 없습니다</div>
              <div class="text-caption">선택한 닉네임의 등급 히스토리가 없습니다.</div>
            </v-alert>

            <!-- 닉네임 미선택 -->
            <v-alert
              v-else
              type="info"
              outlined
              class="text-center"
            >
              <v-icon large class="mb-2">mdi-account-search</v-icon>
              <div class="text-h6">닉네임을 선택해주세요</div>
              <div class="text-caption">위에서 닉네임을 선택하면 등급 히스토리를 확인할 수 있습니다.</div>
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { formatKoreanTime } from '@/utils/timezone.js'

export default {
  name: 'Ranking',
  setup() {
    const latestFriends = ref([])
    const historyData = ref([])
    const selectedNickname = ref('')
    const availableNicknames = ref([])
    const loading = ref(false)

    // 테이블 헤더 정의
    const latestHeaders = [
      { text: '닉네임', value: 'nickname', sortable: true },
      { text: '등급', value: 'icon_rank', sortable: true },
      { text: '레벨', value: 'level', sortable: true },
      { text: '접속상태', value: 'access_on', sortable: true },
      { text: '조회일', value: 'in_date', sortable: true }
    ]

    // 최신 데이터 로드
    const loadLatestData = async () => {
      try {
        loading.value = true
        const response = await axios.get('/api/friends/latest')
        latestFriends.value = response.data

        // 사용 가능한 닉네임 목록 생성
        availableNicknames.value = [...new Set(response.data.map(friend => friend.nickname))]
      } catch (error) {
        console.error('최신 데이터 로드 실패:', error)
      } finally {
        loading.value = false
      }
    }

    // 히스토리 데이터 로드
    const loadHistory = async () => {
      if (!selectedNickname.value) {
        historyData.value = []
        return
      }

      try {
        loading.value = true
        const response = await axios.get(`/api/friends/history/${encodeURIComponent(selectedNickname.value)}`)
        const allData = response.data

        // 변경사항만 필터링 (변경이 발생한 순간의 데이터만)
        const filteredData = allData.filter((item, index) => {
          if (index === allData.length - 1) return true // 마지막 데이터는 항상 포함
          const nextItem = allData[index + 1]
          return item.icon_rank !== nextItem.icon_rank || item.level !== nextItem.level
        })

        historyData.value = filteredData
      } catch (error) {
        console.error('히스토리 데이터 로드 실패:', error)
        historyData.value = []
      } finally {
        loading.value = false
      }
    }

    // 날짜 포맷팅 (timezone 유틸리티 사용)
    const formatDate = (dateString) => {
      return formatKoreanTime(dateString, 'datetime')
    }

        // 등급별 색상 매핑
    const getRankColor = (rank) => {
      const rankColors = {
        // 챔피언스 - 레드 계열
        '슈퍼챔피언스': 'super-champion', // 커스텀 클래스
        '챔피언스': 'red darken-1',

        // 챌린저 - 그린 계열
        '슈퍼챌린지': 'green darken-3',
        '챌린지1부': 'green darken-2',
        '챌린지2부': 'green darken-1',
        '챌린지3부': 'green',

        // 프로 - 골드 계열 (눈에 잘 띄게)
        '프로 1부': 'amber darken-3',
        '프로 2부': 'amber darken-2',
        '프로 3부': 'amber darken-1',

        // 세미프로 - 블루 스카이 계열
        '세미프로 1부': 'light-blue darken-2',
        '세미프로 2부': 'light-blue darken-1',
        '세미프로 3부': 'light-blue',

        // 월드클래스 - 중간 등급
        '월드클래스 1부': 'blue-grey darken-2',
        '월드클래스 2부': 'blue-grey darken-1',
        '월드클래스 3부': 'blue-grey',

        // 배치
        '배치': 'grey'
      }
      return rankColors[rank] || 'grey'
    }

    // 등급 숫자 추출 함수
    function getRankNumber(url) {
      const match = url && url.match(/ico_rank(\d+)/);
      return match ? parseInt(match[1], 10) : 99;
    }

    // 변경사항 설명 생성 (이전 → 현재)
    const getChangeDescription = (currentItem, nextItem) => {
      if (!currentItem || !nextItem) return null;
      if (currentItem.icon_rank !== nextItem.icon_rank) {
        const prevRank = rankOrder[currentItem.icon_rank] || 99;
        const currRank = rankOrder[nextItem.icon_rank] || 99;
        let direction = '';
        let color = '';
        if (prevRank > currRank) {
          direction = 'up';
          color = 'up';
        } else if (prevRank < currRank) {
          direction = 'down';
          color = 'down';
        }
        return {
          direction,
          color,
          message: `등급: ${currentItem.icon_rank} → ${nextItem.icon_rank}`
        };
      }
      return null;
    }

    // 통계 데이터 계산
    const currentRank = computed(() => {
      if (historyData.value.length > 0) {
        return historyData.value[0].icon_rank
      }
      return null
    })

    const firstSeen = computed(() => {
      if (historyData.value.length > 0) {
        return historyData.value[historyData.value.length - 1].in_date
      }
      return null
    })

    // 타임라인 점(원) 색상 동적 적용
    function getTimelineDotColor(index) {
      if (index < historyData.value.length - 1) {
        const curr = historyData.value[index]
        const prev = historyData.value[index+1]
        if (getRankNumber(curr.icon_rank_url) < getRankNumber(prev.icon_rank_url)) {
          return 'primary' // 상승(▲) 파랑
        } else if (getRankNumber(curr.icon_rank_url) > getRankNumber(prev.icon_rank_url)) {
          return 'error' // 하락(▼) 빨강
        }
      }
      return 'grey' // 변화 없음/최초
    }

    // 타임라인 점(원) 색상 HEX로 반환
    function getTimelineDotColorHex(index) {
      if (index < historyData.value.length - 1) {
        const curr = historyData.value[index]
        const prev = historyData.value[index+1]
        if (getRankNumber(curr.icon_rank_url) < getRankNumber(prev.icon_rank_url)) {
          return '#1976d2'; // 파랑
        } else if (getRankNumber(curr.icon_rank_url) > getRankNumber(prev.icon_rank_url)) {
          return '#d32f2f'; // 빨강
        }
      }
      return '#bdbdbd'; // 회색
    }

    // 타임라인 점(원) 색상/크기 인라인 스타일 적용
    function getTimelineDotStyle(index) {
      let bg = '#bdbdbd';
      if (index < historyData.value.length - 1) {
        const curr = historyData.value[index]
        const prev = historyData.value[index+1]
        if (getRankNumber(curr.icon_rank_url) < getRankNumber(prev.icon_rank_url)) {
          bg = '#1976d2'; // 파랑
        } else if (getRankNumber(curr.icon_rank_url) > getRankNumber(prev.icon_rank_url)) {
          bg = '#d32f2f'; // 빨강
        }
      }
      return {
        backgroundColor: bg,
        borderColor: bg,
        width: '10px',
        height: '10px',
        minWidth: '10px',
        minHeight: '10px',
        maxWidth: '10px',
        maxHeight: '10px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        borderRadius: '50%',
        borderWidth: '2px',
        borderStyle: 'solid',
        zIndex: 2
      }
    }

    onMounted(() => {
      loadLatestData()
    })

    return {
      latestFriends,
      historyData,
      selectedNickname,
      availableNicknames,
      loading,
      latestHeaders,
      loadHistory,
      formatDate,
      getRankColor,
      getChangeDescription,
      currentRank,
      firstSeen,
      getRankNumber,
      getTimelineDotColor,
      getTimelineDotStyle,
      getTimelineDotColorHex
    }
  }
}
</script>

<style scoped>
/* Vuetify 컴포넌트 스타일링 */
.v-timeline-item__dot {
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

/* 커스텀 타임라인 아이템 스타일링 */
.custom-timeline-item .v-timeline-item__dot {
  width: 10px !important;
  height: 10px !important;
  border-radius: 50% !important;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2) !important;
  border: 2px solid white !important;
}

.custom-timeline-item .v-timeline-item__dot::before {
  content: '';
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
  z-index: -1;
}

/* 변경사항 표시 스타일 */
.change-indicator {
  color: #1976d2;
  font-weight: 500;
  margin-top: 4px;
  padding: 2px 6px;
  background: rgba(25, 118, 210, 0.1);
  border-radius: 4px;
  display: inline-block;
}
.change-indicator-up {
  color: #1976d2;
  background: #e3f2fd;
  font-size: 12px;
  font-weight: 500;
  margin-top: 4px;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}
.change-indicator-down {
  color: #d32f2f;
  background: #ffebee;
  font-size: 12px;
  font-weight: 500;
  margin-top: 4px;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}

.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
}

.v-chip {
  font-weight: 500;
}

.v-data-table {
  border-radius: 8px;
  overflow: hidden;
}

.v-alert {
  border-radius: 12px;
}

/* 슈퍼챔피언스 커스텀 스타일 - 블랙 배경, 골드 폰트, 레드 테두리 */
.super-champion {
  background: #000000 !important;
  color: #ffd700 !important;
  font-weight: bold !important;
  border: 2px solid #d32f2f !important;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.8) !important;
  box-shadow: 0 2px 8px rgba(211, 47, 47, 0.6) !important;
}

/* 슈퍼챔피언스 호버 효과 */
.super-champion:hover {
  background: #1a1a1a !important;
  color: #ffed4e !important;
  border-color: #b71c1c !important;
  transform: scale(1.05) !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 4px 12px rgba(211, 47, 47, 0.8) !important;
}

.timeline-card {
  min-width: 320px;
  min-height: 120px;
  margin-bottom: 16px;
  box-sizing: border-box;
}

:deep(.v-timeline-item__dot) {
  width: 10px !important;
  height: 10px !important;
  min-width: 10px !important;
  min-height: 10px !important;
  max-width: 10px !important;
  max-height: 10px !important;
  border-radius: 50% !important;
}
</style>