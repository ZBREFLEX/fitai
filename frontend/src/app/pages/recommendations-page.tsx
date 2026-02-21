import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Plus, Trash2, AlertCircle, Heart } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";
import { tokenService, allergyAPI, recommendationAPI, customFoodAPI } from "../../services/api";
import { Search, Loader2 } from "lucide-react";

interface Allergy {
  id: number;
  ingredient: string;
  severity: string;
  severity_display: string;
  created_at: string;
}

interface RecommendedFood {
  id: number;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  serving_size: string;
  ingredients: string;
  ingredients_list: string[];
  food_type: string;
}

interface RecommendationData {
  total_available: number;
  safe_foods: number;
  skipped_count: number;
  recommendations: RecommendedFood[];
  your_allergies: string[];
  current_nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  daily_targets: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  nutrition_gap: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

export function RecommendationsPage() {
  const navigate = useNavigate();
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form states
  const [newIngredient, setNewIngredient] = useState("");
  const [severity, setSeverity] = useState<"mild" | "moderate" | "severe">("moderate");
  const [searchQuery, setSearchQuery] = useState("");
  const [allFoods, setAllFoods] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

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
      const [allergiesRes, recommendationsRes, foodsRes] = await Promise.all([
        allergyAPI.getAllergies(),
        recommendationAPI.getMealRecommendations(),
        customFoodAPI.getAllFoods(),
      ]);
      setAllergies(allergiesRes);
      setRecommendations(recommendationsRes);
      setAllFoods(foodsRes);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const addAllergy = async () => {
    if (!newIngredient.trim()) {
      setError("Please enter an ingredient");
      return;
    }

    try {
      setLoading(true);
      await allergyAPI.addAllergy(newIngredient, severity);
      setNewIngredient("");
      setSeverity("moderate");
      setError("");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add allergy");
    } finally {
      setLoading(false);
    }
  };

  const removeAllergy = async (allergyId: number) => {
    try {
      setLoading(true);
      await allergyAPI.removeAllergy(allergyId);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove allergy");
    } finally {
      setLoading(false);
    }
  };

  const fuzzySearch = (query: string, text: string) => {
    if (!query) return true;
    const tokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 0);
    const target = text.toLowerCase();
    return tokens.every(token => target.includes(token));
  };

  // Extract unique ingredients from all foods
  const allIngredients = Array.from(new Set(
    allFoods.flatMap(food =>
      food.ingredients
        ? food.ingredients.split(',').map((i: string) => i.trim().toLowerCase())
        : []
    )
  )).filter(i => i.length > 0);

  const ingredientSuggestions = newIngredient.length >= 2
    ? allIngredients
      .filter(ing => fuzzySearch(newIngredient, ing))
      .slice(0, 8)
    : [];

