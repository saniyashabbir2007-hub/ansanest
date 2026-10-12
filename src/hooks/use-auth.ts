import { useState, useEffect } from "react";
import { pb } from "@/integrations/pocketbase/client";
import type { RecordModel } from "pocketbase";

export function useAuth() {
  const [user, setUser] = useState<RecordModel | null>(pb.authStore.record);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Listen to PocketBase authStore state changes
    const unsubscribe = pb.authStore.onChange((token, model) => {
      setUser(model);
    }, true);

    return () => {
      unsubscribe();
    };
  }, []);

  // Determine admin roles from user record fields (or check role property)
  const role = user?.role || user?.type || "";
  const isAdmin = Boolean(
    pb.authStore.isValid && (role === "admin" || role === "superadmin" || user?.is_admin)
  );
  const isSuperAdmin = Boolean(
    pb.authStore.isValid && (role === "superadmin" || user?.is_superadmin)
  );

  return {
    user,
    isAuthenticated: pb.authStore.isValid,
    isAdmin,
    isSuperAdmin,
    loading,
    login: pb.collection("users").authWithPassword.bind(pb.collection("users")),
    logout: () => pb.authStore.clear(),
  };
}