<template>
  <v-container>


    <!-- 닉네임 관리 영역 주석처리
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card class="mx-auto pa-4">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-3" size="large">mdi-account-multiple</v-icon>
            <span>닉네임 관리</span>
          </v-card-title>

          <v-container>
            <v-row>
              <v-col cols="12" md="8">
                <v-text-field
                  v-model="newNickname"
                  label="새 닉네임 추가"
                  @keyup.enter="addNickname"
                  :disabled="loading"
                  variant="outlined"
                  placeholder="FC 온라인 닉네임을 입력하세요"
                >
                  <template v-slot:append>
                    <v-btn
                      icon="mdi-plus"
                      @click="addNickname"
                      :disabled="loading || !newNickname.trim()"
                      color="primary"
                    ></v-btn>
                  </template>
                </v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-btn
                  @click="addNickname"
                  :disabled="loading || !newNickname.trim()"
                  color="primary"
                  size="large"
                  block
                  variant="elevated"
                >
                  <v-icon class="mr-2">mdi-plus</v-icon>
                  닉네임 추가
                </v-btn>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <div class="text-subtitle-1 mb-3 font-weight-medium">현재 닉네임 목록</div>
                <draggable
                  v-model="nicknames"
                  item-key="userName"
                  handle=".drag-handle"
                  @end="saveNicknames"
                >
                  <template #item="{ element }">
                    <v-chip
                      class="ma-1"
                      :closable="!element.isDefault"
                      @click:close="removeNickname(nicknames.indexOf(element))"
                      :disabled="loading"
                      size="large"
                      :color="element.isDefault ? 'primary' : 'default'"
                      :variant="element.isDefault ? 'elevated' : 'tonal'"
                    >
                      <v-icon class="drag-handle mr-1">mdi-drag</v-icon>
                      {{ element.userName }}
                      <v-icon v-if="element.isDefault" class="ml-1" size="small">mdi-star</v-icon>
                    </v-chip>
                  </template>
                </draggable>
              </v-col>
            </v-row>

            <v-row class="mt-4">
              <v-col cols="12">

              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
    -->

    <!-- 닉네임별 전적 표시 -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card class="mx-auto pa-4">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-3" size="large">mdi-account-multiple</v-icon>
            <span>전적 조회</span>
          </v-card-title>

          <!-- 데이터 범위 안내 -->
          <v-alert
            type="info"
            variant="tonal"
            class="mb-4"
            border="start"
            density="compact"
          >
            <template v-slot:prepend>
              <v-icon>mdi-information</v-icon>
            </template>
            <div class="text-body-2">
              <p><strong>전적 조회:</strong> 최근 경기 수에 맞춘 데이터 (실시간 계산)</p>
              <p><strong>선수별 활약:</strong> 전체 경기 누적 데이터 (DB 저장)</p>
            </div>
          </v-alert>

          <v-container>
            <v-tabs
              v-model="activeTab"
              color="primary"
              align-tabs="start"
              class="mb-4 nickname-tabs"
            >
              <v-tab
                v-for="nickname in nicknames"
                :key="nickname.userName"
                :value="nickname.userName"
                class="nickname-tab"
              >
                <v-icon v-if="nickname.isDefault" size="small" color="primary" class="mr-1">mdi-star</v-icon>
                {{ nickname.userName }}
              </v-tab>
            </v-tabs>

            <v-window v-model="activeTab">
              <v-window-item
                v-for="nickname in nicknames"
                :key="nickname.userName"
                :value="nickname.userName"
              >
                <div class="d-flex justify-end mb-2">
                  <!-- 게임 수 선택 콤보박스 -->
                  <v-select
                    v-model="selectedMatchCount"
                    :items="matchCountOptions"
                    label="게임 수"
                    style="max-width: 120px"
                    class="mr-2"
                    density="compact"
                    variant="outlined"
                    prepend-inner-icon="mdi-gamepad-variant"
                    hint="미리 계산된 통계 사용"
                    persistent-hint
                  ></v-select>

                  <v-btn
                    color="info"
                    variant="outlined"
                    size="small"
                    :loading="loading"
                    @click="loadDirectorData(nickname, true)"
                  >
                    <v-icon class="mr-1">mdi-refresh</v-icon>
                    화면 갱신
                  </v-btn>
                  <!-- 데이터 재조회 버튼 주석처리
                  <v-btn
                    color="warning"
                    variant="outlined"
                    size="small"
                    class="ml-2"
                    :loading="isRefreshing"
                    @click="refreshDirectorData(nickname)"
                  >
                    <v-icon class="mr-1">mdi-database-refresh</v-icon>
                    데이터 재조회
                  </v-btn>
                  <v-btn
                    color="success"
                    variant="outlined"
                    size="small"
                    class="ml-2"
                    :loading="isRefreshing"
                    @click="refreshAllDirectorData"
                  >
                    <v-icon class="mr-1">mdi-database-sync</v-icon>
                    전체 재조회
                  </v-btn>
                  -->
                </div>
                <div v-if="nickname && Array.isArray(nickname.matches) && nickname.matches.length > 0">
                  <!-- 전적 요약 한 줄 + 파이차트 -->
                  <v-row class="mb-4 align-center justify-center">
                    <v-col cols="auto">
                      <div class="d-flex align-center" style="font-size:3.4em;">
                        <span class="font-weight-bold text-primary">{{ nickname.stats?.win || 0 }}승</span>
                        <span class="mx-2 font-weight-bold text-warning">{{ nickname.stats?.draw || 0 }}무</span>
                        <span class="font-weight-bold text-error">{{ nickname.stats?.lose || 0 }}패</span>
                        <span v-if="(nickname.stats?.error || 0) > 0" class="ml-2 font-weight-bold text-grey">{{ nickname.stats?.error || 0 }}오류</span>
                      </div>
                    </v-col>
                    <v-col cols="auto">
                      <div style="width:120px; height:120px;">
                        <PieChart :data="getPieChartData(nickname.stats)" :options="pieChartOptions" />
                      </div>
                    </v-col>
                    <v-col cols="auto" class="d-flex align-center">
                      <div class="text-center">
                        <div class="text-h4 font-weight-bold text-primary">
                          {{ getWinRate(nickname.stats) }}%
                        </div>
                        <div class="text-caption text-grey-darken-1">
                          승률
                        </div>
                      </div>
                    </v-col>
                  </v-row>

                  <!-- 매치 목록: 한 줄에 3개씩 카드 배치, 무승부 색상 회색계열로 변경, VS 표시 개선 -->
                  <v-row>
                    <v-col
                      v-for="match in nickname.matches"
                      :key="match.matchId"
                      cols="12" md="4"
                    >
                      <v-card
                        :color="getMatchCardColor(match, nickname.userName)"
                        variant="tonal"
                        class="match-card"
                      >
                        <v-card-text>
                          <div class="d-flex align-center justify-space-between">
                            <div class="text-subtitle-1 font-weight-medium">
                              {{ getMatchResult(match, nickname.userName) }}
                              {{ getMatchEndTypeText(match, nickname.userName) }}
                            </div>
                            <div class="text-caption text-grey-darken-1">
                              {{ formatMatchDate(match.matchDate) }}
                            </div>
                          </div>
                          <div class="text-h6 text-center my-2">
                            {{ getMatchScore(match, nickname.userName) }}
                          </div>
                          <div class="text-caption text-center">
                            {{ nickname.userName }} VS {{ getOpponentNickname(match, nickname.userName) }}
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                  <!-- 디버깅용 정보 표시 -->
                  <div class="text-caption text-grey-darken-1 mt-2">
                    현재 탭: {{ nickname.userName }}, 매치 수: {{ nickname.matches?.length || 0 }}
                  </div>
                </div>
                <div v-else class="text-center py-8">
                  <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-account-question</v-icon>
                  <div class="text-body-1 text-medium-emphasis">
                    {{ nickname.userName }}의 전적 데이터가 없습니다.
                  </div>
                </div>
              </v-window-item>
            </v-window>
          </v-container>
        </v-card>
      </v-col>
    </v-row>



    <!-- 닉네임별 전적 조회 아래에 선수별 통계 테이블 UI 추가 -->
    <v-row class="mt-8">
      <v-col cols="12">
        <v-card class="mx-auto pa-4">
          <v-card-title class="text-h5 mb-4">선수별 활약</v-card-title>
          <v-tabs v-model="activeTab" class="mb-4">
            <v-tab v-for="nickname in nicknames" :key="nickname.userName" :value="nickname.userName">
              {{ nickname.userName }}
            </v-tab>
          </v-tabs>
          <v-window v-model="activeTab">
            <v-window-item v-for="nickname in nicknames" :key="nickname.userName" :value="nickname.userName">
              <div class="d-flex justify-end mb-2">
                <!-- 선수 통계 로드 버튼 주석처리
                <v-btn
                  color="info"
                  variant="outlined"
                  size="small"
                  :loading="loadingPlayerStats"
                  @click="loadPlayerStats(nickname)"
                >
                  <v-icon class="mr-1">mdi-refresh</v-icon>
                  선수 통계 로드
                </v-btn>
                -->
              </div>
              <v-data-table
                :headers="[
                  { title: '선수명', key: 'name', align: 'start' },
                  { title: '시즌', key: 'seasonImg', align: 'center' },
                  { title: '출전', key: 'appearances', align: 'end' },
                  { title: '골', key: 'totalGoals', align: 'end' },
                  { title: '도움', key: 'assist', align: 'end' },
                  { title: '인터셉트', key: 'intercept', align: 'end' },
                  { title: '수비', key: 'defending', align: 'end' },
                  { title: '블록', key: 'blockSuccess', align: 'end' },
                  { title: '태클', key: 'tackle', align: 'end' },
                  { title: '옐로카드', key: 'yellowCards', align: 'end' },
                  { title: '레드카드', key: 'redCards', align: 'end' },
                  { title: '평균 평점', key: 'spRating', align: 'end' }
                ]"
                :items="getFilteredPlayerStats(nickname.userName)"
                :loading="loadingPlayerStats"
                class="elevation-1 rounded-lg"
                density="comfortable"
                hover
                no-data-text="선수 활약 데이터가 없습니다."
              >
                <template #[`item.seasonImg`]="{ item }">
                  <div class="d-flex justify-center">
                    <v-img
                      v-if="item.seasonImg"
                      :src="item.seasonImg"
                      width="24"
                      height="24"
                      :title="getSeasonName(item.seasonId)"
                    ></v-img>
                  </div>
                </template>
              </v-data-table>
            </v-window-item>
          </v-window>
        </v-card>
      </v-col>
    </v-row>

    <!-- 하단 데이터 재조회 섹션 삭제 -->
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useFCStore } from '@/stores/fc'
import axios from 'axios'
import draggable from 'vuedraggable'
import { Pie as PieChart } from 'vue-chartjs'
import { formatKoreanTime } from '../utils/timezone'
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

