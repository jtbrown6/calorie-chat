import React, { useState, FormEvent } from 'react';
import styled from 'styled-components';
import Button from '../common/Button';
import { useAppContext } from '../../context/AppContext';

const ChatInputContainer = styled.div`
  position: relative;
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const Form = styled.form`
  display: flex;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: stretch;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const InputWrapper = styled.div`
  flex: 1;
  position: relative;
`;

const StyledTextarea = styled.textarea`
  width: 100%;
  min-height: 60px;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.primary.light};
  font-family: ${({ theme }) => theme.fonts.main};
  font-size: ${({ theme }) => theme.fontSizes.md};
  resize: none;
  transition: all ${({ theme }) => theme.transitions.short};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 2px rgba(110, 72, 170, 0.2);
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ChatInput: React.FC<{ onSendMessage: (message: string) => void; isLoading: boolean }> = ({
  onSendMessage,
  isLoading,
}) => {
  const [message, setMessage] = useState('');
  const { state } = useAppContext();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() !== '') {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const exampleMessages = [
    'I ate a turkey sandwich with mayo and lettuce',
    'Had 2 eggs with toast and coffee for breakfast',
    'Just had a protein bar and apple as a snack',
  ];

  const handleExampleClick = (example: string) => {
    setMessage(example);
  };

  return (
    <ChatInputContainer>
      <Form onSubmit={handleSubmit}>
        <InputWrapper>
          <StyledTextarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tell me what you ate..."
            disabled={isLoading}
          />
        </InputWrapper>
        <Button type="submit" isLoading={isLoading} disabled={message.trim() === '' || isLoading}>
          Send
        </Button>
      </Form>

      {state.customFoods.length === 0 && (
        <div style={{ marginTop: '16px' }}>
          <p style={{ fontSize: '14px', color: '#757575', marginBottom: '8px' }}>
            Examples to try:
          </p>
          <ButtonsContainer>
            {exampleMessages.map((example, index) => (
              <Button
                key={index}
                variant="text"
                size="small"
                onClick={() => handleExampleClick(example)}
              >
                {example}
              </Button>
            ))}
          </ButtonsContainer>
        </div>
      )}
    </ChatInputContainer>
  );
};

export default ChatInput;
