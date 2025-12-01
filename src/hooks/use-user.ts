"use client";

import { useState, useEffect, useContext } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { authClient } from "@/firebase/auth/auth-client";
import { FirebaseContext } from "@/firebase/client-provider";

type User = FirebaseUser | null;

interface UseUser {
  user: User;
  isUserLoading: boolean;
}

export const useUser = (): UseUser => {
  const [user, setUser] = useState<User>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  const { firebase } = useContext(FirebaseContext);
  
  useEffect(() => {
    if (!firebase) {
      setIsUserLoading(false);
      return; // Exit if Firebase is not initialized
    }

    const unsubscribe = onAuthStateChanged(authClient, (authUser) => {
      setUser(authUser);
      setIsUserLoading(false);
    });

    return () => unsubscribe();
  }, [firebase]);

  return { user, isUserLoading };
};
