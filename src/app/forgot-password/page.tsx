"use client";

import { useState } from "react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { Button, Card, Input, Label } from "@/components/ui/primitives";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await api.post("/auth/forgot", { email });
    toast.success("If that email exists, a reset link was sent.");
  }
  return (
    <div className="gradient-mesh flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-semibold">Forgot password</h1>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <div>
            <Label>Email</Label>
            <Input className="mt-1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <Button className="w-full">Send reset link</Button>
        </form>
      </Card>
    </div>
  );
}
