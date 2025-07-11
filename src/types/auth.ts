export interface SignUpParams {
  name: string;
  email: string;
  password: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile extends User {
  weight?: number;
  height?: number;
  fitnessGoal?: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'strength' | 'endurance';
  exerciseDaysPerWeek?: number;
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  age?: number;
  gender?: 'male' | 'female' | 'other';
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export interface SessionResponse {
  success: boolean;
  error?: string;
}
