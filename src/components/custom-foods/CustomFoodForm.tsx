import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { CustomFood } from '../../types';
import Button from '../common/Button';
import { v4 as uuidv4 } from 'uuid';

interface CustomFoodFormProps {
  onAddFood: (food: CustomFood) => void;
  initialFood?: CustomFood;
  onCancel?: () => void;
  isEditing?: boolean;
}

const FormContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Title = styled.h3`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.primary.main};
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const FullWidthGroup = styled(FormGroup)`
  grid-column: 1 / -1;
`;

const Label = styled.label`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Input = styled.input`
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

  &:disabled {
    background-color: ${({ theme }) => theme.colors.background.main};
    cursor: not-allowed;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.md};
  grid-column: 1 / -1;
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const InfoMessage = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-top: ${({ theme }) => theme.spacing.xs};
  font-style: italic;
`;

const initialFormState = {
  name: '',
  servingSize: '',
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  isCustom: true as const,
  createdAt: new Date().toISOString(),
};

// Constants for calorie calculation
const PROTEIN_CALORIES_PER_GRAM = 4;
const CARBS_CALORIES_PER_GRAM = 4;
const FAT_CALORIES_PER_GRAM = 9;

const CustomFoodForm: React.FC<CustomFoodFormProps> = ({
  onAddFood,
  initialFood,
  onCancel,
  isEditing = false,
}) => {
  const [formData, setFormData] = useState<Omit<CustomFood, 'id'>>(
    initialFood
      ? {
          name: initialFood.name,
          servingSize: initialFood.servingSize,
          calories: initialFood.calories,
          protein: initialFood.protein,
          carbs: initialFood.carbs,
          fat: initialFood.fat,
          isCustom: true as const,
          createdAt: initialFood.createdAt,
        }
      : initialFormState
  );
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate calories whenever protein, carbs, or fat changes
  useEffect(() => {
    const calculatedCalories = Math.round(
      formData.protein * PROTEIN_CALORIES_PER_GRAM +
      formData.carbs * CARBS_CALORIES_PER_GRAM +
      formData.fat * FAT_CALORIES_PER_GRAM
    );
    
    if (calculatedCalories !== formData.calories) {
      setFormData(prev => ({
        ...prev,
        calories: calculatedCalories
      }));
    }
  }, [formData.protein, formData.carbs, formData.fat]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Skip if trying to modify calories directly
    if (name === 'calories') {
      return;
    }
    
    // For numeric fields, convert to number
    if (['protein', 'carbs', 'fat'].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        [name]: value === '' ? 0 : parseFloat(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.servingSize.trim()) {
      newErrors.servingSize = 'Serving size is required';
    }
    
    // Validate numbers are positive
    ['protein', 'carbs', 'fat'].forEach((field) => {
      const value = formData[field as keyof typeof formData] as number;
      if (value < 0) {
        newErrors[field] = 'Cannot be negative';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const newFood: CustomFood = {
      id: initialFood?.id || uuidv4(),
      ...formData,
    };
    
    onAddFood(newFood);
    
    if (!isEditing) {
      setFormData({
        ...initialFormState,
        createdAt: new Date().toISOString() // Reset with a fresh timestamp
      });
    }
    
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <FormContainer>
      <Title>{isEditing ? 'Edit Custom Food' : 'Add Custom Food'}</Title>
      <Form onSubmit={handleSubmit}>
        <FullWidthGroup>
          <Label htmlFor="name">Food Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Protein Chips"
          />
          {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
        </FullWidthGroup>
        
        <FullWidthGroup>
          <Label htmlFor="servingSize">Serving Size</Label>
          <Input
            id="servingSize"
            name="servingSize"
            value={formData.servingSize}
            onChange={handleChange}
            placeholder="e.g., 1 bag, 30g"
          />
          {errors.servingSize && <ErrorMessage>{errors.servingSize}</ErrorMessage>}
        </FullWidthGroup>
        
        <FormGroup>
          <Label htmlFor="calories">Calories</Label>
          <Input
            id="calories"
            name="calories"
            type="number"
            value={formData.calories || ''}
            readOnly
            disabled
            style={{ backgroundColor: '#f0f0f0' }}
          />
          <InfoMessage>Auto-calculated from macros</InfoMessage>
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="protein">Protein (g)</Label>
          <Input
            id="protein"
            name="protein"
            type="number"
            value={formData.protein || ''}
            onChange={handleChange}
            placeholder="e.g., 12"
          />
          {errors.protein && <ErrorMessage>{errors.protein}</ErrorMessage>}
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="carbs">Carbs (g)</Label>
          <Input
            id="carbs"
            name="carbs"
            type="number"
            value={formData.carbs || ''}
            onChange={handleChange}
            placeholder="e.g., 13"
          />
          {errors.carbs && <ErrorMessage>{errors.carbs}</ErrorMessage>}
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="fat">Fat (g)</Label>
          <Input
            id="fat"
            name="fat"
            type="number"
            value={formData.fat || ''}
            onChange={handleChange}
            placeholder="e.g., 6"
          />
          {errors.fat && <ErrorMessage>{errors.fat}</ErrorMessage>}
        </FormGroup>
        
        <ButtonContainer>
          {onCancel && (
            <Button type="button" variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">{isEditing ? 'Save Changes' : 'Add Food'}</Button>
        </ButtonContainer>
      </Form>
    </FormContainer>
  );
};

export default CustomFoodForm;
