import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  listCategories,
  listProducts,
  uploadProductImage,
  uploadProductVideo,
  slugify,
  mergeProductAsVariant,
  extractVariantToSeparateProduct,
  type Product,
  type ProductInput,
  type DimensionVariant,
  type VariantColor,
} from "@/lib/products-api";
import {
  Upload,
  X,
  Star,
  Loader2,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  ArrowRightLeft,
  Undo2,
  Crown,
} from "lucide-react";
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
  dimension_variants: [],
  material: "",
  dimensions: "",
  availability: "Made to Order",
  delivery_time: null,
  customizable: false,
  warranty: null,
  care_instructions: null,
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
  const allProductsQuery = useQuery({ queryKey: ["products"], queryFn: listProducts });

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
          short_description: initial.short_description ?? "",
          description: initial.description,
          features: initial.features ?? [],
          colors: initial.colors ?? [],
          color_variants: (initial as any).color_variants ?? [],
          dimension_variants: (initial as any).dimension_variants ?? [],
          material: initial.material ?? "",
          dimensions: initial.dimensions ?? "",
          availability: initial.availability,
          delivery_time: initial.delivery_time ?? null,
          customizable: initial.customizable ?? false,
          warranty: initial.warranty ?? null,
          care_instructions: initial.care_instructions ?? null,
          featured: initial.featured,
          sort_order: initial.sort_order,
        }
      : empty,
  );

  const [expandedVariants, setExpandedVariants] = useState<{ [key: string]: boolean }>({});
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingVideos, setUploadingVideos] = useState(false);
  const [featuresText, setFeaturesText] = useState(
    (initial?.features ?? []).join("\n"),
  );

  const [targetParentId, setTargetParentId] = useState("");
  const [targetVariantName, setTargetVariantName] = useState(initial?.name || "");
  const [deleteSourceProduct, setDeleteSourceProduct] = useState(true);
  const [merging, setMerging] = useState(false);
  const [extractingId, setExtractingId] = useState<string | null>(null);

  function set<K extends keyof ProductFormValues>(k: K, val: ProductFormValues[K]) {
    setV((s) => ({ ...s, [k]: val }));
  }

  const toggleExpand = (id: string) => {
    setExpandedVariants((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  async function handleMainUpload(file: File) {
    setUploadingMain(true);
    try {
      const url = await uploadProductImage(file);
      set("image_url", url);
      const gallery = v.gallery_urls ?? [];
      if (gallery.length === 0) set("gallery_urls", [url]);
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
      const gallery = v.gallery_urls ?? [];
      set("gallery_urls", [...gallery, ...urls]);
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
      const videos = v.video_urls ?? [];
      set("video_urls", [...videos, ...urls]);
      toast.success(`${urls.length} video${urls.length === 1 ? "" : "s"} uploaded`);
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploadingVideos(false);
    }
  }

  function addDimensionVariant() {
    const id = `var-${Date.now()}`;
    const newVariant: DimensionVariant = {
      id,
      name: "",
      dimensions: "",
      seats: "",
      price: v.price || 0,
      stock: 10,
      is_default: (v.dimension_variants ?? []).length === 0,
      images: [],
      colors: [],
    };
    set("dimension_variants", [...(v.dimension_variants ?? []), newVariant]);
    setExpandedVariants((prev) => ({ ...prev, [id]: true }));
  }

  function updateDimensionVariant(index: number, patch: Partial<DimensionVariant>) {
    const list = [...(v.dimension_variants ?? [])];
    list[index] = { ...list[index], ...patch };

    if (patch.is_default) {
      list.forEach((item, i) => {
        if (i !== index) item.is_default = false;
      });
    }

    set("dimension_variants", list);
  }

  function removeDimensionVariant(index: number) {
    const list = (v.dimension_variants ?? []).filter((_, i) => i !== index);
    if (list.length > 0 && !list.some((item) => item.is_default)) {
      list[0].is_default = true;
    }
    set("dimension_variants", list);
  }

  // Promote a Variant to become the main Parent Product
  function promoteVariantToParent(index: number) {
    const list = [...(v.dimension_variants ?? [])];
    const selectedVariant = list[index];
    if (!selectedVariant) return;

    // Create a new variant out of the current parent product data
    const oldParentAsVariant: DimensionVariant = {
      id: `var-old-parent-${Date.now()}`,
      name: v.name,
      dimensions: v.dimensions || "",
      seats: v.sub_type || "",
      price: Number(v.price) || 0,
      stock: 10,
      is_default: false,
      images: [v.image_url, ...(v.gallery_urls ?? [])].filter(Boolean),
      colors: (v.color_variants as any[]) || [],
    };

    // Remove selected variant from array and add old parent
    const remainingVariants = list.filter((_, i) => i !== index);
    const updatedVariants = [
      { ...selectedVariant, is_default: true },
      oldParentAsVariant,
      ...remainingVariants.filter((v) => v.id !== selectedVariant.id),
    ];

    // Swap data into main parent product
    setV((prev) => ({
      ...prev,
      name: selectedVariant.name || prev.name,
      dimensions: selectedVariant.dimensions || prev.dimensions,
      price: selectedVariant.price || prev.price,
      image_url: selectedVariant.images?.[0] || prev.image_url,
      gallery_urls: selectedVariant.images?.slice(1) || prev.gallery_urls,
      dimension_variants: updatedVariants,
    }));

    toast.success(`"${selectedVariant.name}" is now the main parent product! Click Save to confirm.`);
  }

  function addColorToVariant(varIdx: number) {
    const list = [...(v.dimension_variants ?? [])];
    const currentColors = list[varIdx].colors ?? [];
    list[varIdx].colors = [...currentColors, { name: "", images: [] }];
    set("dimension_variants", list);
  }

  function updateColorInVariant(varIdx: number, colorIdx: number, patch: Partial<VariantColor>) {
    const list = [...(v.dimension_variants ?? [])];
    const colors = [...(list[varIdx].colors ?? [])];
    colors[colorIdx] = { ...colors[colorIdx], ...patch };
    list[varIdx].colors = colors;
    set("dimension_variants", list);
  }

  function removeColorFromVariant(varIdx: number, colorIdx: number) {
    const list = [...(v.dimension_variants ?? [])];
    list[varIdx].colors = (list[varIdx].colors ?? []).filter((_, i) => i !== colorIdx);
    set("dimension_variants", list);
  }

  async function handleExtractVariant(variantId: string) {
    if (!initial?.id) return;
    if (!confirm("Are you sure you want to separate this variant back into its own standalone product?")) return;

    setExtractingId(variantId);
    try {
      const created = await extractVariantToSeparateProduct(initial.id, variantId);
      toast.success("Variant successfully extracted back to its own product!");
      window.location.href = `/admin/products/${created.id}`;
    } catch (err: any) {
      toast.error(err.message || "Failed to extract variant");
      setExtractingId(null);
    }
  }

  async function handleMergeProduct() {
    if (!initial?.id) return;
    if (!targetParentId) {
      return toast.error("Please select a parent product to merge into.");
    }

    setMerging(true);
    try {
      await mergeProductAsVariant(
        initial.id,
        targetParentId,
        targetVariantName || v.name,
        deleteSourceProduct
      );
      toast.success("Successfully converted and moved as variant!");
      window.location.href = `/admin/products/${targetParentId}`;
    } catch (err: any) {
      toast.error(err.message || "Failed to merge product.");
      setMerging(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const features = featuresText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const slug = v.slug || slugify(v.name);
    if (!v.name.trim()) return toast.error("Name is required");
    if (!v.category) return toast.error("Category is required");
    if (!v.image_url) return toast.error("Main image is required");

    // Always ensure the parent product price matches the lowest variant price
    let basePrice = v.price;
    if (v.dimension_variants && v.dimension_variants.length > 0) {
      const validPrices = v.dimension_variants
        .map((item) => Number(item.price))
        .filter((p) => !isNaN(p) && p > 0);
      if (validPrices.length > 0) {
        basePrice = Math.min(...validPrices);
      }
    }

    onSubmit({
      ...v,
      price: basePrice,
      slug,
      features,
    });
  }

  const otherProducts = (allProductsQuery.data ?? []).filter(
    (p) => p.id !== initial?.id
  );

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <Card title="Basic Details">
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
            <Field label="Sub Category (optional)">
              <input
                value={v.sub_type ?? ""}
                onChange={(e) => set("sub_type", e.target.value || null)}
                placeholder="e.g. Chesterfield Sofa"
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
            <Field label="Base Price (Lowest Variant Price) (₹)">
              <input
                type="number"
                step="1"
                min="0"
                value={v.price ?? ""}
                onChange={(e) => set("price", e.target.value === "" ? null : Number(e.target.value))}
                placeholder="e.g. 24999"
                className={inputCls}
              />
            </Field>
          )}
        </Card>

        {/* NESTED VARIANTS / DIMENSIONS MANAGER */}
        <Card title="Variants / Dimensions & Variations">
          <p className="text-xs text-muted-foreground mb-3">
            Manage sizes, dimensions, custom prices, images, and color sub-variants.
          </p>

          <div className="space-y-4">
            {(v.dimension_variants ?? []).map((variant, index) => {
              const isExpanded = expandedVariants[variant.id || String(index)] ?? true;

              return (
                <div
                  key={variant.id || index}
                  className="rounded-xl border border-border bg-card p-4 space-y-4 shadow-sm"
                >
                  <div className="grid gap-3 sm:grid-cols-[1.2fr_1.5fr_1fr_1fr_auto_auto] sm:items-end">
                    <Field label="Variant Name">
                      <input
                        value={variant.name}
                        onChange={(e) => updateDimensionVariant(index, { name: e.target.value })}
                        placeholder="e.g. 2 Seater"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Dimensions (in Inches)">
                      <input
                        value={variant.dimensions}
                        onChange={(e) => updateDimensionVariant(index, { dimensions: e.target.value })}
                        placeholder='62" W x 38" D x 30" H'
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Price (₹)">
                      <input
                        type="number"
                        value={variant.price || ""}
                        onChange={(e) => updateDimensionVariant(index, { price: Number(e.target.value) })}
                        placeholder="34999"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Stock">
                      <input
                        type="number"
                        value={variant.stock ?? 10}
                        onChange={(e) => updateDimensionVariant(index, { stock: Number(e.target.value) })}
                        placeholder="10"
                        className={inputCls}
                      />
                    </Field>
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-[10px] text-muted-foreground uppercase font-medium mb-1.5">Default</span>
                      <input
                        type="radio"
                        name="default_variant"
                        checked={variant.is_default || false}
                        onChange={() => updateDimensionVariant(index, { is_default: true })}
                        className="h-4 w-4 cursor-pointer text-emerald focus:ring-emerald"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      {/* Make this variant the parent product */}
                      <button
                        type="button"
                        onClick={() => promoteVariantToParent(index)}
                        className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-amber-500 transition"
                        title="Promote this variant to become the main parent product"
                      >
                        <Crown className="h-4 w-4" />
                      </button>

                      {initial?.id && (
                        <button
                          type="button"
                          disabled={extractingId === variant.id}
                          onClick={() => handleExtractVariant(variant.id)}
                          className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-emerald transition"
                          title="Extract back to separate standalone product"
                        >
                          {extractingId === variant.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-emerald" />
                          ) : (
                            <Undo2 className="h-4 w-4" />
                          )}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleExpand(variant.id || String(index))}
                        className="rounded p-2 text-muted-foreground hover:bg-muted"
                        title="Toggle Photos & Colors"
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeDimensionVariant(index)}
                        className="rounded p-2 text-muted-foreground hover:text-red-500"
                        title="Remove Variant"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 space-y-4 border-t border-border/70 pt-4 bg-muted/20 -mx-4 -mb-4 p-4 rounded-b-xl">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Images for {variant.name || "this variant"}
                          </label>
                        </div>

                        <UploadBox
                          uploading={false}
                          multiple
                          label={`Upload images for ${variant.name || "size"}`}
                          onFiles={async (files) => {
                            const uploaded: string[] = [];
                            for (const file of Array.from(files)) {
                              uploaded.push(await uploadProductImage(file));
                            }
                            updateDimensionVariant(index, {
                              images: [...(variant.images ?? []), ...uploaded],
                            });
                          }}
                        />

                        {(variant.images ?? []).length > 0 && (
                          <div className="mt-2 grid grid-cols-4 sm:grid-cols-6 gap-2">
                            {(variant.images ?? []).map((img, imgIdx) => (
                              <div key={imgIdx} className="relative group">
                                <img
                                  src={img}
                                  alt=""
                                  className="aspect-square rounded-md object-cover w-full border"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const imgs = (variant.images ?? []).filter((_, i) => i !== imgIdx);
                                    updateDimensionVariant(index, { images: imgs });
                                  }}
                                  className="absolute right-1 top-1 rounded-full bg-background/90 p-0.5 opacity-80 group-hover:opacity-100"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Color Variations for {variant.name || "this variant"}
                          </label>
                          <button
                            type="button"
                            onClick={() => addColorToVariant(index)}
                            className="text-xs text-emerald font-semibold hover:underline inline-flex items-center gap-1"
                          >
                            <Plus className="h-3 w-3" /> Add Color Option
                          </button>
                        </div>

                        {(variant.colors ?? []).map((col, cIdx) => (
                          <div key={cIdx} className="rounded-lg border border-border/80 bg-background p-3 space-y-2">
                            <div className="flex items-center gap-2">
                              <input
                                placeholder="Color Name (e.g. Classic Red)"
                                value={col.name}
                                onChange={(e) => updateColorInVariant(index, cIdx, { name: e.target.value })}
                                className={`${inputCls} text-xs py-1.5`}
                              />
                              <button
                                type="button"
                                onClick={() => removeColorFromVariant(index, cIdx)}
                                className="p-1.5 text-muted-foreground hover:text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            <UploadBox
                              uploading={false}
                              multiple
                              label={`Upload photos for ${col.name || "this color"}`}
                              onFiles={async (files) => {
                                const uploaded: string[] = [];
                                for (const file of Array.from(files)) {
                                  uploaded.push(await uploadProductImage(file));
                                }
                                updateColorInVariant(index, cIdx, {
                                  images: [...(col.images ?? []), ...uploaded],
                                });
                              }}
                            />

                            {(col.images ?? []).length > 0 && (
                              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                {(col.images ?? []).map((cImg, cImgIdx) => (
                                  <div key={cImgIdx} className="relative group">
                                    <img
                                      src={cImg}
                                      alt=""
                                      className="aspect-square rounded-md object-cover w-full border"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const cImgs = (col.images ?? []).filter((_, i) => i !== cImgIdx);
                                        updateColorInVariant(index, cIdx, { images: cImgs });
                                      }}
                                      className="absolute right-1 top-1 rounded-full bg-background/90 p-0.5"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={addDimensionVariant}
            className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-border px-3.5 py-2 text-xs font-medium hover:bg-muted transition shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Variant / Dimension
          </button>
        </Card>

        {/* MOVE / CONVERT PRODUCT INTO VARIANT TOOL */}
        {initial?.id && otherProducts.length > 0 && (
          <Card title="Move / Convert to Another Product Variant">
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                If this product was accidentally added separately, select the parent product below to migrate all its dimensions, photos, and colors inside the parent as a variant.
              </p>

              <Field label="Select Parent Product to Merge Into *">
                <select
                  value={targetParentId}
                  onChange={(e) => setTargetParentId(e.target.value)}
                  className={inputCls}
                >
                  <option value="">Select parent product…</option>
                  {otherProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.category})
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Variant Name inside Parent (e.g. 2 Seater)">
                <input
                  value={targetVariantName}
                  onChange={(e) => setTargetVariantName(e.target.value)}
                  placeholder={v.name}
                  className={inputCls}
                />
              </Field>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deleteSourceProduct}
                  onChange={(e) => setDeleteSourceProduct(e.target.checked)}
                  className="rounded border-border text-emerald focus:ring-emerald"
                />
                <span className="text-xs text-foreground font-medium">
                  Delete this standalone product after moving
                </span>
              </label>

              <button
                type="button"
                disabled={merging || !targetParentId}
                onClick={handleMergeProduct}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-emerald/50 bg-emerald/10 px-4 py-2.5 text-xs font-semibold text-emerald hover:bg-emerald hover:text-white transition disabled:opacity-50"
              >
                {merging ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Merging…
                  </>
                ) : (
                  <>
                    <ArrowRightLeft className="h-3.5 w-3.5" /> Convert & Merge into Parent Product
                  </>
                )}
              </button>
            </div>
          </Card>
        )}

        <Card title="Descriptions">
          <Field label="Short description (shown on cards)">
            <textarea
              rows={2}
              value={v.short_description ?? ""}
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

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Material">
              <input
                value={v.material ?? ""}
                onChange={(e) => set("material", e.target.value)}
                placeholder="Solid Wood / Leather"
                className={inputCls}
              />
            </Field>
            <Field label="Default Dimensions">
              <input
                value={v.dimensions ?? ""}
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
        <Card title="Main Product Image *">
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

        <Card title="Overall Gallery Images">
          <div className="grid grid-cols-3 gap-2">
            {(v.gallery_urls ?? []).map((url, i) => (
              <div key={i} className="relative">
                <img src={url} alt="" className="aspect-square w-full rounded-md object-cover" />
                <button
                  type="button"
                  onClick={() =>
                    set("gallery_urls", (v.gallery_urls ?? []).filter((_, idx) => idx !== i))
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
                      (v.video_urls ?? []).filter((_, idx) => idx !== i)
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
              Featured Product
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
    <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border bg-muted/30 px-3 py-4 text-xs text-muted-foreground hover:bg-muted">
      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
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