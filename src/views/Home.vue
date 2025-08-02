<template>
  <v-container>
    <!-- 로딩 오버레이 -->
    <v-overlay v-model="loading" class="align-center justify-center">
      <v-card class="pa-4 text-center">
        <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
        <div class="mt-4 text-h6">데이터를 불러오는 중...</div>
        <div class="text-body-2 text-grey">잠시만 기다려주세요</div>
      </v-card>
    </v-overlay>

    <!-- 닉네임 입력 및 조회 -->
    <v-row class="mt-8">
      <v-col cols="12">
        <v-card class="mx-auto pa-4">
          <v-card-title class="d-flex align-center">
            <span>FC 온라인 전적 검색</span>
            <v-spacer></v-spacer>
            <v-text-field
              v-if="isAdmin"
              v-model="matchLimit"
              type="number"
              label="매치 수"
              class="mr-4"
              style="max-width: 120px"
              :min="1"
              :max="1000"
              density="compact"
              hide-details
            ></v-text-field>
            <v-btn
              color="primary"
              @click="refreshData"
              :loading="loading"
              :disabled="loading"
              class="mr-2"
            >
              화면 갱신
            </v-btn>
            <!-- 데이터 재조회 버튼 주석처리
            <v-btn
              color="success"
              @click="fetchNewData"
              :loading="isRefreshing"
              :disabled="isRefreshing"
              class="mr-2"
            >
              <template v-if="isRefreshing">
                데이터 재조회 중...
              </template>
              <template v-else>
                데이터 재조회
              </template>
            </v-btn>
            -->
            <v-btn
              v-if="isAdmin"
              color="error"
              @click="resetData"
              :loading="resetting"
              class="ml-4"
            >
              데이터 초기화
            </v-btn>
          </v-card-title>
          <v-container>
            <v-row>
              <v-col cols="12">
                <!-- 닉네임 추가 화면 주석처리
                <v-text-field
                  v-model="newNickname"
                  label="닉네임 추가"
                  @keyup.enter="addNickname"
                  :disabled="loading"
                >
                  <template v-slot:append>
                    <v-btn
                      icon="mdi-plus"
                      @click="addNickname"
                      :disabled="loading"
                    ></v-btn>
                  </template>
                </v-text-field>
                -->
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <draggable
                  v-model="nicknames"
                  item-key="userName"
                  handle=".drag-handle"
                  @end="saveNicknames"
                >
                  <template #item="{ element }">
                    <v-chip
                      class="ma-1"
                      closable
                      @click:close="removeNickname(nicknames.indexOf(element))"
                      :disabled="loading"
                    >
                      <v-icon class="drag-handle mr-1">mdi-drag</v-icon>
                      {{ element.userName }}
                    </v-chip>
                  </template>
                </draggable>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
    </v-row>

    <!-- 통계 테이블 -->
    <v-row class="mt-8">
      <v-col cols="12">
        <v-card class="mx-auto pa-4">
          <v-card-title class="text-h5 mb-4">FC BRG 통계</v-card-title>

          <!-- 데이터 범위 설명 -->
          <div class="mb-4 pa-3 bg-grey-lighten-4 rounded">
            <h6 class="text-subtitle-2 mb-2">📊 데이터 범위 안내</h6>
            <div class="text-body-2">
              <p><strong>FC BRG 통계:</strong> 최근 100경기 누적 데이터</p>
              <p><strong>선수별 득점 통계:</strong> 최근 100경기 누적 데이터</p>
              <p><strong>선수별 활약:</strong> 최근 100경기 누적 데이터</p>
            </div>
          </div>

          <v-data-table
            :headers="[
              { title: '닉네임', key: 'userName', align: 'start', sortable: true },
              { title: '총 경기', key: 'stats.totalMatches', align: 'end', sortable: true },
              { title: '평균득점', key: 'stats.averageGoalsFor', align: 'end', sortable: true },
              { title: '평균실점', key: 'stats.averageGoalsAgainst', align: 'end', sortable: true },
              { title: '총득점', key: 'stats.totalGoalsFor', align: 'end', sortable: true },
              { title: '총실점', key: 'stats.totalGoalsAgainst', align: 'end', sortable: true },
              { title: '승', key: 'stats.win', align: 'end', sortable: true },
              { title: '무', key: 'stats.draw', align: 'end', sortable: true },
              { title: '패', key: 'stats.lose', align: 'end', sortable: true },
              { title: '평균 코너킥', key: 'stats.cornerKick', align: 'end', sortable: true },
              { title: '평균 점유율', key: 'stats.possession', align: 'end', sortable: true },
              { title: '평균 경기평점', key: 'stats.averageRating', align: 'end', sortable: true },
              { title: '총 슈팅', key: 'stats.shootTotal', align: 'end', sortable: true },
              { title: '유효 슈팅', key: 'stats.effectiveShootTotal', align: 'end', sortable: true },
              { title: '오프사이드', key: 'stats.offsideCount', align: 'end', sortable: true },
              { title: '매치 기간', key: 'matchPeriod', align: 'end', sortable: true }
            ]"
            :items="nicknames"
            :loading="loading"
            :sort-by="[{ key: 'stats.averageRating', order: 'desc' }]"
            class="elevation-1 rounded-lg"
            density="comfortable"
            hover
          >
            <template #[`item.userName`]="{ item }">
              <div class="font-weight-bold">{{ item.userName || '닉네임 없음' }}</div>
            </template>
            <template #[`item.stats.totalMatches`]="{ item }">
              <div class="text-right">{{ item.stats && !loading ? item.stats.totalMatches : '-' }}</div>
            </template>
            <template #[`item.stats.averageGoalsFor`]="{ item }">
              <div class="text-right">{{ item.stats && !loading ? Number(item.stats.averageGoalsFor).toFixed(2) : '-' }}</div>
            </template>
            <template #[`item.stats.averageGoalsAgainst`]="{ item }">
              <div class="text-right">{{ item.stats && !loading ? Number(item.stats.averageGoalsAgainst).toFixed(2) : '-' }}</div>
            </template>
            <template #[`item.stats.totalGoalsFor`]="{ item }">
              <div class="text-right">{{ item.stats && !loading ? item.stats.totalGoalsFor : '-' }}</div>
            </template>
            <template #[`item.stats.totalGoalsAgainst`]="{ item }">
              <div class="text-right">{{ item.stats && !loading ? item.stats.totalGoalsAgainst : '-' }}</div>
            </template>
            <template #[`item.stats.win`]="{ item }">
              <div class="text-right">{{ item.stats && !loading ? item.stats.win : '-' }}</div>
            </template>
            <template #[`item.stats.draw`]="{ item }">
              <div class="text-right">{{ item.stats && !loading ? item.stats.draw : '-' }}</div>
            </template>
            <template #[`item.stats.lose`]="{ item }">
              <div class="text-right">{{ item.stats && !loading ? item.stats.lose : '-' }}</div>
            </template>
            <template #[`item.stats.cornerKick`]="{ item }">
              <div class="text-right">{{ item.stats && !loading ? Number(item.stats.cornerKick).toFixed(1) : '-' }}</div>
            </template>
            <template #[`item.stats.possession`]="{ item }">
              <div class="text-right">{{ item.stats && !loading ? Number(item.stats.possession).toFixed(2) + '%' : '-' }}</div>
            </template>
            <template #[`item.stats.averageRating`]="{ item }">
              <div class="text-right">{{ item.stats && !loading ? Number(item.stats.averageRating).toFixed(1) : '-' }}</div>
            </template>
            <template #[`item.stats.shootTotal`]="{ item }">
              <div class="text-right">{{ item.stats && !loading ? item.stats.shootTotal : '-' }}</div>
            </template>
            <template #[`item.stats.effectiveShootTotal`]="{ item }">
              <div class="text-right">{{ item.stats && !loading ? item.stats.effectiveShootTotal : '-' }}</div>
            </template>
            <template #[`item.stats.offsideCount`]="{ item }">
              <div class="text-right">{{ item.stats && !loading ? item.stats.offsideCount : '-' }}</div>
            </template>
            <template #[`item.matchPeriod`]="{ item }">
              <div class="text-right">
                {{ item.stats && item.stats.matchPeriod && item.stats.matchPeriod.firstMatchDate ?
                  new Date(item.stats.matchPeriod.firstMatchDate).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' }) : '-' }} ~
                {{ item.stats && item.stats.matchPeriod && item.stats.matchPeriod.lastMatchDate ?
                  new Date(item.stats.matchPeriod.lastMatchDate).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' }) : '-' }}
                <div class="text-caption text-grey">
                  {{ item.stats && item.stats.matchPeriod && item.stats.matchPeriod.totalDays > 0 ?
                    `(${item.stats.matchPeriod.totalDays}일)` : '' }}
                </div>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- 선수별 득점 통계 -->
    <v-row class="mt-8">
      <v-col cols="12">
        <v-card class="mx-auto pa-4">
          <v-card-title class="text-h5 mb-4">선수별 득점 통계</v-card-title>

          <v-tabs v-model="activeTab" class="mb-4">
            <v-tab v-for="nickname in nicknames" :key="nickname.userName" :value="nickname.userName">
              {{ nickname.userName || '닉네임 없음' }}
            </v-tab>
          </v-tabs>

          <v-window v-model="activeTab">
            <v-window-item v-for="nickname in nicknames" :key="nickname.userName" :value="nickname.userName">
              <v-data-table
                :headers="headers"
                :items="[
                  ...(playerStatsMap[nickname.userName] || []),
                  {
                    name: '총합',
                    seasonImg: '',
                    appearances: (playerStatsMap[nickname.userName] || []).reduce((sum, player) => sum + (player.appearances || 0), 0),
                    goals: {
                      normal: (playerStatsMap[nickname.userName] || []).reduce((sum, player) => sum + ((player.goals?.normal) || 0), 0),
                      finesse: (playerStatsMap[nickname.userName] || []).reduce((sum, player) => sum + ((player.goals?.finesse) || 0), 0),
                      header: (playerStatsMap[nickname.userName] || []).reduce((sum, player) => sum + ((player.goals?.header) || 0), 0),
                      lob: (playerStatsMap[nickname.userName] || []).reduce((sum, player) => sum + ((player.goals?.lob) || 0), 0),
                      flare: (playerStatsMap[nickname.userName] || []).reduce((sum, player) => sum + ((player.goals?.flare) || 0), 0),
                      low: (playerStatsMap[nickname.userName] || []).reduce((sum, player) => sum + ((player.goals?.low) || 0), 0),
                      volley: (playerStatsMap[nickname.userName] || []).reduce((sum, player) => sum + ((player.goals?.volley) || 0), 0),
                      freekick: (playerStatsMap[nickname.userName] || []).reduce((sum, player) => sum + ((player.goals?.freekick) || 0), 0),
                      penalty: (playerStatsMap[nickname.userName] || []).reduce((sum, player) => sum + ((player.goals?.penalty) || 0), 0),
                      knuckle: (playerStatsMap[nickname.userName] || []).reduce((sum, player) => sum + ((player.goals?.knuckle) || 0), 0),
                      bicycle: (playerStatsMap[nickname.userName] || []).reduce((sum, player) => sum + ((player.goals?.bicycle) || 0), 0),
                      super: (playerStatsMap[nickname.userName] || []).reduce((sum, player) => sum + ((player.goals?.super) || 0), 0)
                    },
                    totalGoals: (playerStatsMap[nickname.userName] || []).reduce((sum, player) => sum + (player.totalGoals || 0), 0)
                  }
                ]"
                :loading="loadingPlayerStats"
                class="elevation-1 rounded-lg"
                density="comfortable"
                hover
              >
                <template #[`item.name`]="{ item }">
                  <div class="font-weight-bold">
                    {{ item.name }}
                  </div>
                </template>
                <template #[`item.seasonImg`]="{ item }">
                  <div class="d-flex justify-center">
                    <v-img
                      v-if="item.seasonImg"
                      :src="item.seasonImg"
                      width="24"
                      height="24"
                      :title="item.seasonName || getSeasonName(item.seasonId)"
                    ></v-img>
                  </div>
                </template>
                <template #[`item.appearances`]="{ item }">
                  <div class="text-right">{{ item.appearances }}</div>
                </template>
                <template #[`item.goals.normal`]="{ item }">
                  <div class="text-right">{{ item.goals?.normal || 0 }}</div>
                </template>
                <template #[`item.goals.finesse`]="{ item }">
                  <div class="text-right">{{ item.goals?.finesse || 0 }}</div>
                </template>
                <template #[`item.goals.header`]="{ item }">
                  <div class="text-right">{{ item.goals?.header || 0 }}</div>
                </template>
                <template #[`item.goals.lob`]="{ item }">
                  <div class="text-right">{{ item.goals?.lob || 0 }}</div>
                </template>
                <template #[`item.goals.flare`]="{ item }">
                  <div class="text-right">{{ item.goals?.flare || 0 }}</div>
                </template>
                <template #[`item.goals.low`]="{ item }">
                  <div class="text-right">{{ item.goals?.low || 0 }}</div>
                </template>
                <template #[`item.goals.volley`]="{ item }">
                  <div class="text-right">{{ item.goals?.volley || 0 }}</div>
                </template>
                <template #[`item.goals.freekick`]="{ item }">
                  <div class="text-right">{{ item.goals?.freekick || 0 }}</div>
                </template>
                <template #[`item.goals.penalty`]="{ item }">
                  <div class="text-right">{{ item.goals?.penalty || 0 }}</div>
                </template>
                <template #[`item.goals.knuckle`]="{ item }">
                  <div class="text-right">{{ item.goals?.knuckle || 0 }}</div>
                </template>
                <template #[`item.goals.bicycle`]="{ item }">
                  <div class="text-right">{{ item.goals?.bicycle || 0 }}</div>
                </template>
                <template #[`item.goals.super`]="{ item }">
                  <div class="text-right">{{ item.goals?.super || 0 }}</div>
                </template>
                <template #[`item.totalGoals`]="{ item }">
                  <div class="text-right font-weight-bold">{{ item.totalGoals }}</div>
                </template>
              </v-data-table>
            </v-window-item>
          </v-window>
        </v-card>
      </v-col>
    </v-row>

    <!-- 선수별 활약 테이블 -->
    <v-row class="mt-8">
      <v-col cols="12">
        <v-card class="mx-auto pa-4">
          <v-card-title class="text-h5 mb-4">선수별 활약</v-card-title>

          <v-tabs v-model="activeTab" class="mb-4">
            <v-tab v-for="nickname in nicknames" :key="nickname.userName" :value="nickname.userName">
              {{ nickname.userName || '닉네임 없음' }}
            </v-tab>
          </v-tabs>

          <v-window v-model="activeTab">
            <v-window-item v-for="nickname in nicknames" :key="nickname.userName" :value="nickname.userName">
              <v-data-table
                :headers="performanceHeaders"
                :items="sortedPlayerPerformance"
                :items-per-page="50"
                class="elevation-1 rounded-lg"
                density="comfortable"
                hover
                :loading="loadingPlayerStats"
                no-data-text="선수 활약 데이터가 없습니다."
              >
                <template #[`item.name`]="{ item }">
                  <div class="font-weight-bold">
                    {{ item.name }}
                  </div>
                </template>
                <template #[`item.seasonImg`]="{ item }">
                  <div class="d-flex justify-center">
                    <v-img
                      v-if="item.seasonImg"
                      :src="item.seasonImg"
                      width="24"
                      height="24"
                      :title="item.seasonName || getSeasonName(item.seasonId)"
                    ></v-img>
                  </div>
                </template>
                <template #[`item.appearances`]="{ item }">
                  <div class="text-right">{{ item.appearances }}</div>
                </template>
                <template #[`item.assist`]="{ item }">
                  <div class="text-right">{{ item.assist }}</div>
                </template>
                <template #[`item.totalGoals`]="{ item }">
                  <div class="text-right font-weight-bold">{{ item.totalGoals }}</div>
                </template>
                <template #[`item.dribble`]="{ item }">
                  <div class="text-right">{{ item.dribble }}</div>
                </template>
                <template #[`item.intercept`]="{ item }">
                  <div class="text-right">{{ item.intercept }}</div>
                </template>
                <template #[`item.defending`]="{ item }">
                  <div class="text-right">{{ item.defending }}</div>
                </template>
                <template #[`item.passSuccessRate`]="{ item }">
                  <div class="text-right">{{ calculatePassSuccessRate(item) }}%</div>
                </template>
                <template #[`item.blockSuccessRate`]="{ item }">
                  <div class="text-right">{{ calculateBlockSuccessRate(item) }}%</div>
                </template>
                <template #[`item.tackleSuccessRate`]="{ item }">
                  <div class="text-right">{{ calculateTackleSuccessRate(item) }}%</div>
                </template>
                <template #[`item.spRating`]="{ item }">
                  <div class="text-right">{{ Number(item.spRating).toFixed(1) }}</div>
                </template>
                <template #[`item.yellowCards`]="{ item }">
                  <div class="text-right">{{ item.yellowCards }}</div>
                </template>
                <template #[`item.redCards`]="{ item }">
                  <div class="text-right text-red">{{ item.redCards }}</div>
                </template>
              </v-data-table>
            </v-window-item>
          </v-window>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useFCStore } from '@/stores/fc.jsx';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import draggable from 'vuedraggable';

const fcStore = useFCStore();
const authStore = useAuthStore();
const { users, matches, loading, error } = storeToRefs(fcStore);

// auth.js에서 export한 api 인스턴스 사용
import { api } from '@/stores/auth';

const nicknames = ref([]);

const newNickname = ref('');

const activeTab = ref('');
const playerStatsMap = ref({});
const loadingPlayerStats = ref(false);
const seasonMap = ref({});

const isAdmin = ref(false);
const resetting = ref(false);
const isRefreshing = ref(false);

const matchLimit = ref(100);

// 선수 통계 헤더
const headers = [
  { title: '선수명', key: 'name', sortable: true, width: '150px' },
  { title: '시즌', key: 'seasonImg', sortable: false, width: '60px', align: 'center' },
  { title: '출전', key: 'appearances', sortable: true, width: '60px', align: 'end' },
  { title: '일반', key: 'goals.normal', sortable: true, width: '50px', align: 'end' },
  { title: 'Z+D', key: 'goals.finesse', sortable: true, width: '50px', align: 'end' },
  { title: '헤더', key: 'goals.header', sortable: true, width: '50px', align: 'end' },
  { title: '로브', key: 'goals.lob', sortable: true, width: '50px', align: 'end' },
  { title: '플레어', key: 'goals.flare', sortable: true, width: '50px', align: 'end' },
  { title: 'D+D', key: 'goals.low', sortable: true, width: '50px', align: 'end' },
  { title: '발리', key: 'goals.volley', sortable: true, width: '50px', align: 'end' },
  { title: '프리킥', key: 'goals.freekick', sortable: true, width: '50px', align: 'end' },
  { title: '페널티', key: 'goals.penalty', sortable: true, width: '50px', align: 'end' },
  { title: '너클', key: 'goals.knuckle', sortable: true, width: '50px', align: 'end' },
  { title: '바이시클', key: 'goals.bicycle', sortable: true, width: '50px', align: 'end' },
  { title: 'F+D', key: 'goals.super', sortable: true, width: '50px', align: 'end' },
  { title: '총 득점', key: 'totalGoals', sortable: true, width: '70px', align: 'end' }
];

// 선수별 활약 헤더
const performanceHeaders = [
  { title: '선수명', key: 'name', sortable: true, width: '150px' },
  { title: '시즌', key: 'seasonImg', sortable: false, width: '60px', align: 'center' },
  { title: '출전', key: 'appearances', sortable: true, width: '60px', align: 'end' },
  { title: '어시스트', key: 'assist', sortable: true, width: '80px', align: 'end' },
  { title: '골수', key: 'totalGoals', sortable: true, width: '60px', align: 'end' },
  { title: '드리블', key: 'dribble', sortable: true, width: '80px', align: 'end' },
  { title: '인터셉트', key: 'intercept', sortable: true, width: '80px', align: 'end' },
  { title: '수비', key: 'defending', sortable: true, width: '60px', align: 'end' },
  { title: '패스 성공률', key: 'passSuccessRate', sortable: true, width: '100px', align: 'end' },
  { title: '블락', key: 'blockSuccessRate', sortable: true, width: '80px', align: 'end' },
  { title: '태클', key: 'tackleSuccessRate', sortable: true, width: '80px', align: 'end' },
  { title: '평균 평점', key: 'spRating', sortable: true, width: '90px', align: 'end' },
  { title: '옐로우카드', key: 'yellowCards', sortable: true, width: '90px', align: 'end' },
  { title: '레드카드', key: 'redCards', sortable: true, width: '80px', align: 'end' }
];

// 선수별 활약 정렬 (평점 높은 순으로 정렬)
const sortedPlayerPerformance = computed(() => {
  const players = playerStatsMap.value[activeTab.value] || [];
  // 출전 경기가 있는 선수만 필터링하고 평점 높은 순으로 정렬
  return [...players]
    .filter(player => player.appearances > 0)
    .sort((a, b) => b.spRating - a.spRating);
});

// 백분율 계산 함수들
const calculatePassSuccessRate = (player) => {
  if (!player || !player.passTry || player.passTry === 0) return 0;
  return Math.round((player.passSuccess / player.passTry) * 100 * 10) / 10;
};

const calculateBlockSuccessRate = (player) => {
  if (!player || !player.blockTry || player.blockTry === 0) return 0;
  return Math.round((player.blockSuccess / player.blockTry) * 100 * 10) / 10;
};

const calculateTackleSuccessRate = (player) => {
  if (!player || !player.tackleTry || player.tackleTry === 0) return 0;
  return Math.round((player.tackle / player.tackleTry) * 100 * 10) / 10;
};

// 골 통계와 활약 통계 병합 (모든 필드 유지)
const mergeGoalAndPerformanceStats = (goalStats, performanceStats) => {
  const uniqueStats = [];
  const processedSpIds = new Set();

  // spId 정규화 함수 (spid -> spId로 통일)
  const normalizeSpId = (player) => {
    if (player.spid !== undefined) {
      player.spId = player.spid;
      delete player.spid;
    }
    return player.spId;
  };

  // 골 통계를 기준으로 하고, 활약 통계의 추가 필드들을 병합
  goalStats.forEach(goalPlayer => {
    const normalizedSpId = normalizeSpId(goalPlayer);
    if (!normalizedSpId) return;

    const performancePlayer = performanceStats.find(p => {
      const perfSpId = normalizeSpId(p);
      return perfSpId === normalizedSpId;
    });

    const mergedPlayer = {
      ...goalPlayer, // 골 통계 필드들 (spId, name, seasonImg, seasonId, seasonName, appearances, goals, totalGoals)
      ...performancePlayer, // 활약 통계 필드들 (assist, dribble, intercept, defending, passTry, passSuccess, blockTry, blockSuccess, tackleTry, tackle, yellowCards, redCards, spRating)
      // 기본값 설정으로 NaN 방지
      assist: performancePlayer?.assist || 0,
      dribble: performancePlayer?.dribble || 0,
      intercept: performancePlayer?.intercept || 0,
      defending: performancePlayer?.defending || 0,
      passTry: performancePlayer?.passTry || 0,
      passSuccess: performancePlayer?.passSuccess || 0,
      blockTry: performancePlayer?.blockTry || 0,
      blockSuccess: performancePlayer?.blockSuccess || 0,
      tackleTry: performancePlayer?.tackleTry || 0,
      tackle: performancePlayer?.tackle || 0,
      yellowCards: performancePlayer?.yellowCards || 0,
      redCards: performancePlayer?.redCards || 0,
      spRating: performancePlayer?.spRating || 0
    };

    uniqueStats.push(mergedPlayer);
    processedSpIds.add(normalizedSpId);
  });

  // 골 통계에 없는 활약 통계 선수들 추가
  performanceStats.forEach(performancePlayer => {
    const normalizedSpId = normalizeSpId(performancePlayer);
    if (normalizedSpId && !processedSpIds.has(normalizedSpId)) {
      uniqueStats.push(performancePlayer);
      processedSpIds.add(normalizedSpId);
    }
  });

  return uniqueStats;
};

// 화면 갱신
async function refreshData() {
  console.log('🔍 [버튼 디버깅] 화면 갱신 버튼 클릭됨');

  if (nicknames.value.length === 0) {
    console.warn('닉네임이 없어서 함수 종료');
    alert('닉네임을 먼저 추가해주세요.');
    return;
  }

  try {
    loading.value = true; // 로딩 상태 시작
    loadingPlayerStats.value = true; // 선수별 통계 로딩 상태 시작
    console.log('화면 갱신 시작');

    // 사전 계산된 통계를 먼저 조회
    const precalculatedResponse = await api.get('/api/fc/user-stats').catch(err => {
      console.error('사전 계산된 통계 조회 실패:', err);
      return { data: { success: false } };
    });

    if (precalculatedResponse.data && precalculatedResponse.data.success) {
      console.log('✅ 사전 계산된 통계 사용');

      // 모든 사용자에게 사전 계산된 통계 적용
      for (const nickname of nicknames.value) {
        if (!nickname.ouid) continue;

        const userStat = precalculatedResponse.data.data.find(stat => stat.ouid === nickname.ouid);

        if (userStat) {
          console.log('✅ 사용자 통계 적용:', nickname.userName);

          // 사전 계산된 통계 사용 (dataRange를 matchPeriod 형태로 변환)
          nickname.stats = {
            ...userStat.fcBrgStats,
            matchPeriod: {
              firstMatchDate: userStat.dataRange.fromDate,
              lastMatchDate: userStat.dataRange.toDate,
              totalDays: userStat.dataRange.matchCount > 0 ?
                Math.ceil((new Date(userStat.dataRange.toDate) - new Date(userStat.dataRange.fromDate)) / (1000 * 60 * 60 * 24)) : 0
            }
          };

          // 선수별 통계 저장 (골 통계만 사용, 중복 제거)
          const goalStats = userStat.playerGoalStats || [];
          const performanceStats = userStat.playerPerformanceStats || [];

          console.log('🔍 선수별 통계 데이터 구조 확인:', {
            userName: nickname.userName,
            goalStatsLength: goalStats.length,
            performanceStatsLength: performanceStats.length,
            firstGoalStat: goalStats[0],
            firstPerformanceStat: performanceStats[0]
          });

          // 헨릭 라르손과 잔루카 잠브로타(14번째) 디버깅
          const henrikLarsson = goalStats.find(p => p.name === '헨릭 라르손');
          const gianlucaZambrotta = performanceStats[13]; // 14번째 (인덱스 13)

          console.log('🔍 헨릭 라르손 골 통계:', henrikLarsson);
          console.log('🔍 잔루카 잠브로타(14번째) 활약 통계:', gianlucaZambrotta);

          // spId 정규화 테스트
          if (henrikLarsson) {
            console.log('🔍 헨릭 라르손 spId 정규화 전:', {
              spId: henrikLarsson.spId,
              spid: henrikLarsson.spid
            });
          }

          // 개선된 병합 로직 사용
          const uniqueStats = mergeGoalAndPerformanceStats(goalStats, performanceStats);

          console.log('🔍 최종 선수별 통계 데이터:', {
            userName: nickname.userName,
            uniqueStatsLength: uniqueStats.length,
            samplePlayer: uniqueStats[0]
          });

          playerStatsMap.value[nickname.userName] = uniqueStats;

          console.log('📊 통계 적용 완료:', {
            userName: nickname.userName,
            totalMatches: userStat.fcBrgStats?.totalMatches,
            dataRange: userStat.dataRange,
            uniquePlayerStats: uniqueStats.length
          });
        } else {
          console.log('❌ 사용자의 사전 계산된 통계가 없음:', nickname.userName);
        }
      }
    } else {
      console.log('❌ 사전 계산된 통계가 없어서 실시간 계산 사용');

      // 실시간 계산 (기존 방식)
      for (const nickname of nicknames.value) {
        if (!nickname.ouid) continue;

        try {
          const [matchResponse, playerStatsResponse] = await Promise.all([
            api.get(`/api/fc/matches/${nickname.ouid}?refresh=false&limit=${matchLimit.value}`),
            api.get(`/api/fc/player-stats/${nickname.ouid}`)
          ]);

          if (matchResponse.data && matchResponse.data.success) {
            const processedMatches = processMatchData(matchResponse.data.data || []);
            nickname.matchIds = processedMatches;
            nickname.stats = matchResponse.data.stats;
          }

          if (playerStatsResponse.data && playerStatsResponse.data.success) {
            // 중복 제거 로직 적용
            const allStats = playerStatsResponse.data.data;
            const uniqueStats = mergeGoalAndPerformanceStats(allStats, []); // 실시간은 allStats만 있을 수 있음

            playerStatsMap.value[nickname.userName] = uniqueStats;
          }
        } catch (error) {
          console.error('실시간 계산 실패:', {
            userName: nickname.userName,
            error: error.message
          });
        }
      }
    }

    console.log('✅ 화면 갱신 완료');
  } catch (error) {
    console.error('화면 갱신 실패:', error);
    alert('데이터 갱신 중 오류가 발생했습니다. 다시 시도해주세요.');
  } finally {
    loading.value = false; // 로딩 상태 종료
    loadingPlayerStats.value = false; // 선수별 통계 로딩 상태 종료
  }
}

// 새로운 데이터 조회
async function fetchNewData() {
  console.log('🔍 [버튼 디버깅] 데이터 재조회 버튼 클릭됨');
  console.log('🔍 [버튼 디버깅] nicknames.value:', nicknames.value);
  console.log('🔍 [버튼 디버깅] nicknames.value.length:', nicknames.value.length);

  if (nicknames.value.length === 0) {
    console.warn('닉네임이 없어서 함수 종료');
    alert('닉네임을 먼저 추가해주세요.');
    return;
  }

  try {
    isRefreshing.value = true;
    console.log('새로운 데이터 조회 시작');
    for (const nickname of nicknames.value) {
      if (!nickname.ouid) {
        console.warn('사용자 ouid가 없음:', nickname.userName);
        continue;
      }

      console.log('사용자 데이터 조회:', nickname.userName);
      try {
        // refresh=true로 설정하여 새로운 데이터 가져오기, limit 파라미터 추가
        const response = await api.get(`/api/fc/matches/${nickname.ouid}?refresh=true&limit=${matchLimit.value}`);
        console.log('새로운 데이터 조회 응답:', response);

        if (response.data && response.data.success) {
          const processedMatches = processMatchData(response.data.data || []);
          console.log('처리된 매치 데이터:', {
            userName: nickname.userName,
            matchCount: processedMatches.length,
            firstMatchDate: processedMatches[0]?.matchDate,
            lastMatchDate: processedMatches[processedMatches.length - 1]?.matchDate
          });

          nickname.matchIds = processedMatches;
          nickname.stats = response.data.stats;

          // 선수별 득점 통계 가져오기
          try {
            console.log('선수별 득점 통계 요청 시작:', {
              userName: nickname.userName,
              ouid: nickname.ouid
            });

            const statsResponse = await api.get(`/api/fc/player-stats/${nickname.ouid}`);
            console.log('선수별 득점 통계 응답:', {
              userName: nickname.userName,
              success: statsResponse.data.success,
              dataLength: statsResponse.data.data?.length
            });

            if (statsResponse.data.success) {
              // 선수별 통계 데이터에 이름과 시즌 정보 추가
              const processedStats = statsResponse.data.data.map(player => {
                // 선수 이름 설정 - 서버에서 전달받은 이름을 우선 사용
                if (!player.name || player.name.startsWith('선수 ')) {
                  const playerInfo = globalPlayerInfo.value?.find(p =>
                    p.id === parseInt(player.spId) || p.spId === parseInt(player.spId)
                  );
                  if (playerInfo) {
                    player.name = playerInfo.name;
                  }
                }

                // 시즌 정보 설정 - 서버에서 전달받은 정보를 우선 사용
                if (!player.seasonImg && player.spId) {
                  const seasonId = player.spId.toString().substring(0, 3);
                  const seasonInfo = globalSeasonInfo.value?.find(s =>
                    s.seasonId === parseInt(seasonId)
                  );
                  if (seasonInfo) {
                    player.seasonImg = seasonInfo.seasonImg;
                    player.seasonId = seasonInfo.seasonId;
                    player.seasonName = seasonInfo.className;
                  }
                }

                return player;
              });

              // 중복 제거 로직 적용
              const uniqueStats = mergeGoalAndPerformanceStats(processedStats, []); // 실시간은 processedStats만 있을 수 있음

              playerStatsMap.value[nickname.userName] = uniqueStats;
              console.log('선수별 득점 통계 저장 완료:', {
                userName: nickname.userName,
                playerCount: uniqueStats.length
              });
            } else {
              console.warn('선수별 득점 통계 응답 실패:', {
                userName: nickname.userName,
                error: statsResponse.data.error
              });
            }
          } catch (error) {
            console.error('선수별 득점 통계 조회 실패:', {
              userName: nickname.userName,
              error: error.message,
              response: error.response?.data
            });
          }
        } else {
          console.warn('새로운 데이터 조회 응답 실패:', {
            userName: nickname.userName,
            error: response.data?.error || '알 수 없는 오류'
          });
        }
      } catch (error) {
        console.error('새로운 데이터 조회 실패:', {
          userName: nickname.userName,
          error: error.message
        });
      }
    }
  } catch (error) {
    console.error('새로운 데이터 조회 실패:', error);
    alert('데이터 조회 중 오류가 발생했습니다. 다시 시도해주세요.');
  } finally {
    isRefreshing.value = false;
  }
}

// 사용자 정보 확인
const checkUserRole = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('토큰이 없습니다.');
      isAdmin.value = false;
      return;
    }

    const response = await api.get('/api/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('사용자 정보 응답:', response.data);
    isAdmin.value = response.data.user?.role === 'admin';
    console.log('관리자 권한 확인:', isAdmin.value);
  } catch (error) {
    console.error('사용자 정보 조회 실패:', error);
    isAdmin.value = false;
  }
};

