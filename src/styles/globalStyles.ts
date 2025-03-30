import { createGlobalStyle } from 'styled-components';
import { Theme } from './theme';

export const GlobalStyles = createGlobalStyle<{ theme: Theme }>`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: ${({ theme }) => theme.fonts.main};
    background-color: ${({ theme }) => theme.colors.background.main};
    color: ${({ theme }) => theme.colors.text.primary};
    line-height: 1.6;
    font-size: 16px;
    transition: background-color ${({ theme }) => theme.transitions.medium};
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${({ theme }) => theme.fonts.heading};
    margin-bottom: ${({ theme }) => theme.spacing.md};
    line-height: 1.2;
    font-weight: 600;
  }

  h1 {
    font-size: ${({ theme }) => theme.fontSizes['4xl']};
  }

  h2 {
    font-size: ${({ theme }) => theme.fontSizes['3xl']};
  }

  h3 {
    font-size: ${({ theme }) => theme.fontSizes['2xl']};
  }

  h4 {
    font-size: ${({ theme }) => theme.fontSizes.xl};
  }

  h5 {
    font-size: ${({ theme }) => theme.fontSizes.lg};
  }

  h6 {
    font-size: ${({ theme }) => theme.fontSizes.md};
  }

  p {
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  a {
    color: ${({ theme }) => theme.colors.primary.main};
    text-decoration: none;
    transition: color ${({ theme }) => theme.transitions.short};

    &:hover {
      color: ${({ theme }) => theme.colors.primary.light};
      text-decoration: underline;
    }
  }

  button {
    cursor: pointer;
    font-family: ${({ theme }) => theme.fonts.main};
  }

  input, textarea, select {
    font-family: ${({ theme }) => theme.fonts.main};
  }

  img {
    max-width: 100%;
    height: auto;
  }

  ul, ol {
    margin-left: ${({ theme }) => theme.spacing.lg};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 ${({ theme }) => theme.spacing.md};
  }

  .card {
    background-color: ${({ theme }) => theme.colors.background.paper};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    box-shadow: ${({ theme }) => theme.shadows.md};
    padding: ${({ theme }) => theme.spacing.lg};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }

  /* For dark mode support in the future */
  body.dark-mode {
    background-color: ${({ theme }) => theme.colors.background.dark};
    color: ${({ theme }) => theme.colors.text.light};

    .card {
      background-color: #222;
    }
  }

  /* Animation classes */
  .fade-in {
    animation: fadeIn 0.5s ease-in-out;

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  }

  .slide-in {
    animation: slideIn 0.5s ease-in-out;

    @keyframes slideIn {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  }

  /* Responsive utilities */
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    h1 {
      font-size: ${({ theme }) => theme.fontSizes['3xl']};
    }

    h2 {
      font-size: ${({ theme }) => theme.fontSizes['2xl']};
    }

    h3 {
      font-size: ${({ theme }) => theme.fontSizes.xl};
    }
  }
`;
