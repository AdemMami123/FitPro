// Extended user profile types for the fitness app
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  
  // Physical attributes
  weight?: number; // in kg
  height?: number; // in cm
  age?: number;
  gender?: 'male' | 'female' | 'other';
  bodyFatPercentage?: number;
  
  // Fitness goals and preferences
  fitnessGoal?: 'weight_loss' | 'muscle_gain' | 'strength' | 'endurance' | 'maintenance';
  exerciseDaysPerWeek?: number;
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  preferredWorkoutDuration?: number; // in minutes
  preferredWorkoutTime?: 'morning' | 'afternoon' | 'evening';
  
  // Health and medical information
  injuries?: string[];
  allergies?: string[];
  medications?: string[];
  
  // Nutrition preferences
  dietaryRestrictions?: string[];
  dailyCalorieGoal?: number;
  macroGoals?: {
    protein: number; // in grams
    carbs: number; // in grams
    fat: number; // in grams
  };
  
  // Activity level
  activityLevel?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  
  // Preferences
  preferredExerciseTypes?: string[];
  gymAccess?: boolean;
  homeEquipment?: string[];
  
  // Progress tracking
  startingWeight?: number;
  targetWeight?: number;
  startDate?: string;
  targetDate?: string;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  category: 'strength' | 'cardio' | 'flexibility' | 'balance';
  muscleGroups: string[];
  equipment?: string[];
  instructions: string[];
  imageUrl?: string;
  videoUrl?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration?: number; // in minutes for cardio
  caloriesBurned?: number; // estimated per set/minute
}

export interface WorkoutSet {
  exerciseId: string;
  weight?: number; // in kg
  reps?: number;
  duration?: number; // in seconds
  distance?: number; // in meters
  restTime?: number; // in seconds
  rpe?: number; // Rate of Perceived Exertion (1-10)
  notes?: string;
}

export interface Workout {
  id: string;
  userId: string;
  name: string;
  category: 'strength' | 'cardio' | 'flexibility' | 'mixed';
  exercises: WorkoutExercise[];
  sets: WorkoutSet[];
  startTime: string;
  endTime?: string;
  totalDuration?: number; // in minutes
  totalCaloriesBurned?: number;
  notes?: string;
  rating?: number; // 1-5 stars
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  
  // For offline sync
  syncStatus?: 'synced' | 'pending' | 'failed';
  lastModified: string;
}

export interface WorkoutPlan {
  id: string;
  userId: string;
  name: string;
  description?: string;
  goal: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in weeks
  workoutsPerWeek: number;
  estimatedTimePerWorkout: number; // in minutes
  workouts: Workout[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  
  // AI-generated fields
  aiGenerated: boolean;
  aiPrompt?: string;
  aiModelUsed?: string;
}

export interface ProgressEntry {
  id: string;
  userId: string;
  date: string;
  weight?: number;
  bodyFatPercentage?: number;
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
  };
  photos?: string[]; // URLs to progress photos
  notes?: string;
  createdAt: string;
}

export interface NutritionEntry {
  id: string;
  userId: string;
  date: string;
  meals: {
    breakfast?: FoodItem[];
    lunch?: FoodItem[];
    dinner?: FoodItem[];
    snacks?: FoodItem[];
  };
  totalCalories: number;
  totalMacros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  waterIntake?: number; // in ml
  createdAt: string;
  updatedAt: string;
}

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  serving: {
    amount: number;
    unit: string;
  };
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  micronutrients?: {
    [key: string]: number;
  };
}

export interface AIChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  context?: {
    workoutPlan?: string;
    currentGoals?: string;
    recentProgress?: string;
  };
}

export interface AIChatSession {
  id: string;
  userId: string;
  title: string;
  messages: AIChatMessage[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

// Health Insights and Metrics
export interface HealthMetric {
  id: string;
  userId: string;
  date: string;
  type: 'weight' | 'body_fat' | 'muscle_mass' | 'water_weight' | 'bone_mass' | 'visceral_fat' | 'bmr' | 'body_age';
  value: number;
  unit: string;
  source?: 'manual' | 'smart_scale' | 'body_scan' | 'calculated';
  notes?: string;
  createdAt: string;
}

export interface VitalSigns {
  id: string;
  userId: string;
  date: string;
  restingHeartRate?: number;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  bloodOxygen?: number; // SpO2 percentage
  temperature?: number; // in Celsius
  notes?: string;
  createdAt: string;
}

export interface SleepData {
  id: string;
  userId: string;
  date: string;
  bedTime?: string;
  sleepTime?: string;
  wakeTime?: string;
  totalSleepDuration?: number; // in minutes
  sleepQuality?: 1 | 2 | 3 | 4 | 5; // 1-5 rating
  deepSleepDuration?: number; // in minutes
  remSleepDuration?: number; // in minutes
  lightSleepDuration?: number; // in minutes
  awakenings?: number;
  notes?: string;
  createdAt: string;
}

export interface StressLevel {
  id: string;
  userId: string;
  date: string;
  level: 1 | 2 | 3 | 4 | 5; // 1-5 scale
  triggers?: string[];
  notes?: string;
  createdAt: string;
}

export interface HydrationEntry {
  id: string;
  userId: string;
  date: string;
  amount: number; // in ml
  timestamp: string;
  createdAt: string;
}

export interface HealthInsight {
  id: string;
  userId: string;
  type: 'trend' | 'recommendation' | 'alert' | 'achievement';
  category: 'weight' | 'fitness' | 'nutrition' | 'sleep' | 'stress' | 'hydration' | 'overall';
  title: string;
  message: string;
  severity?: 'low' | 'medium' | 'high';
  actionable?: boolean;
  recommendations?: string[];
  createdAt: string;
  dismissed?: boolean;
}

export interface HealthDashboard {
  userId: string;
  lastUpdated: string;
  currentMetrics: {
    weight?: number;
    bodyFat?: number;
    bmi?: number;
    restingHeartRate?: number;
    averageSleep?: number;
    stressLevel?: number;
    hydrationGoal?: number;
    dailyHydration?: number;
  };
  trends: {
    weightTrend: 'up' | 'down' | 'stable';
    fitnessProgress: 'improving' | 'declining' | 'stable';
    sleepQuality: 'improving' | 'declining' | 'stable';
    stressLevel: 'improving' | 'declining' | 'stable';
  };
  insights: HealthInsight[];
  goals: {
    targetWeight?: number;
    targetBodyFat?: number;
    dailyWaterGoal?: number;
    sleepGoal?: number;
    stepsGoal?: number;
  };
}
