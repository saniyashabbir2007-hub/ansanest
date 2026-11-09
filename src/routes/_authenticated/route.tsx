import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";

// Helper to check Firebase auth state before the route mounts
function getCurrentFirebaseUser() {
  return new Promise((resolve) => {
    // If the auth client already has a resolved user, return immediately
    if (auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }
    // Otherwise wait for the initial token resolution
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const user = await getCurrentFirebaseUser();
    if (!user) {
      throw redirect({ to: "/auth" });
    }
    return { user };
  },
  component: () => <Outlet />,
});