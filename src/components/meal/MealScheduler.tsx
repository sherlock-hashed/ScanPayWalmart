import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { 
  ChevronDown, 
  Plus, 
  Minus, 
  Trash2, 
  Save, 
  Calendar as CalendarIcon,
  ChefHat,
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { format, addDays, startOfWeek, isAfter, startOfToday } from "date-fns";
import { cn } from "@/lib/utils";
import type { DaySchedule, MealSlot, MealPlan } from "../../types/mealPlan";
import MealPlanner from "./MealPlanner";
import { toast } from "@/hooks/use-toast";

interface MealSchedulerProps {
  mealPlan: MealPlan | null;
  onUpdatePlan: (plan: MealPlan) => void;
  onSavePlan: (plan: MealPlan) => void;
}

const MealScheduler: React.FC<MealSchedulerProps> = ({
  mealPlan,
  onUpdatePlan,
  onSavePlan,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(addDays(new Date(), 6));
  const [isRecipeDialogOpen, setIsRecipeDialogOpen] = useState(false);
  const [currentSlot, setCurrentSlot] = useState<{ dayIndex: number; mealType: string } | null>(null);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [planSettings, setPlanSettings] = useState({
    planName: mealPlan?.planName || "My Meal Plan",
    durationType: mealPlan?.durationType || "date_range" as "week" | "custom_days" | "date_range",
    numberOfDays: mealPlan?.numberOfDays || 7,
    scenario: mealPlan?.scenario || "Balanced",
  });

  const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snack"];
  const scenarios = [
    "Balanced", "Vegetarian", "Non-Vegetarian", "Vegan", 
    "Diabetic-Friendly", "Gluten-Free", "Low-Carb", "Keto", "High-Protein"
  ];

  const generateDays = (): DaySchedule[] => {
    const days: DaySchedule[] = [];
    const today = startOfToday();
    
    let startDate: Date;
    let numDays: number;
    
    if (planSettings.durationType === "week") {
      startDate = startOfWeek(selectedDate);
      numDays = 7;
    } else if (planSettings.durationType === "date_range") {
      startDate = selectedDate;
      numDays = Math.ceil((endDate.getTime() - selectedDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    } else {
      startDate = selectedDate;
      numDays = planSettings.numberOfDays;
    }
    
    for (let i = 0; i < numDays; i++) {
      const date = addDays(startDate, i);
      // Only include dates that are today or in the future
      if (isAfter(date, today) || date.toDateString() === today.toDateString()) {
        days.push({
          date,
          dayOfWeek: format(date, "EEEE"),
          meals: mealPlan?.schedule[i]?.meals || [],
        });
      }
    }
    
    return days;
  };

  const [schedule, setSchedule] = useState<DaySchedule[]>(generateDays());

  // Regenerate schedule when dates or settings change
  React.useEffect(() => {
    setSchedule(generateDays());
    setCurrentDayIndex(0);
  }, [selectedDate, endDate, planSettings.durationType, planSettings.numberOfDays]);

  const handleAddRecipeToSlot = (dayIndex: number, mealType: string) => {
    setCurrentSlot({ dayIndex, mealType });
    setIsRecipeDialogOpen(true);
  };

  const handleRecipeSelect = (recipe: any) => {
    if (!currentSlot) return;

    const newMeal: MealSlot = {
      mealType: currentSlot.mealType as any,
      recipeId: recipe.id.toString(),
      recipeName: recipe.name,
      servings: 1,
      imageURL: recipe.imageURL || "https://via.placeholder.com/64x64?text=Recipe",
    };

    const updatedSchedule = [...schedule];
    updatedSchedule[currentSlot.dayIndex].meals.push(newMeal);
    setSchedule(updatedSchedule);
    setIsRecipeDialogOpen(false);
    setCurrentSlot(null);

    toast({
      title: "Recipe Added!",
      description: `${recipe.name} added to ${currentSlot.mealType}`,
    });
  };

  const handleServingsChange = (dayIndex: number, mealIndex: number, newServings: number) => {
    if (newServings < 1) return;
    
    const updatedSchedule = [...schedule];
    updatedSchedule[dayIndex].meals[mealIndex].servings = newServings;
    setSchedule(updatedSchedule);
  };

  const handleRemoveRecipe = (dayIndex: number, mealIndex: number) => {
    const updatedSchedule = [...schedule];
    const removedMeal = updatedSchedule[dayIndex].meals[mealIndex];
    updatedSchedule[dayIndex].meals.splice(mealIndex, 1);
    setSchedule(updatedSchedule);

    toast({
      title: "Recipe Removed",
      description: `${removedMeal.recipeName} removed from meal plan`,
      variant: "destructive",
    });
  };

  const handleSavePlan = () => {
    const updatedPlan: MealPlan = {
      id: mealPlan?.id || Date.now().toString(),
      userId: "current-user",
      planName: planSettings.planName,
      durationType: planSettings.durationType,
      numberOfDays: planSettings.numberOfDays,
      scenario: planSettings.scenario,
      schedule,
      createdAt: mealPlan?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSavePlan(updatedPlan);
    toast({
      title: "Plan Saved!",
      description: `${planSettings.planName} has been saved successfully`,
    });
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentDayIndex > 0) {
      setCurrentDayIndex(currentDayIndex - 1);
    } else if (direction === 'next' && currentDayIndex < schedule.length - 1) {
      setCurrentDayIndex(currentDayIndex + 1);
    }
  };

  const currentDay = schedule[currentDayIndex];

  return (
    <div className="space-y-6">
      {/* Plan Settings Header */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Meal Plan Settings</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Plan Name</label>
                  <Input
                    value={planSettings.planName}
                    onChange={(e) => setPlanSettings(prev => ({ ...prev, planName: e.target.value }))}
                    placeholder="My Meal Plan"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Duration</label>
                  <Select
                    value={planSettings.durationType}
                    onValueChange={(value: "week" | "custom_days" | "date_range") => 
                      setPlanSettings(prev => ({ ...prev, durationType: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">For a Week (7 days)</SelectItem>
                      <SelectItem value="date_range">Custom Date Range</SelectItem>
                      <SelectItem value="custom_days">Custom Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {planSettings.durationType === "date_range" && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal mt-1",
                              !selectedDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => date && setSelectedDate(date)}
                            disabled={(date) => date < startOfToday()}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">End Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal mt-1",
                              !endDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={(date) => date && setEndDate(date)}
                            disabled={(date) => date <= selectedDate}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </>
                )}

                {planSettings.durationType === "custom_days" && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Number of Days</label>
                    <Input
                      type="number"
                      value={planSettings.numberOfDays}
                      onChange={(e) => setPlanSettings(prev => ({ ...prev, numberOfDays: parseInt(e.target.value) || 1 }))}
                      min="1"
                      max="30"
                      className="mt-1"
                    />
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Dietary Preference</label>
                  <Select
                    value={planSettings.scenario}
                    onValueChange={(value) => setPlanSettings(prev => ({ ...prev, scenario: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {scenarios.map(scenario => (
                        <SelectItem key={scenario} value={scenario}>{scenario}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button onClick={handleSavePlan} className="bg-primary hover:bg-primary/90">
              <Save className="h-4 w-4 mr-2" />
              Save Plan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Day Navigation */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold flex items-center gap-2">
          <ChefHat className="h-6 w-6 text-primary" />
          Meal Schedule
        </h3>
        
        {/* Horizontal Day Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateDay('prev')}
            disabled={currentDayIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex gap-1">
            {schedule.map((day, index) => (
              <Button
                key={index}
                variant={index === currentDayIndex ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentDayIndex(index)}
                className="min-w-16"
              >
                {format(day.date, "EEE d")}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateDay('next')}
            disabled={currentDayIndex === schedule.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Current Day Schedule */}
      {currentDay && (
        <motion.div
          key={currentDay.date.toISOString()}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          layout
        >
          <Card className="shadow-lg border border-border/60">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center justify-between">
                <span>{format(currentDay.date, "EEEE, MMM d")} - {currentDay.dayOfWeek}</span>
                <Badge variant="outline" className="text-sm">
                  {currentDay.meals.length} meals planned
                </Badge>
              </h3>

              {mealTypes.map(mealType => {
                const mealsForType = currentDay.meals.filter(m => m.mealType === mealType);
                
                return (
                  <Collapsible key={mealType} className="mb-4">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between font-semibold text-lg py-3 hover:bg-primary/5">
                        <span className="flex items-center gap-2">
                          <ChefHat className="h-4 w-4" />
                          {mealType}
                          {mealsForType.length > 0 && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {mealsForType.length}
                            </Badge>
                          )}
                        </span>
                        <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                      </Button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="space-y-3 px-2 py-3">
                      <AnimatePresence>
                        {mealsForType.length === 0 ? (
                          <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }}
                            className="text-muted-foreground text-sm text-center py-6 border-2 border-dashed border-border rounded-lg"
                          >
                            No recipe for {mealType}. Click below to add one!
                          </motion.div>
                        ) : (
                          mealsForType.map((meal, mealIndex) => {
                            const actualMealIndex = currentDay.meals.findIndex(m => m === meal);
                            return (
                              <motion.div
                                key={`${meal.recipeId}-${mealIndex}`}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                layout
                                className="flex items-center gap-4 bg-secondary/30 rounded-lg p-4 border border-border"
                              >
                                <img 
                                  src={meal.imageURL || "https://via.placeholder.com/64x64?text=Recipe"} 
                                  alt={meal.recipeName} 
                                  className="w-16 h-16 rounded-md object-cover"
                                />
                                <div className="flex-1">
                                  <h4 className="font-semibold text-foreground">{meal.recipeName}</h4>
                                  <div className="flex items-center gap-3 mt-2">
                                    <span className="text-sm text-muted-foreground">Servings:</span>
                                    <div className="flex items-center gap-1">
                                      <Button 
                                        variant="outline" 
                                        size="icon" 
                                        className="h-7 w-7" 
                                        onClick={() => handleServingsChange(currentDayIndex, actualMealIndex, meal.servings - 1)}
                                        disabled={meal.servings <= 1}
                                      >
                                        <Minus className="h-3 w-3" />
                                      </Button>
                                      <Input 
                                        type="number" 
                                        value={meal.servings} 
                                        onChange={(e) => handleServingsChange(currentDayIndex, actualMealIndex, parseInt(e.target.value) || 1)} 
                                        className="w-16 h-7 text-center text-sm"
                                        min="1"
                                      />
                                      <Button 
                                        variant="outline" 
                                        size="icon" 
                                        className="h-7 w-7" 
                                        onClick={() => handleServingsChange(currentDayIndex, actualMealIndex, meal.servings + 1)}
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                                <Button 
                                  variant="destructive" 
                                  size="icon" 
                                  onClick={() => handleRemoveRecipe(currentDayIndex, actualMealIndex)}
                                  className="h-8 w-8"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </motion.div>
                            );
                          })
                        )}
                      </AnimatePresence>
                      
                      <Button 
                        variant="outline" 
                        className="w-full mt-3 border-dashed border-2 hover:bg-primary/5 hover:border-primary/30" 
                        onClick={() => handleAddRecipeToSlot(currentDayIndex, mealType)}
                      >
                        <Plus className="h-4 w-4 mr-2" /> 
                        Add Recipe for {mealType}
                      </Button>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recipe Selection Dialog */}
      <Dialog open={isRecipeDialogOpen} onOpenChange={setIsRecipeDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh] w-full h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose a Recipe</DialogTitle>
          </DialogHeader>
          <div className="mt-6 h-[65vh] overflow-y-auto">
            <MealPlanner
              onSelectRecipe={handleRecipeSelect}
              selectedRecipe={null}
              selectedType={planSettings.scenario === "Balanced" ? "" : planSettings.scenario}
              setSelectedType={() => {}}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MealScheduler;
