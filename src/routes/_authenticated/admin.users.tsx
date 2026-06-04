import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  listAdmins,
  createStoreAdmin,
  setStoreAdminDisabled,
  deleteStoreAdmin,
  resetStoreAdminPassword,
} from "@/lib/admin-users.functions";
import { Shield, UserPlus, KeyRound, Power, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const { isSuperAdmin, loading } = useAuth();
  const list = useServerFn(listAdmins);
  const create = useServerFn(createStoreAdmin);
  const setDisabled = useServerFn(setStoreAdminDisabled);
  const remove = useServerFn(deleteStoreAdmin);
  const resetPw = useServerFn(resetStoreAdminPassword);
  const qc = useQueryClient();

  const admins = useQuery({
    queryKey: ["admins"],
    queryFn: () => list(),
    enabled: isSuperAdmin,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admins"] });

  const createMut = useMutation({
    mutationFn: (vars: { email: string; password: string }) => create({ data: vars }),
    onSuccess: () => { toast.success("Store admin created"); invalidate(); },
    onError: (e: any) => toast.error(e.message || "Failed"),
  });
  const disableMut = useMutation({
    mutationFn: (vars: { user_id: string; disabled: boolean }) => setDisabled({ data: vars }),
    onSuccess: (_, v) => { toast.success(v.disabled ? "Account disabled" : "Account enabled"); invalidate(); },
    onError: (e: any) => toast.error(e.message || "Failed"),
  });
  const deleteMut = useMutation({
    mutationFn: (user_id: string) => remove({ data: { user_id } }),
    onSuccess: () => { toast.success("Account deleted"); invalidate(); },
    onError: (e: any) => toast.error(e.message || "Failed"),
  });
  const resetMut = useMutation({
    mutationFn: (vars: { user_id: string; new_password: string }) => resetPw({ data: vars }),
    onSuccess: () => toast.success("Password reset"),
    onError: (e: any) => toast.error(e.message || "Failed"),
  });

  if (loading) return <div className="text-muted-foreground">Loading…</div>;
  if (!isSuperAdmin) {
    return (
      <div className="rounded-xl border border-border bg-background p-8 text-center">
        <Shield className="mx-auto h-8 w-8 text-muted-foreground" />
        <h1 className="mt-3 font-display text-2xl text-foreground">Super Admin only</h1>
        <p className="mt-2 text-sm text-muted-foreground">You don't have permission to manage admins.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-foreground">Admins</h1>
        <p className="mt-1 text-sm text-muted-foreground">Create, disable, reset and delete Store Admin accounts.</p>
      </div>

      <CreateForm submitting={createMut.isPending} onSubmit={(v) => createMut.mutate(v)} />

      <div className="rounded-xl border border-border bg-background">
        <div className="border-b border-border px-5 py-3 font-display text-lg">All admin accounts</div>
        {admins.isLoading ? (
          <div className="p-6 text-sm text-muted-foreground">Loading…</div>
        ) : admins.error ? (
          <div className="p-6 text-sm text-destructive">{(admins.error as any).message}</div>
        ) : (
          <ul className="divide-y divide-border">
            {admins.data?.map((a) => (
              <li key={a.user_id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-foreground">{a.email ?? a.user_id}</span>
                    {a.is_super_admin && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald/15 px-2 py-0.5 text-xs text-emerald">
                        <Shield className="h-3 w-3" /> Super Admin
                      </span>
                    )}
                    {a.is_store_admin && !a.is_super_admin && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Store Admin</span>
                    )}
                    {a.disabled && (
                      <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive">Disabled</span>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Last sign-in: {a.last_sign_in_at ? new Date(a.last_sign_in_at).toLocaleString() : "Never"}
                  </div>
                </div>
                {!a.is_super_admin && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => disableMut.mutate({ user_id: a.user_id, disabled: !a.disabled })}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs hover:bg-muted"
                    >
                      <Power className="h-3.5 w-3.5" /> {a.disabled ? "Enable" : "Disable"}
                    </button>
                    <ResetPwButton onReset={(pw) => resetMut.mutate({ user_id: a.user_id, new_password: pw })} />
                    <button
                      onClick={() => {
                        if (confirm(`Permanently delete ${a.email}? This cannot be undone.`)) {
                          deleteMut.mutate(a.user_id);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded-md border border-destructive/40 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function CreateForm({ onSubmit, submitting }: { onSubmit: (v: { email: string; password: string }) => void; submitting: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ email, password });
        setEmail("");
        setPassword("");
      }}
      className="rounded-xl border border-border bg-background p-5"
    >
      <div className="flex items-center gap-2">
        <UserPlus className="h-4 w-4 text-emerald" />
        <h2 className="font-display text-lg">Add a Store Admin</h2>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <input
          required type="email" placeholder="email@example.com"
          value={email} onChange={(e) => setEmail(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          required type="text" minLength={8} placeholder="Temporary password (min 8)"
          value={password} onChange={(e) => setPassword(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          Create
        </button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        The new admin can sign in immediately and manage products, prices, gallery images and categories.
      </p>
    </form>
  );
}

function ResetPwButton({ onReset }: { onReset: (pw: string) => void }) {
  return (
    <button
      onClick={() => {
        const pw = prompt("Enter a new password (min 8 characters):");
        if (!pw) return;
        if (pw.length < 8) { toast.error("Password too short"); return; }
        onReset(pw);
      }}
      className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs hover:bg-muted"
    >
      <KeyRound className="h-3.5 w-3.5" /> Reset password
    </button>
  );
}
