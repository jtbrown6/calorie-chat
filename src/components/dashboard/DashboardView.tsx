import React, { useState } from 'react';
import styled from 'styled-components';
import { format, subDays, addDays, parseISO } from 'date-fns';
import { useAppContext } from '../../context/AppContext';
import Button from '../common/Button';

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.primary.main};
`;

const DateControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const DateDisplay = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 500;
  min-width: 160px;
  text-align: center;
`;

const MacroSection = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const DashboardCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ProgressContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const CircleProgress = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  flex-shrink: 0;
`;

const ProgressCircle = styled.div<{ $percentage: number; $color: string }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(
    ${({ $color }) => $color} ${({ $percentage }) => $percentage * 3.6}deg,
    rgba(0, 0, 0, 0.1) 0deg
  );
  mask: radial-gradient(transparent 60px, white 61px);
  -webkit-mask: radial-gradient(transparent 60px, white 61px);
`;

const ProgressText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
`;

const ProgressValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary.main};
`;

const ProgressLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const MacroDetailsContainer = styled.div`
  flex-grow: 1;
`;

const MacroBreakdown = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const MacroCard = styled.div<{ $color: string }>`
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ theme }) => theme.spacing.md};
  border-top: 4px solid ${({ $color }) => $color};
`;

const MacroHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const MacroName = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const MacroValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary.main};
`;

const MacroProgressBar = styled.div`
  height: 8px;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.background.main};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const ProgressFill = styled.div<{ $percentage: number; $color: string }>`
  height: 100%;
  width: ${({ $percentage }) => Math.min(100, $percentage)}%;
  background-color: ${({ $color }) => $color};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  transition: width 0.3s ease;
`;

const ProgressDetail = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const MealHistory = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const MealHistoryHeader = styled.h3`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.primary.main};
`;

const MealCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const MealCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const MealType = styled.h4`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const MealTime = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const FoodItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.xs} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.background.main};
  
  &:last-child {
    border-bottom: none;
  }
`;

const FoodName = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.md};
`;

const FoodMacros = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  align-items: center;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.error};
  cursor: pointer;
  margin-left: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.md};
  padding: 0 ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  
  &:hover {
    background-color: rgba(244, 67, 54, 0.1);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.2);
  }
`;

const RemoveConfirmation = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: ${({ theme }) => theme.colors.success};
  color: white;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
  z-index: 1000;
  animation: fadeIn 0.3s, fadeOut 0.3s 2.7s;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes fadeOut {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(-20px); }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

