/**
 * @file PhotoUploadPage.tsx
 * @description 참가자 사진·동영상 업로드 페이지 (모바일 기본 카메라 사진/동영상 촬영 파일 수신 완벽 보장)
 */

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { typography } from '../../styles/typography';
import {
  AppBar,
  Button,
  Chip,
  Icon,
  IconButton,
  Modal,
  ProgressBar,
} from '../../components/common';
import { CameraView } from '../../components/participant/CameraView';
import { useCamera } from '../../hooks/useCamera';
import { useS3Upload } from '../../hooks/useS3Upload';

const MOMENT_TAGS = ['A팀 · 축구장', 'B팀 · 강당', 'C팀 · 식당'];
const NATIVE_PHOTO_INPUT_ID = 'native-photo-camera-input';
const NATIVE_VIDEO_INPUT_ID = 'native-video-camera-input';

/**
 * 모바일 기본 카메라(iOS HEIC/MOV, Android 빈 MIME 등)에서 넘어온 파일이
 * 업로드 대기열 검증기(fileValidation)에서 탈락하지 않도록 표준 MIME 타입으로 보정합니다.
 */
const normalizeCapturedFiles = (rawFiles: File[]): File[] => {
  return rawFiles.map((file) => {
    const lowerName = file.name.toLowerCase();
    const isVideoExt =
      lowerName.endsWith('.mp4') ||
      lowerName.endsWith('.mov') ||
      lowerName.endsWith('.webm') ||
      lowerName.endsWith('.3gp') ||
      file.type.startsWith('video/');

    if (isVideoExt) {
      if (file.type === 'video/mp4' || file.type === 'video/webm') {
        return file;
      }
      const cleanName = file.name.replace(/\.[^/.]+$/, '') + '.mp4';
      return new File([file], cleanName, {
        type: 'video/mp4',
        lastModified: file.lastModified || Date.now(),
      });
    }

    // 사진 파일 (image/heic, image/heif 또는 빈 type 등) -> image/jpeg 표준화
    if (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp') {
      return file;
    }
    const cleanName =
      (file.name ? file.name.replace(/\.[^/.]+$/, '') : `IMG_${Date.now()}`) + '.jpg';
    return new File([file], cleanName, {
      type: 'image/jpeg',
      lastModified: file.lastModified || Date.now(),
    });
  });
};

