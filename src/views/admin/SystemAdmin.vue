<template>
  <v-container>
    <!-- 시스템 관리 섹션 (관리자 전용) -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card class="mx-auto pa-4">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-3" size="large">mdi-cog</v-icon>
            <span>시스템 관리</span>
          </v-card-title>
          <v-container>
            <!-- 스케줄러 관리 주석처리
            <v-row>
              <v-col cols="12">
                <v-card variant="outlined" class="mb-4">
                  <v-card-title class="d-flex align-center">
                    <v-icon class="mr-2">mdi-clock-outline</v-icon>
                    자동 데이터 수집 스케줄러
                  </v-card-title>

                  <v-card-text>
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-card variant="tonal" color="blue-grey-lighten-4">
                          <v-card-text>
                            <div class="text-subtitle-1 font-weight-medium mb-2">스케줄 정보</div>
                            <div v-if="schedulerStatus" class="text-body-2">
                              <div>실행 시간: {{ schedulerStatus.schedule }}</div>
                              <div>다음 실행: {{ schedulerStatus.nextRun }}</div>
                              <div>현재 시간: {{ schedulerStatus.currentTime }}</div>
                              <div>상태:
                                <v-chip
                                  :color="schedulerStatus.isActive ? 'success' : 'error'"
                                  size="small"
                                  variant="tonal"
                                >
                                  {{ schedulerStatus.isActive ? '활성' : '비활성' }}
                                </v-chip>
                              </div>
                            </div>
                          </v-card-text>
                        </v-card>
                      </v-col>

                      <v-col cols="12" md="6">
                        <v-card variant="tonal" color="blue-grey-lighten-4">
                          <v-card-text>
                            <div class="text-subtitle-1 font-weight-medium mb-2">수집 설정</div>
                            <div class="text-body-2">
                              <div>공식경기: limit=50</div>
                              <div>감독모드: limit=150</div>
                              <div>중복 제거: 자동</div>
                              <div>API 키: 자동 전환</div>
                            </div>
                          </v-card-text>
                        </v-card>
                      </v-col>
                    </v-row>

                    <v-row class="mt-4">
                      <v-col cols="12" class="d-flex gap-2 align-center">
                        <v-text-field
                          v-model="collectionLimit"
                          type="number"
                          label="수집 Limit"
                          placeholder="기본값 사용"
                          min="1"
                          max="1000"
                          style="max-width: 150px"
                          density="compact"
                          hide-details
                          class="mr-2"
                        ></v-text-field>

                        <v-btn
                          @click="triggerAutoCollection"
                          :loading="isCollecting"
                          color="primary"
                          variant="elevated"
                        >
                          <v-icon class="mr-2">mdi-play</v-icon>
                          {{ isCollecting ? '수집 중...' : '수동 실행' }}
                        </v-btn>

                        <v-btn
                          @click="refreshSchedulerStatus"
                          color="info"
                          variant="outlined"
                        >
                          <v-icon class="mr-2">mdi-refresh</v-icon>
                          상태 새로고침
                        </v-btn>
                      </v-col>
                    </v-row>

                    <v-alert
                      v-if="collectionMessage"
                      :type="collectionMessage.type"
                      variant="tonal"
                      class="mt-4"
                    >
                      {{ collectionMessage.text }}
                    </v-alert>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
            -->

            <!-- 거래 내역 동기화 -->
            <v-row class="mt-4">
              <v-col cols="12">
                <v-card variant="outlined">
                  <v-card-title class="d-flex align-center">
                    <v-icon class="mr-2">mdi-cash-multiple</v-icon>
                    거래 내역 동기화
                    <v-spacer></v-spacer>
                    <v-btn
                      @click="loadUsers"
                      :loading="loadingUsers"
                      color="primary"
                      variant="text"
                      size="small"
                    >
                      <v-icon class="mr-1">mdi-refresh</v-icon>
                      사용자 목록 새로고침
                    </v-btn>
                  </v-card-title>
                  <v-card-text>
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-select
                          v-model="selectedUserForTrade"
                          :items="users"
                          item-title="nickName"
                          item-value="nickName"
                          label="동기화할 사용자 선택"
                          density="compact"
                          variant="outlined"
                        ></v-select>
                      </v-col>
                      <v-col cols="12" md="3">
                        <v-text-field
                          v-model="tradeLimit"
                          type="number"
                          label="거래 내역 수"
                          placeholder="100"
                          min="1"
                          max="1000"
                          density="compact"
                          variant="outlined"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="3" class="d-flex align-center">
                        <v-btn
                          @click="syncTradeHistory"
                          :loading="syncingTrade"
                          :disabled="!selectedUserForTrade"
                          color="success"
                          variant="elevated"
                          block
                        >
                          <v-icon class="mr-2">mdi-sync</v-icon>
                          {{ syncingTrade ? '동기화 중...' : '동기화' }}
                        </v-btn>
                      </v-col>
                    </v-row>

                    <v-alert
                      v-if="tradeSyncMessage"
                      :type="tradeSyncMessage.type"
                      variant="tonal"
                      class="mt-4"
                    >
                      {{ tradeSyncMessage.text }}
                    </v-alert>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- 사용자별 통계 계산 -->
            <v-row class="mt-4">
              <v-col cols="12">
                <v-card variant="outlined">
                  <v-card-title class="d-flex align-center">
                    <v-icon class="mr-2">mdi-chart-line</v-icon>
                    사용자별 통계 계산 (빠른 로딩용)
                    <v-spacer></v-spacer>
                    <v-btn
                      @click="calculateUserStats"
                      :loading="calculatingStats"
                      color="success"
                      variant="elevated"
                    >
                      <v-icon class="mr-2">mdi-calculator</v-icon>
                      {{ calculatingStats ? '계산 중...' : '통계 계산' }}
                    </v-btn>
                  </v-card-title>
                  <v-card-text>
                    <div class="text-body-2 mb-4">
                      <p><strong>기능:</strong> 모든 사용자의 통계를 사전 계산하여 저장합니다.</p>
                      <p><strong>효과:</strong> Home 페이지 로딩 속도가 크게 향상됩니다.</p>
                      <p><strong>계산 내용:</strong></p>
                      <ul>
                        <li>FC BRG 통계 (최근 100경기)</li>
                        <li>선수별 득점 통계 (전체 누적)</li>
                        <li>선수별 활약 통계 (전체 누적)</li>
                      </ul>
                      <p><strong>소요 시간:</strong> 사용자 수에 따라 몇 분 정도 소요될 수 있습니다.</p>
                    </div>

                    <v-alert
                      v-if="statsCalculationMessage"
                      :type="statsCalculationMessage.type"
                      variant="tonal"
                      class="mt-4"
                    >
                      {{ statsCalculationMessage.text }}
                    </v-alert>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- 관리자 API 키 사용 통계 (이식) -->
            <v-row class="mt-4">
              <v-col cols="12">
                <v-card variant="outlined">
                  <v-card-title class="d-flex align-center">
                    <v-icon class="mr-2">mdi-key-variant</v-icon>
                    API 키 사용 통계
                    <v-spacer></v-spacer>
                    <v-btn
                      @click="loadApiKeyStats"
                      :loading="loadingApiStats"
                      color="primary"
                      variant="text"
                      size="small"
                    >
                      <v-icon class="mr-1">mdi-refresh</v-icon>
                      새로고침
                    </v-btn>
                  </v-card-title>
                  <v-card-text v-if="apiKeyStats">
                    <v-row class="mb-3">
                      <v-col cols="6" md="3">
                        <div class="text-center">
                          <div class="text-h6 font-weight-bold text-primary">{{ apiKeyStats.totalKeys }}</div>
                          <div class="text-caption">총 키 개수</div>
                        </div>
                      </v-col>
                      <v-col cols="6" md="3">
                        <div class="text-center">
                          <div class="text-h6 font-weight-bold text-success">{{ apiKeyStats.availableKeys }}</div>
                          <div class="text-caption">사용 가능</div>
                        </div>
                      </v-col>
                      <v-col cols="6" md="3">
                        <div class="text-center">
                          <div class="text-h6 font-weight-bold text-error">{{ apiKeyStats.blockedKeys }}</div>
                          <div class="text-caption">차단됨</div>
                        </div>
                      </v-col>
                      <v-col cols="6" md="3">
                        <div class="text-center">
                          <div class="text-h6 font-weight-bold text-info">{{ apiKeyStats.currentKeyIndex }}</div>
                          <div class="text-caption">현재 키 인덱스</div>
                        </div>
                      </v-col>
                    </v-row>
                    <v-table density="compact">
                      <thead>
                        <tr>
                          <th>인덱스</th>
                          <th>키 (마스킹)</th>
                          <th>호출 수</th>
                          <th>에러율</th>
                          <th>상태</th>
                          <th>마지막 사용</th>
                          <th>작업</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="stat in apiKeyStats.stats" :key="stat.index">
                          <td>{{ stat.index }}</td>
                          <td><code>{{ stat.maskedKey }}</code></td>
                          <td>{{ stat.totalCalls }}</td>
                          <td>
                            <v-chip
                              :color="parseFloat(stat.errorRate) > 10 ? 'error' : 'success'"
                              size="x-small"
                              variant="tonal"
                            >
                              {{ stat.errorRate }}
                            </v-chip>
                          </td>
                          <td>
                            <v-chip
                              :color="stat.isBlocked ? 'error' : 'success'"
                              size="x-small"
                              variant="tonal"
                            >
                              {{ stat.status }}
                            </v-chip>
                          </td>
                          <td class="text-caption">{{ stat.lastUsed }}</td>
                          <td>
                            <v-btn
                              v-if="stat.isBlocked"
                              @click="unblockApiKey(stat.index)"
                              color="warning"
                              variant="text"
                              size="x-small"
                            >
                              차단 해제
                            </v-btn>
                            <span v-else class="text-caption text-medium-emphasis">-</span>
                          </td>
                        </tr>
                      </tbody>
                    </v-table>
                    <v-alert
                      v-if="apiKeyStats.blockedKeys > 0"
                      type="warning"
                      variant="tonal"
                      class="mt-3"
                    >
                      <v-icon class="mr-2">mdi-alert</v-icon>
                      {{ apiKeyStats.blockedKeys }}개의 API 키가 차단되었습니다.
                      차단된 키는 자동으로 해제되거나 수동으로 해제할 수 있습니다.
                    </v-alert>
                  </v-card-text>
                  <v-card-text v-else>
                    <div class="text-center py-4">
                      <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-key-off</v-icon>
                      <div class="text-body-2 text-medium-emphasis">
                        API 키 통계를 불러오려면 새로고침 버튼을 클릭하세요.
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- 자동 데이터 수집 대상 설정 -->
            <v-row class="mt-4">
              <v-col cols="12">
                <v-card variant="outlined">
                  <v-card-title class="d-flex align-center">
                    <v-icon class="mr-2">mdi-account-multiple</v-icon>
                    자동 데이터 수집 대상 설정
                  </v-card-title>
                  <v-card-text>
                    <v-alert
                      type="info"
                      variant="tonal"
                      class="mb-4"
                    >
                      <v-icon class="mr-2">mdi-information</v-icon>
                      UI에서 추가한 닉네임들을 자동 데이터 수집 대상으로 설정합니다.
                      이 설정은 매일 오전 7시 자동 데이터 수집과 수동 데이터 수집에 적용됩니다.
                    </v-alert>

                    <v-row>
                      <v-col cols="12" md="6">
                        <v-card variant="tonal" color="blue-grey-lighten-4">
                          <v-card-title class="text-subtitle-1">현재 UI 닉네임 목록</v-card-title>
                          <v-card-text>
                            <div v-if="uiNicknames && uiNicknames.length === 0" class="text-center text-grey py-4">
                              UI 닉네임이 없습니다.
                            </div>
                            <div v-else>
                              <v-chip
                                v-for="nickname in uiNicknames"
                                :key="nickname"
                                class="ma-1"
                                color="primary"
                                variant="tonal"
                              >
                                {{ nickname }}
                              </v-chip>
                              <div class="text-caption text-grey mt-2">
                                총 {{ uiNicknames?.length || 0 }}명
                              </div>
                            </div>
                          </v-card-text>
                        </v-card>
                      </v-col>

                      <v-col cols="12" md="6">
                        <v-card variant="tonal" color="blue-grey-lighten-4">
                          <v-card-title class="text-subtitle-1">현재 서버 등록 사용자</v-card-title>
                          <v-card-text>
                            <div v-if="serverUsers && serverUsers.length === 0" class="text-center text-grey py-4">
                              서버 등록 사용자가 없습니다.
                            </div>
                            <div v-else>
                              <v-chip
                                v-for="user in serverUsers"
                                :key="user.ouid"
                                class="ma-1"
                                color="success"
                                variant="tonal"
                              >
                                {{ user.nickName }}
                              </v-chip>
                              <div class="text-caption text-grey mt-2">
                                총 {{ serverUsers?.length || 0 }}명
                              </div>
                            </div>
                          </v-card-text>
                        </v-card>
                      </v-col>
                    </v-row>

                    <v-row class="mt-4">
                      <v-col cols="12" class="d-flex gap-2">
                        <v-btn
                          @click="loadUiNicknames"
                          color="info"
                          variant="outlined"
                        >
                          <v-icon class="mr-2">mdi-refresh</v-icon>
                          UI 닉네임 로드
                        </v-btn>

                        <v-btn
                          @click="loadServerUsers"
                          color="info"
                          variant="outlined"
                        >
                          <v-icon class="mr-2">mdi-refresh</v-icon>
                          서버 사용자 로드
                        </v-btn>

                        <v-btn
                          @click="setCollectionTargets"
                          :loading="settingTargets"
                          :disabled="!uiNicknames || uiNicknames.length === 0"
                          color="primary"
                          variant="elevated"
                        >
                          <v-icon class="mr-2">mdi-account-check</v-icon>
                          수집 대상 설정
                        </v-btn>
                      </v-col>
                    </v-row>

                    <v-alert
                      v-if="targetSettingMessage"
                      :type="targetSettingMessage.type"
                      variant="tonal"
                      class="mt-4"
                    >
                      {{ targetSettingMessage.text }}
                    </v-alert>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- 누락된 매치 마이그레이션 -->
            <v-row class="mt-4">
              <v-col cols="12">
                <v-card variant="outlined">
                  <v-card-title class="d-flex align-center">
                    <v-icon class="mr-2">mdi-database-sync</v-icon>
                    누락된 매치 마이그레이션
                  </v-card-title>
                  <v-card-text>
                    <v-alert
                      type="info"
                      variant="tonal"
                      class="mb-4"
                    >
                      <v-icon class="mr-2">mdi-information</v-icon>
                      매치 ID는 있지만 상세 정보가 누락된 매치들을 마이그레이션합니다.
                      이 작업은 시간이 오래 걸릴 수 있으며, API 호출 제한에 따라 중간에 중단될 수 있습니다.
                    </v-alert>

                    <v-row>
                      <v-col cols="12" md="6">
                        <v-card variant="tonal" color="blue-grey-lighten-4">
                          <v-card-title class="text-subtitle-1">마이그레이션 설정</v-card-title>
                          <v-card-text>
                            <v-select
                              v-model="migrationType"
                              :items="[
                                { title: '감독모드', value: 'director' },
                                { title: '공식경기', value: 'official' }
                              ]"
                              item-title="title"
                              item-value="value"
                              label="마이그레이션 타입"
                              variant="outlined"
                              density="compact"
                            ></v-select>

                            <div class="text-caption text-grey mt-2">
                              <div>• 감독모드: fc_director_matchids → fc_director_match_detail</div>
                              <div>• 공식경기: fc_match_ids → fc_detail</div>
                            </div>
                          </v-card-text>
                        </v-card>
                      </v-col>

                      <v-col cols="12" md="6">
                        <v-card variant="tonal" color="blue-grey-lighten-4">
                          <v-card-title class="text-subtitle-1">마이그레이션 정보</v-card-title>
                          <v-card-text>
                            <div v-if="migrationStatus" class="text-body-2">
                              <div>상태:
                                <v-chip
                                  :color="migrationStatus.isRunning ? 'warning' : 'success'"
                                  size="small"
                                  variant="tonal"
                                >
                                  {{ migrationStatus.isRunning ? '진행 중' : '완료' }}
                                </v-chip>
                              </div>
                              <div v-if="migrationStatus.progress">진행률: {{ migrationStatus.progress }}</div>
                              <div v-if="migrationStatus.message">{{ migrationStatus.message }}</div>
                            </div>
                            <div v-else class="text-caption text-grey">
                              마이그레이션을 시작하면 상태가 표시됩니다.
                            </div>
                          </v-card-text>
                        </v-card>
                      </v-col>
                    </v-row>

                    <v-row class="mt-4">
                      <v-col cols="12" class="d-flex gap-2">
                        <v-btn
                          @click="startMigration"
                          :loading="isMigrating"
                          :disabled="isMigrating"
                          color="primary"
                          variant="elevated"
                        >
                          <v-icon class="mr-2">mdi-database-sync</v-icon>
                          {{ isMigrating ? '마이그레이션 중...' : '마이그레이션 시작' }}
                        </v-btn>

                        <v-btn
                          @click="checkMigrationStatus"
                          color="info"
                          variant="outlined"
                        >
                          <v-icon class="mr-2">mdi-refresh</v-icon>
                          상태 확인
                        </v-btn>
                      </v-col>
                    </v-row>

                    <v-alert
                      v-if="migrationMessage"
                      :type="migrationMessage.type"
                      variant="tonal"
                      class="mt-4"
                    >
                      {{ migrationMessage.text }}
                    </v-alert>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

