const API_URL = "http://127.0.0.1:8000/api";

// Types
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
}

export interface AuthResponse {
    message: string;
    user: {
        id: number;
        email: string;
        first_name: string;
        username: string;
        is_staff: boolean;
    };
    tokens: {
        access: string;
        refresh: string;
    };
}

export interface UserProfile {
    id: number;
    email: string;
    first_name: string;
    username: string;
    is_staff: boolean;
}

// Token management
export const tokenService = {
    getAccessToken: () => localStorage.getItem("access_token"),
    getRefreshToken: () => localStorage.getItem("refresh_token"),
    setTokens: (access: string, refresh: string) => {
        localStorage.setItem("access_token", access);
        localStorage.setItem("refresh_token", refresh);
    },
    clearTokens: () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
    },
    isTokenValid: () => {
        return !!localStorage.getItem("access_token");
    },
};

// API calls
export const authAPI = {
    register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
        // Simplified registration only requires basic info
        const payload: any = {
            email: credentials.email,
            password: credentials.password,
            confirm_password: credentials.confirmPassword || credentials.password,
            name: credentials.name,
        };

        const response = await fetch(`${API_URL}/register/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error("Registration error:", error);

            // If error is an object with field errors, convert to string
            if (typeof error === "object" && error !== null) {
                const errorMessage = Object.entries(error)
                    .map(([field, messages]: [string, any]) => {
                        const msg = Array.isArray(messages) ? messages[0] : messages;
                        return `${field}: ${msg}`;
                    })
                    .join(" | ");
                throw new Error(errorMessage);
            }

            throw new Error(error.error || error.message || "Registration failed");
        }

        const data: AuthResponse = await response.json();
        tokenService.setTokens(data.tokens.access, data.tokens.refresh);
        localStorage.setItem("user", JSON.stringify(data.user));
        return data;
    },

    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await fetch(`${API_URL}/login/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || error.message || "Login failed");
        }

        const data: AuthResponse = await response.json();
        tokenService.setTokens(data.tokens.access, data.tokens.refresh);
        localStorage.setItem("user", JSON.stringify(data.user));
        return data;
    },

    logout: async (): Promise<void> => {
        const refreshToken = tokenService.getRefreshToken();
        const accessToken = tokenService.getAccessToken();

        try {
            await fetch(`${API_URL}/logout/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ refresh: refreshToken }),
            });
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            tokenService.clearTokens();
        }
    },

    getProfile: async (): Promise<UserProfile> => {
        const accessToken = tokenService.getAccessToken();

        if (!accessToken) {
            throw new Error("No access token");
        }

        const response = await fetch(`${API_URL}/profile/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        return data.user;
    },

    refreshToken: async (): Promise<string> => {
        const refreshToken = tokenService.getRefreshToken();

        if (!refreshToken) {
            throw new Error("No refresh token");
        }

        const response = await fetch(`${API_URL}/token/refresh/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!response.ok) {
            tokenService.clearTokens();
            throw new Error("Token refresh failed");
        }

        const data = await response.json();
        localStorage.setItem("access_token", data.access);
        if (data.refresh) {
            localStorage.setItem("refresh_token", data.refresh);
        }
        return data.access;
    },
};

// Body measurements API
export const bodyMeasurementAPI = {
    save: async (data: {
        weight: number;
        height: number;
        age: number;
        gender: string;
        activityLevel: string;
    }) => {
        const accessToken = tokenService.getAccessToken();

        if (!accessToken) {
            throw new Error("Not authenticated");
        }

        const response = await fetch(`${API_URL}/body-measurements/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                weight: parseFloat(String(data.weight)),
                height: parseFloat(String(data.height)),
                age: parseInt(String(data.age)),
                gender: data.gender,
                activity_level: data.activityLevel, // Convert to snake_case for backend
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error("Measurement save error:", error);
            throw new Error(JSON.stringify(error) || "Failed to save measurements");
        }

        return await response.json();
    },

    getLatest: async () => {
        const accessToken = tokenService.getAccessToken();
        if (!accessToken) throw new Error("Not authenticated");

        const response = await fetch(`${API_URL}/body-measurements/latest/`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) throw new Error("Failed to fetch latest measurement");
        return await response.json();
    },

    getHistory: async (limit: number = 30) => {
        const accessToken = tokenService.getAccessToken();
        if (!accessToken) throw new Error("Not authenticated");

        const response = await fetch(
            `${API_URL}/body-measurements/?limit=${limit}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        if (!response.ok) throw new Error("Failed to fetch measurements");
        return await response.json();
    },

    getStats: async () => {
        const accessToken = tokenService.getAccessToken();
        if (!accessToken) throw new Error("Not authenticated");

        const response = await fetch(`${API_URL}/body-measurements/stats/`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) throw new Error("Failed to fetch stats");
        return await response.json();
    },
};

// Goal API
export const goalAPI = {
    save: async (fitnessGoal: string) => {
        const accessToken = tokenService.getAccessToken();

        if (!accessToken) {
            throw new Error("Not authenticated");
        }

        const goalTypeMap: Record<string, string> = {
            lose: "lose_weight",
            gain: "gain_muscle",
            maintain: "maintain",
            endurance: "maintain", // Map to maintain as there's no endurance goal type
        };

        const response = await fetch(`${API_URL}/goals/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                goal_type: goalTypeMap[fitnessGoal] || fitnessGoal,
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to save goal");
        }

        return await response.json();
    },
};
// Nutrition API - Meals
export const mealAPI = {
    logMeal: async (mealData: {
        meal_type: string;
        food_name: string;
        quantity: number;
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
        date?: string;
        notes?: string;
    }) => {
        const accessToken = tokenService.getAccessToken();
        if (!accessToken) throw new Error("Not authenticated");

        const response = await fetch(`${API_URL}/meals/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(mealData),
        });

        if (!response.ok) {
            try {
                const error = await response.json();
                throw new Error(JSON.stringify(error));
            } catch (e) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }
        }

        return await response.json();
    },

    getMeals: async (date?: string) => {
        const accessToken = tokenService.getAccessToken();
        if (!accessToken) throw new Error("Not authenticated");

        const url = new URL(`${API_URL}/meals/`);
        if (date) url.searchParams.append("date", date);

        const response = await fetch(url.toString(), {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) throw new Error("Failed to fetch meals");
        return await response.json();
    },

    deleteMeal: async (mealId: number) => {
        const accessToken = tokenService.getAccessToken();
        if (!accessToken) throw new Error("Not authenticated");

        const response = await fetch(`${API_URL}/meals/${mealId}/`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) throw new Error("Failed to delete meal");
        return response.status === 204;
    },
};

// Nutrition API - Custom Foods
export const customFoodAPI = {
    createFood: async (foodData: {
        food_name: string;
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
        serving_size?: string;
    }) => {
        const accessToken = tokenService.getAccessToken();
        if (!accessToken) throw new Error("Not authenticated");

        const response = await fetch(`${API_URL}/custom-foods/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(foodData),
        });

        if (!response.ok) {
            try {
                const error = await response.json();
                throw new Error(JSON.stringify(error));
            } catch (e) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }
        }

        return await response.json();
    },

    getFoods: async (favorite?: boolean) => {
        const accessToken = tokenService.getAccessToken();
        if (!accessToken) throw new Error("Not authenticated");

        const url = new URL(`${API_URL}/custom-foods/`);
        if (favorite !== undefined) {
            url.searchParams.append("favorite", favorite ? "true" : "false");
        }

        const response = await fetch(url.toString(), {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) throw new Error("Failed to fetch foods");
        return await response.json();
    },

    deleteFood: async (foodId: number) => {
        const accessToken = tokenService.getAccessToken();
        if (!accessToken) throw new Error("Not authenticated");

        const response = await fetch(`${API_URL}/custom-foods/${foodId}/`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) throw new Error("Failed to delete food");
        return response.status === 204;
    },

    updateFood: async (foodId: number, foodData: any) => {
        const accessToken = tokenService.getAccessToken();
        if (!accessToken) throw new Error("Not authenticated");

        const response = await fetch(`${API_URL}/custom-foods/${foodId}/`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(foodData),
        });

        if (!response.ok) throw new Error("Failed to update food");
        return await response.json();
    },

    getAllFoods: async () => {
        const accessToken = tokenService.getAccessToken();
        if (!accessToken) throw new Error("Not authenticated");

        const response = await fetch(`${API_URL}/all-foods/`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) throw new Error("Failed to fetch all foods");
        return await response.json();
    },
};

