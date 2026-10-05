import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20",
        secondary: "bg-muted text-foreground hover:bg-muted/80",
        ghost: "hover:bg-muted",
        outline: "border border-border bg-transparent hover:bg-muted",
        danger: "bg-red-500 text-white hover:bg-red-600",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export function Input(props: React.ComponentProps<"input">) {
  return (
    <input
      {...props}
      className={cn(
        "h-10 w-full rounded-xl border border-border bg-muted/40 px-3 text-sm outline-none ring-ring placeholder:text-muted-foreground focus:ring-2",
        props.className,
      )}
    />
  );
}

export function Textarea(props: React.ComponentProps<"textarea">) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-28 w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm outline-none ring-ring placeholder:text-muted-foreground focus:ring-2",
        props.className,
      )}
    />
  );
}

export function Label(props: React.ComponentProps<"label">) {
  return <label {...props} className={cn("text-sm font-medium", props.className)} />;
}

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("glass rounded-2xl p-5", className)} {...props} />;
}

export function Badge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("shimmer rounded-xl bg-muted", className)} />;
}
