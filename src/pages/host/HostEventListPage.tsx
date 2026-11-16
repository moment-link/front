import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  EmptyState,
  Icon,
  IconButton,
  SegmentedTab,
  Skeleton,
} from '../../components/common';
import { EventCard } from '../../components/host/EventCard';
import { HostLayout } from '../../components/host/HostLayout';
import { useAuth } from '../../hooks/useAuth';
import { useHostEvents } from '../../hooks/useHostEvents';
import type { HostEventSort, HostEventStatusFilter } from '../../types/hostEvent';
import { HOST_ROUTES } from '../../utils/hostRoutes';
import { typography } from '../../styles/typography';

const STATUS_TABS: { key: HostEventStatusFilter; label: string }[] = [
  { key: 'ALL', label: '전체' },
  { key: 'OPEN', label: '열림' },
  { key: 'CLOSED', label: '종료' },
];

const SORT_OPTIONS: { value: HostEventSort; label: string }[] = [
  { value: 'LATEST', label: '최신순' },
  { value: 'OLDEST', label: '오래된순' },
  { value: 'NAME', label: '이름순' },
];

const Toolbar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

const SortRow = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const SortSelect = styled.select`
  ${typography.label}
  padding: 6px 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text2};
`;

const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 12px;
  list-style: none;
`;

/** 안내 문구 아래에 버튼을 가운데로 놓는 영역 */
const ActionArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 0;
`;

const NoticeText = styled.p`
  ${typography.caption}
  color: ${({ theme }) => theme.colors.text3};
`;

/** Button은 너비 prop이 없어 감싸는 영역에서 전체 폭으로 늘린다 */
const MoreArea = styled.div`
  padding: 16px 0;

  & > button {
    width: 100%;
  }
`;

/**
 * 내 행사 목록 화면
 * - 상태 필터(전체/열림/종료), 정렬(최신순/오래된순/이름순)은 서버가 처리
 *   바뀌면 목록을 비우고 첫 페이지부터 다시 가져옴
 * - 다음 페이지는 "더 보기" 버튼으로 이어 붙인다. (무한 스크롤은 이후 단계)
 */
export const HostEventListPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [status, setStatus] = useState<HostEventStatusFilter>('ALL');
  const [sort, setSort] = useState<HostEventSort>('LATEST');

  const { items, isLoading, isLoadingMore, error, hasMore, loadMore, retry } = useHostEvents(
    status,
    sort,
  );

  const showFirstError = !isLoading && error && items.length === 0;
  const showEmpty = !isLoading && !error && items.length === 0;

  return (
    <HostLayout
      title="내 행사"
      rightAction={
        <IconButton onClick={() => void logout()} aria-label="로그아웃">
          <Icon icon="SignOut" />
        </IconButton>
      }
      footer={
        <Button type="button" $size="large" onClick={() => navigate(HOST_ROUTES.eventCreate)}>
          + 새 행사 생성
        </Button>
      }
    >
      <Toolbar>
        <SegmentedTab
          options={STATUS_TABS}
          activeKey={status}
          onChange={(key) => setStatus(key as HostEventStatusFilter)}
        />
        <SortRow>
          <SortSelect
            aria-label="정렬"
            value={sort}
            onChange={(e) => setSort(e.target.value as HostEventSort)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </SortSelect>
        </SortRow>
      </Toolbar>

      {isLoading && (
        <List aria-busy="true" aria-label="행사 불러오는 중">
          {[0, 1, 2].map((i) => (
            <li key={i}>
              <Skeleton $height="84px" $radius="12px" />
            </li>
          ))}
        </List>
      )}

      {showFirstError && (
        <div role="alert">
          <EmptyState message="행사를 불러오지 못했어요" iconName="WarningCircle" />
          <ActionArea>
            <Button type="button" $variant="secondary" onClick={retry}>
              다시 시도
            </Button>
          </ActionArea>
        </div>
      )}

      {showEmpty && (
        <EmptyState
          message={status === 'ALL' ? '아직 만든 행사가 없어요' : '조건에 맞는 행사가 없어요'}
          iconName="CalendarBlank"
        />
      )}

      {items.length > 0 && (
        <List>
          {items.map((event) => (
            <li key={event.id}>
              <EventCard event={event} onClick={(id) => navigate(HOST_ROUTES.eventDetail(id))} />
            </li>
          ))}
        </List>
      )}

      {items.length > 0 && error && (
        <ActionArea role="alert">
          <NoticeText>더 불러오지 못했어요.</NoticeText>
          <Button type="button" $variant="secondary" onClick={retry}>
            다시 시도
          </Button>
        </ActionArea>
      )}

      {items.length > 0 && hasMore && !error && (
        <MoreArea>
          <Button type="button" $variant="secondary" onClick={loadMore} disabled={isLoadingMore}>
            {isLoadingMore ? '불러오는 중…' : '더 보기'}
          </Button>
        </MoreArea>
      )}
    </HostLayout>
  );
};