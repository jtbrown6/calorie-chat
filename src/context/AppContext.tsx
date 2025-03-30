import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, ChatMessage, ConsumedFood, CustomFood, DailyEntry, UserSettings } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

// Initial state for the application
const initialState: AppState = {
  customFoods: [],
  dailyEntries: [],
  chatHistory: {},
  settings: {
    targetCalories: 2000,
    macroRatio: {
      protein: 30,
      carbs: 40,
      fat: 30,
    },
    theme: 'light',
  },
  currentDate: format(new Date(), 'yyyy-MM-dd'),
};

// Define action types
type Action =
  | { type: 'ADD_CUSTOM_FOOD'; payload: CustomFood }
  | { type: 'DELETE_CUSTOM_FOOD'; payload: string }
  | { type: 'UPDATE_CUSTOM_FOOD'; payload: CustomFood }
  | { type: 'ADD_CHAT_MESSAGE'; payload: { date: string; message: ChatMessage } }
  | { type: 'ADD_CONSUMED_FOOD'; payload: { date: string; food: ConsumedFood } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<UserSettings> }
  | { type: 'SET_CURRENT_DATE'; payload: string }
  | { type: 'LOAD_DATA'; payload: AppState }
  | { type: 'DELETE_CONSUMED_FOOD'; payload: { date: string; foodId: string } };

// Create reducer function
const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'ADD_CUSTOM_FOOD':
      return {
        ...state,
        customFoods: [...state.customFoods, action.payload],
      };

    case 'DELETE_CUSTOM_FOOD':
      return {
        ...state,
        customFoods: state.customFoods.filter((food) => food.id !== action.payload),
      };

    case 'UPDATE_CUSTOM_FOOD':
      return {
        ...state,
        customFoods: state.customFoods.map((food) =>
          food.id === action.payload.id ? action.payload : food
        ),
      };

    case 'ADD_CHAT_MESSAGE': {
      const { date, message } = action.payload;
      const dayMessages = state.chatHistory[date] || [];

      return {
        ...state,
        chatHistory: {
          ...state.chatHistory,
          [date]: [...dayMessages, message],
        },
      };
    }

    case 'ADD_CONSUMED_FOOD': {
      const { date, food } = action.payload;
      const existingEntry = state.dailyEntries.find((entry) => entry.date === date);

      if (existingEntry) {
        // Update existing entry
        return {
          ...state,
          dailyEntries: state.dailyEntries.map((entry) => {
            if (entry.date === date) {
              const updatedFoods = [...entry.foods, food];
              return {
                ...entry,
                foods: updatedFoods,
                totalCalories: updatedFoods.reduce((sum, f) => sum + f.calories, 0),
                totalProtein: updatedFoods.reduce((sum, f) => sum + f.protein, 0),
                totalCarbs: updatedFoods.reduce((sum, f) => sum + f.carbs, 0),
                totalFat: updatedFoods.reduce((sum, f) => sum + f.fat, 0),
              };
            }
            return entry;
          }),
        };
      } else {
        // Create new entry
        const newEntry: DailyEntry = {
          id: uuidv4(),
          date,
          foods: [food],
          totalCalories: food.calories,
          totalProtein: food.protein,
          totalCarbs: food.carbs,
          totalFat: food.fat,
        };
        return {
          ...state,
          dailyEntries: [...state.dailyEntries, newEntry],
        };
      }
    }

    case 'DELETE_CONSUMED_FOOD': {
      const { date, foodId } = action.payload;
      
      return {
        ...state,
        dailyEntries: state.dailyEntries.map((entry) => {
          if (entry.date === date) {
            const updatedFoods = entry.foods.filter((food) => food.foodId !== foodId);
            return {
              ...entry,
              foods: updatedFoods,
              totalCalories: updatedFoods.reduce((sum, f) => sum + f.calories, 0),
              totalProtein: updatedFoods.reduce((sum, f) => sum + f.protein, 0),
              totalCarbs: updatedFoods.reduce((sum, f) => sum + f.carbs, 0),
              totalFat: updatedFoods.reduce((sum, f) => sum + f.fat, 0),
            };
          }
          return entry;
        }),
      };
    }

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
      };

    case 'SET_CURRENT_DATE':
      return {
        ...state,
        currentDate: action.payload,
      };

    case 'LOAD_DATA':
      return action.payload;

    default:
      return state;
  }
};

// Create context
interface AppContextProps {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  addCustomFood: (food: Omit<CustomFood, 'id' | 'createdAt' | 'isCustom'>) => void;
  deleteCustomFood: (id: string) => void;
  updateCustomFood: (food: CustomFood) => void;
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  addConsumedFood: (food: Omit<ConsumedFood, 'foodId'>) => void;
  deleteConsumedFood: (foodId: string) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  setCurrentDate: (date: string) => void;
  getCustomFoodByName: (name: string) => CustomFood | undefined;
  getTodaysChatHistory: () => ChatMessage[];
  getTodaysEntry: () => DailyEntry | undefined;
}

export const AppContext = createContext<AppContextProps | undefined>(undefined);

// Create provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('calorieChat');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData) as AppState;
        dispatch({ type: 'LOAD_DATA', payload: parsedData });
      } catch (error) {
        console.error('Failed to load data from localStorage:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('calorieChat', JSON.stringify(state));
  }, [state]);

  // Helper functions
  const addCustomFood = (food: Omit<CustomFood, 'id' | 'createdAt' | 'isCustom'>) => {
    const newFood: CustomFood = {
      ...food,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      isCustom: true,
    };
    dispatch({ type: 'ADD_CUSTOM_FOOD', payload: newFood });
  };

  const deleteCustomFood = (id: string) => {
    dispatch({ type: 'DELETE_CUSTOM_FOOD', payload: id });
  };

  const updateCustomFood = (food: CustomFood) => {
    dispatch({ type: 'UPDATE_CUSTOM_FOOD', payload: food });
  };

  const addChatMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
    };
    dispatch({
      type: 'ADD_CHAT_MESSAGE',
      payload: { date: state.currentDate, message: newMessage },
    });
  };

  const addConsumedFood = (food: Omit<ConsumedFood, 'foodId'>) => {
    const newFood: ConsumedFood = {
      ...food,
      foodId: uuidv4(),
    };
    dispatch({
      type: 'ADD_CONSUMED_FOOD',
      payload: { date: state.currentDate, food: newFood },
    });
  };

  const deleteConsumedFood = (foodId: string) => {
    dispatch({
      type: 'DELETE_CONSUMED_FOOD',
      payload: { date: state.currentDate, foodId },
    });
  };

  const updateSettings = (settings: Partial<UserSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  };

  const setCurrentDate = (date: string) => {
    dispatch({ type: 'SET_CURRENT_DATE', payload: date });
  };

  const getCustomFoodByName = (name: string) => {
    const lowerName = name.toLowerCase();
    return state.customFoods.find(
      (food) => food.name.toLowerCase().includes(lowerName)
    );
  };

  const getTodaysChatHistory = () => {
    return state.chatHistory[state.currentDate] || [];
  };

  const getTodaysEntry = () => {
    return state.dailyEntries.find((entry) => entry.date === state.currentDate);
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        addCustomFood,
        deleteCustomFood,
        updateCustomFood,
        addChatMessage,
        addConsumedFood,
        deleteConsumedFood,
        updateSettings,
        setCurrentDate,
        getCustomFoodByName,
        getTodaysChatHistory,
        getTodaysEntry,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Create custom hook for using the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