export const PhotoUploadPage: React.FC = () => {
  const { eventId, shareKey } = useParams<{ eventId?: string; shareKey?: string }>();
  const targetEventId = eventId || sessionStorage.getItem('currentEventId') || '42';
  const activeShareKey = shareKey || sessionStorage.getItem('currentShareKey') || 'default_key';

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const nativePhotoInputRef = useRef<HTMLInputElement | null>(null);
  const nativeVideoInputRef = useRef<HTMLInputElement | null>(null);

  const [isCameraMode, setIsCameraMode] = useState<boolean>(
    () => searchParams.get('mode') === 'camera'
  );
  const [selectedTag, setSelectedTag] = useState<string>(MOMENT_TAGS[0]);
  const [uploadStarted, setUploadStarted] = useState<boolean>(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const participantSessionId =
    sessionStorage.getItem('currentSessionId') ||
    localStorage.getItem('participantSessionId') ||
    'temp_session_123';

  const camera = useCamera();
  const { queue, isUploading, addToQueue, removeFromQueue, startUpload } = useS3Upload(
    activeShareKey,
    participantSessionId
  );

  const handleOpenCamera = async () => {
    setIsCameraMode(true);
    const started = await camera.startCamera();
    if (!started) {
      setIsCameraMode(false);
      nativePhotoInputRef.current?.click();
    }
  };

  useEffect(() => {
    if (searchParams.get('mode') === 'camera') {
      handleOpenCamera();
    }
  }, []);

  useEffect(() => {
    if (
      uploadStarted &&
      !isUploading &&
      queue.length > 0 &&
      queue.every((item) => item.status === 'completed')
    ) {
      setIsSuccessModalOpen(true);
      setUploadStarted(false);
    }
  }, [uploadStarted, isUploading, queue]);

  const handleCloseCamera = () => {
    camera.stopCamera();
    const cameFromAlbumCameraBtn = searchParams.get('mode') === 'camera';
    if (cameFromAlbumCameraBtn && queue.length === 0) {
      navigate(`/event/${targetEventId}/album`, { replace: true });
      return;
    }
    if (cameFromAlbumCameraBtn) {
      searchParams.delete('mode');
      setSearchParams(searchParams, { replace: true });
    }
    setIsCameraMode(false);
  };

  const handleNextFromCamera = () => {
    camera.stopCamera();
    if (searchParams.get('mode') === 'camera') {
      searchParams.delete('mode');
      setSearchParams(searchParams, { replace: true });
    }
    setIsCameraMode(false);
  };

  /**
   * [핵심] 기본 카메라 호출 직전에는 WebRTC 카메라 렌즈 점유만 해제하고,
   * setIsCameraMode(false)로 화면을 닫지 않습니다! (화면이 유지되어야 OS 카메라 응답이 유실되지 않음)
   */
  const handleBeforeOpenNativeCamera = () => {
    camera.stopCamera();
  };

  const handleCapture = async () => {
    const capturedFile = await camera.captureFrame();
    if (capturedFile) {
      addToQueue([capturedFile]);
    }
  };

  const handleStopRecord = async () => {
    const recordedVideo = await camera.stopRecording();
    if (recordedVideo) {
      addToQueue([recordedVideo]);
    }
  };

  /**
   * 기본 카메라(사진/동영상) 촬영 후 [확인]을 눌렀을 때 실행되는 핸들러
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = e.target.files ? Array.from(e.target.files) : [];
    if (rawFiles.length > 0) {
      const validFiles = normalizeCapturedFiles(rawFiles);
      addToQueue(validFiles);
    }
    // 같은 파일을 연속 촬영할 수 있도록 value 초기화
    e.target.value = '';

    // 촬영이 완료되어 파일이 들어온 시점에 카메라 화면을 닫고 사진 업로드 화면으로 전환합니다!
    camera.stopCamera();
    if (searchParams.get('mode') === 'camera') {
      searchParams.delete('mode');
      setSearchParams(searchParams, { replace: true });
    }
    setIsCameraMode(false);
  };

  const handleStartUpload = async () => {
    setUploadStarted(true);
    await startUpload();
  };

  const handleDeleteFromPreview = () => {
    if (previewIndex === null) return;
    const targetItem = queue[previewIndex];
    if (!targetItem) return;

    removeFromQueue(targetItem.id);

    if (queue.length <= 1) {
      setPreviewIndex(null);
    } else if (previewIndex >= queue.length - 1) {
      setPreviewIndex(Math.max(0, queue.length - 2));
    }
  };

  const currentPreviewItem =
    previewIndex !== null ? queue[previewIndex] || null : null;

  return (
    <>
      {/* 1. 갤러리 다중 파일 선택용 input */}
      <VisuallyHiddenInput
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFileChange}
      />

      {/* 2. 스마트폰 기본 카메라 (사진 촬영) 직행 input */}
      <VisuallyHiddenInput
        id={NATIVE_PHOTO_INPUT_ID}
        ref={nativePhotoInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
      />

      {/* 3. 스마트폰 기본 카메라 (동영상 촬영) 직행 input */}
      <VisuallyHiddenInput
        id={NATIVE_VIDEO_INPUT_ID}
        ref={nativeVideoInputRef}
        type="file"
        accept="video/*"
        capture="environment"
        onChange={handleFileChange}
      />

      {isCameraMode ? (
        <CameraView
          queue={queue}
          videoRef={camera.videoRef}
          isStreamReady={Boolean(camera.stream)}
          isRecording={camera.isRecording}
          recordingSeconds={camera.recordingSeconds}
          nativePhotoInputId={NATIVE_PHOTO_INPUT_ID}
          nativeVideoInputId={NATIVE_VIDEO_INPUT_ID}
          onBeforeOpenNativeCamera={handleBeforeOpenNativeCamera}
          onRemoveItem={removeFromQueue}
          onClose={handleCloseCamera}
          onCapture={handleCapture}
          onStartRecord={camera.startRecording}
          onStopRecord={handleStopRecord}
          onNext={handleNextFromCamera}
        />
      ) : (
        <PageContainer>
          {/* 1. 상단 AppBar */}
          <AppBar
            title="사진 업로드"
            leftAction={
              <IconButton
                onClick={() => navigate(`/event/${targetEventId}/album`)}
                aria-label="닫기"
              >
                <Icon icon="X" $size={20} />
              </IconButton>
            }
          />

          <ContentArea>
            {/* 2. 선택한 파일 N개 */}
            <SectionHeader>
              <SectionLabel>선택한 파일 {queue.length}개</SectionLabel>
            </SectionHeader>

            {/* 3. 3열 정사각형 썸네일 그리드 */}
            <ThumbGrid3Col>
              {queue.map((item, idx) => {
                const isVideo = item.file.type.startsWith('video/');
                return (
                  <ThumbBox
                    key={item.id}
                    onClick={() => setPreviewIndex(idx)}
                    title="클릭하여 크게 보기"
                  >
                    {isVideo ? (
                      <video src={item.previewUrl} muted playsInline />
                    ) : (
                      <img src={item.previewUrl} alt={item.file.name} />
                    )}
                    {isVideo && (
                      <VideoPlayBadge>
                        <Icon icon="Play" $size={13} />
                      </VideoPlayBadge>
                    )}
                    <ThumbRemoveBtn
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromQueue(item.id);
                      }}
                      aria-label="제거"
                    >
                      <Icon icon="X" $size={12} />
                    </ThumbRemoveBtn>
                  </ThumbBox>
                );
              })}

              <EmptyAddBox onClick={() => fileInputRef.current?.click()}>
                <Icon icon="Plus" $size={20} />
                <span>파일 선택</span>
              </EmptyAddBox>

              <EmptyAddBox onClick={handleOpenCamera}>
                <Icon icon="Camera" $size={20} />
                <span>촬영</span>
              </EmptyAddBox>
            </ThumbGrid3Col>

            {/* 4. 파일별 전송/검증 상태 및 ProgressBar 리스트 */}
            {queue.length > 0 && (
              <ProgressListCard>
                {queue.map((item) => {
                  let statusText = '대기 중';
                  if (item.status === 'uploading') statusText = `전송 ${item.progress}%`;
                  else if (item.status === 'verifying') statusText = '검증 중…';
                  else if (item.status === 'completed') statusText = '업로드 완료';
                  else if (item.status === 'failed') statusText = '실패';

                  return (
                    <ProgressRow key={item.id}>
                      <FileInfoRow>
                        <FileName>{item.file.name}</FileName>
                        <StatusText $status={item.status}>{statusText}</StatusText>
                      </FileInfoRow>
                      <ProgressBar
                        progress={
                          item.status === 'verifying' || item.status === 'completed'
                            ? 100
                            : item.progress
                        }
                      />
                    </ProgressRow>
                  );
                })}
              </ProgressListCard>
            )}

            {/* 5. Moment 카드 태그 선택 섹션 */}
            <TagSection>
              <SectionLabel>Moment 카드 태그 선택</SectionLabel>
              <TagChipRow>
                {MOMENT_TAGS.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    selected={selectedTag === tag}
                    onClick={() => setSelectedTag(tag)}
                  />
                ))}
              </TagChipRow>
              <TagHelperText>
                태그별로 설정된 행사에서만 보여요. 세션별 행사는 촬영시각으로 자동 분류돼요.
              </TagHelperText>
            </TagSection>

            {/* 6. 2차 법적 고지 카드 */}
            <LegalNoticeCard>
              <NoticeTitle>
                <Icon icon="CheckCircle" $size={16} $color="accent" />
                <span>사진 업로드 및 초상권 안내</span>
              </NoticeTitle>
              <NoticeList>
                <li>
                  업로드된 사진은 주최자 승인 후{' '}
                  <strong>실시간 포토월 및 공유 앨범에 공개</strong>됩니다.
                </li>
                <li>
                  타인의 <strong>초상권·저작권을 침해하는 사진</strong>은 승인 거절 또는 삭제될 수
                  있습니다.
                </li>
                <li>
                  사진의 <strong>촬영 시각(EXIF)</strong>은 Moment 카드 세션 분류에 활용됩니다.
                </li>
              </NoticeList>
            </LegalNoticeCard>
          </ContentArea>

          {/* 7. 최하단 2분할 버튼 */}
          <BottomButtonGrid>
            <Button
              $variant="secondary"
              $size="large"
              onClick={() => navigate(`/event/${targetEventId}/album`)}
              disabled={isUploading}
            >
              취소
            </Button>
            <Button
              $variant="primary"
              $size="large"
              disabled={queue.length === 0 || isUploading}
              onClick={handleStartUpload}
            >
              {isUploading ? '업로드 중...' : `${queue.length}장 업로드`}
            </Button>
          </BottomButtonGrid>

          {/* 8. 썸네일 클릭 시 사진을 크게 보고 삭제할 수 있는 미리보기 팝업 */}
          {currentPreviewItem && previewIndex !== null && (
            <PreviewModalOverlay onClick={() => setPreviewIndex(null)}>
              <PreviewModalCard onClick={(e) => e.stopPropagation()}>
                <PreviewHeader>
                  <PreviewTitle>
                    선택한 파일 ({previewIndex + 1} / {queue.length})
                  </PreviewTitle>
                  <IconButton onClick={() => setPreviewIndex(null)} aria-label="닫기">
                    <Icon icon="X" $size={20} />
                  </IconButton>
                </PreviewHeader>

                <MainPreviewStage>
                  {currentPreviewItem.file.type.startsWith('video/') ? (
                    <video src={currentPreviewItem.previewUrl} controls playsInline />
                  ) : (
                    <img
                      src={currentPreviewItem.previewUrl}
                      alt={currentPreviewItem.file.name}
                    />
                  )}
                </MainPreviewStage>

                <PreviewFileName>{currentPreviewItem.file.name}</PreviewFileName>

                {queue.length > 1 && (
                  <ThumbStripRow>
                    {queue.map((item, idx) => (
                      <StripThumbItem
                        key={item.id}
                        $active={idx === previewIndex}
                        onClick={() => setPreviewIndex(idx)}
                      >
                        {item.file.type.startsWith('video/') ? (
                          <video src={item.previewUrl} muted playsInline />
                        ) : (
                          <img src={item.previewUrl} alt={`파일 ${idx + 1}`} />
                        )}
                      </StripThumbItem>
                    ))}
                  </ThumbStripRow>
                )}

                <PreviewActionRow>
                  <Button
                    $variant="secondary"
                    $size="medium"
                    onClick={handleDeleteFromPreview}
                  >
                    선택 삭제
                  </Button>
                  <Button
                    $variant="primary"
                    $size="medium"
                    onClick={() => setPreviewIndex(null)}
                  >
                    확인
                  </Button>
                </PreviewActionRow>
              </PreviewModalCard>
            </PreviewModalOverlay>
          )}

          {/* 9. 업로드 완료 소형 팝업 (Modal) */}
          <Modal
            isOpen={isSuccessModalOpen}
            title="업로드 완료"
            onClose={() => navigate(`/event/${targetEventId}/album`)}
          >
            <ModalBody>
              <ModalDesc>
                선택한 미디어 <strong>{queue.length}개</strong>의 업로드가 완료되었어요.
                <br />
                주최자 승인 후 공유 앨범과 실시간 포토월에 공개됩니다.
              </ModalDesc>
              <Button
                $variant="primary"
                $size="medium"
                onClick={() => navigate(`/event/${targetEventId}/album`)}
                style={{ width: '100%' }}
              >
                앨범으로 돌아가기
              </Button>
            </ModalBody>
          </Modal>
        </PageContainer>
      )}
    </>
  );
};

