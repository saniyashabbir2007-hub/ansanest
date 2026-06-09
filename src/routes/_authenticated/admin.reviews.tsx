import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2, Pencil, Eye, EyeOff, Star, X } from "lucide-react";
import { toast } from "sonner";
import {
  listAllReviews,
  createReview,
  updateReview,
  deleteReview,
  type Review,
  type ReviewInput,
} from "@/lib/reviews-api";

export const Route = createFileRoute("/_authenticated/admin/reviews")({
  component: ReviewsAdminPage,
});

const empty: ReviewInput = {
  customer_name: "",
  customer_photo_url: "",
  customer_location: "",
  product_name: "",
  rating: 5,
  review_text: "",
  review_date: new Date().toISOString().slice(0, 10),
  is_hidden: false,
  is_featured: false,
};

function ReviewsAdminPage() {
  const qc = useQueryClient();
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews", "all"],
    queryFn: listAllReviews,
  });

  const [editing, setEditing] = useState<Review | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ReviewInput>(empty);

  function startNew() {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  }

  function startEdit(r: Review) {
    setEditing(r);
    setForm({
      customer_name: r.customer_name,
      customer_photo_url: r.customer_photo_url ?? "",
      customer_location: r.customer_location ?? "",
      product_name: r.product_name ?? "",
      rating: r.rating,
      review_text: r.review_text,
      review_date: r.review_date,
      is_hidden: r.is_hidden,
      is_featured: r.is_featured,
    });
    setOpen(true);
  }

  const save = useMutation({
    mutationFn: async () => {
      const payload: ReviewInput = {
        ...form,
        customer_photo_url: form.customer_photo_url?.trim() || null,
        customer_location: form.customer_location?.trim() || null,
        product_name: form.product_name?.trim() || null,
      };
      if (editing) {
        await updateReview(editing.id, payload);
      } else {
        await createReview(payload);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews"] });
      toast.success(editing ? "Review updated" : "Review added");
      setOpen(false);
    },
    onError: (e: any) => toast.error(e.message || "Failed to save"),
  });

  const toggle = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<ReviewInput> }) =>
      updateReview(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reviews"] }),
    onError: (e: any) => toast.error(e.message || "Failed to update"),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteReview(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Review deleted");
    },
    onError: (e: any) => toast.error(e.message || "Failed to delete"),
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-foreground">Reviews & Testimonials</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manually curated testimonials displayed on the homepage.
          </p>
        </div>
        <button
          onClick={startNew}
          className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> New Review
        </button>
      </div>

      {isLoading ? (
        <p className="mt-10 text-sm text-muted-foreground">Loading…</p>
      ) : reviews.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-border bg-background p-10 text-center">
          <p className="text-muted-foreground">
            No reviews yet. Click <strong>New Review</strong> to add your first testimonial.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4">
          {reviews.map((r) => (
            <div
              key={r.id}
              className={`rounded-xl border bg-background p-5 ${
                r.is_hidden ? "border-dashed border-border opacity-60" : "border-border"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-foreground">{r.customer_name}</span>
                    {r.customer_location && (
                      <span className="text-xs text-muted-foreground">· {r.customer_location}</span>
                    )}
                    {r.is_featured && (
                      <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs font-medium text-gold">
                        Featured
                      </span>
                    )}
                    {r.is_hidden && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        Hidden
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < r.rating ? "fill-gold text-gold" : "text-gold/30"
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-xs text-muted-foreground">{r.review_date}</span>
                    {r.product_name && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        · {r.product_name}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-foreground/80">{r.review_text}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    title={r.is_featured ? "Unfeature" : "Feature"}
                    onClick={() =>
                      toggle.mutate({ id: r.id, patch: { is_featured: !r.is_featured } })
                    }
                    className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Star
                      className={`h-4 w-4 ${r.is_featured ? "fill-gold text-gold" : ""}`}
                    />
                  </button>
                  <button
                    title={r.is_hidden ? "Show" : "Hide"}
                    onClick={() =>
                      toggle.mutate({ id: r.id, patch: { is_hidden: !r.is_hidden } })
                    }
                    className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    {r.is_hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    title="Edit"
                    onClick={() => startEdit(r)}
                    className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    title="Delete"
                    onClick={() => {
                      if (confirm(`Delete review from ${r.customer_name}?`)) del.mutate(r.id);
                    }}
                    className="rounded p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-xl bg-background p-6 shadow-luxury">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-foreground">
                {editing ? "Edit review" : "New review"}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Field label="Customer name *">
                <input
                  value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Location (city)">
                <input
                  value={form.customer_location ?? ""}
                  onChange={(e) => setForm({ ...form, customer_location: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Customer photo URL">
                <input
                  value={form.customer_photo_url ?? ""}
                  onChange={(e) => setForm({ ...form, customer_photo_url: e.target.value })}
                  placeholder="https://…"
                  className={inputCls}
                />
              </Field>
              <Field label="Product purchased">
                <input
                  value={form.product_name ?? ""}
                  onChange={(e) => setForm({ ...form, product_name: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Star rating *">
                <select
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                  className={inputCls}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} star{n > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Date *">
                <input
                  type="date"
                  value={form.review_date ?? ""}
                  onChange={(e) => setForm({ ...form, review_date: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Review text *">
                  <textarea
                    value={form.review_text}
                    onChange={(e) => setForm({ ...form, review_text: e.target.value })}
                    rows={4}
                    className={inputCls}
                  />
                </Field>
              </div>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={!!form.is_featured}
                  onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                />
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={!!form.is_hidden}
                  onChange={(e) => setForm({ ...form, is_hidden: e.target.checked })}
                />
                Hidden
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted"
              >
                Cancel
              </button>
              <button
                disabled={
                  save.isPending ||
                  !form.customer_name.trim() ||
                  !form.review_text.trim() ||
                  !form.review_date
                }
                onClick={() => save.mutate()}
                className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-60"
              >
                {save.isPending ? "Saving…" : editing ? "Save changes" : "Add review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-emerald focus:outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
