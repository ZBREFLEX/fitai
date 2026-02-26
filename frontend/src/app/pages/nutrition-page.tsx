import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Plus, Trash2, AlertCircle, Search } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";
import { tokenService, mealAPI, customFoodAPI, summaryAPI } from "../../services/api";
import { useBadgeUnlock } from "../contexts/badge-context";

interface DailySummary {
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  tdee: number;
  net_calories: number;
  meals_count: number;
}

interface Meal {
  id: number;
  meal_type: string;
  food_name: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  created_at: string;
}

interface CustomFood {
  id: number;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  serving_size: string;
  is_favorite: boolean;
  food_type: 'preset' | 'custom';
}

export function NutritionPage() {
  const navigate = useNavigate();

  const getLocalDateString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const [meals, setMeals] = useState<Meal[]>([]);
  const [customFoods, setCustomFoods] = useState<CustomFood[]>([]);
  const [allFoods, setAllFoods] = useState<CustomFood[]>([]);
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { checkNewBadges } = useBadgeUnlock();

  // Meal logging form states
  const [selectedMealType, setSelectedMealType] = useState("breakfast");
  const [selectedFoodId, setSelectedFoodId] = useState("");
  const [mealQuantity, setMealQuantity] = useState("");
  const [showMealDialog, setShowMealDialog] = useState(false);
  const [foodSearchQuery, setFoodSearchQuery] = useState("");
  const [showFoodResults, setShowFoodResults] = useState(false);
  const [overrideNutrition, setOverrideNutrition] = useState(false);
  const [customNutrition, setCustomNutrition] = useState({
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
  });

  // Custom food form states
  const [customFoodForm, setCustomFoodForm] = useState({
    food_name: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
    serving_size: "100",
  });
  const [showCustomFoodDialog, setShowCustomFoodDialog] = useState(false);

  // Check auth
  useEffect(() => {
    if (!tokenService.isTokenValid()) {
      navigate("/login");
    } else {
      loadData();
    }
  }, [navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [mealsRes, foodsRes, allFoodsRes, summaryRes] = await Promise.all([
        mealAPI.getMeals(),
        customFoodAPI.getFoods(),
        customFoodAPI.getAllFoods(),
        summaryAPI.getDailySummary(getLocalDateString()),
      ]);
      setMeals(mealsRes);
      setCustomFoods(foodsRes);
      setAllFoods(allFoodsRes);
      setDailySummary(summaryRes);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const createCustomFood = async () => {
    if (
      !customFoodForm.food_name ||
      !customFoodForm.calories ||
      !customFoodForm.protein ||
      !customFoodForm.carbs ||
      !customFoodForm.fats
    ) {
      setError("Please fill in all food details");
      return;
    }

    try {
      setLoading(true);
      setError(""); // Clear previous errors

      const foodData = {
        food_name: customFoodForm.food_name,
        calories: parseInt(customFoodForm.calories),
        protein: parseFloat(customFoodForm.protein),
        carbs: parseFloat(customFoodForm.carbs),
        fats: parseFloat(customFoodForm.fats),
        serving_size: customFoodForm.serving_size + "g",
      };

      console.log("Creating food with data:", foodData);
      await customFoodAPI.createFood(foodData);

      setCustomFoodForm({
        food_name: "",
        calories: "",
        protein: "",
        carbs: "",
        fats: "",
        serving_size: "100",
      });
      setShowCustomFoodDialog(false);
      await loadData();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to create food";
      console.error("Food creation error:", errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const logMeal = async () => {
    if (!selectedFoodId || !mealQuantity || !selectedMealType) {
      setError("Please select food, quantity, and meal type");
      return;
    }

    try {
      setLoading(true);
      const selectedFood = allFoods.find(
        (f) => f.id === parseInt(selectedFoodId)
      );
      if (!selectedFood) {
        throw new Error("Food not found");
      }

      const qty = parseInt(mealQuantity);
      const servingGrams = parseServingSize(selectedFood.serving_size);
      const multiplier = qty / servingGrams;

      // Calculate default values from food
      const defaultCalories = Math.round(selectedFood.calories * multiplier);
      const defaultProtein = Math.round(selectedFood.protein * multiplier * 10) / 10;
      const defaultCarbs = Math.round(selectedFood.carbs * multiplier * 10) / 10;
      const defaultFats = Math.round(selectedFood.fats * multiplier * 10) / 10;

      // Use custom nutrition if override is enabled, otherwise use defaults
      const mealData = {
        meal_type: selectedMealType,
        food_name: selectedFood.food_name,
        quantity: qty,
        calories: overrideNutrition && customNutrition.calories
          ? parseInt(customNutrition.calories)
          : defaultCalories,
        protein: overrideNutrition && customNutrition.protein
          ? parseFloat(customNutrition.protein)
          : defaultProtein,
        carbs: overrideNutrition && customNutrition.carbs
          ? parseFloat(customNutrition.carbs)
          : defaultCarbs,
        fats: overrideNutrition && customNutrition.fats
          ? parseFloat(customNutrition.fats)
          : defaultFats,
        date: getLocalDateString(),
      };

      const response = await mealAPI.logMeal(mealData);

      // Badge check
      if (response.new_badges) {
        checkNewBadges(response.new_badges);
      }

      setSelectedFoodId("");
      setMealQuantity("");
      setFoodSearchQuery("");
      setError("");
      setShowMealDialog(false);
      setOverrideNutrition(false);
      setCustomNutrition({ calories: "", protein: "", carbs: "", fats: "" });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log meal");
    } finally {
      setLoading(false);
    }
  };

  const deleteMeal = async (mealId: number) => {
    try {
      setLoading(true);
      await mealAPI.deleteMeal(mealId);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete meal");
    } finally {
      setLoading(false);
    }
  };

  const deleteCustomFood = async (foodId: number) => {
    try {
      setLoading(true);
      await customFoodAPI.deleteFood(foodId);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete food");
    } finally {
      setLoading(false);
    }
  };

  const getSelectedFoodDetails = () => {
    if (!selectedFoodId) return null;
    return allFoods.find((f) => f.id === parseInt(selectedFoodId));
  };

  const getMealsByType = (mealType: string) => {
    return meals.filter((m) => m.meal_type === mealType);
  };

  // Helper to parse serving size (handles both "100" and "100g" formats)
  const parseServingSize = (servingSize: string): number => {
    const parsed = parseInt(servingSize);
    return isNaN(parsed) ? 100 : parsed;
  };

  // Fuzzy search for foods (searches through all foods: custom + preset)
  const fuzzySearchFoods = (query: string) => {
    if (!query.trim()) return allFoods;

    const queryLower = query.toLowerCase();
    return allFoods
      .map((food) => {
        const foodNameLower = food.food_name.toLowerCase();
        let score = 0;

        // Exact match
        if (foodNameLower === queryLower) score = 1000;
        // Starts with query
        else if (foodNameLower.startsWith(queryLower)) score = 500;
        // Contains full query
        else if (foodNameLower.includes(queryLower)) score = 250;
        // Fuzzy match - all characters in order
        else {
          let searchIdx = 0;
          for (let i = 0; i < foodNameLower.length && searchIdx < queryLower.length; i++) {
            if (foodNameLower[i] === queryLower[searchIdx]) {
              score += 100 / queryLower.length;
              searchIdx++;
            }
          }
          if (searchIdx !== queryLower.length) score = 0;
        }

        return { food, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.food);
  };

  const filteredFoods = fuzzySearchFoods(foodSearchQuery);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Nutrition</h1>
        <p className="text-muted-foreground">Track your daily meals and nutrition</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Daily Summary */}
      {dailySummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Calories Consumed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {dailySummary.total_calories}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                of {dailyCalorieTarget} kcal
              </p>
              <div className="mt-3 h-1 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${Math.min(
                      (dailySummary.total_calories / dailyCalorieTarget) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Protein
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {dailySummary.total_protein}g
              </div>
              <p className="text-xs text-muted-foreground mt-1">target: 150g</p>
              <div className="mt-3 h-1 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{
                    width: `${Math.min(
                      (dailySummary.total_protein / 150) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Carbs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {dailySummary.total_carbs}g
              </div>
              <p className="text-xs text-muted-foreground mt-1">target: 250g</p>
              <div className="mt-3 h-1 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{
                    width: `${Math.min(
                      (dailySummary.total_carbs / 250) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Fats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {dailySummary.total_fats}g
              </div>
              <p className="text-xs text-muted-foreground mt-1">target: 80g</p>
              <div className="mt-3 h-1 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500"
                  style={{
                    width: `${Math.min(
                      (dailySummary.total_fats / 80) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Net Calories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${(dailySummary.net_calories || 0) > 0
                ? "text-orange-600"
                : "text-green-600"
                }`}>
                {dailySummary.net_calories}
              </div>
              <p className="text-xs text-muted-foreground mt-1">cal remaining</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="log-meal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="log-meal">Log Meal</TabsTrigger>
          <TabsTrigger value="today-meals">Today's Meals</TabsTrigger>
          <TabsTrigger value="add-food">Add Food</TabsTrigger>
          <TabsTrigger value="my-foods">My Foods</TabsTrigger>
        </TabsList>

        {/* Log Meal Tab */}
        <TabsContent value="log-meal">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Log a Meal</CardTitle>
              <p className="text-sm text-muted-foreground">
                Add a meal by selecting from your custom foods
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="meal-type">Meal Type *</Label>
                <Select value={selectedMealType} onValueChange={setSelectedMealType}>
                  <SelectTrigger id="meal-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="food-search">Search Food *</Label>
                <div className="relative">
                  <Input
                    id="food-search"
                    type="text"
                    placeholder="Search foods (fuzzy match)..."
                    value={foodSearchQuery}
                    onChange={(e) => {
                      setFoodSearchQuery(e.target.value);
                      setShowFoodResults(true);
                    }}
                    onFocus={() => setShowFoodResults(true)}
                    autoComplete="off"
                  />
                  {showFoodResults && foodSearchQuery && filteredFoods.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-10 max-h-64 overflow-y-auto">
                      {filteredFoods.slice(0, 10).map((food) => (
                        <button
                          key={food.id}
                          type="button"
                          onClick={() => {
                            setSelectedFoodId(food.id.toString());
                            setFoodSearchQuery(food.food_name);
                            setShowFoodResults(false);
                            setOverrideNutrition(false);
                            setCustomNutrition({ calories: "", protein: "", carbs: "", fats: "" });
                          }}
                          className="w-full text-left px-4 py-3 border-b border-border hover:bg-secondary transition-colors flex justify-between items-start"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-sm flex items-center gap-2">
                              {food.food_name}
                              <span className={`text-xs px-2 py-0.5 rounded ${food.food_type === 'preset'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                }`}>
                                {food.food_type === 'preset' ? 'Preset' : 'Custom'}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {food.calories} cal | {food.protein.toFixed(0)}p {food.carbs.toFixed(0)}c {food.fats.toFixed(0)}f per {food.serving_size}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {showFoodResults && foodSearchQuery && filteredFoods.length === 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-10 p-3">
                      <div className="text-sm text-muted-foreground">No foods found</div>
                    </div>
                  )}
                </div>
              </div>

              {getSelectedFoodDetails() && (
                <div className="border-l-4 border-primary p-4 bg-secondary/50 rounded space-y-3">
                  <div>
                    <div className="font-medium text-sm flex items-center gap-2">
                      {getSelectedFoodDetails()?.food_name}
                      <span className={`text-xs px-2 py-0.5 rounded ${getSelectedFoodDetails()?.food_type === 'preset'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                        {getSelectedFoodDetails()?.food_type === 'preset' ? 'Preset' : 'Custom'}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Per {getSelectedFoodDetails()?.serving_size}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                      <div className="bg-card p-2 rounded">
                        <span className="text-muted-foreground">Calories:</span><br />
                        <span className="font-medium">{getSelectedFoodDetails()?.calories}</span> kcal
                      </div>
                      <div className="bg-card p-2 rounded">
                        <span className="text-muted-foreground">Protein:</span><br />
                        <span className="font-medium">{getSelectedFoodDetails()?.protein.toFixed(1)}</span>g
                      </div>
                      <div className="bg-card p-2 rounded">
                        <span className="text-muted-foreground">Carbs:</span><br />
                        <span className="font-medium">{getSelectedFoodDetails()?.carbs.toFixed(1)}</span>g
                      </div>
                      <div className="bg-card p-2 rounded">
                        <span className="text-muted-foreground">Fats:</span><br />
                        <span className="font-medium">{getSelectedFoodDetails()?.fats.toFixed(1)}</span>g
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="quantity">Quantity ({getSelectedFoodDetails()?.serving_size}) *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder={getSelectedFoodDetails()?.serving_size}
                      value={mealQuantity}
                      onChange={(e) => setMealQuantity(e.target.value)}
                    />
                  </div>

                  {mealQuantity && (
                    <div className="p-3 bg-card rounded border border-border">
                      <div className="text-sm font-medium mb-3 text-foreground">Total for this meal:</div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-secondary/50 p-2 rounded">
                          <div className="text-muted-foreground text-xs">Calories</div>
                          <div className="font-bold text-lg">
                            {Math.round(
                              (getSelectedFoodDetails()?.calories || 0) *
                              (parseInt(mealQuantity) /
                                parseServingSize(getSelectedFoodDetails()?.serving_size || "100"))
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">kcal</div>
                        </div>
                        <div className="bg-secondary/50 p-2 rounded">
                          <div className="text-muted-foreground text-xs">Protein</div>
                          <div className="font-bold text-lg">
                            {(
                              (getSelectedFoodDetails()?.protein || 0) *
                              (parseInt(mealQuantity) /
                                parseServingSize(getSelectedFoodDetails()?.serving_size || "100"))
                            ).toFixed(1)}
                          </div>
                          <div className="text-xs text-muted-foreground">g</div>
                        </div>
                        <div className="bg-secondary/50 p-2 rounded">
                          <div className="text-muted-foreground text-xs">Carbs</div>
                          <div className="font-bold text-lg">
                            {(
                              (getSelectedFoodDetails()?.carbs || 0) *
                              (parseInt(mealQuantity) /
                                parseServingSize(getSelectedFoodDetails()?.serving_size || "100"))
                            ).toFixed(1)}
                          </div>
                          <div className="text-xs text-muted-foreground">g</div>
                        </div>
                        <div className="bg-secondary/50 p-2 rounded">
                          <div className="text-muted-foreground text-xs">Fats</div>
                          <div className="font-bold text-lg">
                            {(
                              (getSelectedFoodDetails()?.fats || 0) *
                              (parseInt(mealQuantity) /
                                parseServingSize(getSelectedFoodDetails()?.serving_size || "100"))
                            ).toFixed(1)}
                          </div>
                          <div className="text-xs text-muted-foreground">g</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="override-nutrition"
                      checked={overrideNutrition}
                      onChange={(e) => {
                        setOverrideNutrition(e.target.checked);
                        if (!e.target.checked) {
                          setCustomNutrition({ calories: "", protein: "", carbs: "", fats: "" });
                        }
                      }}
                      className="rounded"
                    />
                    <Label htmlFor="override-nutrition" className="cursor-pointer font-medium text-sm">
                      Override nutrition values (optional)
                    </Label>
                  </div>

                  {overrideNutrition && mealQuantity && (
                    <div className="p-3 bg-secondary/30 rounded border border-border">
                      <div className="text-sm font-medium mb-3 text-foreground">Custom nutrition for this meal:</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="custom-cal" className="text-xs">Calories</Label>
                          <Input
                            id="custom-cal"
                            type="number"
                            placeholder="0"
                            value={customNutrition.calories}
                            onChange={(e) => setCustomNutrition({ ...customNutrition, calories: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="custom-protein" className="text-xs">Protein (g)</Label>
                          <Input
                            id="custom-protein"
                            type="number"
                            placeholder="0"
                            value={customNutrition.protein}
                            onChange={(e) => setCustomNutrition({ ...customNutrition, protein: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="custom-carbs" className="text-xs">Carbs (g)</Label>
                          <Input
                            id="custom-carbs"
                            type="number"
                            placeholder="0"
                            value={customNutrition.carbs}
                            onChange={(e) => setCustomNutrition({ ...customNutrition, carbs: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="custom-fats" className="text-xs">Fats (g)</Label>
                          <Input
                            id="custom-fats"
                            type="number"
                            placeholder="0"
                            value={customNutrition.fats}
                            onChange={(e) => setCustomNutrition({ ...customNutrition, fats: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={logMeal}
                    disabled={loading || !mealQuantity}
                    className="w-full"
                  >
                    {loading ? "Logging..." : "Log Meal"}
                  </Button>
                </div>
              )}

              {customFoods.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="mb-3">No custom foods yet</p>
                  <p className="text-sm">Go to "Add Food" tab to create your first food item</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Today's Meals Tab */}
        <TabsContent value="today-meals">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Today's Meals ({meals.length} total)</CardTitle>
            </CardHeader>
            <CardContent>
              {meals.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No meals logged yet</p>
              ) : (
                <div className="space-y-4">
                  {["breakfast", "lunch", "dinner", "snack"].map((mealType) => {
                    const mealsByType = getMealsByType(mealType);
                    if (mealsByType.length === 0) return null;

                    return (
                      <div key={mealType}>
                        <div className="font-semibold text-sm capitalize mb-2 text-foreground">
                          {mealType}
                        </div>
                        <div className="space-y-2">
                          {mealsByType.map((meal) => (
                            <div
                              key={meal.id}
                              className="flex items-center justify-between p-3 bg-secondary/50 rounded border border-border"
                            >
                              <div className="flex-1">
                                <div className="font-medium text-sm">{meal.food_name}</div>
                                <div className="text-xs text-muted-foreground flex gap-3 mt-1">
                                  <span>{meal.quantity}g</span>
                                  <span>🔥 {meal.calories} cal</span>
                                  <span>💪 {meal.protein}g</span>
                                </div>
                              </div>
                              <button
                                onClick={() => deleteMeal(meal.id)}
                                className="text-destructive hover:text-destructive/80 ml-4"
                                disabled={loading}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add Food Tab */}
        <TabsContent value="add-food">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Add Custom Food</CardTitle>
              <p className="text-sm text-muted-foreground">
                Create a new food item with its nutrition information
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="food-name">Food Name *</Label>
                <Input
                  id="food-name"
                  placeholder="e.g., Grilled Chicken Breast"
                  value={customFoodForm.food_name}
                  onChange={(e) =>
                    setCustomFoodForm({
                      ...customFoodForm,
                      food_name: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="serving-size">Serving Size (grams) *</Label>
                <Input
                  id="serving-size"
                  type="number"
                  placeholder="100"
                  value={customFoodForm.serving_size}
                  onChange={(e) =>
                    setCustomFoodForm({
                      ...customFoodForm,
                      serving_size: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="calories">Calories *</Label>
                  <Input
                    id="calories"
                    type="number"
                    placeholder="150"
                    value={customFoodForm.calories}
                    onChange={(e) =>
                      setCustomFoodForm({
                        ...customFoodForm,
                        calories: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="protein">Protein (g) *</Label>
                  <Input
                    id="protein"
                    type="number"
                    placeholder="25"
                    value={customFoodForm.protein}
                    onChange={(e) =>
                      setCustomFoodForm({
                        ...customFoodForm,
                        protein: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="carbs">Carbs (g) *</Label>
                  <Input
                    id="carbs"
                    type="number"
                    placeholder="30"
                    value={customFoodForm.carbs}
                    onChange={(e) =>
                      setCustomFoodForm({
                        ...customFoodForm,
                        carbs: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="fats">Fats (g) *</Label>
                  <Input
                    id="fats"
                    type="number"
                    placeholder="8"
                    value={customFoodForm.fats}
                    onChange={(e) =>
                      setCustomFoodForm({
                        ...customFoodForm,
                        fats: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <Button
                onClick={createCustomFood}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Creating..." : "Create Food"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Foods Tab */}
        <TabsContent value="my-foods">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>My Foods ({customFoods.length} total)</CardTitle>
              <p className="text-sm text-muted-foreground">
                Your saved custom food items
              </p>
            </CardHeader>
            <CardContent>
              {customFoods.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No custom foods yet - create one in the "Add Food" tab!
                </p>
              ) : (
                <div className="space-y-3">
                  {customFoods.map((food) => (
                    <div
                      key={food.id}
                      className="flex items-start justify-between p-4 bg-secondary/50 rounded border border-border"
                    >
                      <div className="flex-1">
                        <div className="font-semibold">{food.food_name}</div>
                        <div className="text-xs text-muted-foreground mt-2 space-y-1">
                          <div>📏 Per {food.serving_size}</div>
                          <div className="flex gap-4">
                            <span>🔥 {food.calories} kcal</span>
                            <span>💪 {food.protein}g protein</span>
                            <span>🥔 {food.carbs}g carbs</span>
                            <span>🧈 {food.fats}g fat</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteCustomFood(food.id)}
                        className="text-destructive hover:text-destructive/80 ml-4 flex-shrink-0"
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper to calculate target calories (from dashboard-home.tsx logic)
export const getDailyCalorieTarget = (): number => {
  const userData = JSON.parse(
    localStorage.getItem("userData") ||
    '{"age": "25", "height": "175", "weight": "70"}'
  );

  const heightInMeters = parseFloat(userData.height || "175") / 100;
  const weight = parseFloat(userData.weight || "70");
  const age = parseInt(userData.age || "25");

  const bmr =
    userData.gender === "female"
      ? 655 + 9.6 * weight + 1.8 * heightInMeters * 100 - 4.7 * age
      : 66 + 13.7 * weight + 5 * heightInMeters * 100 - 6.8 * age;

  const activityMultiplier =
    {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      very: 1.725,
      extreme: 1.9,
    }[userData.activityLevel || "moderate"] || 1.55;

  return Math.round(bmr * activityMultiplier);
};

// Update to use the helper
const dailyCalorieTarget = getDailyCalorieTarget();
