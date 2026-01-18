
export interface MealPlan {
  id: string;
  userId: string;
  planName: string;
  durationType: "week" | "custom_days" | "date_range";
  startDate?: Date;
  endDate?: Date;
  numberOfDays?: number;
  scenario: string;
  schedule: DaySchedule[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DaySchedule {
  date: Date;
  dayOfWeek: string;
  meals: MealSlot[];
}

export interface MealSlot {
  mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  recipeId: string;
  recipeName: string;
  servings: number;
  imageURL?: string;
}

export interface ConsolidatedIngredient {
  name: string;
  totalQuantity: number;
  unit: string;
  imageURL: string;
  brand: string;
  category: string;
  pricePerUnit: number;
  totalPrice: number;
  breakdown: { recipeName: string; quantity: number; unit: string }[];
}