// Workout API
export const workoutAPI = {
    logWorkout: async (workoutData: {
        workout_type: string;
        exercise_name?: string;
        duration_minutes: number;
        intensity: string;
        reps?: number;
        sets?: number;
        body_part?: string;
        calories_burned?: number;
        date?: string;
        notes?: string;
    }) => {
        const accessToken = tokenService.getAccessToken();
        if (!accessToken) throw new Error("Not authenticated");

        const response = await fetch(`${API_URL}/workouts/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(workoutData),
        });

        if (!response.ok) {
            try {
                const error = await response.json();
                throw new Error(JSON.stringify(error));
            } catch (e) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }
        }

        return await response.json();
    },

    getWorkouts: async (date?: string) => {
        const accessToken = tokenService.getAccessToken();
        if (!accessToken) throw new Error("Not authenticated");

        const url = new URL(`${API_URL}/workouts/`);
        if (date) url.searchParams.append("date", date);

        const response = await fetch(url.toString(), {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) throw new Error("Failed to fetch workouts");
        return await response.json();
    },

    deleteWorkout: async (workoutId: number) => {
        const accessToken = tokenService.getAccessToken();
        if (!accessToken) throw new Error("Not authenticated");

        const response = await fetch(`${API_URL}/workouts/${workoutId}/`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) throw new Error("Failed to delete workout");
        return response.status === 204;
    },

    getWorkoutPresets: async () => {
        const accessToken = tokenService.getAccessToken();
        if (!accessToken) throw new Error("Not authenticated");

        const response = await fetch(`${API_URL}/all-workout-presets/`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) throw new Error("Failed to fetch workout presets");
        return await response.json();
    },
};

export const customWorkoutAPI = {
    create: async (data: {
        name: string;
        workout_type: string;
        duration_minutes: number;
        intensity: string;
        body_part?: string;
        notes?: string;
    }) => {
        const accessToken = tokenService.getAccessToken();
        if (!accessToken) throw new Error("Not authenticated");

        const response = await fetch(`${API_URL}/custom-workouts/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error("Failed to create custom workout");
        return await response.json();
    },

    getAll: async () => {
        const accessToken = tokenService.getAccessToken();
        if (!accessToken) throw new Error("Not authenticated");

        const response = await fetch(`${API_URL}/custom-workouts/`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) throw new Error("Failed to fetch custom workouts");
        return await response.json();
    },

    update: async (id: number, data: any) => {
        const accessToken = tokenService.getAccessToken();
        if (!accessToken) throw new Error("Not authenticated");

        const response = await fetch(`${API_URL}/custom-workouts/${id}/`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error("Failed to update custom workout");
        return await response.json();
    },

    delete: async (id: number) => {
        const accessToken = tokenService.getAccessToken();
        if (!accessToken) throw new Error("Not authenticated");

        const response = await fetch(`${API_URL}/custom-workouts/${id}/`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) throw new Error("Failed to delete custom workout");
        return response.status === 204;
    },
};

// Daily Summary API
export const summaryAPI = {
    getDailySummary: async (date?: string) => {
        const accessToken = tokenService.getAccessToken();
        if (!accessToken) throw new Error("Not authenticated");

        const url = new URL(`${API_URL}/daily-summary/`);
        if (date) url.searchParams.append("date", date);

        const response = await fetch(url.toString(), {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) throw new Error("Failed to fetch daily summary");
        return await response.json();
    },

    getStreak: async () => {
        const accessToken = tokenService.getAccessToken();
        if (!accessToken) throw new Error("Not authenticated");

        const response = await fetch(`${API_URL}/streak/`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) throw new Error("Failed to fetch streak");
        return await response.json();
    },

    getWeeklyStats: async () => {
        const accessToken = tokenService.getAccessToken();
        if (!accessToken) throw new Error("Not authenticated");

        const response = await fetch(`${API_URL}/weekly-stats/`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) throw new Error("Failed to fetch weekly stats");
        return await response.json();
    },
};

export const allergyAPI = {
    getAllergies: async () => {
        const accessToken = tokenService.getAccessToken();
        if (!accessToken) throw new Error("Not authenticated");

        const response = await fetch(`${API_URL}/allergies/`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) throw new Error("Failed to fetch allergies");
        return await response.json();
    },

    addAllergy: async (ingredient: string, severity: "mild" | "moderate" | "severe" = "moderate") => {
        const accessToken = tokenService.getAccessToken();
        if (!accessToken) throw new Error("Not authenticated");

        const response = await fetch(`${API_URL}/allergies/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ ingredient, severity }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(JSON.stringify(error));
        }

        return await response.json();
    },

    removeAllergy: async (allergyId: number) => {
        const accessToken = tokenService.getAccessToken();
        if (!accessToken) throw new Error("Not authenticated");

        const response = await fetch(`${API_URL}/allergies/${allergyId}/`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) throw new Error("Failed to remove allergy");
        return await response.json();
    },
};

export const recommendationAPI = {
    getMealRecommendations: async (limit?: number) => {
        const accessToken = tokenService.getAccessToken();
        if (!accessToken) throw new Error("Not authenticated");

        const url = limit
            ? `${API_URL}/recommendations/?limit=${limit}`
            : `${API_URL}/recommendations/`;

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) throw new Error("Failed to fetch recommendations");
        return await response.json();
    },

    getWorkoutRecommendations: async (focus?: string) => {
        const accessToken = tokenService.getAccessToken();
        if (!accessToken) throw new Error("Not authenticated");

        const url = focus
            ? `${API_URL}/workout-recommendations/?override_focus=${focus}`
            : `${API_URL}/workout-recommendations/`;

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) throw new Error("Failed to fetch workout recommendations");
        return await response.json();
    },
};

// Settings & Profile API
export const settingsAPI = {
    updateProfile: async (data: {
        first_name?: string;
        phone?: string;
        age?: number;
        gender?: string;
        medical_conditions?: string;
    }) => {
        const accessToken = tokenService.getAccessToken();
        if (!accessToken) throw new Error("Not authenticated");

        const response = await fetch(`${API_URL}/profile/`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to update profile");
        }

        return await response.json();
    },

    getUserFullData: async () => {
        const accessToken = tokenService.getAccessToken();
        if (!accessToken) throw new Error("Not authenticated");

        const response = await fetch(`${API_URL}/profile/`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) throw new Error("Failed to fetch user data");
        const data = await response.json();
        return data.user;
    },
};

export const gamificationAPI = {
    getStatus: async () => {
        const accessToken = tokenService.getAccessToken();
        if (!accessToken) throw new Error("Not authenticated");

        const response = await fetch(`${API_URL}/gamification/status/`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) throw new Error("Failed to fetch gamification status");
        return await response.json();
    },

    markSeen: async (badgeIds: number[]) => {
        const accessToken = tokenService.getAccessToken();
        if (!accessToken) throw new Error("Not authenticated");

        const response = await fetch(`${API_URL}/gamification/mark-seen/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ badge_ids: badgeIds }),
        });

        if (!response.ok) throw new Error("Failed to mark badges as seen");
        return await response.json();
    },
};