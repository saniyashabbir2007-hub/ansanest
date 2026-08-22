import {
  createRootRouteWithContext,
  Outlet,
  ScrollRestoration,
  HeadContent,
  Scripts,
  useRouteContext,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Toaster } from "@/components/ui/sonner";
import { BUSINESS } from "@/lib/business";
import appCss from "@/styles.css?url";

export interface RouterContext {
  queryClient: QueryClient;
}

const fallbackQueryClient = new QueryClient();

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${BUSINESS.name} — Crafted for Comfort` },
      {
        name: "description",
        content:
          "Handcrafted bespoke sofas, sectionals, upholstered beds, and custom luxury furniture in India.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  const context = useRouteContext({ from: "__root__" });
  const client = context?.queryClient ?? fallbackQueryClient;

  return (
    <QueryClientProvider client={client}>
      <html lang="en" className="h-full scroll-smooth">
        <head>
          <HeadContent />
        </head>
        <body className="flex min-h-full flex-col bg-background font-sans text-foreground antialiased selection:bg-emerald selection:text-white">
          <Header />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
          <Toaster position="bottom-right" richColors />
          <ScrollRestoration />
          <Scripts />
        </body>
      </html>
    </QueryClientProvider>
  );
}