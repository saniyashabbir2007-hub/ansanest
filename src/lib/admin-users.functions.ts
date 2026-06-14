import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertSuperAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("super_admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: Super admin only");
}

async function logActivity(opts: {
  actorId: string;
  actorEmail: string | null;
  action: string;
  target?: string | null;
  metadata?: any;
}) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin.from("admin_activity_logs").insert({
    actor_id: opts.actorId,
    actor_email: opts.actorEmail,
    action: opts.action,
    target: opts.target ?? null,
    metadata: opts.metadata ?? {},
  });
}


export type AdminAccount = {
  user_id: string;
  email: string | null;
  is_super_admin: boolean;
  is_store_admin: boolean;
  disabled: boolean;
  role_created_at: string | null;
  last_sign_in_at: string | null;
  created_at: string | null;
};

export const listAdmins = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminAccount[]> => {
    await assertSuperAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ data: roles }, { data: supers }, { data: usersList }] = await Promise.all([
      supabaseAdmin.from("user_roles").select("user_id, role, disabled, created_at").eq("role", "admin"),
      supabaseAdmin.from("super_admins").select("user_id"),
      supabaseAdmin.auth.admin.listUsers({ perPage: 200 }),
    ]);

    const superSet = new Set((supers ?? []).map((s) => s.user_id));
    const usersById = new Map(
      (usersList?.users ?? []).map((u) => [u.id, u] as const),
    );

    const ids = new Set<string>([
      ...((roles ?? []).map((r) => r.user_id)),
      ...superSet,
    ]);

    return Array.from(ids).map((id) => {
      const role = (roles ?? []).find((r) => r.user_id === id);
      const u = usersById.get(id);
      return {
        user_id: id,
        email: u?.email ?? null,
        is_super_admin: superSet.has(id),
        is_store_admin: !!role,
        disabled: role?.disabled ?? false,
        role_created_at: role?.created_at ?? null,
        last_sign_in_at: u?.last_sign_in_at ?? null,
        created_at: u?.created_at ?? null,
      };
    }).sort((a, b) => Number(b.is_super_admin) - Number(a.is_super_admin));
  });

export const createStoreAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      email: z.string().email().max(255),
      password: z.string().min(8).max(128),
    }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let newUserId: string;

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });

    if (error) {
      // If the user already exists (e.g. signed up via Google or a previous
      // attempt), find them and promote to Store Admin instead of failing.
      const msg = error.message?.toLowerCase() ?? "";
      const alreadyExists =
        (error as any).code === "email_exists" ||
        msg.includes("already been registered") ||
        msg.includes("already registered") ||
        msg.includes("already exists");
      if (!alreadyExists) throw new Error(error.message);

      const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
      if (listErr) throw new Error(listErr.message);
      const existing = list.users.find(
        (u) => u.email?.toLowerCase() === data.email.toLowerCase(),
      );
      if (!existing) throw new Error("User exists but could not be located");
      newUserId = existing.id;

      // Reset their password so they can sign in with the provided one.
      const { error: pwErr } = await supabaseAdmin.auth.admin.updateUserById(existing.id, {
        password: data.password,
        email_confirm: true,
      });
      if (pwErr) throw new Error(pwErr.message);
    } else {
      newUserId = created.user!.id;
    }

    // Ensure the admin role exists and is not disabled.
    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .upsert(
        { user_id: newUserId, role: "admin", disabled: false },
        { onConflict: "user_id,role" },
      );
    if (roleErr) throw new Error(roleErr.message);

    await logActivity({
      actorId: context.userId,
      actorEmail: (context.claims.email as string) ?? null,
      action: "create_store_admin",
      target: data.email,
      metadata: { user_id: newUserId },
    });

    return { user_id: newUserId };
  });

