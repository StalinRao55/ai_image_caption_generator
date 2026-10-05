import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/infrastructure/auth/guards";
import { jsonError } from "@/lib/api";
import { captionRepository } from "@/infrastructure/repositories/caption-repository";
import { Errors } from "@/domain/errors";

const patchSchema = z.object({
  caption: z.string().min(1).optional(),
  isFavorite: z.boolean().optional(),
  isDeleted: z.boolean().optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const existing = await captionRepository.findOwned(id, user.id);
    if (!existing) throw Errors.notFound("Caption");
    const data = patchSchema.parse(await req.json());
    const updated = await captionRepository.update(id, data);
    return NextResponse.json(updated);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const existing = await captionRepository.findOwned(id, user.id);
    if (!existing) throw Errors.notFound("Caption");
    await captionRepository.update(id, { isDeleted: true });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
