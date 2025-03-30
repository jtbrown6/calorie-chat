export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  createdAt: string;
}

export interface CustomFood extends FoodItem {
  isCustom: true;
}

export interface DailyEntry {
  id: string;
  date: string;
  foods: ConsumedFood[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface ConsumedFood {
  foodId: string;
  name: string;
  servingSize: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  time: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  foodItems?: ConsumedFood[];
}

export interface UserSettings {
  targetCalories: number;
  macroRatio: {
    protein: number;
    carbs: number;
    fat: number;
  };
  theme: 'light' | 'dark';
}

export interface AppState {
  customFoods: CustomFood[];
  dailyEntries: DailyEntry[];
  chatHistory: Record<string, ChatMessage[]>;
  settings: UserSettings;
  currentDate: string;
}
