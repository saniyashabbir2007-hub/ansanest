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
    <div>
      <h1 className="font-display text-3xl text-foreground">Categories</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Categories appear in the catalog filter and the product form.
      </p>

      <div className="mt-6 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name…"
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-emerald focus:outline-none"
        />
        <button
          disabled={!name.trim() || add.isPending}
          onClick={() => add.mutate(name.trim())}
          className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-60"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-background divide-y divide-border">
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
    <div className="flex items-center gap-3 p-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1 rounded border border-transparent bg-transparent px-2 py-1 text-sm hover:border-border focus:border-emerald focus:outline-none"
      />
      <input
        type="number"
        value={order}
        onChange={(e) => setOrder(Number(e.target.value))}
        className="w-20 rounded border border-border bg-background px-2 py-1 text-sm"
      />
      <button
        disabled={!dirty}
        onClick={() => onSave({ name, slug: slugify(name), sort_order: order })}
        className="rounded p-2 text-muted-foreground hover:bg-muted disabled:opacity-30"
        title="Save"
      >
        <Save className="h-4 w-4" />
      </button>
      <button onClick={onDelete} className="rounded p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
