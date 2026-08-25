import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  slugify,
} from "@/lib/products-api";
import { useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: CategoriesPage,
});

function CategoriesPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["categories"], queryFn: listCategories });
  const [name, setName] = useState("");

  const add = useMutation({
    mutationFn: (n: string) => createCategory({ name: n, slug: slugify(n), sort_order: (data?.length ?? 0) + 1 }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      setName("");
      toast.success("Category added");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: any }) => updateCategory(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Updated");
    },
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Deleted");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-1 sm:px-4">
      <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">Categories</h1>
      <p className="mt-1 text-xs text-muted-foreground">
        Categories appear in the catalog filter and the product form.
      </p>

      <div className="mt-4 flex items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name…"
          className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
        />
        <button
          disabled={!name.trim() || add.isPending}
          onClick={() => add.mutate(name.trim())}
          className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-foreground px-3.5 py-1.5 text-xs font-semibold text-background shadow-2xs hover:opacity-90 disabled:opacity-60 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-background divide-y divide-border">
        {data?.map((c) => (
          <CategoryRow
            key={c.id}
            cat={c}
            onSave={(patch) => update.mutate({ id: c.id, patch })}
            onDelete={() => {
              if (confirm(`Delete category "${c.name}"? Existing products will keep their category name.`))
                del.mutate(c.id);
            }}
          />
        ))}
      </div>
    </div>
  );
}

function CategoryRow({
  cat,
  onSave,
  onDelete,
}: {
  cat: { id: string; name: string; slug: string; sort_order: number };
  onSave: (patch: any) => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(cat.name);
  const [order, setOrder] = useState(cat.sort_order);
  const dirty = name !== cat.name || order !== cat.sort_order;

  return (
    <div className="flex items-center justify-between gap-1.5 p-2.5 sm:p-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="min-w-0 flex-1 truncate rounded border border-transparent bg-transparent px-2 py-1 text-xs sm:text-sm text-foreground hover:border-border focus:border-foreground focus:outline-none"
      />
      <div className="flex flex-shrink-0 items-center gap-1 sm:gap-1.5">
        <input
          type="number"
          value={order}
          onChange={(e) => setOrder(Number(e.target.value))}
          className="h-7 w-12 rounded border border-border bg-background px-1.5 text-center text-xs text-foreground focus:border-foreground focus:outline-none sm:h-8 sm:w-16"
        />
        <button
          disabled={!dirty}
          onClick={() => onSave({ name, slug: slugify(name), sort_order: order })}
          className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 cursor-pointer sm:h-8 sm:w-8"
          title="Save"
        >
          <Save className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onDelete}
          className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer sm:h-8 sm:w-8"
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}