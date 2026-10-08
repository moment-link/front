import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { typography } from '../../styles/typography';
import { AppBar, Button, Icon, ProgressBar } from '../../components/common';
import { CameraView } from '../../components/participant/CameraView';
import { useCamera } from '../../hooks/useCamera';
import { useS3Upload } from '../../hooks/useS3Upload';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.bg};
`;

const Content = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
`;

const QueueGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`;

const ThumbCard = styled.div`
  aspect-ratio: 1;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.surface};
  position: relative;
  overflow: hidden;
  padding: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const RemoveBtn = styled.button`
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 5;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgba(21, 23, 38, 0.8);
  border: none;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TimeLabel = styled.span`
  position: relative;
  z-index: 5;
  ${typography.micro}
  color: ${({ theme }) => theme.colors.text};
  background-color: rgba(0, 0, 0, 0.5);
  padding: 2px 4px;
  border-radius: 4px;
  align-self: flex-start;
`;

const AddCard = styled.label`
  aspect-ratio: 1;
  border-radius: 12px;
  border: 2px dashed ${({ theme }) => theme.colors.text3};
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: ${({ theme }) => theme.colors.text2};
  ${typography.caption}
  cursor: pointer;

  input {
    display: none;
  }
`;

const InfoBox = styled.div`
  padding: 16px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.surface};
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const InfoText = styled.p`
  ${typography.body}
  color: ${({ theme }) => theme.colors.text2};
  line-height: 1.4;
`;

const BottomNotice = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  ${typography.caption}
  color: ${({ theme }) => theme.colors.text3};
  margin-top: auto;
`;

const CTAWrapper = styled.div`
  padding: 16px;
  background-color: ${({ theme }) => theme.colors.bg};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const NavIconButton = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const HeaderCountText = styled.span`
  ${typography.caption}
  color: #b2b6ca;
`;

export const PhotoUploadPage: React.FC = () => {
  const { shareKey = 'default_key' } = useParams<{ shareKey: string }>();
  const navigate = useNavigate();
  const [isCameraMode, setIsCameraMode] = useState<boolean>(false);

  const participantSessionId = localStorage.getItem('participantSessionId') || 'temp_session_123';

  const camera = useCamera();
  const { queue, isUploading, addToQueue, removeFromQueue, startUpload } = useS3Upload(
    shareKey,
    participantSessionId
  );

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mode') === 'camera') {
      setIsCameraMode(true);
      camera.startCamera();
    }
  }, [camera]);

  const handleCapture = async () => {
    const capturedFile = await camera.captureFrame();
    if (capturedFile) {
      addToQueue([capturedFile]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addToQueue(Array.from(e.target.files));
    }
  };

  if (isCameraMode && camera.isCameraSupported) {
    return (
      <CameraView
        queueCount={queue.length}
        videoRef={camera.videoRef}
        onClose={() => {
          camera.stopCamera();
          setIsCameraMode(false);
        }}
        onCapture={handleCapture}
        onNext={() => {
          camera.stopCamera();
          setIsCameraMode(false);
        }}
      />
    );
  }

  return (
    <Container>
      <AppBar
        title="사진 업로드"
        leftAction={
          <NavIconButton onClick={() => navigate(-1)}>
            <Icon icon="CaretLeft" $size={20} />
          </NavIconButton>
        }
        rightAction={<HeaderCountText>{queue.length}장 선택</HeaderCountText>}
      />

      <Content>
        <QueueGrid>
          {queue.map((item) => (
            <ThumbCard key={item.id}>
              <img src={item.previewUrl} alt="미리보기" />
              <RemoveBtn onClick={() => removeFromQueue(item.id)}>
                <Icon icon="X" $size={16} />
              </RemoveBtn>
              <TimeLabel>
                {new Date(item.capturedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </TimeLabel>
              {item.status === 'uploading' && <ProgressBar progress={item.progress} />}
            </ThumbCard>
          ))}

          <AddCard>
            <Icon icon="Plus" $size={20} />
            추가
            <input type="file" accept="image/*,video/*" multiple onChange={handleFileChange} />
          </AddCard>
        </QueueGrid>

        {/* 촬영 시각 기반 Moment 카드 자동 분류 정책 안내 */}
        <InfoBox>
          <Icon icon="Clock" $size={18}$color="accent" />
          <InfoText>
            촬영 시각 기준으로 세션별 Moment 카드에 자동 분류돼요. 태그를 고를 필요가 없어요.
          </InfoText>
        </InfoBox>

        {/* 주최자 승인 후 공개 정책 안내 */}
        <BottomNotice>
          <Icon icon="CheckCircle" $size={16} />
          주최자 승인 후 공유 앨범에 공개됩니다[cite: 1].
        </BottomNotice>
      </Content>

      <CTAWrapper>
        <Button
          $variant="primary"
          $size="large"
          disabled={queue.length === 0 || isUploading}
          onClick={startUpload}
        >
          {isUploading ? '업로드 진행 중...' : `업로드 시작 (${queue.length}장)`}
        </Button>
      </CTAWrapper>
    </Container>
  );
};