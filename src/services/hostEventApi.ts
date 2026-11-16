// 주최자 행사 API

import type { ApiResponse, PageResult } from '../types/common';
import type { HostEventQuery, HostEventSummary } from '../types/hostEvent';
import { USE_MOCK } from './config';
import { hostClient } from './hostClient';
import { fetchMockHostEvents } from './mock/hostEvents.mock';

/**
 * 내 행사 목록 한 페이지 조회
 * @param query 상태 필터&정렬 (서버가 처리)
 * @param page 0부터 시작하는 페이지 번호
 */
export const fetchHostEvents = async (
  query: HostEventQuery,
  page: number,
): Promise<PageResult<HostEventSummary>> => {
  if (USE_MOCK) return fetchMockHostEvents(query, page);

  const res = await hostClient.get<ApiResponse<PageResult<HostEventSummary>>>('/api/v1/events', {
    params: {
      status: query.status === 'ALL' ? undefined : query.status, // 전체면 status를 아예 보내지 않는다.
      sort: query.sort,
      page,
    },
  });
  return res.data.data;
};