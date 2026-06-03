import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProductById, updateProduct, deleteProduct } from "@/lib/products-api";
import { ProductForm } from "@/components/admin/ProductForm";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/products/$id")({
  component: EditProduct,
});

function EditProduct() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
  });

  const mut = useMutation({
    mutationFn: (patch: any) => updateProduct(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["product", id] });
      toast.success("Saved");
    },
    onError: (e: any) => toast.error(e.message || "Failed to save"),
  });

  const del = useMutation({
    mutationFn: () => deleteProduct(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Deleted");
      navigate({ to: "/admin/products" });
    },
  });

  if (isLoading) return <div className="text-muted-foreground">Loading…</div>;
  if (!data) return <div>Product not found.</div>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <Link to="/admin/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to products
        </Link>
        <button
          onClick={() => {
            if (confirm(`Delete "${data.name}"?`)) del.mutate();
          }}
          className="inline-flex items-center gap-1.5 rounded-md border border-destructive/30 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" /> Delete
        </button>
      </div>
      <h1 className="mt-4 font-display text-3xl text-foreground">{data.name}</h1>
      <div className="mt-8">
        <ProductForm
          initial={data}
          submitLabel="Save changes"
          submitting={mut.isPending}
          onSubmit={(v) => mut.mutate(v)}
        />
      </div>
    </div>
  );
}