const api = axios.create({
  baseURL: window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : window.location.origin,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  },
  withCredentials: true
});
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

const authStore = useAuthStore()
const apiKeyStats = ref(null)
const loadingApiStats = ref(false)
const schedulerStatus = ref(null)
const isCollecting = ref(false)
const collectionMessage = ref(null)
const collectionLimit = ref(null)
const uiNicknames = ref([])
const serverUsers = ref([])
const settingTargets = ref(false)
const targetSettingMessage = ref(null)
const migrationType = ref(null)
const migrationStatus = ref(null)
const isMigrating = ref(false)
const migrationMessage = ref(null)
const selectedUserForTrade = ref(null)
const tradeLimit = ref(100)
const loadingUsers = ref(false)
const syncingTrade = ref(false)
const tradeSyncMessage = ref(null)
const users = ref([])

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
      await loadApiKeyStats(); // 통계 새로고침
    } else {
      alert(`오류: ${result.error}`);
    }
  } catch (error) {
    console.error('API 키 차단 해제 실패:', error);
    alert('API 키 차단 해제 중 오류가 발생했습니다.');
  }
};

const loadUiNicknames = async () => {
  try {
    // localStorage에서 UI 닉네임 목록 읽기
    const homeNicknames = localStorage.getItem('fcNicknames');
    const managerNicknames = localStorage.getItem('fcManagerNicknames');

    const nicknames = new Set();

    // Home.vue의 닉네임들
    if (homeNicknames) {
      try {
        const parsed = JSON.parse(homeNicknames);
        parsed.forEach(nick => {
          if (nick.userName) {
            nicknames.add(nick.userName);
          }
        });
      } catch (error) {
        console.error('Home 닉네임 파싱 오류:', error);
      }
    }

    // Manager.vue의 닉네임들 (기본 닉네임 + 추가 닉네임)
    const defaultNicknames = [
      'junspapa',
      'junnypapa',
      '절대월클아니다',
      '머니트렌드',
      '마곡아이언맨',
      '마곡퍼터맨'
    ];

    defaultNicknames.forEach(nick => nicknames.add(nick));

    if (managerNicknames) {
      try {
        const parsed = JSON.parse(managerNicknames);
        parsed.forEach(nick => {
          if (nick.userName) {
            nicknames.add(nick.userName);
          }
        });
      } catch (error) {
        console.error('Manager 닉네임 파싱 오류:', error);
      }
    }

    uiNicknames.value = Array.from(nicknames).sort();
    console.log('UI 닉네임 로드 완료:', uiNicknames.value);
  } catch (error) {
    console.error('UI 닉네임 로드 오류:', error);
    alert('UI 닉네임을 로드하는 중 오류가 발생했습니다.');
  }
};