  const filteredRecommendations = (recommendations?.recommendations || []).filter((food) =>
    fuzzySearch(searchQuery, food.food_name)
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "mild":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "moderate":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "severe":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Meal Recommendations</h1>
        <p className="text-muted-foreground">
          Manage your allergies and get personalized food recommendations
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="allergies" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="allergies">My Allergies</TabsTrigger>
          <TabsTrigger value="recommendations">
            Recommendations
            {recommendations && (
              <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                {recommendations.safe_foods}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Allergies Tab */}
        <TabsContent value="allergies">
          <div className="space-y-6">
            {/* Add Allergy Section */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Add Allergy or Intolerance</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  List ingredients you're allergic to so we can filter foods safely
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Label htmlFor="ingredient">Ingredient *</Label>
                    <div className="relative">
                      <Input
                        id="ingredient"
                        placeholder="e.g., peanuts, dairy, gluten"
                        value={newIngredient}
                        onChange={(e) => {
                          setNewIngredient(e.target.value);
                          setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onKeyPress={(e) => e.key === "Enter" && addAllergy()}
                        className="pr-10"
                      />
                      <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                    {showSuggestions && ingredientSuggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg overflow-hidden">
                        {ingredientSuggestions.map((suggestion) => (
                          <button
                            key={suggestion}
                            className="w-full text-left px-4 py-2 hover:bg-secondary text-sm transition-colors"
                            onClick={() => {
                              setNewIngredient(suggestion);
                              setShowSuggestions(false);
                            }}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="severity">Severity *</Label>
                    <Select value={severity} onValueChange={(v: any) => setSeverity(v)}>
                      <SelectTrigger id="severity">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mild">Mild - Minor discomfort</SelectItem>
                        <SelectItem value="moderate">Moderate - Significant discomfort</SelectItem>
                        <SelectItem value="severe">Severe - Life threatening</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={addAllergy} disabled={loading || !newIngredient.trim()} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  {loading ? "Adding..." : "Add Allergy"}
                </Button>
              </CardContent>
            </Card>

            {/* Allergies List */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Your Allergies ({allergies.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {allergies.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No allergies added yet</p>
                    <p className="text-sm mt-1">Add your allergies above to get safe recommendations</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allergies.map((allergy) => (
                      <div
                        key={allergy.id}
                        className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg border border-border"
                      >
                        <div className="flex-1">
                          <div className="font-medium capitalize">{allergy.ingredient}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            <span className={`inline-block px-2 py-1 rounded ${getSeverityColor(allergy.severity)}`}>
                              {allergy.severity_display}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAllergy(allergy.id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations">
          <div className="space-y-6">
            {recommendations && (
              <>
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Available Foods</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{recommendations.total_available}</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-green-800 dark:text-green-100">
                        Safe Foods
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {recommendations.safe_foods}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-red-800 dark:text-red-100">
                        Skipped Foods
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                        {recommendations.skipped_count}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Nutrition Progress */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Today's Nutrition Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Calories</span>
                        <span className="text-xs text-muted-foreground">
                          {recommendations.current_nutrition.calories} / {recommendations.daily_targets.calories} kcal
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{
                            width: `${Math.min(
                              (recommendations.current_nutrition.calories / recommendations.daily_targets.calories) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      {recommendations.nutrition_gap.calories > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Need {recommendations.nutrition_gap.calories} more calories
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Protein</span>
                        <span className="text-xs text-muted-foreground">
                          {recommendations.current_nutrition.protein}g / {recommendations.daily_targets.protein}g
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500"
                          style={{
                            width: `${Math.min(
                              (recommendations.current_nutrition.protein / recommendations.daily_targets.protein) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      {recommendations.nutrition_gap.protein > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Need {recommendations.nutrition_gap.protein.toFixed(0)}g more protein
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Carbs</span>
                        <span className="text-xs text-muted-foreground">
                          {recommendations.current_nutrition.carbs}g / {recommendations.daily_targets.carbs}g
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-500"
                          style={{
                            width: `${Math.min(
                              (recommendations.current_nutrition.carbs / recommendations.daily_targets.carbs) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      {recommendations.nutrition_gap.carbs > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Need {recommendations.nutrition_gap.carbs.toFixed(0)}g more carbs
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Fats</span>
                        <span className="text-xs text-muted-foreground">
                          {recommendations.current_nutrition.fats}g / {recommendations.daily_targets.fats}g
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500"
                          style={{
                            width: `${Math.min(
                              (recommendations.current_nutrition.fats / recommendations.daily_targets.fats) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      {recommendations.nutrition_gap.fats > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Need {recommendations.nutrition_gap.fats.toFixed(0)}g more fats
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Search */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Search Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <Input
                        placeholder="Fuzzy search recommended foods..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-12 text-base rounded-xl"
                      />
                      <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                {/* Recommendations Grid */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>
                      Recommended Foods ({filteredRecommendations.length})
                    </CardTitle>
                    {allergies.length > 0 ? (
                      <p className="text-sm text-muted-foreground mt-1">
                        These foods are safe for your allergies:{" "}
                        {recommendations.your_allergies.map((a, index) => (
                          <span key={a}>
                            {index > 0 && ", "}
                            <span className="font-medium">{a}</span>
                          </span>
                        ))}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        All available foods. Add allergies above to filter by dietary restrictions.
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    {filteredRecommendations.length === 0 ? (
                      <div className="text-center py- text-muted-foreground">
                        <p>No foods found matching your search</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredRecommendations.map((food) => {
                          // Determine which macros this food is high in
                          const macroStrengths = [];
                          if (food.protein >= 15) macroStrengths.push('protein');
                          if (food.carbs >= 20) macroStrengths.push('carbs');
                          if (food.fats >= 8) macroStrengths.push('fats');

                          return (
                            <Card key={food.id} className="bg-secondary/30 border-border hover:border-primary transition-colors">
                              <CardContent className="pt-6 space-y-3">
                                <div>
                                  <h4 className="font-semibold text-sm">{food.food_name}</h4>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Per {food.serving_size}
                                  </p>
                                </div>

                                {/* Macro strengths badges */}
                                {macroStrengths.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {macroStrengths.includes('protein') && recommendations.nutrition_gap.protein > 0 && (
                                      <span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 px-2 py-1 rounded">
                                        💪 High Protein
                                      </span>
                                    )}
                                    {macroStrengths.includes('carbs') && recommendations.nutrition_gap.carbs > 0 && (
                                      <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 px-2 py-1 rounded">
                                        🥔 High Carbs
                                      </span>
                                    )}
                                    {macroStrengths.includes('fats') && recommendations.nutrition_gap.fats > 0 && (
                                      <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-100 px-2 py-1 rounded">
                                        🧈 High Fats
                                      </span>
                                    )}
                                  </div>
                                )}

                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div className="bg-card p-2 rounded">
                                    <div className="text-muted-foreground">Calories</div>
                                    <div className="font-bold">{food.calories} kcal</div>
                                  </div>
                                  <div className="bg-card p-2 rounded">
                                    <div className="text-muted-foreground">Protein</div>
                                    <div className="font-bold">{food.protein.toFixed(1)}g</div>
                                  </div>
                                  <div className="bg-card p-2 rounded">
                                    <div className="text-muted-foreground">Carbs</div>
                                    <div className="font-bold">{food.carbs.toFixed(1)}g</div>
                                  </div>
                                  <div className="bg-card p-2 rounded">
                                    <div className="text-muted-foreground">Fats</div>
                                    <div className="font-bold">{food.fats.toFixed(1)}g</div>
                                  </div>
                                </div>

                                {food.ingredients && (
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1">Ingredients:</div>
                                    <div className="text-xs bg-card p-2 rounded">
                                      {food.ingredients}
                                    </div>
                                  </div>
                                )}

                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full text-xs"
                                  onClick={() => {
                                    // Navigate to nutrition page with this food pre-selected
                                    navigate("/dashboard/nutrition", { state: { selectedFood: food } });
                                  }}
                                >
                                  <Heart className="h-3 w-3 mr-1" />
                                  Add to Meal
                                </Button>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