// API 인스턴스 생성 (Authorization 자동 추가)
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
});
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    // 캐시 무효화를 위한 타임스탬프 추가
    if (config.method === 'get') {
        config.params = {
            ...config.params,
            _t: Date.now()
        };
    }
    return config;
});

// 닉네임 비교 함수 (대소문자 무시)
const compareNicknames = (nickname1, nickname2) => {
    if (!nickname1 || !nickname2) return false;
    return nickname1.toLowerCase() === nickname2.toLowerCase();
};

// 기본 닉네임 목록 (항상 표시)
const defaultNicknames = [
  'junspapa',
  'junnypapa',
  '절대월클아니다',
  '머니트렌드',
  '마곡아이언맨',
  '마곡퍼터맨'
];

// 반응형 데이터
const nicknames = ref([]);
const newNickname = ref('');
const loading = ref(false);
const isRefreshing = ref(false);
const isUpdating = ref(false);
const activeTab = ref('');
const refreshProgress = ref(0);

// 게임 수별 미리 계산된 통계 관련
const selectedMatchCount = ref(20);
const matchCountOptions = [
  { title: '20게임', value: 20 },
  { title: '50게임', value: 50 },
  { title: '100게임', value: 100 }
];

// API 키 통계 관련
const apiKeyStats = ref(null);
const loadingApiStats = ref(false);

