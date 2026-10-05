"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Button, Card } from "@/components/ui/primitives";

export default function SavedPage() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["captions", "saved"],
    queryFn: async () => (await api.get("/captions", { params: { favorite: true, take: 24 } })).data,
  });
  const patch = useMutation({
    mutationFn: (id: string) => api.patch(`/captions/${id}`, { isFavorite: false }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["captions"] }),
  });
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Saved captions</h1>
      {!list.data?.items?.length && <p className="text-muted-foreground">Favorites you star will land here.</p>}
      <div className="grid gap-4 md:grid-cols-2">
        {(list.data?.items ?? []).map((item: { id: string; caption: string; imageUrl: string }) => (
          <Card key={item.id}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.imageUrl} alt="" className="mb-3 h-36 w-full rounded-xl object-cover" />
            <p className="text-sm">{item.caption}</p>
            <Button className="mt-3" size="sm" variant="ghost" onClick={() => patch.mutate(item.id)}>
              Remove favorite
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
