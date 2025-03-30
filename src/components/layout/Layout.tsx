import React, { ReactNode } from 'react';
import styled from 'styled-components';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

const Main = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.lg};
  min-height: calc(100vh - 100px); /* Account for header and footer */

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Header />
      <Main>{children}</Main>
    </>
  );
};

export default Layout;
