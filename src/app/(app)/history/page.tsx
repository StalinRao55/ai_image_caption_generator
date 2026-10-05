"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Badge, Button, Card, Input } from "@/components/ui/primitives";
import { toast } from "sonner";
import { CAPTION_TYPES } from "@/constants/app";

export default function HistoryPage() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [deleted, setDeleted] = useState(false);
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["captions", q, type, sort, page, deleted],
    queryFn: async () =>
      (await api.get("/captions", { params: { q, type, sort, page, deleted, take: 12 } })).data,
  });
  const patch = useMutation({
    mutationFn: ({ id, data }: { id: string; data: object }) => api.patch(`/captions/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["captions"] });
      toast.success("Updated");
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">History</h1>
      <div className="flex flex-wrap gap-2">
        <Input placeholder="Search captions" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <select className="h-10 rounded-xl bg-muted px-2" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All types</option>
          {CAPTION_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        <select className="h-10 rounded-xl bg-muted px-2" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
        <Button variant={deleted ? "secondary" : "ghost"} onClick={() => setDeleted(!deleted)}>
          {deleted ? "Viewing deleted" : "Show deleted"}
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {(list.data?.items ?? []).map((item: { id: string; imageUrl: string; caption: string; captionType: string; isFavorite: boolean; isDeleted: boolean }) => (
          <Card key={item.id} className="space-y-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.imageUrl} alt="" className="h-40 w-full rounded-xl object-cover" />
            <Badge>{item.captionType}</Badge>
            <p className="line-clamp-4 text-sm">{item.caption}</p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(item.caption)}>
                Copy
              </Button>
              <Button size="sm" variant="ghost" onClick={() => patch.mutate({ id: item.id, data: { isFavorite: !item.isFavorite } })}>
                {item.isFavorite ? "Unfavorite" : "Favorite"}
              </Button>
              {item.isDeleted ? (
                <Button size="sm" variant="secondary" onClick={() => patch.mutate({ id: item.id, data: { isDeleted: false } })}>
                  Restore
                </Button>
              ) : (
                <Button size="sm" variant="danger" onClick={() => patch.mutate({ id: item.id, data: { isDeleted: true } })}>
                  Delete
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
          Previous
        </Button>
        <Button variant="outline" onClick={() => setPage(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
