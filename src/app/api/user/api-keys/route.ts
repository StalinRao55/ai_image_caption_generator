import crypto from "crypto";
import { NextResponse } from "next/server";
import { requireUser } from "@/infrastructure/auth/guards";
import { jsonError } from "@/lib/api";
import { prisma } from "@/infrastructure/db/prisma";
import { z } from "zod";

export async function GET() {
  try {
    const user = await requireUser();
    const keys = await prisma.apiKey.findMany({
      where: { userId: user.id },
      select: { id: true, name: true, lastFour: true, lastUsedAt: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(keys);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const { name } = z.object({ name: z.string().min(2).max(40) }).parse(await req.json());
    const raw = `cai_${crypto.randomBytes(24).toString("hex")}`;
    const hashedKey = crypto.createHash("sha256").update(raw).digest("hex");
    const created = await prisma.apiKey.create({
      data: {
        userId: user.id,
        name,
        hashedKey,
        lastFour: raw.slice(-4),
      },
    });
    return NextResponse.json({ id: created.id, key: raw, lastFour: created.lastFour, name });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await requireUser();
    const { id } = z.object({ id: z.string() }).parse(await req.json());
    await prisma.apiKey.deleteMany({ where: { id, userId: user.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
