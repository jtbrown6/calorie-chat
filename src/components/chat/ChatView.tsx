import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { analyzeFood } from '../../services/openaiService';
import { useAppContext } from '../../context/AppContext';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { ChatMessage as ChatMessageType, ConsumedFood } from '../../types';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 180px);
  max-width: 800px;
  margin: 0 auto;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
`;

const WelcomeMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  text-align: center;
`;

const ChatView: React.FC = () => {
  const { 
    state, 
    addChatMessage,
    addConsumedFood,
    getTodaysChatHistory 
  } = useAppContext();
  
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messages = getTodaysChatHistory();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    // Add user message to chat
    addChatMessage({
      role: 'user',
      content,
    });

    setIsLoading(true);

    try {
      // Process message with OpenAI
      const foodItems = await analyzeFood(content, state.customFoods);
      
      // Convert to ConsumedFood type
      const consumedFoodItems: ConsumedFood[] = foodItems.map((item) => ({
        foodId: '',
        name: item.name,
        servingSize: item.servingSize,
        quantity: 1,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        mealType: 'snack', // Default mealType
        time: new Date().toISOString(),
      }));

      // Generate response message
      let responseText = '';
      if (consumedFoodItems.length > 0) {
        const totalCalories = consumedFoodItems.reduce((sum, food) => sum + food.calories, 0);
        responseText = `I've analyzed what you ate. Here's the breakdown:`;
        
        if (state.customFoods.length > 0 && state.customFoods.some(food => 
          consumedFoodItems.some(item => item.name.toLowerCase().includes(food.name.toLowerCase()))
        )) {
          responseText += " I found some items in your custom foods list.";
        }
      } else {
        // More detailed error message to help users
        responseText = `I couldn't determine the nutritional information for "${content}". Please try being more specific with your food description, including portion size (e.g., "grilled chicken breast 3oz" or "1 cup of cooked white rice").`;
      }

      // Add assistant message to chat
      addChatMessage({
        role: 'assistant',
        content: responseText,
        foodItems: consumedFoodItems,
      });
    } catch (error) {
      console.error('Error analyzing food:', error);
      
      // Add error message
      addChatMessage({
        role: 'assistant',
        content: 'Sorry, I had trouble analyzing that. Could you try again?',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFood = (food: ConsumedFood) => {
    addConsumedFood(food);
  };

  return (
    <ChatContainer>
      <MessagesContainer>
        {messages.length === 0 && (
          <WelcomeMessage>
            <h2>Welcome to CalorieChat!</h2>
            <p>
              Tell me what you've eaten, and I'll calculate the calories and macronutrients for you.
              I'll remember your custom foods and help you track your daily intake.
            </p>
          </WelcomeMessage>
        )}
        
        {messages.map((message: ChatMessageType) => (
          <ChatMessage key={message.id} message={message} onAddFood={handleAddFood} />
        ))}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </ChatContainer>
  );
};

export default ChatView;