// 데이터 초기화 함수
const resetData = async () => {
  if (!confirm('정말로 모든 데이터를 초기화하시겠습니까?')) {
    return;
  }

  resetting.value = true;
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('인증 토큰이 없습니다.');
    }

    const response = await api.delete('/api/admin/reset-data', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.success) {
      alert('데이터가 초기화되었습니다.');
      // 데이터 다시 로드
      await fetchNewData();
    } else {
      throw new Error(response.data.error || '데이터 초기화 실패');
    }
  } catch (error) {
    console.error('데이터 초기화 실패:', error);
    alert('데이터 초기화 중 오류가 발생했습니다.');
  } finally {
    resetting.value = false;
  }
};

// 사용자별 닉네임 관리 기능 추가
const currentUser = ref(null);
const userNicknames = ref([]);
const loadingUserNicknames = ref(false);

// 현재 사용자 정보 조회
const loadCurrentUser = async () => {
  console.log('🔍 [디버깅] loadCurrentUser 시작');
  try {
    const token = localStorage.getItem('token');
    console.log('🔍 [디버깅] localStorage token:', token ? '존재함' : '없음');

    if (!token) {
      console.log('🔍 [디버깅] 토큰이 없음 - 함수 종료');
      return;
    }

    console.log('🔍 [디버깅] /api/me API 호출 시작');
    const response = await api.get('/api/me');
    console.log('🔍 [디버깅] /api/me API 응답:', response.data);

    currentUser.value = response.data;
    console.log('🔍 [디버깅] currentUser.value 설정 완료:', currentUser.value);
    console.log('🔍 [디버깅] currentUser.value.nicknames:', currentUser.value.nicknames);
  } catch (error) {
    console.error('사용자 정보 조회 실패:', error);
  }
};

