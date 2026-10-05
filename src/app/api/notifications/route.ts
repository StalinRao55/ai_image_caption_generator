import { NextResponse } from "next/server";
import { requireUser } from "@/infrastructure/auth/guards";
import { jsonError } from "@/lib/api";
import { prisma } from "@/infrastructure/db/prisma";

export async function GET() {
  try {
    const user = await requireUser();
    const items = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    return NextResponse.json(items);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH() {
  try {
    const user = await requireUser();
    await prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
