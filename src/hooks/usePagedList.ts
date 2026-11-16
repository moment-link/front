// 페이지 번호 방식 목록 훅 - 첫 페이지 로딩, 더 불러오기, 조건 변경 시 처음부터 다시, 재시도

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PageResult } from '../types/common';

/**
 * @property isLoading 첫 페이지를 불러오는 중
 * @property isLoadingMore 다음 페이지를 불러오는 중
 * @property error 마지막 요청의 오류 (없으면 null)
 * @property hasMore 더 불러올 페이지가 있는지
 * @property loadMore 다음 페이지 요청 (중복·오류 상태면 무시)
 * @property retry 실패한 요청을 다시 시도
 */
export interface ListResult<T> {
  items: T[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
  retry: () => void;
}

const toError = (e: unknown): Error => (e instanceof Error ? e : new Error('요청에 실패했어요.'));

/**
 * @param fetchPage 한 페이지를 가져오는 함수 (모듈 레벨 함수처럼 매 렌더 같은 참조여야함)
 * @param params 조회 조건. 값이 바뀌면 목록을 비우고 첫 페이지부터 다시 가져온다.
 */
export const usePagedList = <T, P>(
  fetchPage: (params: P, page: number) => Promise<PageResult<T>>,
  params: P,
): ListResult<T> => {
  // 객체 참조가 매번 달라도 내용이 같으면 다시 가져오지 않도록 문자열 키로 비교
  const paramsKey = JSON.stringify(params);

  const [items, setItems] = useState<T[]>([]);
  /** 다음에 요청할 페이지 번호. 더 없으면 null */
  const [nextPage, setNextPage] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /** 조건이 바뀔 때마다 +1. 응답이 돌아왔을 때 번호가 다르면 버림 (마지막 요청 우선) */
  const generationRef = useRef(0);
  /** 다음 페이지 요청이 날아가는 중인지 - state는 다음 렌더에야 반영되므로 동시 호출 방지용 */
  const loadingMoreRef = useRef(false);

  // 조건이 바뀐 "그 렌더"에서 바로 목록을 비운다.
  const [loadedKey, setLoadedKey] = useState(paramsKey);
  if (loadedKey !== paramsKey) {
    setLoadedKey(paramsKey);
    setItems([]);
    setNextPage(null);
    setError(null);
    setIsLoading(true);
    setIsLoadingMore(false);
  }

  /** "다시 시도"로 첫 페이지를 처음부터 다시 받고 싶을 때 +1 */
  const [reloadToken, setReloadToken] = useState(0);

  // 처음 열릴 때, 조건이 바뀔 때, 다시 시도할 때 첫 페이지(0)를 가져온다.
  useEffect(() => {
    const generation = ++generationRef.current;
    loadingMoreRef.current = false;

    const loadFirst = async () => {
      try {
        const result = await fetchPage(JSON.parse(paramsKey) as P, 0);
        if (generation !== generationRef.current) return;
        setItems(result.items);
        setNextPage(result.hasNext ? result.nextPage : null);
      } catch (e) {
        if (generation !== generationRef.current) return;
        setError(toError(e));
      } finally {
        if (generation === generationRef.current) setIsLoading(false);
      }
    };
    void loadFirst();

    // 조건이 바뀌거나 화면이 사라지면 진행 중이던 요청의 결과를 버림
    return () => {
      generationRef.current += 1;
    };
  }, [fetchPage, paramsKey, reloadToken]);

  const fetchMore = useCallback(async () => {
    if (nextPage === null || loadingMoreRef.current) return;
    const generation = generationRef.current;
    loadingMoreRef.current = true;
    setIsLoadingMore(true);
    setError(null);

    try {
      const result = await fetchPage(JSON.parse(paramsKey) as P, nextPage);
      if (generation !== generationRef.current) return;
      setItems((prev) => [...prev, ...result.items]);
      setNextPage(result.hasNext ? result.nextPage : null);
    } catch (e) {
      if (generation !== generationRef.current) return;
      setError(toError(e));
    } finally {
      if (generation === generationRef.current) {
        loadingMoreRef.current = false;
        setIsLoadingMore(false);
      }
    }
  }, [fetchPage, paramsKey, nextPage]);

  // 오류가 난 상태에서는 자동으로 더 불러오지 않음
  const loadMore = useCallback(() => {
    if (error) return;
    void fetchMore();
  }, [error, fetchMore]);

  const retry = useCallback(() => {
    if (items.length === 0) {
      setError(null);
      setIsLoading(true);
      setReloadToken((t) => t + 1);
    } else {
      void fetchMore();
    }
  }, [items.length, fetchMore]);

  return {
    items,
    isLoading,
    isLoadingMore,
    error,
    hasMore: nextPage !== null,
    loadMore,
    retry,
  };
};