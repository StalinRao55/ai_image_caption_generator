import { NextResponse } from "next/server";
import { requireUser } from "@/infrastructure/auth/guards";
import { jsonError } from "@/lib/api";
import { prisma } from "@/infrastructure/db/prisma";
import { z } from "zod";
import { Errors } from "@/domain/errors";

const createSchema = z.object({
  captionId: z.string(),
  platform: z.string().min(2),
  runAt: z.string().datetime(),
});

export async function GET() {
  try {
    const user = await requireUser();
    const items = await prisma.scheduledPost.findMany({
      where: { userId: user.id },
      include: { caption: true },
      orderBy: { runAt: "asc" },
    });
    const now = new Date();
    await prisma.scheduledPost.updateMany({
      where: { userId: user.id, status: "scheduled", runAt: { lte: now } },
      data: { status: "ready" },
    });
    return NextResponse.json(items);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = createSchema.parse(await req.json());
    const caption = await prisma.captionHistory.findFirst({
      where: { id: body.captionId, userId: user.id },
    });
    if (!caption) throw Errors.notFound("Caption");
    const created = await prisma.scheduledPost.create({
      data: {
        userId: user.id,
        captionId: body.captionId,
        platform: body.platform,
        runAt: new Date(body.runAt),
      },
    });
    return NextResponse.json(created);
  } catch (error) {
    return jsonError(error);
  }
}
