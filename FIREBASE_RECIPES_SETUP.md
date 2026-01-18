# Firebase Recipes Integration

This document explains how recipes have been integrated with Firebase Realtime Database.

## Overview

The recipes system has been migrated from local data to Firebase Realtime Database for better scalability and real-time updates.

## Firebase Structure

The recipes are stored in the Firebase Realtime Database under the `recipes` node:

```json
{
  "recipes": {
    "recipe1": {
      "id": 2,
      "name": "Methi Thepla (Low-Fat)",
      "description": "Nutritious Gujarati flatbread...",
      "ingredients": [...],
      "type": "Diabetic-Friendly"
    },
    "recipe2": {
      "id": 3,
      "name": "Moong Dal Chilla",
      "description": "Protein-packed savory Indian pancakes...",
      "ingredients": [...],
      "type": "Diabetic-Friendly"
    }
  }
}
```

## API Functions

### `fetchRecipes()`
Fetches all recipes from Firebase.

```typescript
import { fetchRecipes } from '@/lib/recipes';

const recipes = await fetchRecipes();
```

### `fetchRecipeById(recipeId: number)`
Fetches a specific recipe by its ID.

```typescript
import { fetchRecipeById } from '@/lib/recipes';

const recipe = await fetchRecipeById(2);
```

### `fetchRecipesByType(type: string)`
Fetches all recipes of a specific type (e.g., "Diabetic-Friendly").

```typescript
import { fetchRecipesByType } from '@/lib/recipes';

const diabeticRecipes = await fetchRecipesByType("Diabetic-Friendly");
```

### `searchRecipes(searchTerm: string)`
Searches recipes by name or description.

```typescript
import { searchRecipes } from '@/lib/recipes';

const searchResults = await searchRecipes("thepla");
```

## Data Structure

### Recipe Interface
```typescript
interface Recipe {
  id: number;
  name: string;
  description: string;
  ingredients: RecipeIngredient[];
  type: string;
}
```

### RecipeIngredient Interface
```typescript
interface RecipeIngredient {
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
```

## Migration Steps

1. **Backup Local Data**: The original recipes data has been preserved in the old `recipes.ts` file
2. **Firebase Import**: Recipes have been added to `firebase-merged-final.json`
3. **Code Update**: `recipes.ts` now uses Firebase functions instead of local data
4. **Backward Compatibility**: The `recipes` array is still exported as an empty array for compatibility

## Usage Examples

### React Component Example
```typescript
import React, { useState, useEffect } from 'react';
import { fetchRecipes, Recipe } from '@/lib/recipes';

function RecipeList() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const data = await fetchRecipes();
        setRecipes(data);
      } catch (error) {
        console.error('Failed to load recipes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecipes();
  }, []);

  if (loading) return <div>Loading recipes...</div>;

  return (
    <div>
      {recipes.map(recipe => (
        <div key={recipe.id}>
          <h3>{recipe.name}</h3>
          <p>{recipe.description}</p>
        </div>
      ))}
    </div>
  );
}
```

### Search Functionality
```typescript
import { searchRecipes } from '@/lib/recipes';

const handleSearch = async (searchTerm: string) => {
  if (searchTerm.trim()) {
    const results = await searchRecipes(searchTerm);
    setSearchResults(results);
  } else {
    setSearchResults([]);
  }
};
```

## Error Handling

All Firebase functions include proper error handling:

- Network errors are caught and logged
- Empty results are handled gracefully
- TypeScript interfaces ensure type safety

## Benefits

1. **Real-time Updates**: Changes to recipes in Firebase are immediately available
2. **Scalability**: Can handle large numbers of recipes without performance issues
3. **Centralized Management**: All recipe data is managed in one place
4. **Offline Support**: Firebase provides offline capabilities
5. **Search Functionality**: Built-in search across recipe names and descriptions

## Next Steps

1. **Add More Recipes**: Continue adding recipes to the Firebase database
2. **Recipe Categories**: Implement filtering by recipe categories
3. **User Favorites**: Add functionality for users to save favorite recipes
4. **Recipe Ratings**: Implement user rating system for recipes
5. **Recipe Sharing**: Add social sharing capabilities 