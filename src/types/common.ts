/**
 * 모든 API 응답을 감싸는 공통 봉투
 * @property data 실제 응답 본문
 */
export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  timestamp: string;
  data: T;
}

/**
 * 페이지 번호 방식 목록 응답 (page는 0부터 시작)
 * @property items 이번 페이지 항목
 * @property nextPage 다음 페이지 번호
 * @property hasNext 다음 페이지가 있는지
 */
export interface PageResult<T> {
  items: T[];
  nextPage: number;
  hasNext: boolean;
}