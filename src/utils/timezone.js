/**
 * 시간대 처리 유틸리티
 * 모든 시간 데이터는 UTC로 저장하고, 표시할 때만 한국시간으로 변환
 */

/**
 * UTC 시간을 한국시간으로 변환하여 표시용 문자열 반환
 * @param {string|Date} utcDate - UTC 시간 (ISO 문자열 또는 Date 객체)
 * @param {string} format - 표시 형식 ('date', 'time', 'datetime', 'relative')
 * @returns {string} 한국시간으로 변환된 문자열
 */
export function formatKoreanTime(utcDate, format = 'datetime') {
    if (!utcDate) return '-';

    try {
        const date = new Date(utcDate);

        if (isNaN(date.getTime())) {
            console.warn('유효하지 않은 날짜:', utcDate);
            return '-';
        }

        // UTC 시간을 한국시간으로 변환 (timeZone 옵션만 사용)
        switch (format) {
            case 'date':
                return date.toLocaleDateString('ko-KR', {
                    timeZone: 'Asia/Seoul',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                });

            case 'time':
                return date.toLocaleTimeString('ko-KR', {
                    timeZone: 'Asia/Seoul',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });

            case 'datetime':
                return date.toLocaleString('ko-KR', {
                    timeZone: 'Asia/Seoul',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });

            case 'relative':
                return getRelativeTime(date);

            default:
                return date.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
        }
    } catch (error) {
        console.error('시간 변환 오류:', error);
        return '-';
    }
}

/**
 * 상대적 시간 표시 (예: "3분 전", "1시간 전")
 * @param {Date} date - 비교할 날짜 (UTC)
 * @returns {string} 상대적 시간 문자열
 */
function getRelativeTime(date) {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return '방금 전';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;

    return date.toLocaleDateString('ko-KR', {
        timeZone: 'Asia/Seoul',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * 현재 시간을 UTC로 반환
 * @returns {string} UTC ISO 문자열
 */
export function getCurrentUTC() {
    return new Date().toISOString();
}

/**
 * 한국시간을 UTC로 변환
 * @param {string|Date} koreanDate - 한국시간
 * @returns {string} UTC ISO 문자열
 */
export function convertKoreanToUTC(koreanDate) {
    if (!koreanDate) return null;

    try {
        const date = new Date(koreanDate);

        if (isNaN(date.getTime())) {
            console.warn('유효하지 않은 한국시간:', koreanDate);
            return null;
        }

        // 한국시간을 UTC로 변환 (UTC-9)
        const utcDate = new Date(date.getTime() - (9 * 60 * 60 * 1000));
        return utcDate.toISOString();
    } catch (error) {
        console.error('UTC 변환 오류:', error);
        return null;
    }
}

/**
 * 날짜 범위를 UTC로 변환
 * @param {string|Date} startDate - 시작 날짜
 * @param {string|Date} endDate - 종료 날짜
 * @returns {Object} UTC로 변환된 날짜 범위
 */
export function convertDateRangeToUTC(startDate, endDate) {
    return {
        startDate: convertKoreanToUTC(startDate),
        endDate: convertKoreanToUTC(endDate)
    };
}

/**
 * 매치 데이터의 시간을 한국시간으로 변환
 * @param {Array} matches - 매치 데이터 배열
 * @returns {Array} 한국시간으로 변환된 매치 데이터
 */
export function convertMatchesToKoreanTime(matches) {
    if (!Array.isArray(matches)) return matches;

    return matches.map(match => ({
        ...match,
        matchDate: match.matchDate ? formatKoreanTime(match.matchDate, 'datetime') : '-',
        // 다른 시간 필드들도 필요시 추가
    }));
}

/**
 * 시간대 정보가 포함된 날짜인지 확인
 * @param {string} dateString - 확인할 날짜 문자열
 * @returns {boolean} 시간대 정보 포함 여부
 */
export function hasTimezoneInfo(dateString) {
    if (!dateString) return false;

    const str = dateString.toString();
    return str.includes('Z') ||
        str.includes('GMT') ||
        str.includes('UTC') ||
        str.includes('KST') ||
        str.includes('+') ||
        str.includes('-');
}

/**
 * UTC 변환 디버깅 함수
 * @param {string|Date} utcDate - UTC 시간
 * @returns {Object} 디버깅 정보
 */
export function debugUTCTime(utcDate) {
    if (!utcDate) return { error: '날짜가 없습니다.' };

    try {
        const date = new Date(utcDate);

        if (isNaN(date.getTime())) {
            return { error: '유효하지 않은 날짜입니다.' };
        }

        const koreanTime = date.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
        const utcTime = date.toISOString();

        return {
            original: utcDate,
            utcISO: utcTime,
            koreanTime: koreanTime,
            timestamp: date.getTime(),
            isValid: true
        };
    } catch (error) {
        return { error: error.message };
    }
}