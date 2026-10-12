import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import PocketBase from "pocketbase";

const PB_URL =
  process.env.VITE_POCKETBASE_URL ||
  process.env.POCKETBASE_URL ||
  "http://127.0.0.1:8090";

export const requirePocketBaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const request = getRequest();

    if (!request?.headers) {
      throw new Error("Unauthorized: No request headers available");
    }

    const authHeader = request.headers.get("authorization");
    const cookieHeader = request.headers.get("cookie") || "";

    const pb = new PocketBase(PB_URL);
    pb.autoCancellation(false);

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "").trim();
      pb.authStore.save(token, null);
    } else if (cookieHeader) {
      pb.authStore.loadFromCookie(cookieHeader);
    }

    if (!pb.authStore.isValid || !pb.authStore.token) {
      throw new Error("Unauthorized: Invalid or missing token");
    }

    // Decode token payload to extract userId and email
    let userId = "";
    let email = "";
    try {
      const payloadPart = pb.authStore.token.split(".")[1];
      const payload = JSON.parse(
        Buffer.from(payloadPart, "base64").toString("utf-8")
      );
      userId = payload.id || payload.sub || "";
      email = payload.email || "";
    } catch {
      throw new Error("Unauthorized: Malformed auth token");
    }

    if (!userId) {
      throw new Error("Unauthorized: No user ID found in token");
    }

    return next({
      context: {
        pb,
        userId,
        claims: {
          sub: userId,
          email,
        },
      },
    });
  }
);

// Backward-compatible alias
export const requireSupabaseAuth = requirePocketBaseAuth;