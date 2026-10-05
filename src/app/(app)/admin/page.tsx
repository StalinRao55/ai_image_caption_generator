"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Button, Card, Input } from "@/components/ui/primitives";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const qc = useQueryClient();
  const [credits, setCredits] = useState("100");
  const stats = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => (await api.get("/admin/stats")).data,
    enabled: session?.user?.role === "ADMIN",
  });
  const updateUser = useMutation({
    mutationFn: (payload: object) => api.patch("/admin/users", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-stats"] }),
  });

  useEffect(() => {
    if (session && session.user.role !== "ADMIN") router.replace("/dashboard");
  }, [session, router]);

  if (!stats.data) return <p>Loading admin…</p>;
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Admin</h1>
      <div className="grid gap-4 md:grid-cols-4">
        <Card><p className="text-sm text-muted-foreground">Users</p><p className="text-2xl">{stats.data.userCount}</p></Card>
        <Card><p className="text-sm text-muted-foreground">Captions</p><p className="text-2xl">{stats.data.captionCount}</p></Card>
        <Card><p className="text-sm text-muted-foreground">Credits used</p><p className="text-2xl">{stats.data.creditsUsed}</p></Card>
        <Card><p className="text-sm text-muted-foreground">API usage</p><p className="text-2xl">{stats.data.captionsGenerated}</p></Card>
      </div>
      <Card>
        <h2 className="mb-3 font-medium">Users</h2>
        <div className="space-y-2">
          {stats.data.users.map((u: { id: string; email: string; plan: string; credits: number }) => (
            <div key={u.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span>{u.email} · {u.plan} · {u.credits}</span>
              <div className="flex gap-2">
                <Input className="w-24" value={credits} onChange={(e) => setCredits(e.target.value)} />
                <Button size="sm" onClick={() => updateUser.mutate({ userId: u.id, credits: Number(credits) })}>
                  Set credits
                </Button>
                <Button size="sm" variant="secondary" onClick={() => updateUser.mutate({ userId: u.id, plan: "PRO" })}>
                  Make Pro
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h2 className="mb-3 font-medium">Logs</h2>
        {(stats.data.logs ?? []).map((l: { id: string; action: string; createdAt: string }) => (
          <p key={l.id} className="text-sm text-muted-foreground">
            {l.action} · {new Date(l.createdAt).toLocaleString()}
          </p>
        ))}
      </Card>
    </div>
  );
}
