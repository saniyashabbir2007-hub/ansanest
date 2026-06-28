import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authenticated/admin/product-reviews"
)({
  component: ProductReviewsPage,
});

function ProductReviewsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">
        Product Reviews
      </h1>

      <p className="mt-2 text-muted-foreground">
        Customer reviews will appear here.
      </p>
    </div>
  );
}