export const setStoreAdminDisabled = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      user_id: z.string().uuid(),
      disabled: z.boolean(),
    }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Never disable a super admin
    const { data: isSuper } = await supabaseAdmin
      .from("super_admins")
      .select("user_id")
      .eq("user_id", data.user_id)
      .maybeSingle();
    if (isSuper) throw new Error("Cannot disable a Super Admin");

    const { error } = await supabaseAdmin
      .from("user_roles")
      .update({ disabled: data.disabled })
      .eq("user_id", data.user_id)
      .eq("role", "admin");
    if (error) throw new Error(error.message);

    await logActivity({
      actorId: context.userId,
      actorEmail: (context.claims.email as string) ?? null,
      action: data.disabled ? "disable_store_admin" : "enable_store_admin",
      target: data.user_id,
    });
    return { ok: true };
  });

export const deleteStoreAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ user_id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: isSuper } = await supabaseAdmin
      .from("super_admins")
      .select("user_id")
      .eq("user_id", data.user_id)
      .maybeSingle();
    if (isSuper) throw new Error("Cannot delete a Super Admin");

    const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(data.user_id);
    if (delErr) throw new Error(delErr.message);

    await logActivity({
      actorId: context.userId,
      actorEmail: (context.claims.email as string) ?? null,
      action: "delete_store_admin",
      target: data.user_id,
    });
    return { ok: true };
  });

export const resetStoreAdminPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      user_id: z.string().uuid(),
      new_password: z.string().min(8).max(128),
    }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.user_id, {
      password: data.new_password,
    });
    if (error) throw new Error(error.message);

    await logActivity({
      actorId: context.userId,
      actorEmail: (context.claims.email as string) ?? null,
      action: "reset_password",
      target: data.user_id,
    });
    return { ok: true };
  });

export type ActivityLogEntry = {
  id: string;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  target: string | null;
  metadata: any;
  created_at: string;
};


export const listActivity = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ActivityLogEntry[]> => {
    await assertSuperAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("admin_activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return (data ?? []) as ActivityLogEntry[];
  });

// ============================================================
// Access Requests
// ============================================================

export type AccessRequest = {
  id: string;
  user_id: string;
  email: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  decided_at: string | null;
};

export const requestAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = (context.claims.email as string) ?? "";

    const { data: existing } = await supabaseAdmin
      .from("access_requests")
      .select("*")
      .eq("user_id", context.userId)
      .maybeSingle();

    if (existing) {
      // Reopen rejected requests as pending; leave approved/pending as-is.
      if (existing.status === "rejected") {
        const { error: updErr } = await supabaseAdmin
          .from("access_requests")
          .update({ status: "pending", decided_at: null, decided_by: null, email })
          .eq("id", existing.id);
        if (updErr) throw new Error(updErr.message);
        return { status: "pending" as const };
      }
      return { status: existing.status as "pending" | "approved" };
    }

    const { error } = await supabaseAdmin
      .from("access_requests")
      .insert({ user_id: context.userId, email, status: "pending" });
    if (error) throw new Error(error.message);
    return { status: "pending" as const };
  });

export const getMyAccessRequest = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AccessRequest | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("access_requests")
      .select("*")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as AccessRequest) ?? null;
  });

export const listAccessRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AccessRequest[]> => {
    await assertSuperAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("access_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as AccessRequest[];
  });

export const decideAccessRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      id: z.string().uuid(),
      approve: z.boolean(),
    }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: req, error: reqErr } = await supabaseAdmin
      .from("access_requests")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (reqErr) throw new Error(reqErr.message);
    if (!req) throw new Error("Request not found");

    if (data.approve) {
      const { error: roleErr } = await supabaseAdmin
        .from("user_roles")
        .upsert(
          { user_id: req.user_id, role: "admin", disabled: false },
          { onConflict: "user_id,role" },
        );
      if (roleErr) throw new Error(roleErr.message);
    }

    const { error: updErr } = await supabaseAdmin
      .from("access_requests")
      .update({
        status: data.approve ? "approved" : "rejected",
        decided_at: new Date().toISOString(),
        decided_by: context.userId,
      })
      .eq("id", data.id);
    if (updErr) throw new Error(updErr.message);

    await logActivity({
      actorId: context.userId,
      actorEmail: (context.claims.email as string) ?? null,
      action: data.approve ? "approve_access_request" : "reject_access_request",
      target: req.email,
      metadata: { user_id: req.user_id },
    });

    return { ok: true };
  });
