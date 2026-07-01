import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  listCategories,
  uploadProductImage,
  uploadProductVideo,
  slugify,
  type Product,
  type ProductInput,
} from "@/lib/products-api";
import { Upload, X, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";

export type ProductFormValues = ProductInput;

const empty: ProductFormValues = {
  slug: "",
  name: "",
  category: "",
  sub_type: null,
  price: null,
  price_on_request: false,
  image_url: "",
  gallery_urls: [],
  video_urls: [],
  short_description: "",
  description: "",
  features: [],
  colors: [],
  color_variants: [],
  material: "",
  dimensions: "",
  availability: "Made to Order",
  featured: false,
  sort_order: 0,
};

export function ProductForm({
  initial,
  onSubmit,
  submitLabel,
  submitting,
}: {
  initial?: Product;
  onSubmit: (values: ProductFormValues) => void | Promise<void>;
  submitLabel: string;
  submitting?: boolean;
}) {
  const categories = useQuery({ queryKey: ["categories"], queryFn: listCategories });
  const [v, setV] = useState<ProductFormValues>(() =>
    initial
      ? {
          slug: initial.slug,
          name: initial.name,
          category: initial.category,
          sub_type: initial.sub_type,
          price: initial.price != null ? Number(initial.price) : null,
          price_on_request: initial.price_on_request,
          image_url: initial.image_url,
          gallery_urls: initial.gallery_urls ?? [],
          video_urls: (initial as any).video_urls ?? [],
          short_description: initial.short_description,
          description: initial.description,
          features: initial.features ?? [],
          colors: initial.colors ?? [],
          color_variants: (initial as any).color_variants ?? [],
          material: initial.material,
          dimensions: initial.dimensions,
          availability: initial.availability,
          featured: initial.featured,
          sort_order: initial.sort_order,
        }
      : empty,
  );
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingVideos, setUploadingVideos] = useState(false);
  const [featuresText, setFeaturesText] = useState(
    (initial?.features ?? []).join("\n"),
  );
  const [colorsText, setColorsText] = useState(
  (initial?.colors ?? []).join("\n"),
);
console.log("INITIAL COLORS:", initial?.colors);
console.log("COLORS TEXT:", colorsText);

  function set<K extends keyof ProductFormValues>(k: K, val: ProductFormValues[K]) {
    setV((s) => ({ ...s, [k]: val }));
  }

  async function handleMainUpload(file: File) {
    setUploadingMain(true);
    try {
      const url = await uploadProductImage(file);
      set("image_url", url);
      if (v.gallery_urls.length === 0) set("gallery_urls", [url]);
      toast.success("Image uploaded");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploadingMain(false);
    }
  }

  async function handleGalleryUpload(files: FileList) {
    setUploadingGallery(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        urls.push(await uploadProductImage(file));
      }
      set("gallery_urls", [...v.gallery_urls, ...urls]);
      toast.success(`${urls.length} image${urls.length === 1 ? "" : "s"} uploaded`);
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploadingGallery(false);
    }
  }

  async function handleVideoUpload(files: FileList) {
  setUploadingVideos(true);

  try {
    const urls: string[] = [];

    for (const file of Array.from(files)) {
      urls.push(await uploadProductVideo(file));
    }

    set("video_urls", [
      ...(v.video_urls ?? []),
      ...urls,
    ]);

    toast.success(
      `${urls.length} video${urls.length === 1 ? "" : "s"} uploaded`
    );
  } catch (e: any) {
    toast.error(e.message || "Upload failed");
  } finally {
    setUploadingVideos(false);
  }
}

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const features = featuresText
  .split("\n")
  .map((s) => s.trim())
  .filter(Boolean);

const colors = colorsText
  .split("\n")
  .map((s) => s.trim())
  .filter(Boolean);

const slug = v.slug || slugify(v.name);
    if (!v.name.trim()) return toast.error("Name is required");
    if (!v.category) return toast.error("Category is required");
    if (!v.image_url) return toast.error("Main image is required");
