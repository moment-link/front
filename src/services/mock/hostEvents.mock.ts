// 목업 행사 목록 - 서버 없이 필터·정렬·페이지를 확인하기 위한 가짜 API

import type { PageResult } from '../../types/common';
import type { HostEventQuery, HostEventSummary } from '../../types/hostEvent';

/** 서버 기본값(limit=20)과 같게 맞춘다. */
const PAGE_SIZE = 20;

const NAMES = [
  '졸업 축하 파티',
  '동아리 송년회',
  '신입생 환영회',
  '학과 체육대회',
  '가을 MT',
  '졸업작품 전시회',
  '팀 프로젝트 발표회',
  '동문 모임',
];

/** 23개: 앞 5개는 열림, 나머지는 종료. 4일 간격으로 과거로 거슬러 올라간다. */
const MOCK_EVENTS: HostEventSummary[] = Array.from({ length: 23 }, (_, i) => {
  const start = new Date(Date.UTC(2026, 10, 20 - i * 4, 9, 0)); // UTC 09:00 = KST 18:00
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
  return {
    id: i + 1,
    name: i < NAMES.length ? NAMES[i] : `${NAMES[i % NAMES.length]} ${Math.floor(i / NAMES.length) + 1}`,
    startsAt: start.toISOString(),
    endsAt: end.toISOString(),
    status: i < 5 ? 'OPEN' : 'CLOSED',
  };
});

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * 목업 목록 조회 - 실제 API와 같은 모양(PageResult)으로 답한다.
 * @param page 0부터 시작하는 페이지 번호
 */
export const fetchMockHostEvents = async (
  query: HostEventQuery,
  page: number,
): Promise<PageResult<HostEventSummary>> => {
  await wait(500); // 로딩 상태가 눈에 보이도록 일부러 지연

  const filtered = MOCK_EVENTS.filter((e) => query.status === 'ALL' || e.status === query.status);
  const sorted = [...filtered].sort((a, b) => {
    if (query.sort === 'NAME') return a.name.localeCompare(b.name, 'ko');
    const diff = new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
    return query.sort === 'OLDEST' ? diff : -diff;
  });

  const start = page * PAGE_SIZE;
  return {
    items: sorted.slice(start, start + PAGE_SIZE),
    nextPage: page + 1,
    hasNext: start + PAGE_SIZE < sorted.length,
  };
};