// 데이터 재조회 관련
const refreshMatchType = ref(52); // 감독모드 기본값
const refreshing = ref(false);
const refreshResults = ref([]);
const showRefreshHistory = ref(false);

// 시즌 정보 관련
const seasonMap = ref({});

// 관리자 권한 확인 (auth store 사용)
const isAdmin = computed(() => authStore.isAdmin);

// 게임 수 선택 시 미리 계산된 통계 로드
watch(selectedMatchCount, async (newMatchCount) => {
  if (newMatchCount && activeTab.value) {
    const currentNickname = nicknames.value.find(n => n.userName === activeTab.value);
    if (currentNickname) {
      // OUID가 없으면 사용자 정보 먼저 로드
      if (!currentNickname.ouid) {
        console.log(`${currentNickname.userName}의 OUID가 없어서 사용자 정보 로드`);
        await loadUserInfo();
      }

      // 미리 계산된 통계 우선 로드 시도
      if (currentNickname.ouid) {
        try {
          await loadPreCalculatedStats(currentNickname, newMatchCount);
        } catch (error) {
          console.log(`${currentNickname.userName} 미리 계산된 통계 로드 실패, 실시간 데이터 로드`);
          await loadDirectorData(currentNickname, false);
        }
      } else {
        console.log(`${currentNickname.userName}의 OUID가 없어서 실시간 데이터 로드`);
        await loadDirectorData(currentNickname, false);
      }
    }
  }
});

// 닉네임 저장 함수 (localStorage 사용 안함)
const saveNicknames = () => {
    // localStorage 사용 안함 - 서버에서 실시간 조회
    console.log('닉네임 저장 함수 호출됨 (localStorage 사용 안함)');
};

// 잘못된 ouid 초기화 함수
const resetInvalidOuids = () => {
    console.log('잘못된 ouid 초기화 시작');

    // 현재 nicknames에서 잘못된 ouid 확인
    const invalidOuids = nicknames.value.filter(nick =>
        nick.ouid === 'aeaeaeaeaeaeaeaeaeaeaeaeaeaeaeaeae' ||
        nick.ouid === 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' ||
        nick.ouid.length !== 32
    );

    if (invalidOuids.length > 0) {
        console.log('잘못된 ouid 발견:', invalidOuids.map(n => ({ userName: n.userName, ouid: n.ouid })));

        // 잘못된 ouid를 빈 문자열로 초기화
        invalidOuids.forEach(nick => {
            nick.ouid = '';
        });

        // localStorage 업데이트
        saveNicknames();

        console.log('잘못된 ouid 초기화 완료');
        alert(`${invalidOuids.length}명의 잘못된 ouid가 초기화되었습니다.`);
    } else {
        console.log('잘못된 ouid 없음');
    }
};

// 닉네임 로드 함수 (기본 닉네임만 설정, ouid는 서버에서 조회)
const loadNicknames = () => {
    try {
        const baseNicknames = defaultNicknames.map(userName => ({
            userName,
            ouid: '', // 서버에서 조회할 예정
            matches: [],
            stats: null,
            isDefault: true
        }));

        nicknames.value = baseNicknames;

        console.log('기본 닉네임 로드 완료:', nicknames.value.map(n => ({ userName: n.userName, ouid: n.ouid })));

        // activeTab 초기화
        if (nicknames.value.length > 0) {
            activeTab.value = nicknames.value[0].userName;
        }
    } catch (error) {
        console.error('닉네임 로드 실패:', error);
        nicknames.value = defaultNicknames.map(userName => ({
            userName,
            ouid: '',
            matches: [],
            stats: null,
            isDefault: true
        }));
    }
};

// 닉네임 배열이 비어있으면 기본 닉네임 자동 세팅
watch(nicknames, (val) => {
    if (!val || val.length === 0) {
        loadNicknames();
    }
});

onMounted(async () => {
    console.log('감독모드 페이지 로드됨');
    loadNicknames();
    console.log('onMounted nicknames:', nicknames.value);

    // 사용자 정보 먼저 로드
    console.log('사용자 정보 로드 시작');
    await loadUserInfo();
    console.log('사용자 정보 로드 완료:', nicknames.value.map(n => ({ userName: n.userName, ouid: n.ouid })));

    // activeTab 초기화 보장
    if (nicknames.value.length > 0) {
        activeTab.value = nicknames.value[0].userName;

        // 첫 번째 사용자의 20게임 미리 계산된 통계 자동 로드
        const firstNickname = nicknames.value[0];
        if (firstNickname.ouid) {
            console.log(`${firstNickname.userName} 20게임 미리 계산된 통계 자동 로드`);
            await loadPreCalculatedStats(firstNickname, 20);
        } else {
            console.log(`${firstNickname.userName}의 OUID가 없어서 실시간 데이터 로드`);
            await loadDirectorData(firstNickname, false);
        }
    }

    // 시즌 정보 로드
    loadSeasonInfo();
});

// 시즌 정보 로드 함수
const loadSeasonInfo = async () => {
  try {
    console.log('시즌 정보 로드 시작');
    const response = await api.get('/api/fc/seasons');

    if (response.data.success && response.data.data) {
      // 시즌 정보를 Map으로 변환
      const seasonData = {};
      response.data.data.forEach(season => {
        seasonData[season.seasonId] = season;
      });
      seasonMap.value = seasonData;
      console.log('시즌 정보 로드 완료:', Object.keys(seasonData).length);
    }
  } catch (error) {
    console.error('시즌 정보 로드 실패:', error);
  }
};

