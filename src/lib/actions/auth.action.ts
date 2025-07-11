"use server";

import { db, auth } from "@/firebase/admin"
import { cookies } from "next/headers";
import { SignUpParams, SignInParams, AuthResponse, SessionResponse } from "@/types/auth";

export async function signUp(params: SignUpParams): Promise<AuthResponse> {
    try {
        const { name, email, password } = params;
        
        // This function is called after successful client-side Firebase Auth creation
        // So we should get the user record from Firebase Auth
        let userRecord;
        try {
            userRecord = await auth.getUserByEmail(email);
        } catch (error) {
            console.error("User not found in Firebase Auth:", error);
            return {
                success: false,
                error: "Authentication failed. Please try again."
            };
        }

        // Check if user already exists in Firestore
        const existingUserDoc = await db.collection("users").doc(userRecord.uid).get();
        
        if (existingUserDoc.exists) {
            console.log("User already exists in Firestore");
            return {
                success: true,
                user: {
                    id: userRecord.uid,
                    name: existingUserDoc.data()?.name || name,
                    email,
                }
            };
        }

        // Save user data to Firestore
        await db.collection("users").doc(userRecord.uid).set({
            id: userRecord.uid,
            name,
            email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        console.log("User created successfully in Firestore");
        return {
            success: true,
            user: {
                id: userRecord.uid,
                name,
                email,
            }
        };
    } catch (error) {
        console.error("Sign up error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create user profile"
        };
    }
}

export async function setSessionCookie(idToken: string): Promise<SessionResponse> {
    try {
        const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days in milliseconds
        const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
        
        const cookieStore = await cookies();
        cookieStore.set("session", sessionCookie, {
            maxAge: expiresIn / 1000, // maxAge is in seconds
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        });

        console.log('Session cookie set successfully');
        return { success: true };
    } catch (error) {
        console.error("Session cookie error:", error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Failed to create session" 
        };
    }
}

export async function signIn(params: SignInParams): Promise<AuthResponse> {
    try {
        const { email, password } = params;
        
        // You'll need to handle sign-in on the client side with Firebase Auth
        // This is just for reference - actual sign-in happens client-side
        return { success: true };
    } catch (error) {
        console.error("Sign in error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

// Simple in-memory cache to prevent duplicate user creation attempts
const userCreationCache = new Map<string, Promise<any>>();

export async function getCurrentUser() {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("session");
        
        if (!sessionCookie?.value) {
            console.log('getCurrentUser: No session cookie found');
            return null;
        }

        const decodedClaims = await auth.verifySessionCookie(sessionCookie.value, true);
        console.log('getCurrentUser: Session verified, UID:', decodedClaims.uid);
        
        // Get user data from Firestore
        const userDoc = await db.collection("users").doc(decodedClaims.uid).get();
        
        if (!userDoc.exists) {
            console.log('getCurrentUser: User document does not exist in Firestore for UID:', decodedClaims.uid);
            
            // Check if we're already creating this user
            const existingCreation = userCreationCache.get(decodedClaims.uid);
            if (existingCreation) {
                console.log('getCurrentUser: User creation already in progress, waiting...');
                try {
                    return await existingCreation;
                } catch (error) {
                    console.error('getCurrentUser: Cached user creation failed:', error);
                    userCreationCache.delete(decodedClaims.uid);
                    // Fall through to create user again
                }
            }
            
            // Create a promise for user creation and cache it
            const creationPromise = createUserDocument(decodedClaims.uid);
            userCreationCache.set(decodedClaims.uid, creationPromise);
            
            try {
                const result = await creationPromise;
                // Clear cache after creation attempt
                userCreationCache.delete(decodedClaims.uid);
                
                if (result) {
                    console.log('getCurrentUser: User document created successfully');
                    return result;
                } else {
                    console.error('getCurrentUser: User creation failed, but session is valid');
                    // If user creation fails but session is valid, return basic user info
                    return {
                        id: decodedClaims.uid,
                        name: decodedClaims.name || decodedClaims.email?.split('@')[0] || 'User',
                        email: decodedClaims.email || '',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    };
                }
            } catch (error) {
                // Clear cache on error
                userCreationCache.delete(decodedClaims.uid);
                console.error('getCurrentUser: User creation failed:', error);
                // Still return basic user info if session is valid
                return {
                    id: decodedClaims.uid,
                    name: decodedClaims.name || decodedClaims.email?.split('@')[0] || 'User',
                    email: decodedClaims.email || '',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
            }
        }

        const userData = userDoc.data();
        console.log('getCurrentUser: User data retrieved:', userData?.email);
        return {
            id: decodedClaims.uid,
            name: userData?.name || '',
            email: userData?.email || '',
            createdAt: userData?.createdAt,
            updatedAt: userData?.updatedAt,
        };
    } catch (error) {
        console.error("Get current user error:", error);
        return null;
    }
}

// Helper function to create user document
async function createUserDocument(uid: string) {
    try {
        console.log('createUserDocument: Attempting to create Firestore document for UID:', uid);
        
        // Get user record from Firebase Auth
        const userRecord = await auth.getUser(uid);
        console.log('createUserDocument: Retrieved user record:', userRecord.email);
        
        // Create user document in Firestore
        const userData = {
            id: userRecord.uid,
            name: userRecord.displayName || userRecord.email?.split('@')[0] || 'User',
            email: userRecord.email || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        
        console.log('createUserDocument: About to create document with data:', userData);
        await db.collection("users").doc(userRecord.uid).set(userData);
        console.log('createUserDocument: Firestore document created successfully');
        
        return {
            id: userRecord.uid,
            name: userData.name,
            email: userData.email,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt,
        };
    } catch (error) {
        console.error('createUserDocument: Failed to create Firestore document:', error);
        
        // More detailed error logging
        if (error instanceof Error) {
            console.error('createUserDocument: Error name:', error.name);
            console.error('createUserDocument: Error message:', error.message);
            console.error('createUserDocument: Error stack:', error.stack);
        }
        
        throw error; // Re-throw to let caller handle it
    }
}

export async function isAuthenticated(): Promise<boolean> {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("session");
        
        if (!sessionCookie?.value) {
            console.log('No session cookie found');
            return false;
        }

        await auth.verifySessionCookie(sessionCookie.value, true);
        console.log('Session verified successfully');
        return true;
    } catch (error) {
        console.error('Session verification failed:', error);
        
        // Clear invalid session cookie
        try {
            const cookieStore = await cookies();
            cookieStore.delete("session");
        } catch (clearError) {
            console.error('Failed to clear invalid session cookie:', clearError);
        }
        
        return false;
    }
}

export async function logout(): Promise<SessionResponse> {
    try {
        const cookieStore = await cookies();
        cookieStore.delete("session");
        return { success: true };
    } catch (error) {
        console.error("Logout error:", error);
        return { success: false };
    }
}
