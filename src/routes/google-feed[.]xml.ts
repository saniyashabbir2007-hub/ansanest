import { createFileRoute } from "@tanstack/react-router";
import { listProducts } from "@/lib/products-api";
import { BUSINESS } from "@/lib/business";

function escapeXml(unsafe: string = "") {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const Route = createFileRoute("/google-feed.xml")({
  server: {
    handlers: {
      GET: async () => {
        const products = (await listProducts()) || [];
        const siteUrl = "https://ansanest.in";

        const itemsXml = products
          .map((item) => {
            const id = escapeXml(String(item.id));
            const title = escapeXml(item.name || "Luxury Furniture");
            const description = escapeXml(
              item.description || "Handcrafted bespoke luxury furniture."
            );
            const link = `${siteUrl}/product/${item.id}`;
            const imageLink = item.image_url ? escapeXml(item.image_url) : "";
            const price = `${Number(item.price || 0).toFixed(2)} INR`;

            return `
    <item>
      <g:id>${id}</g:id>
      <g:title>${title}</g:title>
      <g:description>${description}</g:description>
      <g:link>${link}</g:link>
      <g:image_link>${imageLink}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>in_stock</g:availability>
      <g:price>${price}</g:price>
      <g:brand>${escapeXml(BUSINESS.name)}</g:brand>
    </item>`;
          })
          .join("");

        const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>${escapeXml(BUSINESS.name)} Product Feed</title>
    <link>${siteUrl}</link>
    <description>Product feed for Google Merchant Center</description>${itemsXml}
  </channel>
</rss>`;

        return new Response(rssXml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});