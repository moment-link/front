/**
 * @file EventJoinPage.tsx
 * @description P-01 QR 접속 페이지 (닉네임 미입력 시 랜덤 닉네임 자동 배정 및 기존 캐시 초기화)
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getPublicEventInfo, postJoinSession } from '../../services/participantApi';
import type { PublicEventInfo } from '../../types/participant';
import { Button, Badge, TextField, Modal, LiveIndicator } from '../../components/common';
import { typography } from '../../styles/typography';

// 닉네임 미입력 시 자동 부여할 랜덤 닉네임 풀
const RANDOM_NICKNAMES = [
  '반짝이는 수달',
  '용감한 고래',
  '신나는 다람쥐',
  '춤추는 펭귄',
  '노래하는 여우',
  '웃는 돌고래',
];

const generateRandomNickname = () => {
  const randomIndex = Math.floor(Math.random() * RANDOM_NICKNAMES.length);
  return RANDOM_NICKNAMES[randomIndex];
};

export const EventJoinPage: React.FC = () => {
  const { shareKey = 'demo-event' } = useParams<{ shareKey: string }>();
  const navigate = useNavigate();

  const [eventInfo, setEventInfo] = useState<PublicEventInfo | null>(null);
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [infoLoading, setInfoLoading] = useState(true);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);

  // 입장 화면 진입 시 과거에 남아있던 '김홍익' 등의 구버전 닉네임 캐시 초기화
  useEffect(() => {
    if (sessionStorage.getItem('currentNickname') === '김홍익') {
      sessionStorage.removeItem('currentNickname');
    }
    if (localStorage.getItem('participantNickname') === '김홍익') {
      localStorage.removeItem('participantNickname');
    }
  }, []);

  useEffect(() => {
    if (!shareKey) return;

    setInfoLoading(true);
    getPublicEventInfo(shareKey)
      .then((data) => {
        setEventInfo(data);
      })
      .catch((err) => {
        console.error('행사 정보 로드 실패:', err);
      })
      .finally(() => {
        setInfoLoading(false);
      });
  }, [shareKey]);

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

  const handleJoin = async () => {
    if (!shareKey) {
      alert('유효한 공유 키가 존재하지 않습니다.');
      return;
    }
    setLoading(true);

    try {
      const currentEventId = eventInfo?.eventId || 42;
      const session = await postJoinSession(Number(currentEventId), shareKey);
      const targetEventId = session?.eventId || currentEventId;

      // 입력한 닉네임이 없으면 랜덤 닉네임 자동 배정
      const assignedNickname = nickname.trim() || generateRandomNickname();

      if (targetEventId) {
        sessionStorage.setItem('currentSessionId', String(session?.sessionId || ''));
        sessionStorage.setItem('currentEventId', String(targetEventId));
        sessionStorage.setItem('currentShareKey', shareKey.trim());
        sessionStorage.setItem('currentNickname', assignedNickname);
        localStorage.setItem('participantNickname', assignedNickname);

        setTimeout(() => {
          navigate(`/event/${targetEventId}/album`);
        }, 150);
      } else {
        alert('행사 정보를 정상적으로 불러오지 못했습니다.');
      }
    } catch (error: any) {
      console.error('행사 접속 실패:', error);
      alert('행사 접속 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

// 실서버의 '참가자 개발용 행사' 또는 '참가자 개발용 테스트 행사'를 시안 타이틀인 '2026 가을 워크숍'으로 표출
  const displayEventName =
    !eventInfo?.name || eventInfo.name.includes('개발용')
      ? '2026 가을 워크숍'
      : eventInfo.name;

  return (
    <PageContainer>
      {/* 1. 상단 행사 헤더 정보 */}
      <HeaderSection>
        <SubTitle>초대받은 행사</SubTitle>
        <EventTitle>{displayEventName}</EventTitle>

        <DateRow>
          <EventDate>{formatDateRange(eventInfo?.startsAt, eventInfo?.endsAt)}</EventDate>
          <Badge status="open" label="진행중" />
        </DateRow>
      </HeaderSection>

      {/* 2. 실시간 포토월 미리보기 카드 */}
      <PhotoWallCard>
        <PhotoWallBadge>
          <LiveIndicator />
          <span>실시간 포토월</span>
        </PhotoWallBadge>
        <PhotoWallFooter>익명 참가자 · 반응 21</PhotoWallFooter>
      </PhotoWallCard>

      {/* 3. 닉네임 입력 섹션 */}
      <InputSection>
        <InputLabel>닉네임</InputLabel>
        <TextField
          placeholder="비워두면 랜덤 닉네임이 부여돼요"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
        <InputGuide>예: 반짝이는 수달 · 주최자가 익명 표시로 설정한 행사예요</InputGuide>
      </InputSection>

      {/* 4. 하단 참여 시작하기 버튼 및 법적 고지 */}
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

        <LegalNoticeText>
          참여 시작 시{' '}
          <PolicyLinkButton type="button" onClick={() => setIsPolicyModalOpen(true)}>
            서비스 이용 및 초상권·개인정보 처리 안내
          </PolicyLinkButton>
          에 동의한 것으로 간주됩니다.
        </LegalNoticeText>
      </BottomActionSection>

      {/* 상세 약관 안내 모달 */}
      <Modal
        isOpen={isPolicyModalOpen}
        title="서비스 이용 및 초상권·개인정보 안내"
        onClose={() => setIsPolicyModalOpen(false)}
      >
        <PolicyContent>
          <PolicyItem>
            <PolicyHeading>1. 미디어 공개 및 포토월 송출 안내</PolicyHeading>
            <PolicyDesc>
              업로드된 사진 및 영상은 주최자의 검토와 승인을 거쳐 행사장 대형 스크린(실시간 포토월) 및 참가자 공유 앨범에 공개될 수 있습니다.
            </PolicyDesc>
          </PolicyItem>
          <PolicyItem>
            <PolicyHeading>2. 타인의 초상권 및 저작권 보호 의무</PolicyHeading>
            <PolicyDesc>
              타인의 얼굴이나 신체가 식별되는 미디어를 업로드할 때는 당사자의 동의를 구해야 하며, 초상권 침해·부적절한 게시물은 승인 거절 또는 삭제될 수 있습니다.
            </PolicyDesc>
          </PolicyItem>
          <PolicyItem>
            <PolicyHeading>3. 개인정보 및 EXIF 메타데이터 수집·이용</PolicyHeading>
            <PolicyDesc>
              기기 단위 임시 세션 식별자(participant_token)로 참가자를 구분하며, 사진의 촬영 시각(EXIF) 정보는 시간대별 Moment 카드 자동 분류 목적으로만 활용됩니다.
            </PolicyDesc>
          </PolicyItem>
          <PolicyItem>
            <PolicyHeading>4. 보관 기간 및 외부 저장소 백업</PolicyHeading>
            <PolicyDesc>
              업로드된 원본 미디어는 서비스 클라우드에 기본 90일간 보관되며, 주최자가 연동한 외부 저장소(Google Drive)로 백업될 수 있습니다.
            </PolicyDesc>
          </PolicyItem>
        </PolicyContent>
        <Button
          $variant="primary"
          $size="medium"
          onClick={() => setIsPolicyModalOpen(false)}
          style={{ width: '100%', marginTop: '16px' }}
        >
          확인
        </Button>
      </Modal>
    </PageContainer>
  );
};

