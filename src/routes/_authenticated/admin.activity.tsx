import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/use-auth";
import { listActivity } from "@/lib/admin-users.functions";
import { Shield, Activity } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/activity")({
  component: ActivityPage,
});

function ActivityPage() {
  const { isSuperAdmin, loading } = useAuth();
  const fn = useServerFn(listActivity);
  const q = useQuery({
    queryKey: ["activity"],
    queryFn: () => fn(),
    enabled: isSuperAdmin,
  });

  if (loading) return <div className="text-muted-foreground">Loading…</div>;
  if (!isSuperAdmin) {
    return (
      <div className="rounded-xl border border-border bg-background p-8 text-center">
        <Shield className="mx-auto h-8 w-8 text-muted-foreground" />
        <h1 className="mt-3 font-display text-2xl text-foreground">Super Admin only</h1>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-emerald" />
        <h1 className="font-display text-3xl text-foreground">Admin activity</h1>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Recent administrative actions across the system.</p>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-background">
        {q.isLoading ? (
          <div className="p-6 text-sm text-muted-foreground">Loading…</div>
        ) : q.error ? (
          <div className="p-6 text-sm text-destructive">{(q.error as any).message}</div>
        ) : !q.data?.length ? (
          <div className="p-6 text-sm text-muted-foreground">No activity yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2">When</th>
                <th className="px-4 py-2">Actor</th>
                <th className="px-4 py-2">Action</th>
                <th className="px-4 py-2">Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {q.data.map((e) => (
                <tr key={e.id}>
                  <td className="whitespace-nowrap px-4 py-2 text-muted-foreground">{new Date(e.created_at).toLocaleString()}</td>
                  <td className="px-4 py-2">{e.actor_email ?? e.actor_id ?? "—"}</td>
                  <td className="px-4 py-2 font-mono text-xs">{e.action}</td>
                  <td className="px-4 py-2 text-muted-foreground">{e.target ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