// 사용자별 닉네임 목록 조회
const loadUserNicknames = async () => {
  console.log('🔍 [디버깅] loadUserNicknames 시작');
  console.log('🔍 [디버깅] currentUser.value:', currentUser.value);

  if (!currentUser.value) {
    console.log('🔍 [디버깅] currentUser.value가 없음 - 함수 종료');
    return;
  }

  try {
    loadingUserNicknames.value = true;

    // 로그인 사용자: currentUser.value.user.nicknames.nickname 사용
    const userNicknames = currentUser.value.user?.nicknames || [];
    console.log('🔍 [디버깅] 사용자 닉네임 목록 (로그인 사용자):', userNicknames);
    console.log('🔍 [디버깅] userNicknames.length:', userNicknames.length);

    // nicknames 배열을 사용자 닉네임으로 업데이트
    nicknames.value = userNicknames.map(nick => ({
      userName: nick.nickname, // 로그인 사용자는 users.nicknames.nickname 필드 사용
      ouid: nick.ouid,
      matchIds: [],
      stats: null
    }));

    console.log('🔍 [디버깅] 사용자 닉네임 업데이트 완료:', nicknames.value);
    console.log('🔍 [디버깅] nicknames.value.length:', nicknames.value.length);
  } catch (error) {
    console.error('사용자 닉네임 목록 처리 실패:', error);
  } finally {
    loadingUserNicknames.value = false;
  }
};

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

