"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Button, Card, Skeleton } from "@/components/ui/primitives";

export default function DashboardPage() {
  const me = useQuery({ queryKey: ["me"], queryFn: async () => (await api.get("/user")).data });
  const analytics = useQuery({ queryKey: ["analytics"], queryFn: async () => (await api.get("/analytics")).data });
  const history = useQuery({
    queryKey: ["captions", "dash"],
    queryFn: async () => (await api.get("/captions", { params: { take: 6 } })).data,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Studio</h1>
          <p className="text-muted-foreground">Welcome back{me.data?.name ? `, ${me.data.name}` : ""}.</p>
        </div>
        <Link href="/generate">
          <Button>Generate caption</Button>
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-muted-foreground">Plan</p>
          <p className="mt-2 text-2xl font-semibold">{me.data?.plan ?? "—"}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Credits remaining</p>
          <p className="mt-2 text-2xl font-semibold">{me.data?.credits ?? "—"}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Captions this month</p>
          <p className="mt-2 text-2xl font-semibold">{analytics.data?.monthly?.captionsGenerated ?? 0}</p>
        </Card>
      </div>
      <Card>
        <h2 className="mb-4 font-medium">Recent captions</h2>
        {history.isLoading && <Skeleton className="h-24" />}
        <div className="space-y-3">
          {(history.data?.items ?? []).map((item: { id: string; caption: string; captionType: string }) => (
            <div key={item.id} className="rounded-xl bg-muted/50 p-3">
              <p className="text-xs uppercase text-muted-foreground">{item.captionType}</p>
              <p className="mt-1 line-clamp-2 text-sm">{item.caption}</p>
            </div>
          ))}
          {!history.isLoading && !history.data?.items?.length && (
            <p className="text-sm text-muted-foreground">No captions yet. Generate your first one.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