// 시즌 이름 가져오기 함수
const getSeasonName = (seasonId) => {
  const season = seasonMap.value[seasonId];
  return season ? season.className : `시즌 ${seasonId}`;
};

// 미리 계산된 통계 로드
const loadPreCalculatedStats = async (nickname, matchCount) => {
  if (!nickname.ouid) {
    await loadUserInfo();
    if (!nickname.ouid) {
      alert('사용자 정보를 찾을 수 없습니다.');
      return;
    }
  }

  if (loading.value) {
    console.log('이미 로딩 중입니다. 요청을 무시합니다.');
    return;
  }

  loading.value = true;

  try {
    console.log(`${nickname.userName} 미리 계산된 통계 로드 시작 (${matchCount}게임)`);

    const response = await api.get(`/api/fc/director/user-match-stats/${nickname.ouid}/${matchCount}`);

    if (response.data.success) {
      const statsData = response.data.data;

      console.log('미리 계산된 통계 응답:', statsData);

      // 매치 데이터 설정
      nickname.matches = statsData.matches || [];
      nickname.matches.sort((a, b) => new Date(b.matchDate) - new Date(a.matchDate));

      // FC BRG 통계 설정
      nickname.stats = statsData.fcBrgStats || {};

      // 선수별 통계 설정
      playerStatsMap.value[nickname.userName] = statsData.playerPerformanceStats || [];

      console.log(`${nickname.userName} 미리 계산된 통계 로드 완료: ${nickname.matches.length}경기, 선수 ${playerStatsMap.value[nickname.userName].length}명`);
      console.log('선수별 통계 샘플:', playerStatsMap.value[nickname.userName].slice(0, 3));
    } else {
      console.error(`${nickname.userName} 미리 계산된 통계 로드 실패:`, response.data.error);
      // 미리 계산된 통계가 없으면 실시간 데이터 로드
      console.log(`${nickname.userName} 실시간 데이터 로드로 대체`);
      await loadDirectorData(nickname, false);
      return;
    }
  } catch (error) {
    console.error(`${nickname.userName} 미리 계산된 통계 로드 오류:`, error);
    if (error.response?.status === 404) {
      console.log(`${nickname.userName} 해당 게임 수의 미리 계산된 통계가 없어서 실시간 데이터 로드`);
      await loadDirectorData(nickname, false);
    } else {
      console.log(`${nickname.userName} 미리 계산된 통계 로드 오류로 실시간 데이터 로드`);
      await loadDirectorData(nickname, false);
    }
    return;
  } finally {
    loading.value = false;
  }
};

// 감독모드 데이터 로드 (실시간 API 호출)
const loadDirectorData = async (nickname, forceRefresh = false) => {
  // selectedMatchCount 값을 사용하도록 수정
  const limit = selectedMatchCount.value || 20;

  if (!nickname.ouid) {
    await loadUserInfo();
    if (!nickname.ouid) {
      alert('사용자 정보를 찾을 수 없습니다.');
      return;
    }
  }

  // 이미 로딩 중이면 중복 요청 방지
  if (loading.value) {
    console.log('이미 로딩 중입니다. 요청을 무시합니다.');
    return;
  }

  loading.value = true;

  try {
    console.log(`${nickname.userName} 감독모드 데이터 로드 시작 (limit: ${limit})`);

    // GameStat.vue와 동일한 방식으로 실시간 데이터 조회
    const response = await api.post('/api/gamestat/matches', {
      targetOuid: nickname.ouid,
      matchType: 52, // 감독모드
      limit: limit,
      offset: 0
    });

    if (response.data.success) {
      // 기존 데이터 초기화
      nickname.stats = null;
      nickname.matches = [];

      // 새로운 데이터 할당 (GameStat.vue 형식으로 변환)
      const matchData = response.data.data;
      nickname.matches = matchData.map(match => ({
        ...match,
        matchInfo: [
          {
            ouid: nickname.ouid,
            nickname: nickname.userName,
            shoot: { goalTotal: match.myGoals },
            matchDetail: {
              matchResult: match.result,
              matchEndType: match.result === '몰수승' ? 1 : match.result === '몰수패' ? 2 : 0
            }
          },
          {
            ouid: 'opponent',
            nickname: match.opponentTeamName,
            shoot: { goalTotal: match.opponentGoals },
            matchDetail: {
              matchResult: match.result === '승' ? '패' : match.result === '패' ? '승' : match.result,
              matchEndType: match.result === '몰수승' ? 2 : match.result === '몰수패' ? 1 : 0
            }
          }
        ]
      }));

      // 통계 계산
      const stats = {
        win: 0,
        draw: 0,
        lose: 0,
        error: 0
      };

      matchData.forEach(match => {
        if (match.result === '승' || match.result === '몰수승') {
          stats.win++;
        } else if (match.result === '무') {
          stats.draw++;
        } else if (match.result === '패' || match.result === '몰수패') {
          stats.lose++;
        } else {
          stats.error++;
        }
      });

      nickname.stats = stats;

      // 정렬 최적화: 날짜 기준 내림차순 (최신순)
      nickname.matches.sort((a, b) => new Date(b.matchDate) - new Date(a.matchDate));

      console.log(`${nickname.userName} 감독모드 데이터 로드 완료: ${nickname.matches.length}경기`);

      // Vue 반응형 시스템 강제 업데이트
      await nextTick();

      // 탭 활성화 확인
      if (!activeTab.value) {
        activeTab.value = nickname.userName;
      }
    } else {
      console.error('감독모드 데이터 로드 실패:', response.data.error);
      alert(`데이터 조회 실패: ${response.data.error}`);
    }
  } catch (error) {
    console.error(`${nickname.userName} 감독모드 데이터 조회 실패:`, error);
    alert('데이터 조회 중 오류가 발생했습니다.');
  } finally {
    loading.value = false;
  }
};

