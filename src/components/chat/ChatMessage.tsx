import React, { useState } from 'react';
import styled from 'styled-components';
import { ChatMessage as ChatMessageType, ConsumedFood } from '../../types';
import Button from '../common/Button';

interface ChatMessageProps {
  message: ChatMessageType;
  onAddFood: (food: ConsumedFood) => void;
}

const MessageContainer = styled.div<{ isUser: boolean }>`
  display: flex;
  flex-direction: ${({ isUser }) => (isUser ? 'row-reverse' : 'row')};
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Avatar = styled.div<{ isUser: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: ${({ isUser }) => (isUser ? '0 0 0 12px' : '0 12px 0 0')};
  background: ${({ isUser, theme }) => 
    isUser ? theme.colors.gradients.primary : theme.colors.gradients.secondary};
  color: white;
  font-weight: bold;
`;

const MessageBubble = styled.div<{ isUser: boolean }>`
  max-width: 70%;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ isUser, theme }) =>
    isUser ? theme.colors.primary.light : theme.colors.background.paper};
  color: ${({ isUser, theme }) =>
    isUser ? theme.colors.text.light : theme.colors.text.primary};
  box-shadow: ${({ theme }) => theme.shadows.md};
  position: relative;

  &:after {
    content: '';
    position: absolute;
    top: 15px;
    ${({ isUser }) => (isUser ? 'right: -8px' : 'left: -8px')};
    width: 0;
    height: 0;
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
    ${({ isUser, theme }) =>
      isUser
        ? `border-left: 8px solid ${theme.colors.primary.light};`
        : `border-right: 8px solid ${theme.colors.background.paper};`}
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    max-width: 85%;
  }
`;

const Time = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: rgba(255, 255, 255, 0.7);
  text-align: right;
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const FoodItem = styled.div`
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const FoodItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const MacroInfo = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const MacroItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onAddFood }) => {
  const isUser = message.role === 'user';
  const [addedFoods, setAddedFoods] = useState<string[]>([]);

  return (
    <MessageContainer isUser={isUser}>
      <Avatar isUser={isUser}>{isUser ? 'U' : 'AI'}</Avatar>
      <MessageBubble isUser={isUser}>
        <div>{message.content}</div>
        
        {message.foodItems && message.foodItems.length > 0 && (
          <div>
            {message.foodItems.map((food, index) => (
              <FoodItem key={index}>
                <FoodItemHeader>
                  <div>
                    <strong>{food.name}</strong> ({food.servingSize})
                  </div>
                  <Button 
                    size="small" 
                    variant="text" 
                    onClick={() => {
                      onAddFood(food);
                      setAddedFoods((prev) => [...prev, food.foodId || index.toString()]);
                      setTimeout(() => {
                        setAddedFoods((prev) => 
                          prev.filter(id => id !== (food.foodId || index.toString()))
                        );
                      }, 3000);
                    }}
                  >
                    {addedFoods.includes(food.foodId || index.toString()) 
                      ? "✓ Added!" 
                      : "Add to log"}
                  </Button>
                </FoodItemHeader>
                <div>{food.calories} calories</div>
                <MacroInfo>
                  <MacroItem>P: {food.protein}g</MacroItem>
                  <MacroItem>C: {food.carbs}g</MacroItem>
                  <MacroItem>F: {food.fat}g</MacroItem>
                </MacroInfo>
              </FoodItem>
            ))}
          </div>
        )}
        
        <Time>{formatTime(message.timestamp)}</Time>
      </MessageBubble>
    </MessageContainer>
  );
};

export default ChatMessage;
