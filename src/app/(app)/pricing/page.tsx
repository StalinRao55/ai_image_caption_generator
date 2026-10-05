"use client";

import { PLANS } from "@/constants/app";
import { Button, Card } from "@/components/ui/primitives";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PricingInner() {
  const params = useSearchParams();
  async function checkout(plan: string) {
    try {
      const { data } = await api.post("/billing/checkout", { plan });
      if (data.url) window.location.href = data.url;
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(message || "Checkout unavailable");
    }
  }
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Pricing</h1>
      {params.get("success") && <p className="text-accent">Payment received. Your plan will update shortly.</p>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((p) => (
          <Card key={p.id}>
            <p className="text-sm text-muted-foreground">{p.name}</p>
            <p className="mt-2 text-3xl font-semibold">${p.price}</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {p.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            {p.id !== "FREE" && (
              <Button className="mt-4 w-full" onClick={() => checkout(p.id)}>
                Upgrade
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense>
      <PricingInner />
    </Suspense>
  );
}
