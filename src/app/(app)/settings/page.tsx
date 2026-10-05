"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Button, Card, Input, Label, Textarea } from "@/components/ui/primitives";
import { CAPTION_TYPES, TONES, LANGUAGES } from "@/constants/app";
import { toast } from "sonner";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const qc = useQueryClient();
  const { setTheme } = useTheme();
  const me = useQuery({ queryKey: ["me"], queryFn: async () => (await api.get("/user")).data });
  const save = useMutation({
    mutationFn: (data: object) => api.patch("/user", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      toast.success("Settings saved");
    },
  });
  const u = me.data;
  if (!u) return null;
  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-3xl font-semibold">Settings</h1>
      <Card className="space-y-4">
        <div>
          <Label>Theme</Label>
          <select
            className="mt-1 h-10 w-full rounded-xl bg-muted px-2"
            defaultValue={u.theme}
            onChange={(e) => {
              setTheme(e.target.value === "system" ? "system" : e.target.value);
              save.mutate({ theme: e.target.value });
            }}
          >
            <option value="system">System</option>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>
        <div>
          <Label>Interface language</Label>
          <Input defaultValue={u.uiLanguage} onBlur={(e) => save.mutate({ uiLanguage: e.target.value })} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" defaultChecked={u.notificationsEnabled} onChange={(e) => save.mutate({ notificationsEnabled: e.target.checked })} />
          Notifications
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" defaultChecked={u.privacyAnalytics} onChange={(e) => save.mutate({ privacyAnalytics: e.target.checked })} />
          Usage analytics
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" defaultChecked={u.autoSave} onChange={(e) => save.mutate({ autoSave: e.target.checked })} />
          Auto save captions
        </label>
        <div>
          <Label>Default caption type</Label>
          <select className="mt-1 h-10 w-full rounded-xl bg-muted px-2" defaultValue={u.defaultCaptionType} onChange={(e) => save.mutate({ defaultCaptionType: e.target.value })}>
            {CAPTION_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Default tone</Label>
          <select className="mt-1 h-10 w-full rounded-xl bg-muted px-2" defaultValue={u.defaultTone} onChange={(e) => save.mutate({ defaultTone: e.target.value })}>
            {TONES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Default language</Label>
          <select className="mt-1 h-10 w-full rounded-xl bg-muted px-2" defaultValue={u.defaultLanguage} onChange={(e) => save.mutate({ defaultLanguage: e.target.value })}>
            {LANGUAGES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Brand voice</Label>
          <Textarea defaultValue={u.brandVoice ?? ""} onBlur={(e) => save.mutate({ brandVoice: e.target.value })} />
        </div>
      </Card>
    </div>
  );
}
