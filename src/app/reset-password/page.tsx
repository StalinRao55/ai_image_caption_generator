"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { Button, Card, Input, Label } from "@/components/ui/primitives";

function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await api.post("/auth/reset", {
      email: params.get("email"),
      token: params.get("token"),
      password,
    });
    toast.success("Password updated.");
    router.push("/login");
  }
  return (
    <Card className="w-full max-w-md">
      <h1 className="text-2xl font-semibold">Reset password</h1>
      <form className="mt-6 space-y-4" onSubmit={submit}>
        <div>
          <Label>New password</Label>
          <Input className="mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
        </div>
        <Button className="w-full">Update password</Button>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="gradient-mesh flex min-h-screen items-center justify-center px-4">
      <Suspense>
        <ResetForm />
      </Suspense>
    </div>
  );
}
