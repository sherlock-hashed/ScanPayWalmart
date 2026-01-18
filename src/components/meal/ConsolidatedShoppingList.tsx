import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ShoppingBag, Plus } from "lucide-react";
import { formatPrice } from "../../lib/currency";
import type { ConsolidatedIngredient, MealPlan } from "@/types/mealPlan";
import { fetchRecipes } from "../../lib/recipes";
import { useCart } from "../../context/CartContext";
import { toast } from "@/hooks/use-toast";

interface ConsolidatedShoppingListProps {
  mealPlan: MealPlan | null;
}

const ConsolidatedShoppingList: React.FC<ConsolidatedShoppingListProps> = ({ mealPlan }) => {
  const [consolidatedIngredients, setConsolidatedIngredients] = useState<ConsolidatedIngredient[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [isAddingAll, setIsAddingAll] = useState(false);
  const [recipes, setRecipes] = useState<any[]>([]);
  const { addToCart } = useCart();

  // Fetch recipes from Firebase
  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const fetchedRecipes = await fetchRecipes();
        setRecipes(fetchedRecipes);
      } catch (error) {
        console.error('Error loading recipes:', error);
      }
    };

    loadRecipes();
  }, []);

  const consolidateIngredients = () => {
    if (!mealPlan || recipes.length === 0) return;

    const ingredientMap = new Map<string, ConsolidatedIngredient>();

    mealPlan.schedule.forEach(day => {
      day.meals.forEach(meal => {
        const recipe = recipes.find(r => r.id.toString() === meal.recipeId);
        if (!recipe) return;

        recipe.ingredients.forEach(ingredient => {
          const defaultQuantity = 1; // fallback quantity
          const defaultUnit = "unit"; // fallback unit
          const scaledQuantity = defaultQuantity * meal.servings;
          const key = ingredient.name.toLowerCase();

          if (ingredientMap.has(key)) {
            const existing = ingredientMap.get(key)!;
            existing.totalQuantity += scaledQuantity;
            existing.totalPrice = existing.totalQuantity * existing.pricePerUnit;
            existing.breakdown.push({
              recipeName: meal.recipeName,
              quantity: scaledQuantity,
              unit: defaultUnit,
            });
          } else {
            const pricePerUnit = ingredient.price || 50;
            ingredientMap.set(key, {
              name: ingredient.name,
              totalQuantity: scaledQuantity,
              unit: defaultUnit,
              imageURL: ingredient.imageURL || "https://via.placeholder.com/48x48?text=Ingredient",
              brand: ingredient.brand || "Generic",
              category: ingredient.category || "Ingredient",
              pricePerUnit,
              totalPrice: scaledQuantity * pricePerUnit,
              breakdown: [{
                recipeName: meal.recipeName,
                quantity: scaledQuantity,
                unit: defaultUnit,
              }],
            });
          }
        });
      });
    });

    setConsolidatedIngredients(Array.from(ingredientMap.values()));
  };

  useEffect(() => {
    consolidateIngredients();
  }, [mealPlan, recipes]);

  const filteredIngredients = consolidatedIngredients.filter(ingredient => {
    if (filter === "all") return true;
    return ingredient.category.toLowerCase() === filter.toLowerCase();
  });

  const totalCost = consolidatedIngredients.reduce((sum, ingredient) => sum + ingredient.totalPrice, 0);
  const categories = Array.from(new Set(consolidatedIngredients.map(i => i.category)));

  const handleAddAllToCart = async () => {
    setIsAddingAll(true);

    try {
      for (const ingredient of consolidatedIngredients) {
        addToCart({
          id: ingredient.name.toLowerCase().replace(/\s+/g, '-'),
          name: ingredient.name,
          price: ingredient.pricePerUnit,
          currency: "INR",
          qrCodeId: `SP-${ingredient.name.toUpperCase().replace(/\s+/g, '-')}`,
          stock: 100,
          imageURL: ingredient.imageURL,
          category: ingredient.category,
          brand: ingredient.brand,
          description: `Consolidated from: ${ingredient.breakdown.map(b => b.recipeName).join(', ')}`,
          ratings: 4.0,
          numReviews: 0,
          weight: `${ingredient.totalQuantity} ${ingredient.unit}`,
        }, Math.ceil(ingredient.totalQuantity));
      }

      toast({
        title: "🎉 Shopping List Added!",
        description: `Added ${consolidatedIngredients.length} ingredients to your cart`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add some ingredients to cart",
        variant: "destructive",
      });
    } finally {
      setIsAddingAll(false);
    }
  };

  if (!mealPlan) {
    return (
      <Card className="p-8 text-center">
        <CardContent>
          <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Meal Plan Selected</h3>
          <p className="text-muted-foreground">Create a meal plan to generate your shopping list</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShoppingBag className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-3xl font-bold">Your Consolidated Shopping List</h2>
            <p className="text-muted-foreground">From: {mealPlan.planName}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleAddAllToCart}
            disabled={isAddingAll || consolidatedIngredients.length === 0}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary px-6"
          >
            {isAddingAll ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Adding...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add All to Cart
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border border-green-200 dark:border-green-800">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">{consolidatedIngredients.length}</p>
              <p className="text-sm text-green-600 dark:text-green-400">Total Ingredients</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">{mealPlan.schedule.reduce((sum, day) => sum + day.meals.length, 0)}</p>
              <p className="text-sm text-green-600 dark:text-green-400">Planned Meals</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">{formatPrice(totalCost)}</p>
              <p className="text-sm text-green-600 dark:text-green-400">Estimated Total</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ingredients List */}
      <div className="space-y-3">
        {filteredIngredients.length === 0 ? (
          <Card className="p-8 text-center">
            <CardContent>
              <h3 className="text-lg font-semibold mb-2">No ingredients found</h3>
              <p className="text-muted-foreground">Try adjusting your filter or add recipes to your meal plan</p>
            </CardContent>
          </Card>
        ) : (
          filteredIngredients.map((ingredient, idx) => (
            <motion.div
              key={ingredient.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              layout
            >
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={ingredient.imageURL}
                        alt={ingredient.name}
                        className="w-12 h-12 rounded-md object-cover"
                      />
                      <div>
                        <h4 className="font-semibold text-foreground">{ingredient.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {ingredient.brand && <span className="font-medium">{ingredient.brand}</span>}
                          {ingredient.brand && ingredient.category && " - "}
                          {ingredient.category && <span>{ingredient.category}</span>}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Used in: {ingredient.breakdown.map(b => b.recipeName).join(", ")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Badge variant="default" className="text-base font-bold px-3 py-1">
                        {ingredient.totalQuantity.toFixed(2)} {ingredient.unit}
                      </Badge>
                      <span className="text-lg font-bold text-primary">{formatPrice(ingredient.totalPrice)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConsolidatedShoppingList;