// 닉네임 로드 함수 (기본 사용자 목록 포함)
const loadNicknames = async () => {
  try {
    console.log('loadNicknames 시작');

    // 기본 사용자 목록 로드 (비로그인 사용자용)
    const defaultUsers = await loadDefaultUsers();

    // 현재 사용자가 있으면 사용자별 닉네임과 병합
    if (currentUser.value && currentUser.value.user?.nicknames) {
      console.log('로그인 사용자 - 사용자별 닉네임과 기본 사용자 병합');
      const userNicknames = currentUser.value.user.nicknames.map(nickname => ({
        userName: nickname.nickname, // 로그인 사용자는 users.nicknames.nickname 필드 사용
        ouid: nickname.ouid,
        matchIds: [],
        stats: null,
        isUserNickname: true
      }));

      // 중복 제거 (사용자 닉네임 우선)
      const allNicknames = [...userNicknames];
      defaultUsers.forEach(defaultUser => {
        if (!allNicknames.find(n => n.userName === defaultUser.userName)) {
          allNicknames.push(defaultUser);
        }
      });

      nicknames.value = allNicknames;
    } else {
      console.log('비로그인 사용자 - 기본 사용자 목록만 사용');
      nicknames.value = defaultUsers;
    }

    console.log('loadNicknames 완료:', nicknames.value.map(n => ({ userName: n.userName, ouid: n.ouid })));
  } catch (error) {
    console.error('loadNicknames 실패:', error);
    // 폴백 기본 사용자 목록 사용
    nicknames.value = getFallbackDefaultUsers();
  }
};