// 감독모드 데이터 재조회 (API 호출하여 MongoDB 업데이트)
const refreshDirectorData = async (nickname) => {
  if (!nickname.ouid) {
    await loadUserInfo();
    if (!nickname.ouid) {
      alert('사용자 정보를 찾을 수 없습니다.');
      return;
    }
  }

  isRefreshing.value = true;
  try {
    console.log(`${nickname.userName} 감독모드 데이터 재조회 시작`);
    const response = await api.get(`/api/fc/matches/${nickname.ouid}`, {
      params: {
        limit: apiLimit.value,
        matchtype: 52
      }
    });

    if (response.data.success) {
      nickname.stats = response.data.stats;
      nickname.matches = response.data.data;
      nickname.matches.sort((a, b) => new Date(b.matchDate) - new Date(a.matchDate));
      console.log(`${nickname.userName} 감독모드 데이터 재조회 완료: ${nickname.matches.length}경기`);

      // Vue 반응형 시스템 강제 업데이트
      await nextTick();
      console.log(`Vue 업데이트 후 ${nickname.userName} 매치 수:`, nickname.matches.length);

      // 선수별 통계 계산 및 로드
      console.log(`${nickname.userName} 선수별 통계 계산 시작`);
      await calculateDirectorPlayerStats(nickname);
      console.log(`${nickname.userName} 선수별 통계 로드 시작`);
      await loadPlayerStats(nickname);
    }
  } catch (error) {
    console.error(`${nickname.userName} 감독모드 데이터 재조회 실패:`, error);
    alert('데이터 재조회 중 오류가 발생했습니다.');
  } finally {
    isRefreshing.value = false;
  }
};

// 감독모드 데이터 갱신 (초기 데이터 생성)
const updateDirectorData = async (nickname) => {
    if (!nickname.ouid) {
        await loadUserInfo();
        if (!nickname.ouid) {
            alert('사용자 정보를 찾을 수 없습니다.');
            return;
        }
    }

    const confirmed = confirm(`${nickname.userName}의 감독모드 데이터를 갱신하시겠습니까?\n\n이 작업은 FC 온라인 API에서 최신 감독모드 매치 데이터를 가져와 MongoDB에 저장합니다.\n시간이 다소 걸릴 수 있습니다.`);
    if (!confirmed) return;

    isUpdating.value = true;
    try {
        console.log(`${nickname.userName} 감독모드 데이터 갱신 시작`);

        // 전체 감독모드 데이터 갱신 (날짜 제한 없이)
        const response = await api.get(`/api/fc/matches/${nickname.ouid}`, {
            params: {
                matchtype: 52,
                refresh: true
            }
        });

        if (response.data.success) {
            console.log(`${nickname.userName} 감독모드 데이터 갱신 완료`);
            alert(`${nickname.userName}의 감독모드 데이터 갱신이 완료되었습니다.\n\n이제 날짜를 선택하여 해당 기간의 전적을 조회할 수 있습니다.`);

            // 현재 날짜 범위로 데이터 다시 로드

        }
    } catch (error) {
        console.error(`${nickname.userName} 감독모드 데이터 갱신 실패:`, error);
        alert('데이터 갱신 중 오류가 발생했습니다.');
    } finally {
        isUpdating.value = false;
    }
};

// 매치 카드 색상 결정 (무승부는 회색계열, 오류는 연보라)
const getMatchCardColor = (match, userName) => {
    const result = getMatchResult(match, userName);

    switch (result) {
        case '승': return 'blue-lighten-2';
        case '패': return 'red-lighten-2';
        case '무': return '#888888';
        case '몰수승': return 'orange-lighten-2'; // 주황색
        case '몰수패': return 'deep-orange-lighten-2'; // 진주황색
        case '오류': return '#E1BEE7'; // 연보라색
        default: return 'grey-lighten-2';
    }
};

// 매치 결과 텍스트 (GameStat.vue 형식)
const getMatchResult = (match, userName) => {
    // GameStat.vue 형식의 데이터 사용
    if (match.result) {
        return match.result;
    }

    // 기존 형식 fallback
    const nickname = nicknames.value.find(n => n.userName === userName);

    // ouid로 해당 사용자의 매치 정보를 찾음
    let userMatchInfo = null;
    if (nickname && nickname.ouid) {
        userMatchInfo = match.matchInfo?.find(info => info.ouid === nickname.ouid);
    }

    // ouid로 찾지 못한 경우 닉네임으로 찾음 (fallback)
    if (!userMatchInfo) {
        // 닉네임으로 찾기 (기존 로직)
        userMatchInfo = match.matchInfo?.find(info =>
            info.nickname && compareNicknames(info.nickname, userName)
        );
    }

    if (userMatchInfo) {
        return getMatchResultFromInfo(userMatchInfo, match.matchId);
    }

    return '오류';
};

// 매치 정보에서 결과를 추출하는 헬퍼 함수
const getMatchResultFromInfo = (userMatchInfo, matchId) => {
    if (!userMatchInfo || !userMatchInfo.matchDetail) {
        console.log('매치 상세 정보 없음:', { userMatchInfo, matchId });
        return '오류';
    }

    const result = userMatchInfo.matchDetail.matchResult;
    const matchEndType = userMatchInfo.matchDetail.matchEndType;

    console.log('매치 결과 분석:', {
        result,
        matchEndType,
        matchId,
        userMatchInfo: userMatchInfo.matchDetail
    });

    // 몰수승/몰수패 판정
    if (matchEndType === 1) {
        return '몰수승';
    } else if (matchEndType === 2) {
        return '몰수패';
    }

    // 일반 승/무/패 판정
    let displayResult = '오류';
    if (result === '승' || result === 'forfeit_win' || result === 'win') {
        displayResult = '승';
    } else if (result === '무' || result === 'draw') {
        displayResult = '무';
    } else if (result === '패' || result === 'forfeit_lose' || result === 'lose') {
        displayResult = '패';
    } else {
        console.log('알 수 없는 결과:', result);
        displayResult = '오류';
    }

    return displayResult;
};