const loadServerUsers = async () => {
  try {
    const response = await api.get('/api/fc/registered-users');
    if (response.data.success) {
      serverUsers.value = response.data.data;
    } else {
      console.error('서버 사용자 로드 실패:', response.data.error);
      alert('서버 사용자를 로드하는데 실패했습니다.');
    }
  } catch (error) {
    console.error('서버 사용자 로드 오류:', error);
    alert('서버 사용자를 로드하는 중 오류가 발생했습니다.');
  }
};

const setCollectionTargets = async () => {
  if (!uiNicknames.value || uiNicknames.value.length === 0) {
    alert('설정할 UI 닉네임이 없습니다.');
    return;
  }

  const confirmed = confirm(`총 ${uiNicknames.value.length}명의 닉네임을 자동 데이터 수집 대상으로 설정하시겠습니까?\n\n이 작업은 기존 서버 등록 사용자를 모두 삭제하고 새로운 목록으로 교체합니다.`);
  if (!confirmed) return;

  settingTargets.value = true;
  targetSettingMessage.value = null;

  try {
    const response = await api.post('/api/fc/set-collection-targets', {
      nicknames: uiNicknames.value
    });

    if (response.data.success) {
      targetSettingMessage.value = {
        type: 'success',
        text: response.data.message || '수집 대상 설정이 완료되었습니다.'
      };
      // 서버 사용자 목록 새로고침
      await loadServerUsers();
    } else {
      targetSettingMessage.value = {
        type: 'error',
        text: `오류: ${response.data.error}`
      };
    }
  } catch (error) {
    console.error('수집 대상 설정 실패:', error);
    targetSettingMessage.value = {
      type: 'error',
      text: error.response?.data?.error || error.message || '수집 대상 설정 중 오류가 발생했습니다.'
    };
  } finally {
    settingTargets.value = false;
  }
};

