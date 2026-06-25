import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRoles(u: User | null) {
      if (!u) {
        setIsAdmin(false);
        setIsSuperAdmin(false);
        return;
      }
      const [adminRes, superRes] = await Promise.all([
        supabase
          .from("user_roles")
          .select("role,disabled")
          .eq("user_id", u.id)
          .eq("role", "admin")
          .eq("disabled", false)
          .maybeSingle(),
        supabase
          .from("super_admins")
          .select("user_id")
          .eq("user_id", u.id)
          .maybeSingle(),
      ]);
      console.log("Current User:", u?.id);
console.log("Admin Result:", adminRes.data);
console.log("Super Admin Result:", superRes.data);

      setIsAdmin(!!adminRes.data);
      setIsSuperAdmin(!!superRes.data);
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setTimeout(() => loadRoles(s?.user ?? null), 0);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      loadRoles(data.session?.user ?? null).finally(() => setLoading(false));
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, user, isAdmin, isSuperAdmin, loading };
}