// 매치 점수 (GameStat.vue 형식)
const getMatchScore = (match, userName) => {
    // GameStat.vue 형식의 데이터 사용
    if (match.myGoals !== undefined && match.opponentGoals !== undefined) {
        return `${match.myGoals} : ${match.opponentGoals}`;
    }

    // 기존 형식 fallback
    if (!match.matchInfo || match.matchInfo.length < 2) return '? : ?';

    const nickname = nicknames.value.find(n => n.userName === userName);
    let userIndex = -1;

    if (nickname && nickname.ouid) {
        userIndex = match.matchInfo.findIndex(info => info.ouid === nickname.ouid);
    }

    if (userIndex === -1) {
        userIndex = match.matchInfo.findIndex(info =>
            info.nickname && compareNicknames(info.nickname, userName)
        );
    }

    if (userIndex === -1) return '? : ?';

    const userGoals = match.matchInfo[userIndex].shoot?.goalTotal || 0;
    const opponentGoals = match.matchInfo[1 - userIndex].shoot?.goalTotal || 0;

    return `${userGoals} : ${opponentGoals}`;
};

// 상대방 닉네임 가져오기 (GameStat.vue 형식)
const getOpponentNickname = (match, userName) => {
    // GameStat.vue 형식의 데이터 사용
    if (match.opponentTeamName) {
        return match.opponentTeamName;
    }

    // 기존 형식 fallback
    if (!match.matchInfo || match.matchInfo.length < 2) return '알 수 없음';

    const nickname = nicknames.value.find(n => n.userName === userName);
    let userOuid = null;

    if (nickname && nickname.ouid) {
        userOuid = nickname.ouid;
    }

    let opponent;
    if (userOuid) {
        opponent = match.matchInfo.find(info => info.ouid !== userOuid);
    }

    if (!opponent) {
        opponent = match.matchInfo.find(info =>
            info.nickname && !compareNicknames(info.nickname, userName)
        );
    }

    return opponent?.nickname || '알 수 없음';
};

// 날짜 포맷팅 (한국 시간으로 정확히 표시)
const formatMatchDate = (dateString) => {
    // UTC 시간을 한국시간으로 변환하여 표시
    return formatKoreanTime(dateString, 'datetime');
};

// 전체 감독모드 데이터 재조회 (모든 닉네임)
const refreshAllDirectorData = async () => {
  // 사용자 정보가 없는 닉네임들 먼저 조회
  await loadUserInfo();

  const nicknamesWithOuid = nicknames.value.filter(nick => nick.ouid);
  if (nicknamesWithOuid.length === 0) {
    alert('조회할 수 있는 사용자 정보가 없습니다.');
    return;
  }

  const confirmed = confirm(`전체 ${nicknamesWithOuid.length}명의 감독모드 데이터를 재조회하시겠습니까?\n\n이 작업은 FC 온라인 API를 호출하여 최신 데이터를 가져옵니다.\n시간이 다소 걸릴 수 있습니다.\n\nAPI Limit: 20`);
  if (!confirmed) return;

  isRefreshing.value = true;
  refreshProgress.value = 0;

  // ouid별 집계 통계 초기화
  const ouidStats = {
    total: nicknamesWithOuid.length,
    completed: 0,
    failed: 0,
    totalMatches: 0,
    totalPlayerStats: 0,
    details: []
  };

  try {
    console.log('전체 감독모드 데이터 재조회 시작, API Limit: 20');
    console.log('=== ouid별 집계 통계 시작 ===');

    for (let i = 0; i < nicknamesWithOuid.length; i++) {
      const nickname = nicknamesWithOuid[i];
      refreshProgress.value = i + 1;

      // 개별 ouid 처리 시작 로그
      console.log(`\n--- ${nickname.userName} (${nickname.ouid}) 처리 시작 (${refreshProgress.value}/${ouidStats.total}) ---`);

      try {
        console.log(`${nickname.userName} 감독모드 데이터 재조회 시작 (${refreshProgress.value}/${nicknamesWithOuid.length}), Limit: 20`);

        const response = await api.get(`/api/fc/matches/${nickname.ouid}`, {
          params: {
            limit: 20,
            matchtype: 52
          }
        });

        if (response.data.success) {
          nickname.stats = response.data.stats;
          nickname.matches = response.data.data;
          nickname.matches.sort((a, b) => new Date(b.matchDate) - new Date(a.matchDate));

          const matchCount = nickname.matches.length;
          ouidStats.totalMatches += matchCount;

          console.log(`${nickname.userName} 감독모드 데이터 재조회 완료: ${matchCount}경기`);

          // Vue 반응형 시스템 강제 업데이트
          await nextTick();
          console.log(`Vue 업데이트 후 ${nickname.userName} 매치 수:`, nickname.matches.length);

          // ouid별 상세 통계 추가
          ouidStats.completed++;
          ouidStats.details.push({
            userName: nickname.userName,
            ouid: nickname.ouid,
            status: '성공',
            matchCount: matchCount,
            timestamp: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
          });

          console.log(`✅ ${nickname.userName} 처리 완료: ${matchCount}경기`);
        } else {
          console.error(`${nickname.userName} 감독모드 데이터 재조회 실패:`, response.data.error);

          ouidStats.failed++;
          ouidStats.details.push({
            userName: nickname.userName,
            ouid: nickname.ouid,
            status: '실패',
            error: response.data.error,
            timestamp: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
          });

          console.log(`❌ ${nickname.userName} 처리 실패: ${response.data.error}`);
        }

        // API 호출 간격 (1초 대기)
        if (i < nicknamesWithOuid.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`${nickname.userName} 감독모드 데이터 재조회 실패:`, error);

        ouidStats.failed++;
        ouidStats.details.push({
          userName: nickname.userName,
          ouid: nickname.ouid,
          status: '오류',
          error: error.message,
          timestamp: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
        });

        console.log(`❌ ${nickname.userName} 처리 오류: ${error.message}`);
      }

      // 진행률 및 집계 통계 출력
      const progressPercent = Math.round((refreshProgress.value / ouidStats.total) * 100);
      console.log(`\n📊 진행률: ${progressPercent}% (${refreshProgress.value}/${ouidStats.total})`);
      console.log(`📈 집계 통계: 성공=${ouidStats.completed}, 실패=${ouidStats.failed}, 총 매치=${ouidStats.totalMatches}`);
    }

    // 최종 집계 통계 출력
    console.log('\n=== 전체 감독모드 데이터 재조회 완료 ===');
    console.log(`📊 최종 집계 통계:`);
    console.log(`   - 총 처리 대상: ${ouidStats.total}명`);
    console.log(`   - 성공: ${ouidStats.completed}명`);
    console.log(`   - 실패: ${ouidStats.failed}명`);
    console.log(`   - 총 매치 수: ${ouidStats.totalMatches}경기`);

    console.log(`\n📋 상세 결과:`);
    ouidStats.details.forEach((detail, index) => {
      if (detail.status === '성공') {
        console.log(`   ${index + 1}. ✅ ${detail.userName}: ${detail.matchCount}경기`);
      } else {
        console.log(`   ${index + 1}. ❌ ${detail.userName}: ${detail.error}`);
      }
    });

    alert(`전체 ${nicknamesWithOuid.length}명의 감독모드 데이터 재조회가 완료되었습니다.\n\n성공: ${ouidStats.completed}명\n실패: ${ouidStats.failed}명\n총 매치: ${ouidStats.totalMatches}경기`);
  } catch (error) {
    console.error('전체 감독모드 데이터 재조회 실패:', error);
    alert('전체 데이터 재조회 중 오류가 발생했습니다.');
  } finally {
    isRefreshing.value = false;
    refreshProgress.value = 0;
  }
};