// 시즌 이름 가져오기 함수
const getSeasonName = (seasonId) => {
  if (!seasonId) return '알 수 없음';

  // 전역 시즌 정보에서 찾기
  const season = globalSeasonInfo.value?.find(s => s.seasonId === seasonId || s.seasonId === parseInt(seasonId));
  if (season) return season.className || `시즌 ${seasonId}`;

  return `시즌 ${seasonId}`;
};

// 선수 이름 가져오기 함수
const getPlayerName = (spId) => {
  if (!spId) return '알 수 없음';

  // 전역 선수 정보에서 찾기
  const player = globalPlayerInfo.value?.find(p => p.id === spId || p.id === parseInt(spId));
  if (player) return player.name;

  return `선수 ${spId}`;
};

// 시즌 이미지 URL 가져오기 함수
const getSeasonImage = (seasonId) => {
  if (!seasonId) return '';

  // 전역 시즌 정보에서 찾기
  const season = globalSeasonInfo.value?.find(s => s.seasonId === seasonId || s.seasonId === parseInt(seasonId));
  if (season) return season.seasonImg;

  return '';
};

// 전역 선수 정보와 시즌 정보
const globalPlayerInfo = ref([]);
const globalSeasonInfo = ref([]);

// 선수 정보와 시즌 정보 로드
const loadGlobalInfo = async () => {
  try {
    // 선수 정보와 시즌 정보를 병렬로 로드
    const [playerResponse, seasonResponse] = await Promise.all([
      api.get('/api/fc/players').catch(() => ({ data: { success: false, data: [] } })),
      api.get('/api/fc/seasons').catch(() => ({ data: { success: false, data: [] } }))
    ]);

    if (playerResponse.data.success) {
      globalPlayerInfo.value = playerResponse.data.data;
      console.log('전역 선수 정보 로드 완료:', globalPlayerInfo.value.length);
    }

    if (seasonResponse.data.success) {
      globalSeasonInfo.value = seasonResponse.data.data;
      console.log('전역 시즌 정보 로드 완료:', globalSeasonInfo.value.length);
    }
  } catch (error) {
    console.error('전역 정보 로드 실패:', error);
  }
};

