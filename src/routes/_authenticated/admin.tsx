import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Package, Tag, LogOut, ExternalLink } from "lucide-react";
import { BUSINESS } from "@/lib/business";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();
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

  if (!isAdmin) {
    return (
      <div className="container-px mx-auto max-w-2xl py-20 text-center">
        <h1 className="font-display text-3xl text-foreground">Admin access required</h1>
        <p className="mt-4 text-muted-foreground">
          Your account ({user?.email}) does not yet have admin permissions. An existing admin
          must grant you the "admin" role from the database.
        </p>
        <div className="mt-3 rounded-lg bg-muted p-4 text-left font-mono text-xs text-foreground">
          Your user ID: <span className="select-all">{user?.id}</span>
        </div>
        <button
          onClick={handleSignOut}
          className="mt-6 rounded-md border border-border px-4 py-2 text-sm hover:bg-muted"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="border-b border-border bg-background">
        <div className="container-px mx-auto flex max-w-7xl items-center justify-between py-4">
          <div className="flex items-center gap-6">
            <Link to="/admin" className="font-display text-xl text-foreground">
              {BUSINESS.name} <span className="text-sm text-muted-foreground">Admin</span>
            </Link>
            <nav className="hidden gap-1 md:flex">
              <AdminLink to="/admin" icon={LayoutDashboard} label="Overview" />
              <AdminLink to="/admin/products" icon={Package} label="Products" />
              <AdminLink to="/admin/categories" icon={Tag} label="Categories" />
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
