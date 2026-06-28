import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listPendingProductReviews,
  approveProductReview,
  deleteProductReview,
} from "@/lib/products-api";

export const Route = createFileRoute(
  "/_authenticated/admin/product-reviews"
)({
  component: ProductReviewsPage,
});

function ProductReviewsPage() {
  const qc = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["product-reviews"],
    queryFn: listPendingProductReviews,
  });

  const approveMutation = useMutation({
    mutationFn: approveProductReview,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["product-reviews"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProductReview,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["product-reviews"] });
    },
  });

  if (isLoading) {
    return <div>Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Product Reviews</h1>

      {reviews.length === 0 ? (
        <p>No reviews found.</p>
      ) : (
        reviews.map((review: any) => (
          <div
            key={review.id}
            className="border rounded-lg p-4 space-y-2"
          >
            <div>
              <strong>Customer:</strong> {review.customer_name}
            </div>

            <div>
              <strong>Product:</strong>{" "}
              {review.products?.name || "Unknown Product"}
            </div>

            <div>
              <strong>Rating:</strong> ⭐ {review.rating}/5
            </div>

            <div>
              <strong>Review:</strong> {review.review}
            </div>

            <div>
              <strong>Status:</strong>{" "}
              {review.approved ? "Approved" : "Pending"}
            </div>

            {!review.approved && (
              <button
                onClick={() => approveMutation.mutate(review.id)}
                className="px-3 py-2 rounded bg-green-600 text-white mr-2"
              >
                Approve
              </button>
            )}

            <button
              onClick={() => deleteMutation.mutate(review.id)}
              className="px-3 py-2 rounded bg-red-600 text-white"
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}