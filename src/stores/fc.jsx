import { defineStore } from 'pinia';
import axios from 'axios';
import api from '../api';
import { formatKoreanTime } from '../utils/timezone';

// API 요청 간 지연 시간 (밀리초)
const API_DELAY = 500;

// 캐시 유효 시간 (밀리초)
const CACHE_DURATION = 5 * 60 * 1000; // 5분

// API 인스턴스 생성
const apiInstance = axios.create({
    baseURL: 'https://fc-online-server.onrender.com',
    timeout: 30000
});

export const useFCStore = defineStore('fc', {
            state: () => ({
                users: {},
                matches: {},
                matchDetails: {},
                loading: false,
                error: null,
                // 캐시 추가
                userCache: new Map(),
                matchCache: new Map(),
                matchDetailCache: new Map()
            }),

            actions: {
                // 지연 함수
                async delay(ms) {
                    return new Promise(resolve => setTimeout(resolve, ms));
                },

                // 캐시에서 데이터 조회
                getFromCache(cache, key) {
                    const cached = cache.get(key);
                    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
                        return cached.data;
                    }
                    return null;
                },

                // 캐시에 데이터 저장
                setToCache(cache, key, data) {
                    cache.set(key, {
                        data,
                        timestamp: Date.now()
                    });
                },

                async fetchUsers(nicknames) {
                    this.loading = true;
                    this.error = null;

                    try {
                        console.log('사용자 정보 조회 시작:', nicknames);
                        const response = await apiInstance.post('/api/fc/users', { nicknames });
                        console.log('사용자 정보 조회 응답:', response.data);

                        if (response.data.success) {
                            response.data.data.forEach(user => {
                                if (!user.error) {
                                    // userName 또는 nickName 필드 사용
                                    const userName = user.userName || user.nickName;
                                    if (userName) {
                                        this.users[userName] = user;
                                    } else {
                                        console.warn('사용자 이름 필드 없음:', user);
                                    }
                                } else {
                                    console.warn('사용자 정보 조회 실패:', {
                                        userName: user.userName || user.nickName,
                                        error: user.error
                                    });
                                }
                            });
                            return response.data;
                        } else {
                            throw new Error('사용자 정보 조회 실패');
                        }
                    } catch (error) {
                        this.error = error.message;
                        console.error('사용자 정보 조회 실패:', error);
                        throw error;
                    } finally {
                        this.loading = false;
                    }
                },

                async fetchMatches(ouid, refresh = false, matchtype = 50, limit = 50) {
                    this.loading = true;
                    this.error = null;

                    try {
                        console.log('매치 데이터 요청:', { ouid, refresh, matchtype, limit });
                        const response = await api.get(`/api/fc/matches/${ouid}`, {
                            params: {
                                refresh: refresh.toString(),
                                matchtype: matchtype.toString(),
                                limit: limit.toString()
                            }
                        });
                        console.log('매치 데이터 응답:', response.data);

                        if (response.data.success) {
                            // 매치 데이터를 한국 시간으로 변환하고 정렬 (UTC 그대로 유지, 표시만 변환)
                            const processedMatches = response.data.data.map(match => {
                                return {
                                    ...match,
                                    // matchDate는 UTC 그대로 유지하고, 표시용 필드 추가
                                    matchDateDisplay: formatKoreanTime(match.matchDate, 'datetime')
                                };
                            }).sort((a, b) => {
                                return new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime();
                            });

                            this.matches[ouid] = processedMatches;
                            return {
                                ...response.data,
                                data: processedMatches
                            };
                        } else {
                            throw new Error(response.data.error || '매치 데이터 조회 실패');
                        }
                    } catch (error) {
                        console.error('매치 데이터 조회 오류:', error);
                        this.error = error.message;
                        throw error;
                    } finally {
                        this.loading = false;
                    }
                },

                async fetchMatchDetail(matchId) {
                    this.loading = true;
                    this.error = null;

                    try {
                        const response = await apiInstance.get(`/api/fc/match-detail/${matchId}`);
                        if (response.data.success) {
                            return response.data.data;
                        }
                    } catch (error) {
                        this.error = error.message;
                        console.error('매치 상세 정보 조회 실패:', error);
                    } finally {
                        this.loading = false;
                    }
                },

                async fetchPlayerStats(ouid) {
                    try {
                        const response = await apiInstance.get(`/api/player-stats/${ouid}`);
                        if (response.data.success) {
                            return response.data.data;
                        }
                        throw new Error(response.data.error || '선수별 득점 통계 조회 실패');
                    } catch (error) {
                        console.error('선수별 득점 통계 조회 실패:', error);
                        throw error;
                    }
                }
            }
        });