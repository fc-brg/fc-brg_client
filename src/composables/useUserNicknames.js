import { ref } from 'vue'
import axios from 'axios'

// API 인스턴스 생성
const api = axios.create({
    baseURL: window.location.hostname === 'localhost' ?
        'http://localhost:3000' : window.location.origin,
    headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
    },
    withCredentials: true
});

// Authorization 헤더 자동 추가
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

export function useUserNicknames() {
    const currentUser = ref(null);
    const userNicknames = ref([]);
    const loadingUserNicknames = ref(false);

    // 현재 사용자 정보 조회
    const loadCurrentUser = async() => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return null;

            const response = await api.get('/api/me');
            currentUser.value = response.data;
            console.log('현재 사용자 정보:', currentUser.value);
            return currentUser.value;
        } catch (error) {
            console.error('사용자 정보 조회 실패:', error);
            return null;
        }
    };

    // 사용자별 닉네임 목록 조회
    const loadUserNicknames = async() => {
        console.log('🔍 [디버깅] loadUserNicknames 시작');

        if (!currentUser.value) {
            console.log('🔍 [디버깅] currentUser가 없음 - loadCurrentUser 호출');
            await loadCurrentUser();
        }

        console.log('🔍 [디버깅] currentUser.value:', currentUser.value);

        if (!currentUser.value) {
            console.log('🔍 [디버깅] currentUser가 여전히 없음 - 빈 배열 반환');
            return [];
        }

        // /api/me에서 받은 nicknames를 직접 사용
        const nicknamesFromMe = currentUser.value.user ? .nicknames || [];
        console.log('🔍 [디버깅] /api/me에서 받은 nicknames:', nicknamesFromMe);

        // nicknames 배열을 클라이언트에서 사용하는 형식으로 변환
        const formattedNicknames = nicknamesFromMe.map(nick => ({
            userName: nick.nickname,
            ouid: nick.ouid,
            addedAt: nick.addedAt
        }));

        userNicknames.value = formattedNicknames;
        console.log('🔍 [디버깅] userNicknames.value 설정 완료:', userNicknames.value);

        return userNicknames.value;
    };

    // 사용자별 닉네임 추가
    const addUserNickname = async(nickname) => {
        if (!currentUser.value) {
            await loadCurrentUser();
        }

        if (!currentUser.value || !nickname) return null;

        try {
            const response = await api.post(`/api/users/${currentUser.value.user.id}/nicknames`, {
                nickname: nickname.trim()
            });

            if (response.data.success) {
                // 닉네임 목록 새로고침
                await loadUserNicknames();
                return response.data.data;
            }
        } catch (error) {
            console.error('닉네임 추가 실패:', error);
            throw error;
        }
        return null;
    };

    // 사용자별 닉네임 제거
    const removeUserNickname = async(nickname) => {
        if (!currentUser.value) {
            await loadCurrentUser();
        }

        if (!currentUser.value || !nickname) return false;

        try {
            const response = await api.delete(`/api/users/${currentUser.value.user.id}/nicknames/${nickname}`);

            if (response.data.success) {
                // 닉네임 목록 새로고침
                await loadUserNicknames();
                return true;
            }
        } catch (error) {
            console.error('닉네임 제거 실패:', error);
            throw error;
        }
        return false;
    };

    return {
        currentUser,
        userNicknames,
        loadingUserNicknames,
        loadCurrentUser,
        loadUserNicknames,
        addUserNickname,
        removeUserNickname
    };
}