import React, { useState, useEffect } from "react";
import { fetchRecipes, fetchRecipesByType } from "../../lib/recipes";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Search, ChefHat, Clock, Users } from "lucide-react";
import { ExampleCombobox } from "@/components/ui/Combobox";

type Recipe = {
  id: string | number;
  name: string;
  [key: string]: any;
};

type MealPlannerProps = {
  onSelectRecipe: (recipe: Recipe) => void;
  selectedRecipe: Recipe | null;
  selectedType: string;
  setSelectedType: (type: string) => void;
};

const categoryOptions = [
  { value: "", label: "All" },
  { value: "Diabetic-Friendly", label: "Diabetic-Friendly" },
  { value: "Low Sugar", label: "Low Sugar" },
  { value: "Low Carb", label: "Low Carb" },
  { value: "High Protein", label: "High Protein" },
  { value: "Heart-Healthy", label: "Heart-Healthy" },
  { value: "Weight Loss", label: "Weight Loss" },
  { value: "Low Fat", label: "Low Fat" },
  { value: "Quick Meal", label: "Quick Meal (≤ 15 mins)" },
  { value: "Breakfast", label: "Breakfast" },
  { value: "Lunch", label: "Lunch" },
  { value: "Dinner", label: "Dinner" },
];

const MealPlanner: React.FC<MealPlannerProps> = ({
  onSelectRecipe,
  selectedRecipe,
  selectedType,
  setSelectedType,
}) => {
  const [search, setSearch] = useState<string>("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch recipes from Firebase
  useEffect(() => {
    const loadRecipes = async () => {
      try {
        console.log('🔄 Loading recipes from Firebase...');
        const fetchedRecipes = await fetchRecipes();
        console.log('📋 Recipes loaded:', fetchedRecipes.length);
        setRecipes(fetchedRecipes);
      } catch (error) {
        console.error('❌ Error loading recipes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecipes();
  }, []);

  // Fetch recipes by type when selectedType changes
  useEffect(() => {
    if (selectedType) {
      const loadRecipesByType = async () => {
        try {
          setLoading(true);
          console.log('🔄 Loading recipes for type:', selectedType);
          const fetchedRecipes = await fetchRecipesByType(selectedType);
          console.log('📋 Recipes for type loaded:', fetchedRecipes.length);
          setRecipes(fetchedRecipes);
        } catch (error) {
          console.error('❌ Error loading recipes by type:', error);
        } finally {
          setLoading(false);
        }
      };

      loadRecipesByType();
    } else {
      // If no type selected, load all recipes
      const loadAllRecipes = async () => {
        try {
          setLoading(true);
          console.log('🔄 Loading all recipes...');
          const fetchedRecipes = await fetchRecipes();
          console.log('📋 All recipes loaded:', fetchedRecipes.length);
          setRecipes(fetchedRecipes);
        } catch (error) {
          console.error('❌ Error loading all recipes:', error);
        } finally {
          setLoading(false);
        }
      };

      loadAllRecipes();
    }
  }, [selectedType]);

  const handleSelect = (recipe: Recipe) => {
    onSelectRecipe(recipe);
    setSearch("");
  };

  const handleClearSelection = () => {
    onSelectRecipe(null as any);
    setSearch("");
    setSelectedType("");
  };

  const filteredRecipes = recipes.filter((recipe: Recipe) => {
    const matchesSearch = recipe.name.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <Card className="overflow-hidden shadow-xl border-2 border-border/60 bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm">
      <CardContent className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <ChefHat className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Meal Planner
            </h2>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover delicious recipes and plan your perfect meals with ease
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8 max-w-2xl mx-auto">
          <div className="flex items-center gap-6">
            <div className="relative flex-1 min-w-0">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Search className="h-5 w-5" />
              </div>
              <Input
                type="text"
                placeholder="Search for recipes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 pr-4 py-3 h-10 text-base rounded-xl border-2 border-border/60 focus:border-primary/50 bg-background/80 backdrop-blur-sm shadow-lg transition-all duration-200 w-full"
                style={{ minWidth: 0 }}
              />
            </div>
            <div className="flex items-center gap-2">
              <ExampleCombobox
                value={selectedType}
                onChange={setSelectedType}
                items={categoryOptions}
              />
              {selectedType && (
                <button
                  onClick={() => setSelectedType("")}
                  className="ml-2 px-6 py-2 min-w-[120px] text-xs rounded bg-muted hover:bg-primary/10 text-muted-foreground border border-border/40 transition-colors"
                  type="button"
                  aria-label="Clear filter"
                >
                  ✖ Clear Filter
                </button>
              )}
              {selectedRecipe && (
                <button
                  onClick={handleClearSelection}
                  className="ml-2 px-3 py-2 text-xs rounded bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/20 transition-colors"
                  type="button"
                  aria-label="Clear selection"
                >
                  ✖ Clear Selection
                </button>
              )}
            </div>
          </div>
          {search.trim() === "" && !selectedType && !selectedRecipe && (
            <div className="absolute left-0 right-0 top-full mt-2 text-center">
              <p className="text-sm text-muted-foreground">
                ✨ Start typing to discover amazing recipes
              </p>
            </div>
          )}
        </div>

        {/* Search Results */}
        {(search.trim() !== "" || selectedType || selectedRecipe) && (
          <div className="grid gap-4 sm:grid-cols-2 w-5xl">
            {loading ? (
              <div className="flex justify-center items-center col-span-2 py-12 w-full">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center animate-spin">
                    <ChefHat className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Loading recipes...
                  </h3>
                  <p className="text-muted-foreground">
                    Fetching delicious recipes from our database
                  </p>
                </div>
              </div>
            ) : filteredRecipes.length === 0 ? (
              <div className="flex justify-center items-center col-span-2 py-12 w-full">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No recipes found
                  </h3>
                  <p className="text-muted-foreground">
                    Try searching with different keywords or browse our collection
                  </p>
                </div>
              </div>
            ) : (
              <>
                {filteredRecipes.map((recipe: Recipe, idx: number) => (
                  <Card
                    key={recipe.id}
                    className={`group cursor-pointer border border-border/40 hover:border-primary/40 bg-card/90 shadow-md hover:shadow-lg transition-all duration-200 p-0 rounded-xl min-h-[90px] max-w-md w-full mx-auto ${filteredRecipes.length === 1 ? 'sm:col-span-2' : ''}`}
                    onClick={() => handleSelect(recipe)}
                  >
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors flex items-center justify-center">
                          <ChefHat className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                {recipe.name}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                {recipe.description || "A delicious recipe perfect for any occasion"}
                              </p>
                            </div>
                            <Badge
                              variant="secondary"
                              className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs px-2 py-0.5 rounded"
                            >
                              Recipe
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        )}

        {/* Welcome Message */}
        {search.trim() === "" && !selectedType && !selectedRecipe && (
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
              <ChefHat className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Ready to cook something amazing?
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Search for your favorite recipes above and start planning your next delicious meal
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MealPlanner;
