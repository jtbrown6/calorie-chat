import React, { createContext, useContext, useReducer, useEffect, ReactNode, useState, useCallback } from 'react';
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

    case 'LOAD_DATA': {
      // Merge loaded state with initial state to ensure all keys exist
      // Overwrite initial state values with loaded values where they exist
      const mergedState = {
        ...initialState, // Start with the default structure
        ...action.payload, // Overwrite with loaded data
      };
      // Ensure currentDate is always today's date on initial load,
      // regardless of the date potentially saved in the loaded state.
      mergedState.currentDate = format(new Date(), 'yyyy-MM-dd');
      return mergedState;
    }
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
  refreshData: () => Promise<void>;
  isRefreshing: boolean;
}

export const AppContext = createContext<AppContextProps | undefined>(undefined);

// Create provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isLoaded, setIsLoaded] = useState(false); // Flag to track initial load completion
  const [isRefreshing, setIsRefreshing] = useState(false); // Track refresh status for UI

  // Refresh data function - can be called manually and is used on initial load
  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Always clear any stale data from localStorage first
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('calorieChat');
      }
      
      // Fetch fresh data from server
      // In development, use the full URL, in production use relative URL
      const apiBaseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001';
      const response = await fetch(`${apiBaseUrl}/api/load-data`);
      
      if (response.ok) {
        // Parse the response data
        const loadedState = await response.json() as AppState;
        
        if (loadedState && typeof loadedState === 'object') {
          // Update application state with fresh data
          dispatch({ type: 'LOAD_DATA', payload: loadedState });
          
          // Update localStorage with fresh data as a fallback cache
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('calorieChat', JSON.stringify(loadedState));
          }
          
          console.log('Data refreshed successfully from server.');
        } else {
          console.warn('Received unexpected data format from server. Using initial state.', loadedState);
        }
      } else if (response.status === 404) {
        console.log('No saved data found on server (404). Using initial state.');
      } else {
        console.error(`Failed to load data from server. Status: ${response.status} ${response.statusText}`);
        
        // Fall back to any cached data if server is unavailable
        if (typeof window !== 'undefined' && window.localStorage) {
          const cachedData = localStorage.getItem('calorieChat');
          if (cachedData) {
            console.log('Falling back to cached data from localStorage');
            dispatch({ type: 'LOAD_DATA', payload: JSON.parse(cachedData) });
          }
        }
      }
    } catch (error) {
      console.error('Error refreshing data from server:', error);
      
      // Fall back to any cached data if error occurs
      if (typeof window !== 'undefined' && window.localStorage) {
        const cachedData = localStorage.getItem('calorieChat');
        if (cachedData) {
          console.log('Error occurred. Falling back to cached data from localStorage');
          dispatch({ type: 'LOAD_DATA', payload: JSON.parse(cachedData) });
        }
      }
    } finally {
      setIsRefreshing(false);
      if (!isLoaded) {
        setIsLoaded(true); // Mark initial loading as complete
      }
    }
  }, [isLoaded]);

  // Load data from API on mount
  useEffect(() => {
    refreshData();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Save data to SQLite database whenever state changes, but only after initial load is complete
  useEffect(() => {
    // Don't save until initial load attempt is finished
    if (!isLoaded || isRefreshing) {
      return;
    }

    const saveData = async () => {
      try {
        // Send state to server for database storage
        // In development, use the full URL, in production use relative URL
        const apiBaseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001';
        const response = await fetch(`${apiBaseUrl}/api/save-data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // Send the state object directly
          body: JSON.stringify(state), 
        });
        
        if (response.ok) {
          console.log('Data saved successfully to database.');
          
          // Update localStorage as fallback cache after successful server save
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('calorieChat', JSON.stringify(state));
          }
        } else {
          console.error('Failed to save data to server:', response.statusText);
        }
      } catch (error) {
        console.error('Error saving data to server:', error);
        
        // Still update localStorage as temporary backup if server save fails
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('calorieChat', JSON.stringify(state));
        }
      }
    };

    // Debounce saving to avoid excessive API calls
    const handler = setTimeout(() => {
      saveData();
    }, 500); // Save 500ms after the last state change

    return () => {
      clearTimeout(handler); // Cleanup timeout on unmount or if state changes again quickly
    };
  }, [state, isLoaded, isRefreshing]); // Run this effect whenever the state object changes

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
    // Add defensive check: ensure chatHistory exists before accessing property
    if (!state.chatHistory) {
      console.warn('getTodaysChatHistory called when state.chatHistory is undefined. Returning empty array.');
      return [];
    }
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
        refreshData,
        isRefreshing,
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