// 컴포넌트 마운트 시 저장된 닉네임 불러오기
onMounted(async () => {
  try {
    loading.value = true; // 로딩 상태 시작
    loadingPlayerStats.value = true; // 선수별 통계 로딩 상태 시작

    console.log('🚀 초기 로딩 시작 - 병렬 처리로 최적화');

    // 병렬로 모든 초기 데이터 로드
    const [
      globalInfoResult,
      currentUserResult,
      userRoleResult,
      seasonUpdateResult,
      seasonInfoResult,
      nicknamesResult,
      precalculatedResponse
    ] = await Promise.allSettled([
      loadGlobalInfo(),
      loadCurrentUser(),
      checkUserRole(),
      api.post('/api/fc/seasons/update').catch(err => {
        console.error('시즌 정보 업데이트 실패:', err);
        return null;
      }),
      loadSeasonInfo(),
      loadNicknames(),
      api.get('/api/fc/user-stats').catch(err => {
        console.error('사전 계산된 통계 조회 실패:', err);
        return { data: { success: false } };
      })
    ]);

    console.log('✅ 병렬 로딩 완료');

    // 사용자별 닉네임 목록 로드 (로그인한 사용자의 경우)
    if (currentUserResult.status === 'fulfilled' && currentUserResult.value) {
      await loadUserNicknames();
      console.log('사용자별 닉네임 목록 로드 완료');
    } else {
      console.log('로그인하지 않은 사용자 - 기본 사용자 목록만 사용');
      // 기본 사용자 목록이 로드되지 않았다면 다시 로드
      if (nicknames.value.length === 0) {
        console.log('기본 사용자 목록이 비어있어 다시 로드합니다.');
        const defaultUsers = await loadDefaultUsers();
        nicknames.value = defaultUsers;
        console.log('기본 사용자 목록 재로드 완료:', nicknames.value);
      }
    }

    if (nicknames.value.length > 0) {
      activeTab.value = nicknames.value[0].userName;
      console.log('활성 탭 설정:', activeTab.value);
    }

    console.log('관리자 여부:', userRoleResult.status === 'fulfilled' ? userRoleResult.value : false);

    console.log('🔍 사전 계산된 통계 응답:', {
      success: precalculatedResponse.status === 'fulfilled' ? precalculatedResponse.value?.data?.success : false,
      dataLength: precalculatedResponse.status === 'fulfilled' ? precalculatedResponse.value?.data?.data?.length : 0,
      availableOuids: precalculatedResponse.status === 'fulfilled' ? precalculatedResponse.value?.data?.data?.map(stat => stat.ouid) || [] : []
    });

    let hasPrecalculatedStats = false;

    if (precalculatedResponse.status === 'fulfilled' &&
        precalculatedResponse.value?.data?.success &&
        Array.isArray(precalculatedResponse.value.data.data)) {

      console.log('🔍 사전 계산된 통계 처리 시작:', {
        totalStats: precalculatedResponse.value.data.data.length,
        availableOuids: precalculatedResponse.value.data.data.map(stat => stat.ouid),
        nicknames: nicknames.value.map(n => ({ userName: n.userName, ouid: n.ouid }))
      });

      // 사전 계산된 통계가 있으면 즉시 적용
      for (const nickname of nicknames.value) {
        if (!nickname.ouid) {
          console.log('❌ nickname.ouid 없음:', nickname.userName);
          continue;
        }

        const userStat = precalculatedResponse.value.data.data.find(stat => stat.ouid === nickname.ouid);

        console.log('🔍 사용자 통계 검색:', {
          userName: nickname.userName,
          ouid: nickname.ouid,
          found: !!userStat
        });

        if (userStat) {
          console.log('✅ 사전 계산된 통계 사용:', nickname.userName);

          // 사전 계산된 통계 사용 (dataRange를 matchPeriod 형태로 변환)
          nickname.stats = {
            ...userStat.fcBrgStats,
            matchPeriod: {
              firstMatchDate: userStat.dataRange?.fromDate,
              lastMatchDate: userStat.dataRange?.toDate,
              totalDays: userStat.dataRange?.matchCount > 0 ?
                Math.ceil((new Date(userStat.dataRange.toDate) - new Date(userStat.dataRange.fromDate)) / (1000 * 60 * 60 * 24)) : 0
            }
          };

          // 선수별 통계 저장 (골 통계만 사용, 중복 제거)
          const goalStats = userStat.playerGoalStats || [];
          const performanceStats = userStat.playerPerformanceStats || [];

          console.log('🔍 선수별 통계 데이터 구조 확인:', {
            userName: nickname.userName,
            goalStatsLength: goalStats.length,
            performanceStatsLength: performanceStats.length,
            firstGoalStat: goalStats[0],
            firstPerformanceStat: performanceStats[0]
          });

          // 헨릭 라르손과 잔루카 잠브로타(14번째) 디버깅
          const henrikLarsson = goalStats.find(p => p.name === '헨릭 라르손');
          const gianlucaZambrotta = performanceStats[13]; // 14번째 (인덱스 13)

          console.log('🔍 헨릭 라르손 골 통계:', henrikLarsson);
          console.log('🔍 잔루카 잠브로타(14번째) 활약 통계:', gianlucaZambrotta);

          // spId 정규화 테스트
          if (henrikLarsson) {
            console.log('🔍 헨릭 라르손 spId 정규화 전:', {
              spId: henrikLarsson.spId,
              spid: henrikLarsson.spid
            });
          }

          // 개선된 병합 로직 사용
          const uniqueStats = mergeGoalAndPerformanceStats(goalStats, performanceStats);

          console.log('🔍 최종 선수별 통계 데이터:', {
            userName: nickname.userName,
            uniqueStatsLength: uniqueStats.length,
            samplePlayer: uniqueStats[0]
          });

          playerStatsMap.value[nickname.userName] = uniqueStats;

          hasPrecalculatedStats = true;

          console.log('📊 사전 계산된 통계 상세:', {
            userName: nickname.userName,
            totalMatches: userStat.fcBrgStats?.totalMatches,
            averageGoalsFor: userStat.fcBrgStats?.averageGoalsFor,
            averageGoalsAgainst: userStat.fcBrgStats?.averageGoalsAgainst,
            dataRange: userStat.dataRange,
            matchPeriod: nickname.stats.matchPeriod
          });
        } else {
          console.log('❌ 사용자 통계 없음:', nickname.userName);
        }
      }

      console.log('📊 사전 계산된 통계 처리 완료:', {
        hasPrecalculatedStats,
        processedCount: nicknames.value.filter(n => n.stats).length
      });
    }

    // 사전 계산된 통계가 없거나 일부 사용자에게 없는 경우에만 실시간 계산
    if (!hasPrecalculatedStats) {
      console.log('🔄 실시간 계산 시작 (사전 계산된 통계 없음)');

      const dataPromises = nicknames.value.map(async (nickname) => {
        if (!nickname.ouid) return;

        try {
          const [matchResponse, statsResponse] = await Promise.all([
            fcStore.fetchMatches(nickname.ouid, true, 100, matchLimit.value || 100),
            api.get(`/api/fc/player-stats/${nickname.ouid}`).catch(err => ({ data: { success: false, data: [] } }))
          ]);

          if (matchResponse && matchResponse.success && Array.isArray(matchResponse.data)) {
            const processedMatches = processMatchData(matchResponse.data);
            nickname.matchIds = processedMatches;
            nickname.stats = matchResponse.stats;
          }

          if (statsResponse.data.success) {
            const processedStats = statsResponse.data.data.map(player => {
              if (!player.name || player.name.startsWith('선수 ')) {
                const playerInfo = globalPlayerInfo.value?.find(p =>
                  p.id === parseInt(player.spId) || p.spId === parseInt(player.spId)
                );
                if (playerInfo) {
                  player.name = playerInfo.name;
                }
              }

              if (!player.seasonImg && player.spId) {
                const seasonId = player.spId.toString().substring(0, 3);
                const seasonInfo = globalSeasonInfo.value?.find(s =>
                  s.seasonId === parseInt(seasonId)
                );
                if (seasonInfo) {
                  player.seasonImg = seasonInfo.seasonImg;
                  player.seasonId = seasonInfo.seasonId;
                  player.seasonName = seasonInfo.className;
                }
              }

              return player;
            });

            // 중복 제거 로직 적용
            const uniqueStats = mergeGoalAndPerformanceStats(processedStats, []); // 실시간은 processedStats만 있을 수 있음

            playerStatsMap.value[nickname.userName] = uniqueStats;
          }
        } catch (error) {
          console.error('데이터 조회 실패:', {
            userName: nickname.userName,
            error: error.message
          });
        }
      });

      await Promise.all(dataPromises);
    }

    // localStorage 저장 안함 - 서버에서 실시간 조회
    console.log('초기 데이터 로딩 완료');
  } catch (error) {
    console.error('초기 데이터 로딩 실패:', error);
    // 사용자에게 에러 메시지 표시
    alert('초기 데이터 로딩 중 오류가 발생했습니다. 페이지를 새로고침해주세요.');
  } finally {
    loading.value = false; // 로딩 상태 종료
    loadingPlayerStats.value = false; // 선수별 통계 로딩 상태 종료
  }
});

