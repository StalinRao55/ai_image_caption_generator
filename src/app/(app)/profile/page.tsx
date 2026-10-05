"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Button, Card, Input, Label } from "@/components/ui/primitives";
import { toast } from "sonner";
import { signOut } from "next-auth/react";
import { useState } from "react";

export default function ProfilePage() {
  const qc = useQueryClient();
  const [keyName, setKeyName] = useState("Production");
  const [revealed, setRevealed] = useState<string | null>(null);
  const me = useQuery({ queryKey: ["me"], queryFn: async () => (await api.get("/user")).data });
  const keys = useQuery({ queryKey: ["api-keys"], queryFn: async () => (await api.get("/user/api-keys")).data });
  const save = useMutation({
    mutationFn: (data: object) => api.patch("/user", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      toast.success("Profile updated");
    },
  });
  const createKey = useMutation({
    mutationFn: () => api.post("/user/api-keys", { name: keyName }),
    onSuccess: (res) => {
      setRevealed(res.data.key);
      qc.invalidateQueries({ queryKey: ["api-keys"] });
    },
  });

  const u = me.data;
  if (!u) return null;
  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-3xl font-semibold">Profile</h1>
      <Card className="space-y-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/30 text-xl">
          {(u.name || "U").slice(0, 1)}
        </div>
        <div>
          <Label>Name</Label>
          <Input defaultValue={u.name ?? ""} onBlur={(e) => save.mutate({ name: e.target.value })} />
        </div>
        <p className="text-sm text-muted-foreground">{u.email}</p>
        <p className="text-sm">Plan: {u.plan}</p>
        <p className="text-sm">Credits: {u.credits}</p>
      </Card>
      <Card className="space-y-3">
        <h2 className="font-medium">API keys</h2>
        <div className="flex gap-2">
          <Input value={keyName} onChange={(e) => setKeyName(e.target.value)} />
          <Button onClick={() => createKey.mutate()}>Create</Button>
        </div>
        {revealed && <p className="break-all rounded-xl bg-muted p-3 text-xs">Copy now: {revealed}</p>}
        {(keys.data ?? []).map((k: { id: string; name: string; lastFour: string }) => (
          <div key={k.id} className="flex items-center justify-between text-sm">
            <span>
              {k.name} · ••••{k.lastFour}
            </span>
            <Button size="sm" variant="danger" onClick={() => api.delete("/user/api-keys", { data: { id: k.id } }).then(() => qc.invalidateQueries({ queryKey: ["api-keys"] }))}>
              Revoke
            </Button>
          </div>
        ))}
      </Card>
      <Card>
        <h2 className="font-medium">Delete account</h2>
        <p className="mt-2 text-sm text-muted-foreground">This permanently removes your captions and keys.</p>
        <Button
          className="mt-3"
          variant="danger"
          onClick={async () => {
            if (!confirm("Delete account forever?")) return;
            await api.delete("/user");
            await signOut({ callbackUrl: "/" });
          }}
        >
          Delete account
        </Button>
      </Card>
    </div>
  );
}
