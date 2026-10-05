"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button, Card } from "@/components/ui/primitives";
import { APP_NAME, PLANS } from "@/constants/app";
import { Sparkles } from "lucide-react";

const features = [
  { title: "Vision analysis", body: "Objects, scene, lighting, mood, and brand context in one pass." },
  { title: "17 caption styles", body: "Instagram, LinkedIn, SEO, product, travel, fashion, and more." },
  { title: "Export anywhere", body: "Copy, TXT, PDF, DOCX, schedule, and save full history." },
  { title: "Brand voice", body: "Lock your tone once and reuse it across every campaign." },
];

const faqs = [
  { q: "Which AI models are used?", a: "Google Gemini Vision is primary. OpenAI GPT-4.1 Vision is the automatic fallback." },
  { q: "Is my image stored?", a: "Images are stored in Supabase Storage (or local uploads in development) and tied to your account history." },
  { q: "Can I use it for a team?", a: "Business plans include workspaces so you can invite collaborators." },
];

export default function HomePage() {
  return (
    <div className="gradient-mesh min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Sparkles className="h-5 w-5 text-primary" />
          {APP_NAME}
        </div>
        <nav className="flex items-center gap-3">
          <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
            Pricing
          </Link>
          <Link href="/login">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link href="/signup">
            <Button>Get started</Button>
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 text-sm uppercase tracking-[0.2em] text-accent"
        >
          Premium caption studio
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-semibold leading-tight md:text-6xl"
        >
          Generate Amazing AI Image Captions in Seconds
        </motion.h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
          Upload a photo. CaptionAI reads the scene and writes social, marketing, and SEO copy that actually matches the image.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/signup">
            <Button size="lg">Upload an image</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              Live demo
            </Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-20 md:grid-cols-4">
        {features.map((f) => (
          <Card key={f.title}>
            <h3 className="font-medium">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
          </Card>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="mb-6 text-2xl font-semibold">Loved by creators</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Aisha, brand lead", "We replaced three tools. Captions finally sound like our brand."],
            ["Marco, photographer", "The scene analysis is scary accurate. Hashtags stopped being guesswork."],
            ["Priya, social manager", "Bulk upload on Pro saved our Monday content batch."],
          ].map(([name, quote]) => (
            <Card key={name}>
              <p className="text-sm text-muted-foreground">“{quote}”</p>
              <p className="mt-4 text-sm font-medium">{name}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="mb-6 text-2xl font-semibold">Pricing</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {PLANS.map((p) => (
            <Card key={p.id} className={p.id === "PRO" ? "ring-1 ring-primary" : ""}>
              <p className="text-sm text-muted-foreground">{p.name}</p>
              <p className="mt-2 text-3xl font-semibold">${p.price}</p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {p.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-20">
        <h2 className="mb-6 text-2xl font-semibold">FAQ</h2>
        <div className="space-y-3">
          {faqs.map((f) => (
            <Card key={f.q}>
              <p className="font-medium">{f.q}</p>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-border px-6 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {APP_NAME}. Built for creators.
      </footer>
    </div>
  );
}
