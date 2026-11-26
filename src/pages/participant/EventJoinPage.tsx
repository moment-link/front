/**
 * @file EventJoinPage.tsx
 * @description P-01 QR 접속 및 참가자 세션 발급·닉네임 서버 동기화(PATCH /me) 페이지
 * @note
 * - 새 행사(shareKey) 진입 시 이전 행사에서 사용하던 상태 및 로컬/세션 스토리지 캐시(세션, 닉네임, 행사명)를 전면 초기화합니다.
 * - GET /api/v1/events/access 로 조회한 실제 행사명을 표시하고 sessionStorage에 저장해 공유 앨범과 동기화합니다.
 * - 세션 발급(POST /session) 직후 입력된 닉네임(또는 랜덤 배정 닉네임)을 서버(PATCH /me)에 동기화합니다.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  getPublicEventInfo,
  postJoinSession,
  updateParticipantNickname,
} from '../../services/participantApi';
import type { PublicEventInfo } from '../../types/participant';
import { Button, Badge, TextField, Modal, LiveIndicator } from '../../components/common';
import { typography } from '../../styles/typography';

// 닉네임 미입력 시 자동 부여할 랜덤 닉네임 풀 (백엔드 2~20자 규칙 준수)
const RANDOM_NICKNAMES = [
  '반짝이는 수달',
  '용감한 고래',
  '신나는 다람쥐',
  '춤추는 펭귄',
  '노래하는 여우',
  '웃는 돌고래',
];

const generateRandomNickname = (withSuffix = false) => {
  const randomIndex = Math.floor(Math.random() * RANDOM_NICKNAMES.length);
  const base = RANDOM_NICKNAMES[randomIndex];
  if (!withSuffix) return base;
  const suffix = Math.floor(100 + Math.random() * 900);
  return `${base} ${suffix}`;
};

export const EventJoinPage: React.FC = () => {
  const { shareKey = 'demo-event' } = useParams<{ shareKey: string }>();
  const navigate = useNavigate();

  const [eventInfo, setEventInfo] = useState<PublicEventInfo | null>(null);
  const [nickname, setNickname] = useState('');
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [infoLoading, setInfoLoading] = useState(true);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);

  // ==========================================================================
  // 1. 새 행사 진입 시 이전 행사의 상태 및 세션·닉네임·행사명 캐시 전면 리셋
  // ==========================================================================
  useEffect(() => {
    const cleanKey = shareKey.trim();
    const prevKey = sessionStorage.getItem('currentShareKey');

    // 다른 행사 링크로 진입했거나 구버전('김홍익') 캐시가 남아있는 경우 모두 초기화
    if (
      prevKey !== cleanKey ||
      sessionStorage.getItem('currentNickname') === '김홍익' ||
      localStorage.getItem('participantNickname') === '김홍익'
    ) {
      sessionStorage.removeItem('currentSessionId');
      sessionStorage.removeItem('currentEventId');
      sessionStorage.removeItem('currentEventName');
      sessionStorage.removeItem('currentNickname');
      localStorage.removeItem('participantNickname');
    }

    sessionStorage.setItem('currentShareKey', cleanKey);
    setEventInfo(null);
    setNickname('');
    setNicknameError(null);
  }, [shareKey]);

  // ==========================================================================
  // 2. 공유 키(shareKey) 기반 공개 행사 기본 정보 조회
  // ==========================================================================
  useEffect(() => {
    if (!shareKey) return;

    let isMounted = true;
    setInfoLoading(true);
    getPublicEventInfo(shareKey)
      .then((data) => {
        if (!isMounted) return;
        setEventInfo(data);
        if (data?.eventId) {
          sessionStorage.setItem('currentEventId', String(data.eventId));
        }
        if (data?.name) {
          sessionStorage.setItem('currentEventName', data.name);
        }
      })
      .catch((err) => {
        console.error('행사 정보 로드 실패:', err);
      })
      .finally(() => {
        if (isMounted) setInfoLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [shareKey]);

  const formatDateRange = (startsAt?: string, endsAt?: string) => {
    if (!startsAt || !endsAt) return '행사 일정 확인 중';
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

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
    if (nicknameError) setNicknameError(null);
  };

  const displayEventName =
    eventInfo?.name || (infoLoading ? '행사 정보 불러오는 중...' : '초대받은 행사');

  // ==========================================================================
  // 3. 참가자 세션 발급 및 서버 닉네임 동기화(PATCH /me)
  // ==========================================================================
  const handleJoin = async () => {
    if (!shareKey) {
      alert('유효한 공유 키가 존재하지 않습니다.');
      return;
    }

    const trimmedInput = nickname.trim();
    const isCustomInput = trimmedInput.length > 0;

    // 백엔드 PATCH /me 정책: 앞뒤 공백 제거 후 2~20자
    if (isCustomInput && (trimmedInput.length < 2 || trimmedInput.length > 20)) {
      setNicknameError('닉네임은 앞뒤 공백을 제외하고 2~20자로 입력해 주세요.');
      return;
    }

    setLoading(true);
    setNicknameError(null);

    try {
      const currentEventId = eventInfo?.eventId || 42;
      const session = await postJoinSession(Number(currentEventId), shareKey);
      const targetEventId = Number(session?.eventId || currentEventId);

      if (!targetEventId) {
        alert('행사 정보를 정상적으로 불러오지 못했습니다.');
        return;
      }

      // 입력한 닉네임이 없으면 랜덤 닉네임 배정 후 서버(PATCH /me)에 동기화
      let assignedNickname = isCustomInput ? trimmedInput : generateRandomNickname(false);

      try {
        const updated = await updateParticipantNickname(targetEventId, assignedNickname);
        assignedNickname = updated.displayName || assignedNickname;
      } catch (patchError: any) {
        const status = patchError?.response?.status;
        const serverMsg = patchError?.response?.data?.message;

        if (!isCustomInput && (status === 409 || status === 400)) {
          // 랜덤 닉네임이 중복된 경우 숫자 접미사를 붙여 1회 재시도
          const fallbackRandom = generateRandomNickname(true);
          try {
            const retryUpdated = await updateParticipantNickname(targetEventId, fallbackRandom);
            assignedNickname = retryUpdated.displayName || fallbackRandom;
          } catch (retryErr) {
            console.warn('[EventJoinPage] 랜덤 닉네임 재시도 실패:', retryErr);
          }
        } else if (isCustomInput && status === 409) {
          // 동일 행사 내 닉네임 중복(409 Conflict) 안내 후 중단
          setNicknameError(
            serverMsg || '현재 행사에서 이미 사용 중인 닉네임이에요. 다른 닉네임을 입력해 주세요.'
          );
          return;
        } else if (isCustomInput && status === 400) {
          // 입력 형식 또는 행사 상태 오류(400 Bad Request) 안내 후 중단
          setNicknameError(
            serverMsg || '닉네임 형식이 올바르지 않거나 변경할 수 없는 상태입니다.'
          );
          return;
        } else {
          console.warn('[EventJoinPage] 서버 닉네임 반영 중 경고:', patchError);
        }
      }

      // 확정된 새 행사의 세션, 행사명, 닉네임 저장 후 공유 앨범 페이지로 이동
      const resolvedEventName = eventInfo?.name || '공유 앨범';
      sessionStorage.setItem('currentSessionId', String(session?.sessionId || ''));
      sessionStorage.setItem('currentEventId', String(targetEventId));
      sessionStorage.setItem('currentEventName', resolvedEventName);
      sessionStorage.setItem('currentShareKey', shareKey.trim());
      sessionStorage.setItem('currentNickname', assignedNickname);
      localStorage.setItem('participantNickname', assignedNickname);

      setTimeout(() => {
        navigate(`/event/${targetEventId}/album`);
      }, 150);
    } catch (error: any) {
      console.error('행사 접속 실패:', error);
      alert('행사 접속 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      {/* 1. 상단 행사 헤더 정보 (실서버 조회 행사명 표출) */}
      <HeaderSection>
        <SubTitle>초대받은 행사</SubTitle>
        <EventTitle>{displayEventName}</EventTitle>

        <DateRow>
          <EventDate>{formatDateRange(eventInfo?.startsAt, eventInfo?.endsAt)}</EventDate>
          <Badge status="open" label="진행중" />
        </DateRow>
      </HeaderSection>

      {/* 2. 실시간 포토월 미리보기 카드 (더미 메타 텍스트 제거) */}
      <PhotoWallCard>
        <PhotoWallBadge>
          <LiveIndicator />
          <span>실시간 포토월</span>
        </PhotoWallBadge>
      </PhotoWallCard>

      {/* 3. 닉네임 입력 섹션 (placeholder 비움) */}
      <InputSection>
        <InputLabel>닉네임</InputLabel>
        <TextField
          placeholder=""
          value={nickname}
          onChange={handleNicknameChange}
          maxLength={20}
        />
        {nicknameError ? (
          <ErrorGuide>{nicknameError}</ErrorGuide>
        ) : (
          <InputGuide>비워두면 랜덤 닉네임이 자동 배정돼요 · 2~20자 입력 가능</InputGuide>
        )}
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
              업로드된 사진 및 영상은 주최자의 검토와 승인을 거쳐 행사장 대형 스크린(실시간
              포토월) 및 참가자 공유 앨범에 공개될 수 있습니다.
            </PolicyDesc>
          </PolicyItem>
          <PolicyItem>
            <PolicyHeading>2. 타인의 초상권 및 저작권 보호 의무</PolicyHeading>
            <PolicyDesc>
              타인의 얼굴이나 신체가 식별되는 미디어를 업로드할 때는 당사자의 동의를 구해야 하며,
              초상권 침해·부적절한 게시물은 승인 거절 또는 삭제될 수 있습니다.
            </PolicyDesc>
          </PolicyItem>
          <PolicyItem>
            <PolicyHeading>3. 개인정보 및 EXIF 메타데이터 수집·이용</PolicyHeading>
            <PolicyDesc>
              기기 단위 임시 세션 식별자(participant_token)로 참가자를 구분하며, 사진의 촬영
              시각(EXIF) 정보는 시간대별 Moment 카드 자동 분류 목적으로만 활용됩니다.
            </PolicyDesc>
          </PolicyItem>
          <PolicyItem>
            <PolicyHeading>4. 보관 기간 및 외부 저장소 백업</PolicyHeading>
            <PolicyDesc>
              업로드된 원본 미디어는 서비스 클라우드에 기본 90일간 보관되며, 주최자가 연동한 외부
              저장소(Google Drive)로 백업될 수 있습니다.
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
  justify-content: flex-start;
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

const ErrorGuide = styled.p`
  ${typography.caption}
  color: #f87171;
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