import React from 'react';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import { Button, Icon } from '../../components/common';
import { getGoogleLoginUrl } from '../../services/authApi';
import { typography } from '../../styles/typography';

/** 로그인 화면에 안내 문구를 띄우는 사유 (라우터 state로 전달) */
type LoginNoticeReason = 'expired' | 'failed';

interface LoginLocationState {
  reason?: LoginNoticeReason;
}

const NOTICE_MESSAGES: Record<LoginNoticeReason, string> = {
  expired: '로그인 시간이 만료되었어요. 다시 로그인해 주세요.',
  failed: '로그인이 취소되었거나 인증에 실패했어요. 다시 시도해 주세요.',
};

const Page = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  max-width: ${({ theme }) => theme.breakpoints.mobile};
  margin: 0 auto;
  padding: 24px 16px calc(24px + env(safe-area-inset-bottom));
  background-color: ${({ theme }) => theme.colors.bg};
`;

const Brand = styled.p`
  ${typography.section}
  margin-top: 56px;
  color: ${({ theme }) => theme.colors.accentText};
`;

const Title = styled.h2`
  ${typography.display}
  margin-top: 12px;
  color: ${({ theme }) => theme.colors.text};
`;

const Description = styled.p`
  ${typography.body}
  margin-top: 16px;
  color: ${({ theme }) => theme.colors.text2};
`;

const Spacer = styled.div`
  flex: 1;
`;

const Notice = styled.div`
  ${typography.label}
  margin-bottom: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.accentTint};
  color: ${({ theme }) => theme.colors.accentText};
`;

/** Button은 너비 prop이 없어 감싸는 영역에서 전체 폭으로 늘린다 */
const FullWidth = styled.div`
  & > button {
    width: 100%;
  }
`;

const Footnote = styled.p`
  ${typography.caption}
  margin-top: 12px;
  text-align: center;
  color: ${({ theme }) => theme.colors.text4};
`;

/**
 * O-01. 주최자 로그인 화면
 * - 버튼을 누르면 API의 구글 로그인 주소로 페이지를 이동한다.
 * - 로그인이 끝나면 서버가 /oauth/callback 으로 돌려보낸다. (콜백 처리는 로그인 연결 단계)
 */
export const HostLoginPage: React.FC = () => {
  const { state } = useLocation();
  const reason = (state as LoginLocationState | null)?.reason;

  const handleGoogleLogin = () => {
    window.location.href = getGoogleLoginUrl();
  };

  return (
    <Page>
      <Brand>Moment Link</Brand>
      <Title>
        행사 사진,
        <br />
        다 같이 모아보세요
      </Title>
      <Description>
        QR 하나로 참가자 사진을 한곳에 모으고,
        <br />
        승인한 사진만 공유해요.
      </Description>

      <Spacer />

      {reason && <Notice role="alert">{NOTICE_MESSAGES[reason]}</Notice>}

      <FullWidth>
        <Button type="button" $variant="secondary" $size="large" onClick={handleGoogleLogin}>
          <Icon icon="GoogleLogo" weight="bold" $size={20} aria-hidden="true" />
          Google로 계속하기
        </Button>
      </FullWidth>
      <Footnote>로그인과 Drive 저장소 연결 동의는 별도로 진행돼요</Footnote>
    </Page>
  );
};
