"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button, Card, Input, Label } from "@/components/ui/primitives";
import { loginSchema } from "@/types/schemas";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setLoading(true);
    const res = await signIn("credentials", { ...values, redirect: false });
    setLoading(false);
    if (res?.error) {
      toast.error("Invalid email or password.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="gradient-mesh flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to CaptionAI</p>
        <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div>
            <Label>Email</Label>
            <Input className="mt-1" type="email" {...form.register("email")} />
          </div>
          <div>
            <Label>Password</Label>
            <Input className="mt-1" type="password" {...form.register("password")} />
          </div>
          <Button className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <Button
          className="mt-3 w-full"
          variant="outline"
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        >
          Continue with Google
        </Button>
        <div className="mt-4 flex justify-between text-sm text-muted-foreground">
          <Link href="/forgot-password">Forgot password</Link>
          <Link href="/signup">Create account</Link>
        </div>
      </Card>
    </div>
  );
}
