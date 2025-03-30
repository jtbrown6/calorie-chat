import React, { useState } from 'react';
import styled from 'styled-components';
import { useAppContext } from '../../context/AppContext';
import { CustomFood } from '../../types';
import Button from '../common/Button';
import CustomFoodForm from './CustomFoodForm';

const Container = styled.div`
  max-width: 800px;
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

const FoodsList = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const FoodCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ theme }) => theme.spacing.lg};
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const FoodDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const FoodName = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ServingSize = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const MacroInfo = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const MacroItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.fontSizes.md};
`;

const Calories = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary.main};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const ActionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: row;
  }
`;

const ConfirmDeleteContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.error};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ConfirmMessage = styled.p`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const CustomFoodsView: React.FC = () => {
  const { state, addCustomFood, updateCustomFood, deleteCustomFood } = useAppContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFood, setEditingFood] = useState<CustomFood | null>(null);
  const [deletingFood, setDeletingFood] = useState<CustomFood | null>(null);
  
  const handleAddFood = (food: CustomFood) => {
    addCustomFood(food);
    setShowAddForm(false);
  };
  
  const handleUpdateFood = (food: CustomFood) => {
    updateCustomFood(food);
    setEditingFood(null);
  };
  
  const handleDeleteFood = () => {
    if (deletingFood) {
      deleteCustomFood(deletingFood.id);
      setDeletingFood(null);
    }
  };
  
  const sortedFoods = [...state.customFoods].sort((a, b) => 
    a.name.localeCompare(b.name)
  );
  
  return (
    <Container>
      <Header>
        <Title>Custom Foods</Title>
        <Button 
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingFood(null);
            setDeletingFood(null);
          }}
        >
          {showAddForm ? 'Cancel' : 'Add Custom Food'}
        </Button>
      </Header>
      
      {showAddForm && (
        <CustomFoodForm 
          onAddFood={handleAddFood} 
          onCancel={() => setShowAddForm(false)} 
        />
      )}
      
      {editingFood && (
        <CustomFoodForm 
          initialFood={editingFood} 
          onAddFood={handleUpdateFood} 
          onCancel={() => setEditingFood(null)} 
          isEditing 
        />
      )}
      
      {deletingFood && (
        <ConfirmDeleteContainer>
          <ConfirmMessage>
            Are you sure you want to delete "{deletingFood.name}"?
          </ConfirmMessage>
          <ButtonGroup>
            <Button 
              variant="outlined" 
              onClick={() => setDeletingFood(null)}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDeleteFood}
            >
              Delete
            </Button>
          </ButtonGroup>
        </ConfirmDeleteContainer>
      )}
      
      <FoodsList>
        {sortedFoods.length === 0 ? (
          <EmptyState>
            <h3>No custom foods yet</h3>
            <p>Add your favorite foods to quickly track them in your diet.</p>
            <Button 
              onClick={() => setShowAddForm(true)}
              variant="secondary"
            >
              Add Your First Food
            </Button>
          </EmptyState>
        ) : (
          sortedFoods.map((food) => (
            <FoodCard key={food.id}>
              <FoodDetails>
                <FoodName>{food.name}</FoodName>
                <ServingSize>Serving: {food.servingSize}</ServingSize>
                <Calories>{food.calories} calories</Calories>
                <MacroInfo>
                  <MacroItem>Protein: {food.protein}g</MacroItem>
                  <MacroItem>Carbs: {food.carbs}g</MacroItem>
                  <MacroItem>Fat: {food.fat}g</MacroItem>
                </MacroInfo>
              </FoodDetails>
              <ActionsContainer>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => {
                    setEditingFood(food);
                    setShowAddForm(false);
                    setDeletingFood(null);
                  }}
                >
                  Edit
                </Button>
                <Button 
                  variant="text" 
                  size="small" 
                  onClick={() => {
                    setDeletingFood(food);
                    setShowAddForm(false);
                    setEditingFood(null);
                  }}
                >
                  Delete
                </Button>
              </ActionsContainer>
            </FoodCard>
          ))
        )}
      </FoodsList>
    </Container>
  );
};

export default CustomFoodsView;
