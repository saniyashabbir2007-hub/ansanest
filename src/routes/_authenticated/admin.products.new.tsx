import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProduct } from "@/lib/products-api";
import { ProductForm } from "@/components/admin/ProductForm";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/products/new")({
  component: NewProduct,
});

function NewProduct() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const mut = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created");
      navigate({ to: "/admin/products" });
    },
    onError: (e: any) => toast.error(e.message || "Failed to create"),
  });

  return (
    <div>
      <Link to="/admin/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>
      <h1 className="mt-4 font-display text-3xl text-foreground">New product</h1>
      <div className="mt-8">
        <ProductForm
          submitLabel="Create product"
          submitting={mut.isPending}
          onSubmit={(v) => mut.mutate(v)}
        />
      </div>
    </div>
  );
}
