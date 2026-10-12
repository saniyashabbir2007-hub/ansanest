import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { pb } from "@/integrations/pocketbase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // Check if the PocketBase authStore has a valid session token
    if (!pb.authStore.isValid || !pb.authStore.record) {
      throw redirect({ to: "/auth" });
    }

    return { user: pb.authStore.record };
  },
  component: () => <Outlet />,
});