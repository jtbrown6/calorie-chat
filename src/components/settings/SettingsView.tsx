import React, { useState } from 'react';
import styled from 'styled-components';
import { useAppContext } from '../../context/AppContext';
import Button from '../common/Button';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.primary.main};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const FormCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme }) => theme.colors.primary.light};
  font-family: ${({ theme }) => theme.fonts.main};
  font-size: ${({ theme }) => theme.fontSizes.md};
  transition: all ${({ theme }) => theme.transitions.short};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 2px rgba(110, 72, 170, 0.2);
  }
`;

const SliderContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const SliderGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const SliderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const SliderLabel = styled.label`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const SliderValue = styled.span`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.primary.main};
`;

const StyledSlider = styled.input`
  width: 100%;
  -webkit-appearance: none;
  height: 6px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: ${({ theme }) => theme.colors.background.main};
  outline: none;
  margin: ${({ theme }) => theme.spacing.sm} 0;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary.main};
    cursor: pointer;
    box-shadow: ${({ theme }) => theme.shadows.sm};
    transition: background ${({ theme }) => theme.transitions.short};
  }

  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary.main};
    cursor: pointer;
    box-shadow: ${({ theme }) => theme.shadows.sm};
    transition: background ${({ theme }) => theme.transitions.short};
    border: none;
  }

  &::-webkit-slider-thumb:hover {
    background: ${({ theme }) => theme.colors.primary.light};
  }

  &::-moz-range-thumb:hover {
    background: ${({ theme }) => theme.colors.primary.light};
  }
`;

const MacroDisplay = styled.div`
  display: flex;
  justify-content: space-around;
  margin-top: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.md};
  background-color: rgba(110, 72, 170, 0.1);
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const MacroItem = styled.div`
  text-align: center;
`;

const MacroLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const MacroPercentage = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary.main};
`;

const MacroGrams = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const SettingsView: React.FC = () => {
  const { state, updateSettings } = useAppContext();
  
  const [targetCalories, setTargetCalories] = useState(state.settings.targetCalories);
  const [proteinPercentage, setProteinPercentage] = useState(state.settings.macroRatio.protein);
  const [carbsPercentage, setCarbsPercentage] = useState(state.settings.macroRatio.carbs);
  const [fatPercentage, setFatPercentage] = useState(state.settings.macroRatio.fat);
  
  // Calculate grams based on percentages and calories
  const proteinGrams = Math.round((targetCalories * (proteinPercentage / 100)) / 4);
  const carbsGrams = Math.round((targetCalories * (carbsPercentage / 100)) / 4);
  const fatGrams = Math.round((targetCalories * (fatPercentage / 100)) / 9);
  
  const handleProteinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProtein = parseInt(e.target.value);
    
    // Adjust other macros proportionally
    const remainingPercentage = 100 - newProtein;
    const currentNonProteinTotal = carbsPercentage + fatPercentage;
    
    if (currentNonProteinTotal === 0) {
      // If both are 0, distribute equally
      setCarbsPercentage(remainingPercentage / 2);
      setFatPercentage(remainingPercentage / 2);
    } else {
      // Otherwise adjust proportionally
      const carbsRatio = carbsPercentage / currentNonProteinTotal;
      const newCarbs = Math.round(remainingPercentage * carbsRatio);
      setCarbsPercentage(newCarbs);
      setFatPercentage(remainingPercentage - newCarbs);
    }
    
    setProteinPercentage(newProtein);
  };
  
  const handleCarbsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCarbs = parseInt(e.target.value);
    
    // Adjust fat while keeping protein constant
    const maxPossibleCarbs = 100 - proteinPercentage;
    const validCarbs = Math.min(newCarbs, maxPossibleCarbs);
    
    setCarbsPercentage(validCarbs);
    setFatPercentage(100 - proteinPercentage - validCarbs);
  };
  
  const handleFatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFat = parseInt(e.target.value);
    
    // Adjust carbs while keeping protein constant
    const maxPossibleFat = 100 - proteinPercentage;
    const validFat = Math.min(newFat, maxPossibleFat);
    
    setFatPercentage(validFat);
    setCarbsPercentage(100 - proteinPercentage - validFat);
  };
  
  const handleSave = () => {
    updateSettings({
      targetCalories,
      macroRatio: {
        protein: proteinPercentage,
        carbs: carbsPercentage,
        fat: fatPercentage,
      },
      theme: state.settings.theme, // Preserve current theme
    });
  };
  
  const handleReset = () => {
    // Reset to default settings
    setTargetCalories(2000);
    setProteinPercentage(30);
    setCarbsPercentage(40);
    setFatPercentage(30);
  };
  
  return (
    <Container>
      <Header>
        <Title>Settings</Title>
        <Description>
          Customize your daily calorie target and macro nutrient distribution
        </Description>
      </Header>
      
      <FormCard>
        <FormGroup>
          <FormLabel htmlFor="targetCalories">Daily Calorie Target</FormLabel>
          <Input
            id="targetCalories"
            type="number"
            min={1000}
            max={5000}
            step={50}
            value={targetCalories}
            onChange={(e) => setTargetCalories(parseInt(e.target.value))}
          />
        </FormGroup>
        
        <SliderContainer>
          <h3>Macro Nutrient Distribution</h3>
          
          <SliderGroup>
            <SliderHeader>
              <SliderLabel htmlFor="proteinPercentage">Protein</SliderLabel>
              <SliderValue>{proteinPercentage}%</SliderValue>
            </SliderHeader>
            <StyledSlider
              id="proteinPercentage"
              type="range"
              min={10}
              max={60}
              value={proteinPercentage}
              onChange={handleProteinChange}
            />
          </SliderGroup>
          
          <SliderGroup>
            <SliderHeader>
              <SliderLabel htmlFor="carbsPercentage">Carbohydrates</SliderLabel>
              <SliderValue>{carbsPercentage}%</SliderValue>
            </SliderHeader>
            <StyledSlider
              id="carbsPercentage"
              type="range"
              min={10}
              max={80}
              value={carbsPercentage}
              onChange={handleCarbsChange}
            />
          </SliderGroup>
          
          <SliderGroup>
            <SliderHeader>
              <SliderLabel htmlFor="fatPercentage">Fat</SliderLabel>
              <SliderValue>{fatPercentage}%</SliderValue>
            </SliderHeader>
            <StyledSlider
              id="fatPercentage"
              type="range"
              min={10}
              max={70}
              value={fatPercentage}
              onChange={handleFatChange}
            />
          </SliderGroup>
          
          <MacroDisplay>
            <MacroItem>
              <MacroLabel>Protein</MacroLabel>
              <MacroPercentage>{proteinPercentage}%</MacroPercentage>
              <MacroGrams>{proteinGrams}g</MacroGrams>
            </MacroItem>
            <MacroItem>
              <MacroLabel>Carbs</MacroLabel>
              <MacroPercentage>{carbsPercentage}%</MacroPercentage>
              <MacroGrams>{carbsGrams}g</MacroGrams>
            </MacroItem>
            <MacroItem>
              <MacroLabel>Fat</MacroLabel>
              <MacroPercentage>{fatPercentage}%</MacroPercentage>
              <MacroGrams>{fatGrams}g</MacroGrams>
            </MacroItem>
          </MacroDisplay>
        </SliderContainer>
        
        <ButtonContainer>
          <Button variant="outlined" onClick={handleReset}>
            Reset to Default
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </ButtonContainer>
      </FormCard>
    </Container>
  );
};

export default SettingsView;
