import React from 'react';
import styled from 'styled-components';
import { Badge } from '../common';
import type { HostEventSummary } from '../../types/hostEvent';
import { formatEventPeriod } from '../../utils/formatDate';
import { typography } from '../../styles/typography';

const Card = styled.button`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.surface};
  text-align: left;
  cursor: pointer;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const Name = styled.span`
  ${typography.section}
  color: ${({ theme }) => theme.colors.text};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Period = styled.span`
  ${typography.caption}
  color: ${({ theme }) => theme.colors.text2};
`;

/**
 * EventCard 컴포넌트 Props 인터페이스
 * @property event 카드에 보여줄 행사 요약
 * @property onClick 카드를 눌렀을 때 (행사 상세로 이동 등)
 */
export interface EventCardProps {
  event: HostEventSummary;
  onClick: (eventId: number) => void;
}

/**
 * 행사 목록 카드 - 행사명, 상태 배지, 일정
 * @example <EventCard event={event} onClick={(id) => navigate(HOST_ROUTES.eventDetail(id))} />
 */
export const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  const isOpen = event.status === 'OPEN';
  return (
    <Card type="button" onClick={() => onClick(event.id)}>
      <TopRow>
        <Name>{event.name}</Name>
        <Badge status={isOpen ? 'open' : 'closed'} label={isOpen ? '열림' : '종료'} />
      </TopRow>
      <Period>{formatEventPeriod(event.startsAt, event.endsAt)}</Period>
    </Card>
  );
};