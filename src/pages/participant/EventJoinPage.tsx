/**
 * @file EventJoinPage.tsx
 * @description 참가자 행사 입장 및 세션 발급 페이지 (Figma 디자인 및 컴포넌트 규격 완벽 반영)
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getPublicEventInfo, postJoinSession } from '../../services/participantApi';
import type { PublicEventInfo } from '../../types/participant';
import { Button, Badge, TextField } from '../../components/common';
import { typography } from '../../styles/typography';

export const EventJoinPage: React.FC = () => {
  const { shareKey } = useParams<{ shareKey: string }>();
  const navigate = useNavigate();

  const [eventInfo, setEventInfo] = useState<PublicEventInfo | null>(null);
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [infoLoading, setInfoLoading] = useState(true);

  // 1. 공유 키 기반 행사 기본 정보 로드
  useEffect(() => {
    if (!shareKey) return;

    setInfoLoading(true);
    getPublicEventInfo(shareKey)
      .then((data) => {
        console.log('[행사 정보 로드 성공]:', data);
        setEventInfo(data);
      })
      .catch((err) => {
        console.error('행사 정보 로드 실패:', err);
      })
      .finally(() => {
        setInfoLoading(false);
      });
  }, [shareKey]);

  // 날짜 포맷팅 함수 (MM.DD HH:mm ~ MM.DD HH:mm)
  const formatDateRange = (startsAt?: string, endsAt?: string) => {
    if (!startsAt || !endsAt) return '10.02 09:00 ~ 10.03 18:00';
    const start = new Date(startsAt);
    const end = new Date(endsAt);

    const formatStart = `${String(start.getMonth() + 1).padStart(2, '0')}.${String(
      start.getDate()
    ).padStart(2, '0')} ${String(start.getHours()).padStart(2, '0')}:${String(
      start.getMinutes()
    ).padStart(2, '0')}`;

    const formatEnd = `${String(end.getMonth() + 1).padStart(2, '0')}.${String(
      end.getDate()
    ).padStart(2, '0')} ${String(end.getHours()).padStart(2, '0')}:${String(
      end.getMinutes()
    ).padStart(2, '0')}`;

    return `${formatStart} ~ ${formatEnd}`;
  };

  // 2. 세션 발급 및 행사 입장 처리
  const handleJoin = async () => {
    if (!shareKey) {
      alert('유효한 공유 키가 존재하지 않습니다.');
      return;
    }
    setLoading(true);

    try {
      const currentEventId = eventInfo?.eventId || 45;
      const session = await postJoinSession(Number(currentEventId), shareKey);
      console.log('[세션 정보 수신]:', session);

      const targetEventId = session?.eventId || currentEventId;

      if (targetEventId) {
        sessionStorage.setItem('currentSessionId', String(session?.sessionId || ''));
        sessionStorage.setItem('currentEventId', String(targetEventId));
        sessionStorage.setItem('currentShareKey', shareKey.trim());
        if (nickname.trim()) {
          sessionStorage.setItem('currentNickname', nickname.trim());
        }

        console.log(`[페이지 이동 준비]: /event/${targetEventId}/album`);

        setTimeout(() => {
          navigate(`/event/${targetEventId}/album`);
        }, 150);
      } else {
        alert('행사 정보를 정상적으로 불러오지 못했습니다.');
      }
    } catch (error: any) {
      console.error('행사 접속 실패:', error);
      if (error.response?.status === 403) {
        alert('해당 행사는 현재 공개 접근이 차단되어 있거나 유효하지 않은 공유 키입니다.');
      } else {
        alert('행사 접속 중 오류가 발생했습니다. 다시 시도해 주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      {/* 1. 상단 행사 헤더 정보 */}
      <HeaderSection>
        <SubTitle>초대받은 행사</SubTitle>
        <EventTitle>{eventInfo?.name || '2026 가을 워크숍'}</EventTitle>

        {/* 행사 기간 + 우측 진행중 뱃지 (기존 Badge 규격 status, label 적용) */}
        <DateRow>
          <EventDate>{formatDateRange(eventInfo?.startsAt, eventInfo?.endsAt)}</EventDate>
          <Badge status="open" label="진행중" />
        </DateRow>
      </HeaderSection>

      {/* 2. 실시간 포토월 미리보기 카드 */}
      <PhotoWallCard>
        <PhotoWallBadge>
          <LiveDot /> 실시간 포토월
        </PhotoWallBadge>
        <PhotoWallFooter>익명 참가자 · 반응 21</PhotoWallFooter>
      </PhotoWallCard>

      {/* 3. 닉네임 입력 세션 */}
      <InputSection>
        <InputLabel>닉네임</InputLabel>
        <TextField
          placeholder="비워두면 랜덤 닉네임이 부여돼요"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
        <InputGuide>예: 반짝이는 수달 · 주최자가 익명 표시로 설정한 행사예요</InputGuide>
      </InputSection>

      {/* 4. 하단 참여 시작하기 버튼 영역 */}
      <BottomActionSection>
        <Button
          $variant="primary"
          $size="large"
          disabled={loading || infoLoading}
          onClick={handleJoin}
          style={{ width: '100%' }}
        >
          {loading ? '접속 처리 중...' : '참여 시작하기'}
        </Button>
        <FooterGuide>회원가입·앱 설치 없이 바로 사진을 올릴 수 있어요</FooterGuide>
      </BottomActionSection>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  padding: 24px 20px;
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.bg || '#0f172a'};
  color: ${({ theme }) => theme.colors.text || '#ffffff'};
`;

const HeaderSection = styled.div`
  margin-bottom: 24px;
`;

const SubTitle = styled.span`
  ${typography.caption}
  color: ${({ theme }) => theme.colors.text2 || '#94a3b8'};
  display: block;
  margin-bottom: 6px;
`;

const EventTitle = styled.h1`
  ${typography.title || typography.page}
  font-size: 26px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text || '#ffffff'};
  margin-bottom: 8px;
`;

const DateRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const EventDate = styled.span`
  ${typography.body}
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text2 || '#94a3b8'};
`;

const PhotoWallCard = styled.div`
  width: 100%;
  height: 220px;
  border-radius: 16px;
  background: linear-gradient(135deg, #1e40af 0%, #1e1b4b 100%);
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: 32px;
`;

const PhotoWallBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  border-radius: 20px;
  color: #ffffff;
  font-size: 12px;
  width: fit-content;
`;

const LiveDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #60a5fa;
`;

const PhotoWallFooter = styled.p`
  ${typography.caption}
  color: rgba(255, 255, 255, 0.8);
`;

const InputSection = styled.div`
  margin-bottom: auto;
`;

const InputLabel = styled.label`
  ${typography.body}
  font-weight: 600;
  display: block;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.colors.text || '#ffffff'};
`;

const InputGuide = styled.p`
  ${typography.caption}
  color: ${({ theme }) => theme.colors.text2 || '#94a3b8'};
  margin-top: 8px;
`;

const BottomActionSection = styled.div`
  margin-top: 32px;
  padding-bottom: 16px;
  text-align: center;
`;

const FooterGuide = styled.p`
  ${typography.caption}
  color: ${({ theme }) => theme.colors.text2 || '#94a3b8'};
  margin-top: 12px;
`;