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
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";
import { tokenService, mealAPI, customFoodAPI, summaryAPI } from "../../services/api";

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
}

export function NutritionPage() {
  const navigate = useNavigate();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [customFoods, setCustomFoods] = useState<CustomFood[]>([]);
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Meal logging form states
  const [selectedMealType, setSelectedMealType] = useState("breakfast");
  const [selectedFoodId, setSelectedFoodId] = useState("");
  const [mealQuantity, setMealQuantity] = useState("");
  const [showMealDialog, setShowMealDialog] = useState(false);

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
      const [mealsRes, foodsRes, summaryRes] = await Promise.all([
        mealAPI.getMeals(),
        customFoodAPI.getFoods(),
        summaryAPI.getDailySummary(),
      ]);
      setMeals(mealsRes);
      setCustomFoods(foodsRes);
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
      await customFoodAPI.createFood({
        food_name: customFoodForm.food_name,
        calories: parseInt(customFoodForm.calories),
        protein: parseFloat(customFoodForm.protein),
        carbs: parseFloat(customFoodForm.carbs),
        fats: parseFloat(customFoodForm.fats),
        serving_size: customFoodForm.serving_size + "g",
      });

      setCustomFoodForm({
        food_name: "",
        calories: "",
        protein: "",
        carbs: "",
        fats: "",
        serving_size: "100",
      });
      setError("");
      setShowCustomFoodDialog(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create food");
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
      const selectedFood = customFoods.find(
        (f) => f.id === parseInt(selectedFoodId)
      );
      if (!selectedFood) {
        throw new Error("Food not found");
      }

      const qty = parseInt(mealQuantity);
      const servingGrams = parseInt(selectedFood.serving_size);
      const multiplier = qty / servingGrams;

      await mealAPI.logMeal({
        meal_type: selectedMealType,
        food_name: selectedFood.food_name,
        quantity: qty,
        calories: Math.round(selectedFood.calories * multiplier),
        protein: Math.round(selectedFood.protein * multiplier * 10) / 10,
        carbs: Math.round(selectedFood.carbs * multiplier * 10) / 10,
        fats: Math.round(selectedFood.fats * multiplier * 10) / 10,
      });

      setSelectedFoodId("");
      setMealQuantity("");
      setError("");
      setShowMealDialog(false);
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
    return customFoods.find((f) => f.id === parseInt(selectedFoodId));
  };

  const getMealsByType = (mealType: string) => {
    return meals.filter((m) => m.meal_type === mealType);
  };

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
              <div className={`text-3xl font-bold ${
                (dailySummary.net_calories || 0) > 0
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
                <Label htmlFor="food-select">Select Food *</Label>
                <Select value={selectedFoodId} onValueChange={setSelectedFoodId}>
                  <SelectTrigger id="food-select">
                    <SelectValue placeholder="Choose a food..." />
                  </SelectTrigger>
                  <SelectContent>
                    {customFoods.length === 0 ? (
                      <SelectItem value="-" disabled>
                        No foods available - add one first!
                      </SelectItem>
                    ) : (
                      customFoods.map((food) => (
                        <SelectItem key={food.id} value={food.id.toString()}>
                          {food.food_name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {getSelectedFoodDetails() && (
                <div className="border-l-4 border-primary p-4 bg-secondary/50 rounded space-y-3">
                  <div>
                    <div className="font-medium text-sm">
                      {getSelectedFoodDetails()?.food_name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Per {getSelectedFoodDetails()?.serving_size}:
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
                      <div className="text-sm font-medium mb-2">Macros for this meal:</div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>
                          🔥 Calories:{" "}
                          {Math.round(
                            (getSelectedFoodDetails()?.calories || 0) *
                              (parseInt(mealQuantity) /
                                parseInt(getSelectedFoodDetails()?.serving_size || 100))
                          )}
                          kcal
                        </div>
                        <div>
                          💪 Protein:{" "}
                          {(
                            (getSelectedFoodDetails()?.protein || 0) *
                            (parseInt(mealQuantity) /
                              parseInt(getSelectedFoodDetails()?.serving_size || 100))
                          ).toFixed(1)}
                          g
                        </div>
                        <div>
                          🥔 Carbs:{" "}
                          {(
                            (getSelectedFoodDetails()?.carbs || 0) *
                            (parseInt(mealQuantity) /
                              parseInt(getSelectedFoodDetails()?.serving_size || 100))
                          ).toFixed(1)}
                          g
                        </div>
                        <div>
                          🧈 Fats:{" "}
                          {(
                            (getSelectedFoodDetails()?.fats || 0) *
                            (parseInt(mealQuantity) /
                              parseInt(getSelectedFoodDetails()?.serving_size || 100))
                          ).toFixed(1)}
                          g
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