// API 키 통계 로드
const loadApiKeyStats = async () => {
  loadingApiStats.value = true;
  try {
    const response = await api.get('/api/admin/api-keys/stats');
    if (response.data.success) {
      apiKeyStats.value = response.data.data;
      console.log('API 키 통계 로드 완료:', apiKeyStats.value);
    } else {
      console.error('API 키 통계 로드 실패:', response.data.error);
      alert('API 키 통계를 불러오는데 실패했습니다.');
    }
  } catch (error) {
    console.error('API 키 통계 로드 오류:', error);
    alert('API 키 통계를 불러오는 중 오류가 발생했습니다.');
  } finally {
    loadingApiStats.value = false;
  }
};

// API 키 차단 해제
const unblockApiKey = async (keyIndex) => {
  try {
    const response = await fetch(`/api/admin/api-keys/${keyIndex}/unblock`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const result = await response.json();
    if (result.success) {
      alert(result.message);
      await fetchApiKeyStats(); // 통계 새로고침
    } else {
      alert(`오류: ${result.error}`);
    }
  } catch (error) {
    console.error('API 키 차단 해제 실패:', error);
    alert('API 키 차단 해제 중 오류가 발생했습니다.');
  }
};

// 사용자 정보 조회
const loadUserInfo = async () => {
    try {
        const nicknameList = nicknames.value.map(n => n.userName);
        console.log('사용자 정보 조회 시작:', {
            nicknameList,
            currentNicknames: nicknames.value.map(n => ({ userName: n.userName, ouid: n.ouid }))
        });

        const response = await api.post('/api/fc/users', { nicknames: nicknameList });

        console.log('서버 응답:', {
            success: response.data?.success,
            data: response.data?.data,
            dataLength: response.data?.data?.length || 0
        });

        if (response.data && response.data.success && Array.isArray(response.data.data)) {
            response.data.data.forEach(userData => {
                console.log('사용자 데이터 처리:', {
                    userData,
                    nickName: userData.nickName,
                    ouid: userData.ouid,
                    userType: userData.userType,
                    source: userData.source
                });

                const nickname = nicknames.value.find(n => compareNicknames(n.userName, userData.nickName));
                if (nickname && userData.ouid) {
                    console.log('ouid 업데이트:', {
                        userName: nickname.userName,
                        oldOuid: nickname.ouid,
                        newOuid: userData.ouid,
                        userType: userData.userType,
                        source: userData.source
                    });
                    nickname.ouid = userData.ouid;
                    // 사용자 타입과 소스 정보 저장
                    nickname.userType = userData.userType || '알 수 없음';
                    nickname.source = userData.source || '알 수 없음';
                }
            });
            saveNicknames();

            console.log('사용자 정보 조회 완료:', {
                updatedNicknames: nicknames.value.map(n => ({
                    userName: n.userName,
                    ouid: n.ouid,
                    userType: n.userType,
                    source: n.source
                }))
            });
        }
    } catch (error) {
        console.error('사용자 정보 조회 실패:', error);
    }
};

// 닉네임 제거 (기본 닉네임은 제거 불가)
const removeNickname = (index) => {
    const nickname = nicknames.value[index];
    if (!nickname.isDefault) {
        nicknames.value.splice(index, 1);
        // localStorage 저장 안함
    }
};



// 감독모드 탭 전환 시 자동 데이터 로드
watch(activeTab, async (newTab) => {
  const nickname = nicknames.value.find(n => n.userName === newTab);
  if (nickname) {
    // OUID가 없으면 사용자 정보 먼저 로드
    if (!nickname.ouid) {
      console.log(`${nickname.userName}의 OUID가 없어서 사용자 정보 로드`);
      await loadUserInfo();
    }

    // 미리 계산된 통계 우선 로드 시도
    if (nickname.ouid) {
      console.log(`탭 전환으로 인한 미리 계산된 통계 로드: ${nickname.userName} (${selectedMatchCount.value}게임)`);
      await loadPreCalculatedStats(nickname, selectedMatchCount.value);
    } else {
      console.log(`${nickname.userName}의 OUID가 없어서 실시간 데이터 로드`);
      await loadDirectorData(nickname, false);
    }
  }
});

// addNickname 함수가 없으면 추가
const addNickname = () => {
  if (newNickname.value.trim()) {
    const exists = nicknames.value.some(n => n.userName === newNickname.value.trim());
    if (!exists) {
      nicknames.value.push({
        userName: newNickname.value.trim(),
        ouid: '', // 서버에서 조회할 예정
        matches: [],
        stats: null,
        isDefault: false
      });
      // localStorage 저장 안함
    }
    newNickname.value = '';
  }
};

// API 키 통계 새로고침
const fetchApiKeyStats = async () => {
  await loadApiKeyStats();
};

// PieChart용 chartData 생성
const getPieChartData = (stats) => {
  if (!stats) return null;
  const data = [stats.win || 0, stats.draw || 0, stats.lose || 0, stats.error || 0];
  const labels = ['승', '무', '패', '오류'];
  const backgroundColor = ['#4CAF50', '#FFC107', '#F44336', '#BDBDBD'];
  return {
    labels,
    datasets: [{
      data,
      backgroundColor,
      borderWidth: 1
    }]
  };
};

const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false // 범례 숨기기
    },
    datalabels: {
      color: '#fff',
      font: { weight: 'bold', size: 14 },
      formatter: (value, ctx) => value > 0 ? value : ''
    }
  }
};

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
);

