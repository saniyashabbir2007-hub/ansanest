import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listProducts, deleteProduct, updateProduct, type Product } from "@/lib/products-api";
import { Plus, Pencil, Trash2, Star, Search } from "lucide-react";
import { inr } from "@/lib/business";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: ProductsList,
});

function ProductsList() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["products"], queryFn: listProducts });
  const [q, setQ] = useState("");

  const toggleFeatured = useMutation({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) =>
      updateProduct(id, { featured }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Updated");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = (data ?? []).filter(
    (p) =>
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      p.category.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-foreground">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">{data?.length ?? 0} total</p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> New Product
        </Link>
      </div>

      <div className="mt-6 relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or category…"
          className="w-full rounded-md border border-border bg-background py-2.5 pl-10 pr-3 text-sm focus:border-emerald focus:outline-none"
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-background">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No products found.</div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((p) => (
              <Row
                key={p.id}
                p={p}
                onToggleFeatured={() =>
                  toggleFeatured.mutate({ id: p.id, featured: !p.featured })
                }
                onDelete={() => {
                  if (confirm(`Delete "${p.name}"? This cannot be undone.`)) del.mutate(p.id);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({
  p,
  onToggleFeatured,
  onDelete,
}: {
  p: Product;
  onToggleFeatured: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-4 p-4">
      <div className="h-16 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
        {p.image_url ? (
          <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link
            to="/admin/products/$id"
            params={{ id: p.id }}
            className="truncate font-medium text-foreground hover:underline"
          >
            {p.name}
          </Link>
          {p.featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gold-foreground">
              <Star className="h-2.5 w-2.5 fill-current" /> Featured
            </span>
          )}
        </div>
        <div className="mt-0.5 truncate text-xs text-muted-foreground">
          {p.category}
          {p.sub_type ? ` · ${p.sub_type}` : ""} · {p.gallery_urls.length} image
          {p.gallery_urls.length === 1 ? "" : "s"}
        </div>
      </div>
      <div className="hidden w-32 text-right text-sm text-emerald sm:block">
        {p.price_on_request ? "On request" : p.price != null ? inr(Number(p.price)) : "—"}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onToggleFeatured}
          title={p.featured ? "Unfeature" : "Feature"}
          className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Star className={`h-4 w-4 ${p.featured ? "fill-gold text-gold" : ""}`} />
        </button>
        <Link
          to="/admin/products/$id"
          params={{ id: p.id }}
          className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Pencil className="h-4 w-4" />
        </Link>
        <button
          onClick={onDelete}
          className="rounded p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
