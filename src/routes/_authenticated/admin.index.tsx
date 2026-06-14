import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listProducts, listCategories } from "@/lib/products-api";
import { Plus, Package, Tag, Star, Image as ImageIcon } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const products = useQuery({ queryKey: ["products"], queryFn: listProducts });
  const categories = useQuery({ queryKey: ["categories"], queryFn: listCategories });

  const total = products.data?.length ?? 0;
  const featured = products.data?.filter((p) => p.featured).length ?? 0;
  const totalImages =
    products.data?.reduce((acc, p) => acc + (p.gallery_urls?.length ?? 0), 0) ?? 0;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your products, prices, photos and categories.
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> New Product
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Package} label="Products" value={total} />
        <Stat icon={Star} label="Featured" value={featured} />
        <Stat icon={Tag} label="Categories" value={categories.data?.length ?? 0} />
        <Stat icon={ImageIcon} label="Gallery images" value={totalImages} />
      </div>

      <div className="mt-10 rounded-xl border border-border bg-background p-6">
        <h2 className="font-display text-xl text-foreground">Quick actions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <QuickLink to="/admin/products" title="Manage products" desc="Edit prices, photos and descriptions" />
          <QuickLink to="/admin/products/new" title="Add a new product" desc="Upload photos and create a listing" />
          <QuickLink to="/admin/categories" title="Manage categories" desc="Add, rename or remove categories" />
          <QuickLink to="/" title="View live site" desc="See how the site looks to visitors" />
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-emerald" />
      </div>
      <div className="mt-2 font-display text-3xl text-foreground">{value}</div>
    </div>
  );
}

function QuickLink({ to, title, desc }: { to: string; title: string; desc: string }) {
  return (
    <Link
      to={to}
      className="block rounded-lg border border-border p-4 transition-colors hover:bg-muted"
    >
      <div className="font-medium text-foreground">{title}</div>
      <div className="text-sm text-muted-foreground">{desc}</div>
    </Link>
  );
}