// 승률 계산 함수
const getWinRate = (stats) => {
  if (!stats) return 0;
  const totalMatches = (stats.win || 0) + (stats.draw || 0) + (stats.lose || 0) + (stats.error || 0);
  if (totalMatches === 0) return 0;
  const winRate = (stats.win || 0) / totalMatches * 100;
  return winRate.toFixed(1); // 소수점 한자리까지 표시
};

// 매치 종료 타입 텍스트 (ouid 기준으로 매칭)
const getMatchEndTypeText = (match, userName) => {
    const nickname = nicknames.value.find(n => n.userName === userName);
    let userMatchInfo;

    if (nickname && nickname.ouid) {
        userMatchInfo = match.matchInfo?.find(info => info.ouid === nickname.ouid);
    }

    if (!userMatchInfo) {
        userMatchInfo = match.matchInfo?.find(info =>
            info.nickname && compareNicknames(info.nickname, userName)
        );
    }

    const matchEndType = userMatchInfo?.matchDetail?.matchEndType;

    if (matchEndType === 1) return '(몰수승)';
    if (matchEndType === 2) return '(몰수패)';
    return '';
};

// 선수별 활약 데이터 관련
const playerStatsMap = ref({});
const loadingPlayerStats = ref(false);

// 선수별 활약 데이터 필터링 함수
const getFilteredPlayerStats = (userName) => {
    const players = playerStatsMap.value[userName] || [];
    return [...players].sort((a, b) => b.spRating - a.spRating);
};

// 선수별 활약 데이터 로드 함수
const loadPlayerStats = async (nickname) => {
    if (loadingPlayerStats.value) return;

    loadingPlayerStats.value = true;

    try {
        console.log(`📊 ${nickname.userName} 선수별 활약 데이터 로드 시작`);

        // 감독모드 전용 엔드포인트 사용
        const response = await api.get(`/api/fc/director/player-stats/${nickname.ouid}?limit=20`);

        if (response.data.success) {
            playerStatsMap.value[nickname.userName] = response.data.data || [];
            console.log(`✅ ${nickname.userName} 선수별 활약 데이터 로드 완료: ${playerStatsMap.value[nickname.userName].length}명`);
        } else {
            console.error(`❌ ${nickname.userName} 선수별 활약 데이터 로드 실패:`, response.data.error);
            playerStatsMap.value[nickname.userName] = [];
        }

    } catch (error) {
        console.error(`❌ ${nickname.userName} 선수별 활약 데이터 로드 오류:`, error);
        playerStatsMap.value[nickname.userName] = [];
    } finally {
        loadingPlayerStats.value = false;
    }
};

// 데이터 재조회 함수
const refreshMatches = async () => {
    if (refreshing.value) return;

    refreshing.value = true;
    refreshResults.value = [];

    try {
        console.log(`🔄 데이터 재조회 시작 - matchType: ${refreshMatchType.value}`);

        const response = await api.post('/api/fc/refresh-matches', {
            matchType: refreshMatchType.value
        });

        if (response.data.success) {
            refreshResults.value = response.data.data.users;
            console.log('✅ 데이터 재조회 완료:', response.data.data);

            // 성공 메시지 표시
            const totalNewMatches = response.data.data.totalNewMatches;
            const totalSaved = response.data.data.totalSaved;

            if (totalNewMatches > 0) {
                alert(`데이터 재조회 완료!\n새로운 매치: ${totalNewMatches}개\n저장 성공: ${totalSaved}개`);
            } else {
                alert('데이터 재조회 완료!\n새로운 매치가 없습니다.');
            }

            // 재조회 후 현재 탭의 데이터 새로고침
            const currentNickname = nicknames.value.find(n => n.userName === activeTab.value);
            if (currentNickname) {
                await loadDirectorData(currentNickname, true);
            }

        } else {
            console.error('❌ 데이터 재조회 실패:', response.data.error);
            alert('데이터 재조회 실패: ' + response.data.error);
        }

    } catch (error) {
        console.error('❌ 데이터 재조회 오류:', error);
        alert('데이터 재조회 중 오류가 발생했습니다.');
    } finally {
        refreshing.value = false;
    }
};

// 상태 색상 반환 함수
const getStatusColor = (status) => {
    switch (status) {
        case 'completed':
            return 'success';
        case 'no-new-matches':
            return 'info';
        case 'failed':
            return 'error';
        default:
            return 'grey';
    }
};

// 상태 텍스트 반환 함수
const getStatusText = (status) => {
    switch (status) {
        case 'completed':
            return '완료';
        case 'no-new-matches':
            return '새 매치 없음';
        case 'failed':
            return '실패';
        default:
            return '알 수 없음';
    }
};
</script>