// ============================================================================
// 스타일 정의
// ============================================================================

/* 모바일 Safari/Chrome에서 display:none 시 파일 콜백이 무시되는 현상을 막기 위한 표준 시각적 숨김 처리 */
const VisuallyHiddenInput = styled.input`
  position: fixed;
  top: -9999px;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
`;

const PageContainer = styled.div`
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.bg};
  display: flex;
  flex-direction: column;
`;

const ContentArea = styled.div`
  padding: 16px 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  flex: 1;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SectionLabel = styled.span`
  ${typography.label}
  color: ${({ theme }) => theme.colors.text2};
`;

const ThumbGrid3Col = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
`;

const ThumbBox = styled.div`
  aspect-ratio: 1;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;

  img,
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ThumbRemoveBtn = styled.button`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background-color: rgba(18, 20, 38, 0.75);
  border: none;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const VideoPlayBadge = styled.div`
  position: absolute;
  top: 6px;
  right: 32px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.9);
  color: #161826;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EmptyAddBox = styled.div`
  aspect-ratio: 1;
  border-radius: 12px;
  border: 1.5px dashed ${({ theme }) => theme.colors.text3};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  ${typography.caption}
  color: ${({ theme }) => theme.colors.text2};
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accentLine};
  }
`;

const ProgressListCard = styled.div`
  padding: 14px 16px;
  border-radius: 14px;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const ProgressRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FileInfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FileName = styled.span`
  ${typography.body}
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  max-width: 70%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StatusText = styled.span<{ $status: string }>`
  ${typography.label}
  color: ${({ $status, theme }) =>
    $status === 'verifying' || $status === 'completed'
      ? theme.colors.accentText
      : theme.colors.text2};
