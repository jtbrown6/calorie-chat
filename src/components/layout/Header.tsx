import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { useAppContext } from '../../context/AppContext';

const StyledHeader = styled.header`
  background: ${({ theme }) => theme.colors.gradients.primary};
  color: ${({ theme }) => theme.colors.text.light};
  padding: ${({ theme }) => theme.spacing.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndices.sticky};
  width: 100%;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-wrap: wrap;
  }
`;

const Logo = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: bold;

  a {
    color: ${({ theme }) => theme.colors.text.light};
    text-decoration: none;
    
    &:hover {
      color: ${({ theme }) => theme.colors.text.light};
      text-decoration: none;
    }
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: ${({ theme }) => theme.fontSizes.xl};
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    gap: ${({ theme }) => theme.spacing.xs};
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
    margin-top: ${({ theme }) => theme.spacing.xs};
    order: 3;
  }
`;

const NavItem = styled(Link)<{ $active?: boolean }>`
  color: ${({ theme }) => theme.colors.text.light};
  text-decoration: none;
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: background-color ${({ theme }) => theme.transitions.short};
  font-weight: ${({ $active }) => ($active ? 'bold' : 'normal')};
  position: relative;
  white-space: nowrap;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: ${({ theme }) => theme.colors.text.light};
    text-decoration: none;
  }

  ${({ $active, theme }) =>
    $active &&
    `
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 30px;
      height: 3px;
      background-color: ${theme.colors.text.light};
      border-radius: ${theme.borderRadius.full};
    }
  `}

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: ${({ theme }) => theme.spacing.xs};
    font-size: ${({ theme }) => theme.fontSizes.xs};
    flex: 1;
    text-align: center;
  }
`;

const DateDisplay = styled.div`
  cursor: pointer;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    order: 2;
  }
`;

// Refresh button animation
const spinAnimation = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const RefreshButton = styled.button`
  background: transparent;
  color: ${({ theme }) => theme.colors.text.light};
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: ${({ theme }) => theme.borderRadius.full};
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.short};
  margin-left: ${({ theme }) => theme.spacing.md};
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    width: 16px;
    height: 16px;
    
    &.spinning {
      animation: ${spinAnimation} 1s linear infinite;
    }
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    margin-left: ${({ theme }) => theme.spacing.sm};
    width: 28px;
    height: 28px;
  }
`;

const Header: React.FC = () => {
  const location = useLocation();
  const { state, setCurrentDate, refreshData, isRefreshing } = useAppContext();
  const today = format(new Date(), 'yyyy-MM-dd');

  const handleDateClick = () => {
    setCurrentDate(today);
  };

  return (
    <StyledHeader>
      <HeaderContent>
        <Logo>
          <Link to="/">CalorieChat</Link>
        </Logo>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <DateDisplay onClick={handleDateClick}>
            {state.currentDate === today ? 'Today' : state.currentDate}
          </DateDisplay>
          <RefreshButton 
            onClick={() => refreshData()} 
            disabled={isRefreshing}
            title="Refresh data from server"
            aria-label="Refresh data from server"
          >
            {isRefreshing ? (
              <svg className="spinning" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 11-9-9" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 4v6h6M23 20v-6h-6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
              </svg>
            )}
          </RefreshButton>
        </div>
        <Nav>
          <NavItem to="/" $active={location.pathname === '/'}>
            Chat
          </NavItem>
          <NavItem
            to="/dashboard"
            $active={location.pathname === '/dashboard'}
          >
            Dashboard
          </NavItem>
          <NavItem
            to="/custom-foods"
            $active={location.pathname === '/custom-foods'}
          >
            Custom Foods
          </NavItem>
          <NavItem
            to="/settings"
            $active={location.pathname === '/settings'}
          >
            Settings
          </NavItem>
        </Nav>
      </HeaderContent>
    </StyledHeader>
  );
};

export default Header;