const startMigration = async () => {
  if (isMigrating.value) return

  isMigrating.value = true
  migrationMessage.value = null

  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('인증 토큰이 없습니다.')
    }

    const response = await fetch('/api/fc/migration/start', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: migrationType.value
      })
    })

    if (!response.ok) {
      throw new Error(`서버 응답 오류: ${response.status}`)
    }

    const result = await response.json()

    if (result.success) {
      migrationMessage.value = {
        type: 'success',
        text: result.message || '마이그레이션이 시작되었습니다.'
      }
    } else {
      migrationMessage.value = {
        type: 'error',
        text: `오류: ${result.error}`
      }
    }
  } catch (error) {
    console.error('마이그레이션 실패:', error)
    migrationMessage.value = {
      type: 'error',
      text: error.message || '마이그레이션 중 오류가 발생했습니다.'
    }
  } finally {
    isMigrating.value = false
  }
}

const checkMigrationStatus = async () => {
  try {
    const response = await fetch('/api/fc/migration/status', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const result = await response.json();
    if (result.success) {
      migrationStatus.value = result.data;
    } else {
      console.error('마이그레이션 상태 조회 실패:', result.error);
    }
  } catch (error) {
    console.error('마이그레이션 상태 조회 실패:', error);
  }
};

const loadUsers = async () => {
  loadingUsers.value = true;
  try {
    const response = await api.get('/api/fc/registered-users');
    if (response.data.success) {
      users.value = response.data.data;
    } else {
      console.error('서버 사용자 로드 실패:', response.data.error);
      alert('서버 사용자를 로드하는데 실패했습니다.');
    }
  } catch (error) {
    console.error('서버 사용자 로드 오류:', error);
    alert('서버 사용자를 로드하는 중 오류가 발생했습니다.');
  } finally {
    loadingUsers.value = false;
  }
};

// 사용자별 통계 계산
const calculatingStats = ref(false);
const statsCalculationMessage = ref(null);

const calculateUserStats = async () => {
  calculatingStats.value = true;
  statsCalculationMessage.value = null;

  try {
    const response = await api.post('/api/fc/calculate-user-stats');

    if (response.data.success) {
      statsCalculationMessage.value = {
        type: 'success',
        text: response.data.message || '사용자별 통계 계산이 시작되었습니다. 완료까지 몇 분 정도 소요될 수 있습니다.'
      };
    } else {
      statsCalculationMessage.value = {
        type: 'error',
        text: `오류: ${response.data.error}`
      };
    }
  } catch (error) {
    console.error('사용자별 통계 계산 실패:', error);
    statsCalculationMessage.value = {
      type: 'error',
      text: error.response?.data?.error || error.message || '사용자별 통계 계산 중 오류가 발생했습니다.'
    };
  } finally {
    calculatingStats.value = false;
  }
};

const syncTradeHistory = async () => {
  if (!selectedUserForTrade.value) {
    alert('동기화할 사용자를 선택하세요.');
    return;
  }

  syncingTrade.value = true;
  tradeSyncMessage.value = null;

  try {
    const response = await api.post('/api/fc/trade/sync', {
      nickname: selectedUserForTrade.value,
      limit: tradeLimit.value
    });

    if (response.data.success) {
      tradeSyncMessage.value = {
        type: 'success',
        text: response.data.message || '거래 내역 동기화가 완료되었습니다.'
      };
    } else {
      tradeSyncMessage.value = {
        type: 'error',
        text: `오류: ${response.data.error}`
      };
    }
  } catch (error) {
    console.error('거래 내역 동기화 실패:', error);
    tradeSyncMessage.value = {
      type: 'error',
      text: error.response?.data?.error || error.message || '거래 내역 동기화 중 오류가 발생했습니다.'
    };
  } finally {
    syncingTrade.value = false;
  }
};

onMounted(() => {
  loadApiKeyStats()
  loadUiNicknames()
  loadServerUsers()
  loadUsers()
})
</script>
<style scoped>
.log-container {
  max-height: 500px;
  overflow-y: auto;
  font-family: 'Consolas', monospace;
}
.log-entry {
  font-size: 0.875rem;
  line-height: 1.5;
}
.log-entry pre {
  font-family: 'Consolas', monospace;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>