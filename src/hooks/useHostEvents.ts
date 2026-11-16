import { fetchHostEvents } from '../services/hostEventApi';
import type {
  HostEventSort,
  HostEventStatusFilter,
  HostEventQuery,
  HostEventSummary,
} from '../types/hostEvent';
import { usePagedList, type ListResult } from './usePagedList';

/**
 * 내 행사 목록 훅 - 필터&정렬이 바뀌면 서버에서 첫 페이지부터 다시 가져옴
 * @example const { items, isLoading, hasMore, loadMore } = useHostEvents('ALL', 'LATEST');
 */
export const useHostEvents = (
  status: HostEventStatusFilter,
  sort: HostEventSort,
): ListResult<HostEventSummary> => {
  const query: HostEventQuery = { status, sort };
  return usePagedList<HostEventSummary, HostEventQuery>(fetchHostEvents, query);
};