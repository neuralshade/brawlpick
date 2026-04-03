import styled from "styled-components";

export const AppShell = styled.main`
  max-width: 1080px;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;

  @media (max-width: 768px) {
    padding: 1rem 0.75rem 2rem;
  }
`;

export const BaseCard = styled.section`
  background: rgba(0, 0, 0, 0.25);
  border: 2px solid #000;
  padding: 1.25rem;
  box-shadow: 0 24px 40px rgba(15, 23, 42, 0.06);
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

export const GroupTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: ${(props) => props.$size || "1rem"};
  color: ${(props) => props.$color || "#fff"};
  margin-bottom: 0.75rem;
  margin-top: 0;
  text-transform: uppercase;
  padding-bottom: 0.25rem;
  text-shadow:
    0 0 2px #000,
    0 0 4px #000,
    1px 1px 0 #000,
    -1px -1px 0 #000,
    2px 2px 4px rgba(0, 0, 0, 0.7);

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

export const PickGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`;