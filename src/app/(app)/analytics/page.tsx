"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Card } from "@/components/ui/primitives";

export default function AnalyticsPage() {
  const { data } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => (await api.get("/analytics")).data,
  });
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Analytics</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Stat title="Daily captions" value={data?.daily?.captionsGenerated} />
        <Stat title="Weekly captions" value={data?.weekly?.captionsGenerated} />
        <Stat title="Monthly captions" value={data?.monthly?.captionsGenerated} />
        <Stat title="Credits used (month)" value={data?.monthly?.creditsUsed} />
        <Stat title="Avg response (ms)" value={data?.monthly?.avgResponseMs} />
      </div>
      <Card>
        <h2 className="mb-3 font-medium">Caption types</h2>
        <div className="space-y-2">
          {(data?.types ?? []).map((t: { captionType: string; _count: { _all: number } }) => (
            <div key={t.captionType} className="flex justify-between text-sm">
              <span>{t.captionType}</span>
              <span className="text-muted-foreground">{t._count._all}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h2 className="mb-3 font-medium">Popular styles</h2>
        {(data?.tones ?? []).map((t: { tone: string; _count: { _all: number } }) => (
          <div key={t.tone} className="flex justify-between text-sm">
            <span>{t.tone}</span>
            <span className="text-muted-foreground">{t._count._all}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

function Stat({ title, value }: { title: string; value?: number }) {
  return (
    <Card>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-2 text-2xl font-semibold">{value ?? 0}</p>
    </Card>
  );
}