onSubmit({
  ...v,
  slug,
  features,
  colors,
});  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <Card title="Basic details">
          <Field label="Product name *">
            <input
              required
              value={v.name}
              onChange={(e) => {
                set("name", e.target.value);
                if (!initial) set("slug", slugify(e.target.value));
              }}
              className={inputCls}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category *">
              <select
                required
                value={v.category}
                onChange={(e) => set("category", e.target.value)}
                className={inputCls}
              >
                <option value="">Select…</option>
                {categories.data?.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Sub-type (optional)">
              <input
                value={v.sub_type ?? ""}
                onChange={(e) => set("sub_type", e.target.value || null)}
                placeholder="e.g. U-Shaped Sectional Sofas"
                className={inputCls}
              />
            </Field>
          </div>
          <Field label="URL slug">
            <input
              value={v.slug}
              onChange={(e) => set("slug", slugify(e.target.value))}
              className={inputCls}
            />
            <p className="mt-1 text-xs text-muted-foreground">/product/{v.slug || "your-slug"}</p>
          </Field>
        </Card>

        <Card title="Pricing">
          <div className="flex items-center gap-3">
            <input
              id="por"
              type="checkbox"
              checked={v.price_on_request}
              onChange={(e) => set("price_on_request", e.target.checked)}
            />
            <label htmlFor="por" className="text-sm">Show as "Price on Request"</label>
          </div>
          {!v.price_on_request && (
            <Field label="Price (₹)">
              <input
                type="number"
                step="1"
                min="0"
                value={v.price ?? ""}
                onChange={(e) => set("price", e.target.value === "" ? null : Number(e.target.value))}
                className={inputCls}
              />
            </Field>
          )}
        </Card>

        <Card title="Descriptions">
          <Field label="Short description (shown on cards)">
            <textarea
              rows={2}
              value={v.short_description}
              onChange={(e) => set("short_description", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Full description (shown on product page)">
            <textarea
              rows={8}
              value={v.description}
              onChange={(e) => set("description", e.target.value)}
              className={inputCls}
            />
          </Field>
        </Card>

        <Card title="Specifications">
          <Field label="Features (one per line)">
            <textarea
              rows={5}
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              placeholder={"Hand-tufted\nSolid wood frame\nStain-resistant fabric"}
              className={inputCls}
            />
          </Field> 
          
          <Field label="Available Colors (one per line)">
  <textarea
    rows={5}
    value={colorsText}
    onChange={(e) => setColorsText(e.target.value)}
    placeholder={"Ivory White\nBeige\nTaupe\nCharcoal Grey\nEmerald Green"}
    className={inputCls}
  />
</Field>
<Card title="Color Variants">
  <div className="space-y-4">
    {(v.color_variants || []).map((variant: any, index: number) => (
      <div
        key={index}
        className="rounded-lg border p-4 space-y-3"
      >
        <input
          placeholder="Color Name"
          value={variant.name || ""}
          onChange={(e) => {
            const variants = [...(v.color_variants || [])];
            variants[index].name = e.target.value;
            set("color_variants", variants);
          }}
          className={inputCls}
        />

        <UploadBox
          uploading={false}
          multiple
          label="Upload Variant Images"
          onFiles={async (files) => {
            const uploaded: string[] = [];

            for (const file of Array.from(files)) {
              uploaded.push(await uploadProductImage(file));
            }

            const variants = [...(v.color_variants || [])];

            variants[index].images = [
              ...(variants[index].images || []),
              ...uploaded,
            ];

            set("color_variants", variants);
          }}
        />

        <div className="grid grid-cols-3 gap-3">
          {(variant.images || []).map(
            (img: string, imgIndex: number) => (
              <div
                key={imgIndex}
                className="relative"
              >
                <img
                  src={img}
                  className="aspect-square rounded-md object-cover"
                />

                <button
                  type="button"
                  className="absolute right-1 top-1 rounded-full bg-white p-1"
                  onClick={() => {
                    const variants = [
                      ...(v.color_variants || []),
                    ];

                    variants[index].images.splice(
                      imgIndex,
                      1
                    );

                    set("color_variants", variants);
                  }}
                >
                  ×
                </button>
              </div>
            )
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            const variants = [...(v.color_variants || [])];
            variants.splice(index, 1);
            set("color_variants", variants);
          }}
          className="rounded border px-3 py-2"
        >
          Remove Color
        </button>
      </div>
    ))}

    <button
      type="button"
      onClick={() =>
        set("color_variants", [
          ...(v.color_variants || []),
          {
            name: "",
            images: [],
          },
        ])
      }
      className="rounded border px-4 py-2"
    >
      Add Color Variant
    </button>
  </div>
</Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Material">
              <input
                value={v.material}
                onChange={(e) => set("material", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Dimensions">
              <input
                value={v.dimensions}
                onChange={(e) => set("dimensions", e.target.value)}
                placeholder='e.g. 88"W × 38"D × 30"H'
                className={inputCls}
              />
            </Field>
          </div>
          <Field label="Availability">
            <select
              value={v.availability}
              onChange={(e) => set("availability", e.target.value)}
              className={inputCls}
            >
              <option>In Stock</option>
              <option>Made to Order</option>
              <option>Limited Stock</option>
            </select>
          </Field>
        </Card>
      </div>

      <div className="space-y-6">
        <Card title="Main image *">
          {v.image_url ? (
            <div className="relative">
              <img src={v.image_url} alt="" className="aspect-[4/3] w-full rounded-md object-cover" />
              <button
                type="button"
                onClick={() => set("image_url", "")}
                className="absolute right-2 top-2 rounded-full bg-background/90 p-1 hover:bg-background"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <UploadBox
              uploading={uploadingMain}
              onFiles={(files) => files[0] && handleMainUpload(files[0])}
              label="Upload main image"
            />
          )}
        </Card>

        <Card title="Gallery">
          <div className="grid grid-cols-3 gap-2">
            {v.gallery_urls.map((url, i) => (
              <div key={i} className="relative">
                <img src={url} alt="" className="aspect-square w-full rounded-md object-cover" />
                <button
                  type="button"
                  onClick={() =>
                    set("gallery_urls", v.gallery_urls.filter((_, idx) => idx !== i))
                  }
                  className="absolute right-1 top-1 rounded-full bg-background/90 p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <UploadBox
              uploading={uploadingGallery}
              multiple
              onFiles={handleGalleryUpload}
              label="Add gallery images"
            />
          </div>
        </Card>

        <Card title="Videos">
  <div className="grid gap-3">
    {(v.video_urls ?? []).map((url, i) => (
      <div key={i} className="relative">
        <video
          src={url}
          controls
          className="w-full rounded-md"
        />

        <button
          type="button"
          onClick={() =>
            set(
              "video_urls",
              (v.video_urls ?? []).filter(
                (_, idx) => idx !== i
              )
            )
          }
          className="absolute right-2 top-2 rounded-full bg-background/90 p-1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    ))}
  </div>

  <div className="mt-3">
    <UploadBox
      uploading={uploadingVideos}
      multiple
      onFiles={handleVideoUpload}
      label="Add videos"
      accept="video/*"
    />
  </div>
</Card>

        <Card title="Display">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={v.featured}
              onChange={(e) => set("featured", e.target.checked)}
            />
            <span className="inline-flex items-center gap-1.5 text-sm">
              <Star className={`h-4 w-4 ${v.featured ? "fill-gold text-gold" : "text-muted-foreground"}`} />
              Featured product
            </span>
          </label>
          <Field label="Sort order (lower = first)">
            <input
              type="number"
              value={v.sort_order}
              onChange={(e) => set("sort_order", Number(e.target.value))}
              className={inputCls}
            />
          </Field>
        </Card>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-foreground px-4 py-3 text-sm font-medium text-background hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-emerald focus:outline-none";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <h2 className="font-display text-lg text-foreground">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function UploadBox({
  uploading,
  multiple,
  onFiles,
  label,
  accept = "image/*",
}: {
  uploading: boolean;
  multiple?: boolean;
  onFiles: (files: FileList) => void;
  label: string;
  accept?: string;

}) {
  return (
    <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border bg-muted/30 px-4 py-8 text-sm text-muted-foreground hover:bg-muted">
      {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
      <span>{uploading ? "Uploading…" : label}</span>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        disabled={uploading}
        onChange={(e) => e.target.files && e.target.files.length > 0 && onFiles(e.target.files)}
      />
    </label>
  );
}
