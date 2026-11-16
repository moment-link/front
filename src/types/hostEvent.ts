// 주최자 행사 관련 타입 

/** 행사 상태: 열림 / 종료 */
export type HostEventStatus = 'OPEN' | 'CLOSED';

/** 목록 상태 필터: 전체 / 열림 / 종료. 'ALL'은 화면 전용 값이라 서버에는 보내지 않음 */
export type HostEventStatusFilter = 'ALL' | HostEventStatus;

/** 목록 정렬: 최신순 / 오래된순 / 이름순 */
export type HostEventSort = 'LATEST' | 'OLDEST' | 'NAME';

/**
 * 행사 목록 한 줄 (카드에 보이는 정보)
 * @property startsAt 행사 시작 시각 (ISO8601)
 * @property endsAt 행사 종료 예정 시각 (ISO8601)
 */
export interface HostEventSummary {
  id: number;
  name: string;
  startsAt: string;
  endsAt: string;
  status: HostEventStatus;
}

/** 목록 조회 조건 - 바뀌면 서버에서 첫 페이지부터 다시 가져옴 */
export interface HostEventQuery {
  status: HostEventStatusFilter;
  sort: HostEventSort;
}