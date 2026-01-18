// Firebase integration for recipes
import { ref, get, child } from 'firebase/database';
import { db } from './firebase';

export interface RecipeIngredient {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  qrCodeId: string;
  stock: number;
  imageURL: string;
  category: string;
  brand: string;
  weight: string;
  ratings: number;
  numReviews: number;
}

export interface Recipe {
  id: number;
  name: string;
  description: string;
  ingredients: RecipeIngredient[];
  type: string;
}

// Function to fetch all recipes from Firebase
export const fetchRecipes = async (): Promise<Recipe[]> => {
  try {
    console.log('🔍 fetchRecipes called');
    const recipesRef = ref(db, 'recipes');
    const snapshot = await get(recipesRef);
    
    if (snapshot.exists()) {
      const recipesData = snapshot.val();
      console.log('📊 Raw recipes data from Firebase:', recipesData);
      
      // Convert object to array and ensure proper structure
      const recipesArray = Object.values(recipesData).map((recipe: any) => ({
        id: recipe.id,
        name: recipe.name,
        description: recipe.description,
        ingredients: Array.isArray(recipe.ingredients)
          ? recipe.ingredients
          : Object.values(recipe.ingredients || {}),
        type: recipe.type
      }));
      
      console.log(`✅ Successfully fetched ${recipesArray.length} recipes from Firebase:`, recipesArray.map(r => ({ name: r.name, type: r.type })));
      return recipesArray as Recipe[];
    } else {
      console.log('❌ No recipes found in Firebase');
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching recipes from Firebase:', error);
    return [];
  }
};

// Function to fetch a specific recipe by ID
export const fetchRecipeById = async (recipeId: number): Promise<Recipe | null> => {
  try {
    const recipesRef = ref(db, 'recipes');
    const snapshot = await get(recipesRef);
    
    if (snapshot.exists()) {
      const recipesData = snapshot.val();
      const recipe = Object.values(recipesData).find((r: any) => r.id === recipeId) as any;
      
      if (recipe) {
        return {
          id: recipe.id,
          name: recipe.name,
          description: recipe.description,
          ingredients: Array.isArray(recipe.ingredients)
            ? recipe.ingredients
            : Object.values(recipe.ingredients || {}),
          type: recipe.type
        } as Recipe;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching recipe by ID from Firebase:', error);
    return null;
  }
};

// Function to fetch recipes by type
export const fetchRecipesByType = async (type: string): Promise<Recipe[]> => {
  try {
    console.log('🔍 fetchRecipesByType called with type:', type);
    const recipesRef = ref(db, 'recipes');
    const snapshot = await get(recipesRef);
    
    if (snapshot.exists()) {
      const recipesData = snapshot.val();
      console.log('📊 All recipes from Firebase:', Object.keys(recipesData));
      
      // Log all available types
      const allTypes = Object.values(recipesData).map((recipe: any) => recipe.type);
      console.log('🏷️ All available types in Firebase:', [...new Set(allTypes)]);
      
      const filteredRecipes = Object.values(recipesData)
        .filter((recipe: any) => {
          const matches = recipe.type === type;
          console.log(`🔍 Recipe "${recipe.name}" (type: "${recipe.type}") matches "${type}": ${matches}`);
          return matches;
        })
        .map((recipe: any) => ({
          id: recipe.id,
          name: recipe.name,
          description: recipe.description,
          ingredients: Array.isArray(recipe.ingredients)
            ? recipe.ingredients
            : Object.values(recipe.ingredients || {}),
          type: recipe.type
        }));
      
      console.log(`✅ Found ${filteredRecipes.length} recipes for type "${type}":`, filteredRecipes.map(r => r.name));
      return filteredRecipes as Recipe[];
    } else {
      console.log('❌ No recipes found in Firebase');
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching recipes by type from Firebase:', error);
    return [];
  }
};

// Function to search recipes by name or description
export const searchRecipes = async (searchTerm: string): Promise<Recipe[]> => {
  try {
    const recipesRef = ref(db, 'recipes');
    const snapshot = await get(recipesRef);
    
    if (snapshot.exists()) {
      const recipesData = snapshot.val();
      const searchLower = searchTerm.toLowerCase();
      
      const filteredRecipes = Object.values(recipesData)
        .filter((recipe: any) => 
          recipe.name.toLowerCase().includes(searchLower) ||
          recipe.description.toLowerCase().includes(searchLower)
        )
        .map((recipe: any) => ({
          id: recipe.id,
          name: recipe.name,
          description: recipe.description,
          ingredients: Array.isArray(recipe.ingredients)
            ? recipe.ingredients
            : Object.values(recipe.ingredients || {}),
          type: recipe.type
        }));
      
      return filteredRecipes as Recipe[];
    }
    
    return [];
  } catch (error) {
    console.error('Error searching recipes from Firebase:', error);
    return [];
  }
};

// Export empty array as fallback (for backward compatibility)
export const recipes: Recipe[] = []; 