"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { useGeneratorStore } from "@/hooks/use-generator-store";
import { AUDIENCES, CAPTION_TYPES, LANGUAGES, LENGTHS, TONES } from "@/constants/app";
import { Badge, Button, Card, Input, Label, Skeleton, Textarea } from "@/components/ui/primitives";
import { useQueryClient } from "@tanstack/react-query";

type Result = {
  saved: {
    id: string;
    caption: string;
    hashtags: string[];
    emojis: string[];
    cta?: string;
    wordCount: number;
    readingTime: number;
    confidence?: number;
    variants?: string[];
    analysis?: {
      objects: string[];
      scene: string;
      description: string;
      confidence: number;
    };
  };
  result: {
    caption: string;
    hashtags: string[];
    emojis: string[];
    cta: string;
    variants: string[];
    analysis: {
      objects: string[];
      scene: string;
      description: string;
      confidence: number;
    };
  };
};

export default function GeneratePage() {
  const store = useGeneratorStore();
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [edit, setEdit] = useState("");
  const qc = useQueryClient();

  const uploadFile = useCallback(
    async (file: File) => {
      setBusy(true);
      try {
        const form = new FormData();
        form.append("file", file);
        const { data } = await api.post("/upload", form);
        store.set({ imageUrl: data.url, imageBase64: data.base64, mimeType: data.mimeType });
        toast.success("Upload success");
      } catch (error: unknown) {
        const message = (error as { response?: { data?: { error?: string } } })?.response?.data?.error;
        toast.error(message || "Upload failed");
      } finally {
        setBusy(false);
      }
    },
    [store],
  );

  async function uploadFromUrl() {
    setBusy(true);
    try {
      const { data } = await api.post("/upload", { url });
      store.set({ imageUrl: data.url, imageBase64: data.base64, mimeType: data.mimeType });
      toast.success("Upload success");
    } catch {
      toast.error("Upload failed");
    } finally {
      setBusy(false);
    }
  }

  const onPaste = async (e: React.ClipboardEvent) => {
    const item = [...e.clipboardData.items].find((i) => i.type.startsWith("image/"));
    if (item?.getAsFile()) await uploadFile(item.getAsFile()!);
  };

  async function generate() {
    if (!store.imageUrl || !store.imageBase64) {
      toast.error("Please upload an image first.");
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post("/generate", {
        imageUrl: store.imageUrl,
        imageBase64: store.imageBase64,
        mimeType: store.mimeType,
        captionType: store.captionType,
        tone: store.tone,
        language: store.language,
        length: store.length,
        emoji: store.emoji,
        hashtags: store.hashtags,
        keywords: store.keywords,
        audience: store.audience,
        variants: true,
      });
      setResult(data);
      setEdit(data.result.caption);
      toast.success("Caption generated");
      qc.invalidateQueries({ queryKey: ["me"] });
      qc.invalidateQueries({ queryKey: ["captions"] });
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(message || "Network error");
    } finally {
      setBusy(false);
    }
  }

  async function transform(mode: string) {
    if (!edit) return;
    setBusy(true);
    try {
      const { data } = await api.post("/transform", { caption: edit, mode, language: store.language });
      setEdit(data.text);
      toast.success("Updated caption");
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(message || "Could not transform");
    } finally {
      setBusy(false);
    }
  }

  async function saveEdit() {
    if (!result?.saved.id) return;
    await api.patch(`/captions/${result.saved.id}`, { caption: edit, isFavorite: true });
    toast.success("Saved successfully");
  }

  async function download(format: "txt" | "pdf" | "docx") {
    if (!result?.saved.id) return;
    const res = await api.post("/export", { id: result.saved.id, format }, { responseType: "blob" });
    const blob = new Blob([res.data]);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `caption.${format}`;
    a.click();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]" onPaste={onPaste}>
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold">Generate caption</h1>
        <Card
          className="flex min-h-72 cursor-pointer flex-col items-center justify-center border-dashed"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) void uploadFile(file);
          }}
          onClick={() => fileRef.current?.click()}
        >
          {store.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={store.imageUrl} alt="Preview" className="max-h-80 rounded-xl object-contain" />
          ) : (
            <div className="text-center">
              <p className="font-medium">Drag & drop, browse, paste, or use camera</p>
              <p className="mt-1 text-sm text-muted-foreground">PNG, JPEG, WEBP, GIF · 20 MB max</p>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])}
          />
        </Card>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => cameraRef.current?.click()}>
            Camera
          </Button>
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])}
          />
          {store.imageUrl && (
            <>
              <Button variant="outline" onClick={() => fileRef.current?.click()}>
                Replace
              </Button>
              <Button variant="ghost" onClick={() => store.resetImage()}>
                Remove
              </Button>
            </>
          )}
        </div>
        <div className="flex gap-2">
          <Input placeholder="Upload from image URL" value={url} onChange={(e) => setUrl(e.target.value)} />
          <Button variant="secondary" onClick={uploadFromUrl}>
            Fetch
          </Button>
        </div>

        <Card className="grid gap-3 md:grid-cols-2">
          <Field label="Caption type">
            <select className="h-10 w-full rounded-xl bg-muted px-2" value={store.captionType} onChange={(e) => store.set({ captionType: e.target.value })}>
              {CAPTION_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tone">
            <select className="h-10 w-full rounded-xl bg-muted px-2" value={store.tone} onChange={(e) => store.set({ tone: e.target.value })}>
              {TONES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Language">
            <select className="h-10 w-full rounded-xl bg-muted px-2" value={store.language} onChange={(e) => store.set({ language: e.target.value })}>
              {LANGUAGES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Length">
            <select className="h-10 w-full rounded-xl bg-muted px-2" value={store.length} onChange={(e) => store.set({ length: e.target.value as "SHORT" | "MEDIUM" | "LONG" })}>
              {LENGTHS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Audience">
            <select className="h-10 w-full rounded-xl bg-muted px-2" value={store.audience} onChange={(e) => store.set({ audience: e.target.value })}>
              {AUDIENCES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Keywords">
            <Input value={store.keywords} onChange={(e) => store.set({ keywords: e.target.value })} />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={store.emoji} onChange={(e) => store.set({ emoji: e.target.checked })} /> Emoji
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={store.hashtags} onChange={(e) => store.set({ hashtags: e.target.checked })} /> Hashtags
          </label>
        </Card>
        <Button size="lg" disabled={busy} onClick={generate}>
          {busy ? "Working…" : "Generate"}
        </Button>
      </div>

      <div className="space-y-4">
        {!result && busy && <Skeleton className="h-96" />}
        {!result && !busy && (
          <Card className="flex h-full min-h-80 items-center justify-center text-sm text-muted-foreground">
            Results will appear here after generation.
          </Card>
        )}
        {result && (
          <>
            <Card>
              <div className="mb-2 flex flex-wrap gap-2">
                <Badge>Words {result.saved.wordCount}</Badge>
                <Badge>Read {result.saved.readingTime}m</Badge>
                <Badge>Confidence {Math.round((result.result.analysis.confidence || 0) * 100)}%</Badge>
              </div>
              <Textarea value={edit} onChange={(e) => setEdit(e.target.value)} />
              <p className="mt-3 text-sm text-muted-foreground">{result.result.hashtags.join(" ")}</p>
              <p className="mt-2 text-sm">{result.result.cta}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => navigator.clipboard.writeText(`${edit}\n${result.result.hashtags.join(" ")}`)}>
                  Copy
                </Button>
                <Button size="sm" variant="secondary" onClick={generate}>
                  Regenerate
                </Button>
                <Button size="sm" variant="secondary" onClick={saveEdit}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => download("txt")}>
                  TXT
                </Button>
                <Button size="sm" variant="outline" onClick={() => download("pdf")}>
                  PDF
                </Button>
                <Button size="sm" variant="outline" onClick={() => download("docx")}>
                  DOCX
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigator.share?.({ text: edit }).catch(() => navigator.clipboard.writeText(edit))}
                >
                  Share
                </Button>
              </div>
            </Card>
            <Card>
              <p className="text-sm font-medium">AI tools</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["rewrite", "improve", "grammar", "seo", "hashtags", "emoji", "cta"].map((m) => (
                  <Button key={m} size="sm" variant="ghost" onClick={() => transform(m)}>
                    {m}
                  </Button>
                ))}
              </div>
            </Card>
            <Card>
              <p className="text-sm font-medium">Vision analysis</p>
              <p className="mt-2 text-sm text-muted-foreground">{result.result.analysis.description}</p>
              <p className="mt-2 text-sm">Scene: {result.result.analysis.scene}</p>
              <p className="mt-1 text-sm">Objects: {result.result.analysis.objects?.join(", ")}</p>
              {result.result.variants?.length ? (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium">Variants</p>
                  {result.result.variants.map((v) => (
                    <button key={v} className="block w-full rounded-xl bg-muted/50 p-2 text-left text-sm" onClick={() => setEdit(v)}>
                      {v}
                    </button>
                  ))}
                </div>
              ) : null}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
