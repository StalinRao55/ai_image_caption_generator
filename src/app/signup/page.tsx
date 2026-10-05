"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button, Card, Input, Label } from "@/components/ui/primitives";
import { registerSchema } from "@/types/schemas";
import { api } from "@/lib/api-client";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setLoading(true);
    try {
      await api.post("/auth/register", values);
      const res = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });
      if (res?.error) throw new Error(res.error);
      toast.success("Account created. Check your email to verify.");
      router.push("/dashboard");
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(message || "Could not create account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="gradient-mesh flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-semibold">Create your studio</h1>
        <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div>
            <Label>Name</Label>
            <Input className="mt-1" {...form.register("name")} />
          </div>
          <div>
            <Label>Email</Label>
            <Input className="mt-1" type="email" {...form.register("email")} />
          </div>
          <div>
            <Label>Password</Label>
            <Input className="mt-1" type="password" {...form.register("password")} />
          </div>
          <Button className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Sign up"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground">
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </Card>
    </div>
  );
}
