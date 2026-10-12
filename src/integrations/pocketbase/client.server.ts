import PocketBase from "pocketbase";

const PB_URL =
  process.env.VITE_POCKETBASE_URL ||
  process.env.POCKETBASE_URL ||
  "http://127.0.0.1:8090";

function createAdminClient() {
  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);

  const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
  const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    pb.admins.authWithPassword(adminEmail, adminPassword).catch((err) => {
      console.error("[PocketBase Admin] Auth failed:", err.message);
    });
  }

  return pb;
}

let _pbAdmin: PocketBase | undefined;

export const pbAdmin = new Proxy({} as PocketBase, {
  get(_, prop, receiver) {
    if (!_pbAdmin) _pbAdmin = createAdminClient();
    return Reflect.get(_pbAdmin, prop, receiver);
  },
});