// 매치 데이터를 정렬하는 함수
function processMatchData(matches) {
  if (!Array.isArray(matches)) return [];

  return matches.map(match => ({
    ...match,
    matchDate: match.matchDate // 서버에서 이미 한국 시간으로 변환되어 있음
  })).sort((a, b) => {
    return new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime();
  });
}

// 기본 사용자 목록을 서버에서 가져오는 함수
const loadDefaultUsers = async () => {
  try {
    console.log('loadDefaultUsers 시작');
    console.log('API 호출: /api/fc/default-users');

    const response = await api.get('/api/fc/default-users');
    console.log('API 응답:', response.data);
    console.log('API 응답 데이터 구조:', {
      success: response.data.success,
      dataLength: response.data.data?.length,
      dataKeys: response.data.data?.[0] ? Object.keys(response.data.data[0]) : [],
      firstItem: response.data.data?.[0]
    });

    if (response.data.success && response.data.data) {
      const defaultUsers = response.data.data.map(user => {
        console.log('사용자 데이터 처리 (비로그인 사용자):', user);
        return {
          userName: user.nickName, // 비로그인 사용자는 nickName 필드 사용 (fc_user.isDefault: true)
          ouid: user.ouid,
          matchIds: [],
          stats: null
        };
      });

      console.log('기본 사용자 목록 변환 완료 (비로그인 사용자):', defaultUsers);
      return defaultUsers;
    } else {
      console.warn('기본 사용자 목록 응답 실패:', response.data);
      console.log('폴백 기본 사용자 목록 사용');
      return getFallbackDefaultUsers();
    }
  } catch (error) {
    console.error('기본 사용자 목록 로드 실패:', error);
    console.log('폴백 기본 사용자 목록 사용');
    return getFallbackDefaultUsers();
  }
};

