import styled from 'styled-components';

const Container = styled.main`
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #f8fafc;
`;

const Content = styled.section`
  width: 100%;
  max-width: 560px;
  padding: 32px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 8px 24px rgb(15 23 42 / 8%);
  text-align: center;
`;

const Title = styled.h1`
  margin: 0;
  color: #1d4ed8;
  font-size: 28px;
`;

const Description = styled.p`
  margin: 12px 0 0;
  color: #475569;
  line-height: 1.6;
`;

function App() {
  return (
    <Container>
      <Content>
        <Title>Moment Link</Title>
        <Description>
          행사 사진·영상 수집 및 공유 서비스
        </Description>
      </Content>
    </Container>
  );
}

export default App;