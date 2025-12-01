// Import the functions you need from the SDKs you need
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, updateProfile } from "firebase/auth";

// Initialize Firebase Authentication and get a reference to the service
export const authClient = getAuth();

// Export authentication related functions with proper type annotations

// Register user
export const registerUser = async (auth: any, email: string, password: string) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

// Sign in user
export const signInWithEmail = async (auth: any, email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

// Reset password
export const resetPassword = async (auth: any, email: string) => {
  return await sendPasswordResetEmail(auth, email);
};

// Sign out
export const signOutUser = async (auth: any) => {
  return await signOut(auth);
};

// Update user profile
export const updateUserName = async (auth: any, name: string) => {
  return await updateProfile(auth.currentUser as any, { displayName: name });
};

export function getFriendlyAuthErrorMessage(error: any): string {
    if (error && typeof error.code === 'string' && error.code.startsWith('auth/')) {
        // Remove "Firebase: " and the auth code itself from the message for a cleaner display
        const message = error.message
          .replace('Firebase: ', '')
          .replace(/\(auth\/.*\)\.?/, '').trim();
        return message || 'An unknown authentication error occurred.';
    }
    return error?.message || 'An unexpected error occurred.';
}
