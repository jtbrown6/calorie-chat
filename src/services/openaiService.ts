import OpenAI from 'openai';
import { CustomFood } from '../types';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface NutritionResponse {
  name: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export async function analyzeFood(
  foodDescription: string,
  customFoods: CustomFood[]
): Promise<NutritionResponse[]> {
  try {
    // First check if the food matches any custom food
    const customFoodMatches = checkForCustomFoods(foodDescription, customFoods);
    if (customFoodMatches.length > 0) {
      return customFoodMatches.map(food => ({
        name: food.name,
        servingSize: food.servingSize,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat
      }));
    }

    // If no custom food match, use OpenAI to analyze
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a nutrition analysis assistant. 
          Extract the foods mentioned, estimate their serving sizes, and provide nutritional information.
          Format your response as a JSON object with a 'foods' array containing objects with these fields:
          name (string), servingSize (string), calories (number), protein (number in grams), 
          carbs (number in grams), fat (number in grams).
          
          Example response format:
          {
            "foods": [
              {
                "name": "Cooked Chicken Breast",
                "servingSize": "2 oz",
                "calories": 110,
                "protein": 23,
                "carbs": 0,
                "fat": 2.5
              }
            ]
          }
          
          Provide your best estimate for nutritional information based on standard values.
          Return ONLY the JSON object, without any explanations or additional text.`
        },
        {
          role: "user",
          content: foodDescription
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    try {
      const parsedContent = JSON.parse(content);
      
      // Check if the response is an array directly
      if (Array.isArray(parsedContent)) {
        return parsedContent;
      }
      
      // Check if there's a 'foods' property (as expected in the original code)
      if (parsedContent.foods && Array.isArray(parsedContent.foods)) {
        return parsedContent.foods;
      }
      
      // If it's an object but not in the expected format, look for any array property
      for (const key in parsedContent) {
        if (Array.isArray(parsedContent[key])) {
          return parsedContent[key];
        }
      }
      
      // If it's a single food item (not in an array)
      if (typeof parsedContent === 'object' && 
          parsedContent.name && 
          (typeof parsedContent.calories === 'number' || 
           typeof parsedContent.calories === 'string')) {
        return [parsedContent];
      }
      
      console.log('Unexpected response format:', parsedContent);
      return [];
    } catch (error) {
      console.error('Error parsing OpenAI response:', error, 'Content:', content);
      throw new Error('Failed to parse OpenAI response');
    }
  } catch (error) {
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error analyzing food:', {
        message: error.message,
        stack: error.stack,
        foodDescription
      });
    } else {
      console.error('Unknown error analyzing food:', error, { foodDescription });
    }
    throw error;
  }
}

function checkForCustomFoods(
  foodDescription: string,
  customFoods: CustomFood[]
): CustomFood[] {
  const lowerDescription = foodDescription.toLowerCase();
  return customFoods.filter(food => 
    lowerDescription.includes(food.name.toLowerCase())
  );
}
