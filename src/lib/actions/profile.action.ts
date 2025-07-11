"use server";

import { db } from "@/firebase/admin";
import { getCurrentUser } from "./auth.action";
import { UserProfile } from "@/types/fitness";

export async function updateUserProfile(profileData: Partial<UserProfile>) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return {
        success: false,
        error: 'Not authenticated'
      };
    }

    // Update the user profile document
    const profileRef = db.collection("userProfiles").doc(user.id);
    
    const updateData = {
      ...profileData,
      updatedAt: new Date().toISOString()
    };

    await profileRef.set(updateData, { merge: true });

    return {
      success: true,
      message: 'Profile updated successfully'
    };
  } catch (error) {
    console.error("Update profile error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return null;
    }

    const profileDoc = await db.collection("userProfiles").doc(user.id).get();
    
    if (!profileDoc.exists) {
      // Create a basic profile if it doesn't exist
      const basicProfile: Partial<UserProfile> = {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await db.collection("userProfiles").doc(user.id).set(basicProfile);
      return basicProfile as UserProfile;
    }

    const profileData = profileDoc.data();
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      ...profileData
    } as UserProfile;
  } catch (error) {
    console.error("Get profile error:", error);
    return null;
  }
}

export async function isProfileComplete(): Promise<boolean> {
  try {
    const profile = await getUserProfile();
    
    if (!profile) {
      return false;
    }

    // Check if essential profile fields are filled
    const requiredFields = [
      'weight',
      'height',
      'age',
      'gender',
      'fitnessGoal',
      'exerciseDaysPerWeek',
      'experienceLevel',
      'activityLevel'
    ];

    return requiredFields.every(field => 
      profile[field as keyof UserProfile] !== undefined && 
      profile[field as keyof UserProfile] !== null
    );
  } catch (error) {
    console.error("Check profile complete error:", error);
    return false;
  }
}

export async function calculateBMI(weight: number, height: number): Promise<number> {
  // BMI = weight (kg) / (height (m))^2
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}

export async function calculateBMR(profile: UserProfile): Promise<number | null> {
  try {
    if (!profile.weight || !profile.height || !profile.age || !profile.gender) {
      return null;
    }

    let bmr: number;
    
    // Mifflin-St Jeor Equation
    if (profile.gender === 'male') {
      bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
    } else {
      bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
    }

    return Math.round(bmr);
  } catch (error) {
    console.error("Calculate BMR error:", error);
    return null;
  }
}

export async function calculateTDEE(profile: UserProfile): Promise<number | null> {
  try {
    const bmr = await calculateBMR(profile);
    
    if (!bmr || !profile.activityLevel) {
      return null;
    }

    // Activity multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9
    };

    const tdee = bmr * activityMultipliers[profile.activityLevel];
    return Math.round(tdee);
  } catch (error) {
    console.error("Calculate TDEE error:", error);
    return null;
  }
}

export async function getRecommendedCalories(profile: UserProfile): Promise<number | null> {
  try {
    const tdee = await calculateTDEE(profile);
    
    if (!tdee || !profile.fitnessGoal) {
      return null;
    }

    // Calorie adjustments based on goals
    const goalAdjustments = {
      weight_loss: -500, // 500 calorie deficit
      muscle_gain: 300, // 300 calorie surplus
      strength: 0, // maintenance
      endurance: 200, // slight surplus
      maintenance: 0 // maintenance
    };

    const recommendedCalories = tdee + goalAdjustments[profile.fitnessGoal];
    return Math.round(recommendedCalories);
  } catch (error) {
    console.error("Calculate recommended calories error:", error);
    return null;
  }
}

export async function getRecommendedMacros(profile: UserProfile): Promise<{ protein: number; carbs: number; fat: number } | null> {
  try {
    const recommendedCalories = await getRecommendedCalories(profile);
    
    if (!recommendedCalories || !profile.weight || !profile.fitnessGoal) {
      return null;
    }

    let proteinRatio: number;
    let fatRatio: number;

    // Macro ratios based on goals
    switch (profile.fitnessGoal) {
      case 'weight_loss':
        proteinRatio = 0.35; // 35% protein
        fatRatio = 0.25; // 25% fat
        break;
      case 'muscle_gain':
        proteinRatio = 0.30; // 30% protein
        fatRatio = 0.25; // 25% fat
        break;
      case 'strength':
        proteinRatio = 0.25; // 25% protein
        fatRatio = 0.30; // 30% fat
        break;
      case 'endurance':
        proteinRatio = 0.20; // 20% protein
        fatRatio = 0.25; // 25% fat
        break;
      default:
        proteinRatio = 0.25; // 25% protein
        fatRatio = 0.25; // 25% fat
    }

    const proteinCalories = recommendedCalories * proteinRatio;
    const fatCalories = recommendedCalories * fatRatio;
    const carbCalories = recommendedCalories - proteinCalories - fatCalories;

    return {
      protein: Math.round(proteinCalories / 4), // 4 calories per gram
      carbs: Math.round(carbCalories / 4), // 4 calories per gram
      fat: Math.round(fatCalories / 9) // 9 calories per gram
    };
  } catch (error) {
    console.error("Calculate recommended macros error:", error);
    return null;
  }
}
