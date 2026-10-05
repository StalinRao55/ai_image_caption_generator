import { NextResponse } from "next/server";
import { requireAdmin } from "@/infrastructure/auth/guards";
import { jsonError } from "@/lib/api";
import { userRepository } from "@/infrastructure/repositories/user-repository";
import { prisma } from "@/infrastructure/db/prisma";
import { Plan } from "@prisma/client";
import { z } from "zod";

const schema = z.object({
  userId: z.string(),
  plan: z.nativeEnum(Plan).optional(),
  credits: z.number().int().min(0).optional(),
});

export async function PATCH(req: Request) {
  try {
    const admin = await requireAdmin();
    const data = schema.parse(await req.json());
    const updated = await userRepository.update(data.userId, {
      ...(data.plan ? { plan: data.plan } : {}),
      ...(typeof data.credits === "number" ? { credits: data.credits } : {}),
    });
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: "admin.update_user",
        details: data,
      },
    });
    return NextResponse.json({ id: updated.id, plan: updated.plan, credits: updated.credits });
  } catch (error) {
    return jsonError(error);
  }
}
