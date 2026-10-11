import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { typography } from '../../styles/typography';
import { Button } from '../../components/common/Button';
import { TextField } from '../../components/common/TextField';
import { postJoinSession } from '../../services/participantApi';

export const EventJoinPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shareKey = searchParams.get('shareKey') || 'demo-event';

  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = async () => {
    try {
      setIsLoading(true);
      const session = await postJoinSession(shareKey, nickname);
      
      localStorage.setItem('participantSessionId', session.participantSessionId);
      localStorage.setItem('participantNickname', session.nickname);

      navigate(`/event/${shareKey}/album`);
    } catch (error) {
      alert('세션 발급에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Title>행사 참여하기</Title>
      <Description>별도 가입 없이 닉네임만 입력하고 사진을 함께 공유해 보세요.</Description>
      
      <FormGroup>
        <TextField
          id="participant-nickname"
          name="nickname"
          placeholder="닉네임 입력 (미입력 시 랜덤 부여)"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
        <Button onClick={handleJoin} disabled={isLoading} style={{ marginTop: '16px', width: '100%' }}>
          {isLoading ? '입장 중...' : '참여 시작하기'}
        </Button>
      </FormGroup>
    </Container>
  );
};

const Container = styled.div`
  padding: 24px;
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.bg};
`;

const Title = styled.h1`
  ${typography.title}
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 8px;
`;

const Description = styled.p`
  ${typography.body}
  color: ${({ theme }) => theme.colors.text2};
  margin-bottom: 32px;
`;

const FormGroup = styled.div`
  width: 100%;
`;