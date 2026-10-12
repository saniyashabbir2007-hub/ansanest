import PocketBase from "pocketbase";

const pocketbaseUrl =
  import.meta.env.VITE_POCKETBASE_URL ||
  (typeof process !== "undefined" && process.env?.POCKETBASE_URL) ||
  "http://127.0.0.1:8090";

export const pb = new PocketBase(pocketbaseUrl);

// Optional: Automatically persist auth in localStorage for client-side web sessions
if (typeof window !== "undefined") {
  pb.authStore.loadFromCookie(document.cookie);
  pb.authStore.onChange(() => {
    document.cookie = pb.authStore.exportToCookie({ httpOnly: false });
  });
}