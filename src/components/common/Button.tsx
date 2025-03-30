import React, { ButtonHTMLAttributes } from 'react';
import styled, { css } from 'styled-components';

type ButtonVariant = 'primary' | 'secondary' | 'outlined' | 'text' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

const getButtonStyles = (variant: ButtonVariant, theme: any) => {
  switch (variant) {
    case 'primary':
      return css`
        background: ${theme.colors.gradients.primary};
        color: ${theme.colors.text.light};
        border: none;

        &:hover, &:focus {
          box-shadow: 0 0 0 2px ${theme.colors.primary.light};
        }

        &:active {
          background: ${theme.colors.primary.dark};
        }
      `;
    case 'secondary':
      return css`
        background: ${theme.colors.gradients.secondary};
        color: ${theme.colors.text.light};
        border: none;

        &:hover, &:focus {
          box-shadow: 0 0 0 2px ${theme.colors.secondary.light};
        }

        &:active {
          background: ${theme.colors.secondary.dark};
        }
      `;
    case 'outlined':
      return css`
        background: transparent;
        color: ${theme.colors.primary.main};
        border: 2px solid ${theme.colors.primary.main};

        &:hover, &:focus {
          background: rgba(110, 72, 170, 0.05);
        }

        &:active {
          background: rgba(110, 72, 170, 0.1);
        }
      `;
    case 'text':
      return css`
        background: transparent;
        color: ${theme.colors.primary.main};
        border: none;

        &:hover, &:focus {
          background: rgba(110, 72, 170, 0.05);
        }

        &:active {
          background: rgba(110, 72, 170, 0.1);
        }
      `;
    case 'danger':
      return css`
        background: ${theme.colors.error};
        color: ${theme.colors.text.light};
        border: none;

        &:hover, &:focus {
          background: #d32f2f;
          box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.5);
        }

        &:active {
          background: #b71c1c;
        }
      `;
    default:
      return css``;
  }
};

const getButtonSize = (size: ButtonSize, theme: any) => {
  switch (size) {
    case 'small':
      return css`
        padding: ${theme.spacing.xs} ${theme.spacing.sm};
        font-size: ${theme.fontSizes.sm};
      `;
    case 'medium':
      return css`
        padding: ${theme.spacing.sm} ${theme.spacing.md};
        font-size: ${theme.fontSizes.md};
      `;
    case 'large':
      return css`
        padding: ${theme.spacing.md} ${theme.spacing.lg};
        font-size: ${theme.fontSizes.lg};
      `;
    default:
      return css``;
  }
};

const StyledButton = styled.button<{
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth: boolean;
  $hasIcon: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 500;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.short};
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
  
  ${({ $variant, theme }) => getButtonStyles($variant, theme)}
  ${({ $size, theme }) => getButtonSize($size, theme)}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  ${({ $hasIcon }) =>
    $hasIcon &&
    css`
      gap: 0.5rem;
    `}
`;

const SpinnerContainer = styled.span`
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  icon,
  isLoading = false,
  children,
  disabled,
  ...rest
}) => {
  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      $hasIcon={!!icon || isLoading}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? <SpinnerContainer /> : icon}
      {children}
    </StyledButton>
  );
};

export default Button;