`;

const TagSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TagChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const TagHelperText = styled.p`
  ${typography.caption}
  color: ${({ theme }) => theme.colors.text3};
  line-height: 1.45;
  margin: 0;
`;

const LegalNoticeCard = styled.div`
  padding: 12px 14px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: auto;
`;

const NoticeTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  ${typography.caption}
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const NoticeList = styled.ul`
  margin: 0;
  padding-left: 16px;
  ${typography.micro}
  color: ${({ theme }) => theme.colors.text2};
  line-height: 1.5;

  strong {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const BottomButtonGrid = styled.div`
  padding: 16px;
  display: grid;
  grid-template-columns: 1fr 1.6fr;
  gap: 10px;
  background-color: ${({ theme }) => theme.colors.bg};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const PreviewModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1100;
  background-color: rgba(12, 14, 24, 0.88);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const PreviewModalCard = styled.div`
  width: 100%;
  max-width: 420px;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 20px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PreviewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PreviewTitle = styled.span`
  ${typography.section}
  color: ${({ theme }) => theme.colors.text};
`;

const MainPreviewStage = styled.div`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 14px;
  overflow: hidden;
  background-color: #0e101a;
  border: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;

  img,
  video {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const PreviewFileName = styled.span`
  ${typography.caption}
  color: ${({ theme }) => theme.colors.text2};
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ThumbStripRow = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
`;

const StripThumbItem = styled.button<{ $active: boolean }>`
  width: 50px;
  height: 50px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  padding: 0;
  border: 2px solid
    ${({ $active, theme }) => ($active ? theme.colors.accentLine : 'transparent')};
  opacity: ${({ $active }) => ($active ? 1 : 0.55)};
  cursor: pointer;

  img,
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PreviewActionRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 10px;
  margin-top: 4px;
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const ModalDesc = styled.p`
  ${typography.body}
  color: ${({ theme }) => theme.colors.text2};
  line-height: 1.55;
  margin: 0;

  strong {
    color: ${({ theme }) => theme.colors.accentText};
  }
`;