"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import {
  BarChart3,
  Clock3,
  CreditCard,
  Home,
  ImagePlus,
  LogOut,
  Moon,
  Settings,
  Shield,
  Sparkles,
  Star,
  User,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { Badge, Button } from "@/components/ui/primitives";
import { useState } from "react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/generate", label: "Generate Caption", icon: ImagePlus },
  { href: "/history", label: "History", icon: Clock3 },
  { href: "/saved", label: "Saved Captions", icon: Star },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/pricing", label: "Pricing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/profile", label: "Profile", icon: User },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data } = useSession();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const me = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await api.get("/user")).data,
  });
  const notes = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (await api.get("/notifications")).data,
  });
  const markRead = useMutation({
    mutationFn: () => api.patch("/notifications"),
    onSuccess: () => notes.refetch(),
  });

  const unread = (notes.data ?? []).filter((n: { read: boolean }) => !n.read).length;

  return (
    <div className="gradient-mesh min-h-screen md:grid md:grid-cols-[260px_1fr]">
      <aside className="hidden border-r border-border bg-card/60 p-4 md:block">
        <div className="mb-8 flex items-center gap-2 px-2 text-lg font-semibold">
          <Sparkles className="h-5 w-5 text-primary" /> CaptionAI
        </div>
        <nav className="space-y-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${
                pathname === l.href ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60"
              }`}
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </Link>
          ))}
          {me.data?.role === "ADMIN" && (
            <Link
              href="/admin"
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${
                pathname === "/admin" ? "bg-muted" : "text-muted-foreground hover:bg-muted/60"
              }`}
            >
              <Shield className="h-4 w-4" /> Admin
            </Link>
          )}
        </nav>
      </aside>
      <div>
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/70 px-4 py-3 backdrop-blur">
          <Button className="md:hidden" variant="ghost" onClick={() => setOpen(!open)}>
            Menu
          </Button>
          <div className="flex items-center gap-3">
            <Badge>Credits {me.data?.credits ?? "—"}</Badge>
            <div className="relative">
              <Button variant="ghost" size="sm" onClick={() => markRead.mutate()}>
                Notifications {unread ? `(${unread})` : ""}
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              <Moon className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/30">
                {(data?.user?.name || "U").slice(0, 1)}
              </div>
              <span className="hidden sm:inline">{data?.user?.name}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => signOut({ callbackUrl: "/" })}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
        {open && (
          <div className="flex flex-wrap gap-2 border-b border-border p-3 md:hidden">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-lg bg-muted px-3 py-1 text-sm">
                {l.label}
              </Link>
            ))}
          </div>
        )}
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