// 폴백 기본 사용자 목록 (API 실패 시 사용)
const getFallbackDefaultUsers = () => {
  return [
    { userName: 'junspapa', ouid: 'a58fcf2750b6054f7508729dc99e7625', matchIds: [], stats: null },
    { userName: 'junnypapa', ouid: '511b736fe892566d0c6013ba2fc1ff7e', matchIds: [], stats: null },
    { userName: '절대월클아니다', ouid: '1234567890abcdef1234567890abcdef', matchIds: [], stats: null },
    { userName: '머니트렌드', ouid: 'abcdef1234567890abcdef1234567890', matchIds: [], stats: null }
  ];
};
</script>

<style scoped>
.v-data-table {
  border-radius: 8px;
  overflow: hidden;
}

.v-data-table-header th {
  background-color: #f5f5f5 !important;
  font-weight: bold !important;
  color: #333 !important;
}

.v-data-table-row:hover {
  background-color: #f8f9fa !important;
}

.v-card {
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
}

.v-card-title {
  color: #1976d2;
  font-weight: 600;
}

.text-primary {
  color: rgb(var(--v-theme-primary));
}

.logo-link {
  text-decoration: none;
  color: inherit;
}

.logo-link:hover {
  opacity: 0.8;
}

.drag-handle {
  cursor: move;
}

.v-chip {
  user-select: none;
}

.v-dialog {
  max-height: 80vh;
}

.v-card-text {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>