const DashboardView: React.FC = () => {
  const { state, setCurrentDate, deleteConsumedFood } = useAppContext();
  const currentDate = state.currentDate;
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  const [removedFoodName, setRemovedFoodName] = useState('');
  
  // Get current day's data
  const dailyEntry = state.dailyEntries.find(entry => entry.date === currentDate) || {
    id: '',
    date: currentDate,
    foods: [],
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
  };
  
  // Target values from settings
  const { targetCalories, macroRatio } = state.settings;
  const targetProtein = (targetCalories * (macroRatio.protein / 100)) / 4;
  const targetCarbs = (targetCalories * (macroRatio.carbs / 100)) / 4;
  const targetFat = (targetCalories * (macroRatio.fat / 100)) / 9;
  
  // Progress percentages
  const caloriePercentage = Math.round((dailyEntry.totalCalories / targetCalories) * 100);
  const proteinPercentage = Math.round((dailyEntry.totalProtein / targetProtein) * 100);
  const carbsPercentage = Math.round((dailyEntry.totalCarbs / targetCarbs) * 100);
  const fatPercentage = Math.round((dailyEntry.totalFat / targetFat) * 100);
  
  // Format date for display
  const formattedDate = format(parseISO(currentDate), 'EEEE, MMMM do, yyyy');
  
  // Navigate between dates
  const goToPreviousDay = () => {
    const newDate = format(subDays(parseISO(currentDate), 1), 'yyyy-MM-dd');
    setCurrentDate(newDate);
  };
  
  const goToNextDay = () => {
    const newDate = format(addDays(parseISO(currentDate), 1), 'yyyy-MM-dd');
    setCurrentDate(newDate);
  };
  
  const goToToday = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    setCurrentDate(today);
  };

  const handleDeleteFood = (foodId: string, foodName: string) => {
    deleteConsumedFood(foodId);
    setRemovedFoodName(foodName);
    setShowRemoveConfirmation(true);
    
    setTimeout(() => {
      setShowRemoveConfirmation(false);
    }, 3000);
  };
  
  // Group foods by meal type
  const foodsByMealType = dailyEntry.foods.reduce<Record<string, Array<typeof dailyEntry.foods[0]>>>(
    (acc, food) => {
      if (!acc[food.mealType]) {
        acc[food.mealType] = [];
      }
      acc[food.mealType].push(food);
      return acc;
    },
    {}
  );
  
  // Sort meal types in a standard order
  const mealTypeOrder = ['breakfast', 'lunch', 'dinner', 'snack'];
  const sortedMealTypes = Object.keys(foodsByMealType).sort(
    (a, b) => mealTypeOrder.indexOf(a) - mealTypeOrder.indexOf(b)
  );
  
  const formatMealType = (mealType: string) => {
    return mealType.charAt(0).toUpperCase() + mealType.slice(1);
  };
  
  const formatTime = (isoTime: string) => {
    return format(parseISO(isoTime), 'h:mm a');
  };
  
  return (
    <Container>
      {showRemoveConfirmation && (
        <RemoveConfirmation>
          <strong>{removedFoodName}</strong> removed from your log
        </RemoveConfirmation>
      )}
      
      <Header>
        <Title>Dashboard</Title>
        <DateControls>
          <Button variant="outlined" size="small" onClick={goToPreviousDay}>
            Previous Day
          </Button>
          <DateDisplay>{formattedDate}</DateDisplay>
          <Button variant="outlined" size="small" onClick={goToNextDay}>
            Next Day
          </Button>
          <Button variant="secondary" size="small" onClick={goToToday}>
            Today
          </Button>
        </DateControls>
      </Header>
      
      <MacroSection>
        <DashboardCard>
          <ProgressContainer>
            <CircleProgress>
              <ProgressCircle 
                $percentage={caloriePercentage} 
                $color={caloriePercentage <= 100 
                  ? '#4CAF50'
                  : '#FF9800'
                }
              />
              <ProgressText>
                <ProgressValue>{caloriePercentage}%</ProgressValue>
                <ProgressLabel>of goal</ProgressLabel>
              </ProgressText>
            </CircleProgress>
            
            <MacroDetailsContainer>
              <h3>Calories</h3>
              <p>
                You've consumed {dailyEntry.totalCalories} of your {targetCalories} calorie goal.
                {caloriePercentage > 100 
                  ? ` You've exceeded your target by ${dailyEntry.totalCalories - targetCalories} calories.`
                  : ` You have ${targetCalories - dailyEntry.totalCalories} calories remaining.`
                }
              </p>
            </MacroDetailsContainer>
          </ProgressContainer>
          
          <MacroBreakdown>
            <MacroCard $color="#6E48AA">
              <MacroHeader>
                <MacroName>Protein</MacroName>
                <MacroValue>{Math.round(dailyEntry.totalProtein)}g</MacroValue>
              </MacroHeader>
              <MacroProgressBar>
                <ProgressFill $percentage={proteinPercentage} $color="#6E48AA" />
              </MacroProgressBar>
              <ProgressDetail>
                <span>Goal: {Math.round(targetProtein)}g</span>
                <span>{proteinPercentage}%</span>
              </ProgressDetail>
            </MacroCard>
            
            <MacroCard $color="#2196F3">
              <MacroHeader>
                <MacroName>Carbs</MacroName>
                <MacroValue>{Math.round(dailyEntry.totalCarbs)}g</MacroValue>
              </MacroHeader>
              <MacroProgressBar>
                <ProgressFill $percentage={carbsPercentage} $color="#2196F3" />
              </MacroProgressBar>
              <ProgressDetail>
                <span>Goal: {Math.round(targetCarbs)}g</span>
                <span>{carbsPercentage}%</span>
              </ProgressDetail>
            </MacroCard>
            
            <MacroCard $color="#FF9800">
              <MacroHeader>
                <MacroName>Fat</MacroName>
                <MacroValue>{Math.round(dailyEntry.totalFat)}g</MacroValue>
              </MacroHeader>
              <MacroProgressBar>
                <ProgressFill $percentage={fatPercentage} $color="#FF9800" />
              </MacroProgressBar>
              <ProgressDetail>
                <span>Goal: {Math.round(targetFat)}g</span>
                <span>{fatPercentage}%</span>
              </ProgressDetail>
            </MacroCard>
          </MacroBreakdown>
        </DashboardCard>
      </MacroSection>
      
      <MealHistory>
        <MealHistoryHeader>Today's Meals</MealHistoryHeader>
        
        {dailyEntry.foods.length === 0 ? (
          <EmptyState>
            <h3>No meals recorded today</h3>
            <p>Start tracking your food intake by using the Chat feature.</p>
            <Button variant="secondary" onClick={() => window.location.href = '/'}>
              Go to Chat
            </Button>
          </EmptyState>
        ) : (
          sortedMealTypes.map(mealType => (
            <MealCard key={mealType}>
              <MealCardHeader>
                <MealType>{formatMealType(mealType)}</MealType>
                {foodsByMealType[mealType].length > 0 && (
                  <MealTime>
                    {formatTime(foodsByMealType[mealType][0].time)}
                  </MealTime>
                )}
              </MealCardHeader>
              
              {foodsByMealType[mealType].map(food => (
                <FoodItem key={food.foodId || food.name + food.time}>
                  <FoodName>
                    {food.name} ({food.quantity} {food.servingSize})
                  </FoodName>
                  <FoodMacros>
                    <span>{food.calories} cal</span>
                    <span>P: {Math.round(food.protein)}g</span>
                    <span>C: {Math.round(food.carbs)}g</span>
                    <span>F: {Math.round(food.fat)}g</span>
                    <DeleteButton 
                      onClick={() => food.foodId && handleDeleteFood(food.foodId, food.name)}
                      title="Remove from log"
                      aria-label={`Remove ${food.name} from log`}
                    >
                      ×
                    </DeleteButton>
                  </FoodMacros>
                </FoodItem>
              ))}
            </MealCard>
          ))
        )}
      </MealHistory>
    </Container>
  );
};

export default DashboardView;
