import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  Package,
  Tag,
  LogOut,
  ExternalLink,
  Users,
  Activity,
  MessageSquareQuote,
  Star,
} from "lucide-react";
import { BUSINESS } from "@/lib/business";
import { toast } from "sonner";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { user, isAdmin, isSuperAdmin, loading, logout } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    try {
      await logout();
      toast.success("Signed out");
      navigate({ to: "/auth" });
    } catch (err: any) {
      toast.error(err?.message || "Failed to sign out");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-xs text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!isAdmin && !isSuperAdmin) {
    return <RequestAccessPanel email={user?.email ?? ""} onSignOut={handleSignOut} />;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="border-b border-border bg-background">
        <div className="container-px mx-auto flex max-w-7xl items-center justify-between py-2.5 sm:py-3">
          <div className="flex items-center gap-4 sm:gap-5">
            <Link to="/admin" className="flex items-center gap-1.5 font-display text-sm sm:text-base font-semibold text-foreground">
              <Logo className="h-6 w-6 sm:h-7 sm:w-7" />
              {BUSINESS.name}
              <span className="text-[10px] sm:text-xs text-muted-foreground font-normal">
                ({isSuperAdmin ? "Super Admin" : "Store Admin"})
              </span>
            </Link>
            <nav className="hidden gap-1 md:flex">
              <AdminLink to="/admin" icon={LayoutDashboard} label="Overview" />
              <AdminLink to="/admin/products" icon={Package} label="Products" />
              <AdminLink to="/admin/categories" icon={Tag} label="Categories" />
              <AdminLink to="/admin/reviews" icon={MessageSquareQuote} label="Reviews" />
              <AdminLink
                to="/admin/product-reviews"
                icon={Star}
                label="Product Reviews"
              />
              {isSuperAdmin && <AdminLink to="/admin/users" icon={Users} label="Admins" />}
              {isSuperAdmin && <AdminLink to="/admin/activity" icon={Activity} label="Activity" />}
            </nav>
          </div>
          <div className="flex items-center gap-1.5">
            <Link
              to="/"
              className="hidden items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted md:inline-flex"
            >
              <ExternalLink className="h-3 w-3" /> View site
            </Link>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
            >
              <LogOut className="h-3 w-3" /> Sign out
            </button>
          </div>
        </div>
        <div className="container-px mx-auto flex max-w-7xl gap-1 overflow-x-auto pb-1.5 pt-0.5 md:hidden text-xs">
          <AdminLink to="/admin" icon={LayoutDashboard} label="Overview" />
          <AdminLink to="/admin/products" icon={Package} label="Products" />
          <AdminLink to="/admin/categories" icon={Tag} label="Categories" />
          <AdminLink to="/admin/reviews" icon={MessageSquareQuote} label="Reviews" />
          <AdminLink
            to="/admin/product-reviews"
            icon={Star}
            label="Product Reviews"
          />
          {isSuperAdmin && <AdminLink to="/admin/users" icon={Users} label="Admins" />}
          {isSuperAdmin && <AdminLink to="/admin/activity" icon={Activity} label="Activity" />}
        </div>
      </div>
      <div className="container-px mx-auto max-w-7xl py-5 sm:py-6">
        <Outlet />
      </div>
    </div>
  );
}

function AdminLink({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      activeProps={{ className: "bg-muted text-foreground font-medium" }}
      activeOptions={{ exact: to === "/admin" }}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </Link>
  );
}

function RequestAccessPanel({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  return (
    <div className="container-px mx-auto max-w-lg py-12 text-center">
      <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">Admin access required</h1>
      <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
        Your account ({email}) does not currently have admin permissions.
      </p>

      <div className="mt-4 rounded-md border border-border bg-muted/40 p-3 text-xs text-foreground">
        Contact a Super Admin to assign roles to this email.
      </div>

      <div className="mt-4">
        <button
          onClick={onSignOut}
          className="rounded-md border border-border px-3.5 py-1.5 text-xs hover:bg-muted cursor-pointer"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}