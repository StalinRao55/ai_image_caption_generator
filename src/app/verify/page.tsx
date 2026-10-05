"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

function VerifyInner() {
  const params = useSearchParams();
  const router = useRouter();
  useEffect(() => {
    const email = params.get("email");
    const token = params.get("token");
    if (!email || !token) return;
    api
      .post("/auth/verify", { email, token })
      .then(() => {
        toast.success("Email verified.");
        router.push("/dashboard");
      })
      .catch(() => toast.error("Verification failed."));
  }, [params, router]);
  return <p className="text-muted-foreground">Verifying your email…</p>;
}

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Suspense>
        <VerifyInner />
      </Suspense>
    </div>
  );
}