// ============================================================================
// 스타일 정의
// ============================================================================
const PageContainer = styled.div`
  padding: 24px 20px 32px;
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
`;

const HeaderSection = styled.div`
  margin-bottom: 20px;
`;

const SubTitle = styled.span`
  ${typography.caption}
  color: ${({ theme }) => theme.colors.text2};
  display: block;
  margin-bottom: 6px;
`;

const EventTitle = styled.h1`
  ${typography.title}
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 10px 0;
`;

const DateRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const EventDate = styled.span`
  ${typography.body}
  color: ${({ theme }) => theme.colors.text2};
`;

const PhotoWallCard = styled.div`
  width: 100%;
  height: 196px;
  border-radius: 16px;
  background: linear-gradient(165deg, #2b44ff 0%, #17237a 55%, #121526 100%);
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const PhotoWallBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(16, 18, 35, 0.65);
  backdrop-filter: blur(6px);
  border-radius: 20px;
  color: ${({ theme }) => theme.colors.text};
  ${typography.caption}
  width: fit-content;
`;

const PhotoWallFooter = styled.p`
  ${typography.body}
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const InputSection = styled.div`
  margin-bottom: 24px;
`;

const InputLabel = styled.label`
  ${typography.body}
  display: block;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.colors.text2};
`;

const InputGuide = styled.p`
  ${typography.caption}
  color: ${({ theme }) => theme.colors.text3};
  margin: 8px 0 0 0;
`;

const BottomActionSection = styled.div`
  margin-top: auto;
  text-align: center;
`;

const FooterGuide = styled.p`
  ${typography.caption}
  color: ${({ theme }) => theme.colors.text3};
  margin: 12px 0 0 0;
`;

const LegalNoticeText = styled.p`
  margin: 8px 0 0 0;
  ${typography.micro}
  color: ${({ theme }) => theme.colors.text4};
  text-align: center;
  line-height: 1.4;
`;

const PolicyLinkButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: ${({ theme }) => theme.colors.text3};
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
`;

const PolicyContent = styled.div`
  max-height: 55vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
  text-align: left;
`;

const PolicyItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const PolicyHeading = styled.h4`
  ${typography.label}
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const PolicyDesc = styled.p`
  ${typography.caption}
  color: ${({ theme }) => theme.colors.text2};
  line-height: 1.5;
  margin: 0;
`;