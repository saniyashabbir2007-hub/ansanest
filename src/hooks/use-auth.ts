import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  type User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export function useAuth() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // Check role in firestore 'admins' collection if present
          const adminDoc = await getDoc(doc(db, "admins", currentUser.uid));
          if (adminDoc.exists()) {
            const data = adminDoc.data();
            setIsAdmin(true);
            setIsSuperAdmin(data?.role === "superadmin");
          } else {
            // Any authenticated registered user in Firebase Auth is granted store admin access
            setIsAdmin(true);
            setIsSuperAdmin(true);
          }
        } catch {
          setIsAdmin(true);
          setIsSuperAdmin(true);
        }
      } else {
        setIsAdmin(false);
        setIsSuperAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await fbSignOut(auth);
  };

  return {
    user,
    isAuthenticated: Boolean(user),
    isAdmin,
    isSuperAdmin,
    loading,
    loginWithEmail,
    loginWithGoogle,
    logout,
  };
}