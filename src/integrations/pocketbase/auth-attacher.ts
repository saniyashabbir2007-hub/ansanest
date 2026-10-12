import { createMiddleware } from "@tanstack/react-start";
import { pb } from "./client";

export const attachPocketBaseAuth = createMiddleware({
  type: "function",
}).server(async ({ next, data }: { next: any; data?: any }) => {
  // In server functions, data or context carries the request
  if (typeof window === "undefined" && typeof document === "undefined") {
    // Sync PocketBase auth if needed
  }
  return await next();
});