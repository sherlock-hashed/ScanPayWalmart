import React, { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import MealPlanner from "../components/meal/MealPlanner";
import MealScheduler from "../components/meal/MealScheduler";
import ConsolidatedShoppingList from "../components/meal/ConsolidatedShoppingList";
import IngredientCartList from "../components/meal/IngredientCartList";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Check, ShoppingCart, Sparkles, Calendar, List, Search } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/currency";
import { toast } from "@/hooks/use-toast";
import type { MealPlan } from "../types/mealPlan";

// --- Type Definitions ---
type Ingredient = {
  name: string;
  quantity: number;
  unit?: string;
  [key: string]: any;
};

type Recipe = {
  id?: string | number;
  name: string;
  ingredients: Ingredient[];
  [key: string]: any;
};

type Quantities = Record<string, number>;

// --- Main Component ---
function MealCartPlannerPage() {
  const [activeTab, setActiveTab] = useState("search");
  const [currentMealPlan, setCurrentMealPlan] = useState<MealPlan | null>(null);
  
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [servings, setServings] = useState<number>(1);
  const [displayedIngredients, setDisplayedIngredients] = useState<Ingredient[]>([]);
  const [quantities, setQuantities] = useState<Quantities>({});
  const [addingAll, setAddingAll] = useState(false);
  const { addToCart } = useCart();
  const [selectedType, setSelectedType] = useState("");
  const ingredientsSectionRef = useRef<HTMLDivElement>(null);
  const ingredientsTitleRef = useRef<HTMLDivElement>(null);
  const [showIngredientsAnimation, setShowIngredientsAnimation] = useState(false);
  const [showTitleHighlight, setShowTitleHighlight] = useState(false);

  // When a recipe is selected, initialize displayedIngredients and quantities
  useEffect(() => {
    if (selectedRecipe) {
      setDisplayedIngredients(
        selectedRecipe.ingredients.map((ing) => ({
          ...ing,
          quantity: Number((ing.quantity * servings).toFixed(2)),
          unit: ing.unit,
        }))
      );
      setQuantities(
        Object.fromEntries(
          selectedRecipe.ingredients.map((ing) => [
            ing.name,
            Math.max(1, servings),
          ])
        )
      );
      
      // Scroll to ingredients title first, then section after a short delay to ensure DOM is updated
      setTimeout(() => {
        if (ingredientsTitleRef.current) {
          ingredientsTitleRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          // Trigger animations after scroll
          setTimeout(() => {
            setShowIngredientsAnimation(true);
            setShowTitleHighlight(true);
            // Remove highlight after 2 seconds
            setTimeout(() => setShowTitleHighlight(false), 2000);
          }, 300);
        }
      }, 100);
    } else {
      setDisplayedIngredients([]);
      setQuantities({});
      setShowIngredientsAnimation(false);
      setShowTitleHighlight(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRecipe]);

  // When servings change, rescale displayedIngredients and quantities
  useEffect(() => {
    if (selectedRecipe) {
      setDisplayedIngredients((prev) =>
        selectedRecipe.ingredients
          .filter((ing) => prev.some((d) => d.name === ing.name))
          .map((ing) => ({
            ...ing,
            quantity: Number((ing.quantity * servings).toFixed(2)),
            unit: ing.unit,
          }))
      );
      setQuantities((prevQuantities) => {
        const updated: Quantities = { ...prevQuantities };
        selectedRecipe.ingredients.forEach((ing) => {
          updated[ing.name] = Math.max(1, servings);
        });
        return updated;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [servings]);

  // Remove ingredient from planner (from UI only)
  const handleRemoveIngredient = (productName: string) => {
    setDisplayedIngredients((prev) =>
      prev.filter((ing) => ing.name !== productName)
    );
    setQuantities((prev) => {
      const updated: Quantities = { ...prev };
      delete updated[productName];
      return updated;
    });
  };

  // Add all ingredients to cart
  const handleAddAllToCart = async () => {
    setAddingAll(true);

    try {
      for (const ing of displayedIngredients) {
        const quantity = quantities[ing.name] || ing.quantity || 1;

        addToCart(
          {
            id: String(ing.id || ing.name),
            name: ing.name,
            price: ing.price ?? 50,
            currency: "INR",
            qrCodeId: ing.qrCodeId || `QR-${ing.name}`,
            imageURL: ing.imageURL ?? "https://via.placeholder.com/120x120?text=No+Image",
            brand: ing.brand ?? "Generic",
            category: ing.category ?? "Ingredient",
            description: ing.description ?? "No description available.",
            ratings: ing.ratings ?? 4.0,
            numReviews: ing.numReviews ?? 0,
            stock: ing.stock ?? 25,
            weight: ing.weight ?? ing.unit ?? "unit",
          },
          quantity
        );
      }

      toast({
        title: "🎉 Success!",
        description: `Added all ${displayedIngredients.length} ingredients to your cart`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add some ingredients to cart",
        variant: "destructive",
      });
    } finally {
      setAddingAll(false);
    }
  };

  const handleUpdatePlan = (plan: MealPlan) => {
    setCurrentMealPlan(plan);
  };

  const handleSavePlan = (plan: MealPlan) => {
    setCurrentMealPlan(plan);
    // Here you would typically save to backend
    console.log("Saving meal plan:", plan);
  };

  const totalIngredients = displayedIngredients.length;
  const totalCost = displayedIngredients.reduce((sum: number, ing: Ingredient) => {
    const price = ing.price ?? 0;
    const quantity = quantities[ing.name] || 1;
    return sum + price * quantity;
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Shop & Simmer
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mt-10">
            Plan your perfect meals and get all ingredients delivered to your door
          </p>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Recipe Search
            </TabsTrigger>
            <TabsTrigger value="planner" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Meal Planner
            </TabsTrigger>
            <TabsTrigger value="shopping" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Shopping List
            </TabsTrigger>
          </TabsList>

          {/* Recipe Search Tab */}
          <TabsContent value="search" className="space-y-8">
            <MealPlanner
              onSelectRecipe={(recipe: any) => {
                setSelectedRecipe(recipe);
                if (recipe) {
                  setServings(1);
                }
              }}
              selectedRecipe={selectedRecipe as any}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
            />

            {/* Selected Recipe Details */}
            {selectedRecipe && (
              <div className="space-y-6">
                {/* Recipe Summary Card */}
                <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/10 shadow rounded-lg w-280">
                  <CardContent className="p-2 sm:p-3">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
                      {/* Left: Info */}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <div className="p-1 bg-primary/20 rounded flex items-center justify-center">
                            <ShoppingCart className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-base sm:text-lg font-bold text-foreground leading-tight">
                              Shopping List Ready
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {selectedRecipe.name} • {servings} serving{servings > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 sm:gap-2 mt-1">
                          <Badge variant="secondary" className="bg-primary/10 text-primary text-xs px-2 py-0.5 ml-7">
                            {totalIngredients} ingredients
                          </Badge>
                        </div>
                      </div>
                      {/* Right: Add All Button */}
                      {totalIngredients > 0 && (
                        <div className="w-full md:w-auto mt-2 md:mt-0 flex-shrink-0 flex items-center justify-end">
                          <Button
                            onClick={handleAddAllToCart}
                            disabled={addingAll}
                            size="sm"
                            className="w-full md:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow transition-all duration-300 px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base font-semibold rounded"
                          >
                            {addingAll ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-2"></div>
                                Adding...
                              </>
                            ) : (
                              <>
                                <Check className="h-3 w-3 mr-2" />
                                Add All to Cart
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Ingredients List */}
                <div ref={ingredientsSectionRef} className={`space-y-6 transition-all duration-500 ${showIngredientsAnimation ? 'animate-in slide-in-from-bottom-4' : 'opacity-0 translate-y-4'}`}>
                  <div ref={ingredientsTitleRef} className={`flex items-center justify-between transition-all duration-500 ${showTitleHighlight ? 'bg-primary/5 rounded-lg p-4 border border-primary/20' : ''}`}>
                    <h3 className={`text-2xl font-bold transition-colors duration-500 ${showTitleHighlight ? 'text-primary' : 'text-foreground'}`}>
                      Ingredients & Quantities
                    </h3>
                    <p className="text-muted-foreground">
                      Adjust quantities and add individual items to your cart
                    </p>
                  </div>

                  <IngredientCartList
                    ingredients={displayedIngredients}
                    onRemove={handleRemoveIngredient}
                    servings={servings}
                    setServings={setServings}
                    quantities={quantities}
                    setQuantities={setQuantities}
                  />
                </div>
              </div>
            )}
          </TabsContent>

          {/* Meal Planner Tab */}
          <TabsContent value="planner">
            <MealScheduler
              mealPlan={currentMealPlan}
              onUpdatePlan={handleUpdatePlan}
              onSavePlan={handleSavePlan}
            />
          </TabsContent>

          {/* Shopping List Tab */}
          <TabsContent value="shopping">
            <ConsolidatedShoppingList mealPlan={currentMealPlan} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default MealCartPlannerPage;
