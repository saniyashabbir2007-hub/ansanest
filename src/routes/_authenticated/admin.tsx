import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Package, Tag, LogOut, ExternalLink, Users, Activity, MessageSquareQuote } from "lucide-react";
import { BUSINESS } from "@/lib/business";
import { toast } from "sonner";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyAccessRequest, requestAccess } from "@/lib/admin-users.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { user, isAdmin, isSuperAdmin, loading } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth" });
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">Loading…</div>
    );
  }

  if (!isAdmin && !isSuperAdmin) {
    return <RequestAccessPanel email={user?.email ?? ""} onSignOut={handleSignOut} />;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="border-b border-border bg-background">
        <div className="container-px mx-auto flex max-w-7xl items-center justify-between py-4">
          <div className="flex items-center gap-6">
            <Link to="/admin" className="flex items-center gap-2 font-display text-xl text-foreground">
              <img src="/favicon.png" alt="" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
              {BUSINESS.name}
              <span className="text-sm text-muted-foreground">
                {isSuperAdmin ? "Super Admin" : "Store Admin"}
              </span>
            </Link>
            <nav className="hidden gap-1 md:flex">
              <AdminLink to="/admin" icon={LayoutDashboard} label="Overview" />
              <AdminLink to="/admin/products" icon={Package} label="Products" />
              <AdminLink to="/admin/categories" icon={Tag} label="Categories" />
              <AdminLink to="/admin/reviews" icon={MessageSquareQuote} label="Reviews" />
              {isSuperAdmin && <AdminLink to="/admin/users" icon={Users} label="Admins" />}
              {isSuperAdmin && <AdminLink to="/admin/activity" icon={Activity} label="Activity" />}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="hidden items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted md:inline-flex"
            >
              <ExternalLink className="h-3.5 w-3.5" /> View site
            </Link>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
        <div className="container-px mx-auto flex max-w-7xl gap-1 overflow-x-auto pb-2 md:hidden">
          <AdminLink to="/admin" icon={LayoutDashboard} label="Overview" />
          <AdminLink to="/admin/products" icon={Package} label="Products" />
          <AdminLink to="/admin/categories" icon={Tag} label="Categories" />
          <AdminLink to="/admin/reviews" icon={MessageSquareQuote} label="Reviews" />
          {isSuperAdmin && <AdminLink to="/admin/users" icon={Users} label="Admins" />}
          {isSuperAdmin && <AdminLink to="/admin/activity" icon={Activity} label="Activity" />}
        </div>
      </div>
      <div className="container-px mx-auto max-w-7xl py-8">
        <Outlet />
      </div>
    </div>
  );
}

function AdminLink({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
      activeProps={{ className: "bg-muted text-foreground" }}
      activeOptions={{ exact: to === "/admin" }}
    >
      <Icon className="h-4 w-4" /> {label}
    </Link>
  );
}

function RequestAccessPanel({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  const getReq = useServerFn(getMyAccessRequest);
  const reqFn = useServerFn(requestAccess);
  const q = useQuery({ queryKey: ["my-access-request"], queryFn: () => getReq() });
  const m = useMutation({
    mutationFn: () => reqFn(),
    onSuccess: () => { toast.success("Request submitted"); q.refetch(); },
    onError: (e: any) => toast.error(e.message || "Failed to submit request"),
  });

  const status = q.data?.status ?? null;

  return (
    <div className="container-px mx-auto max-w-2xl py-20 text-center">
      <h1 className="font-display text-3xl text-foreground">Admin access required</h1>
      <p className="mt-4 text-muted-foreground">
        Your account ({email}) does not have admin permissions.
      </p>

      {q.isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Checking your request…</p>
      ) : status === "pending" ? (
        <div className="mt-6 rounded-md border border-border bg-muted/40 p-4 text-sm text-foreground">
          Your access request is <span className="font-medium">pending</span> review by an admin.
        </div>
      ) : status === "approved" ? (
        <div className="mt-6 rounded-md border border-emerald/40 bg-emerald/10 p-4 text-sm text-foreground">
          Your request was approved. Please sign out and sign back in to refresh your permissions.
        </div>
      ) : status === "rejected" ? (
        <div className="mt-6 space-y-3">
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-foreground">
            Your previous request was rejected. You can request access again.
          </div>
          <button
            onClick={() => m.mutate()}
            disabled={m.isPending}
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-60"
          >
            {m.isPending ? "Submitting…" : "Request Access"}
          </button>
        </div>
      ) : (
        <button
          onClick={() => m.mutate()}
          disabled={m.isPending}
          className="mt-6 rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-90 disabled:opacity-60"
        >
          {m.isPending ? "Submitting…" : "Request Access"}
        </button>
      )}

      <div className="mt-6">
        <button onClick={onSignOut} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted">
          Sign out
        </button>
      </div>
    </div>
  );
}
