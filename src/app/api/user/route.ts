import { NextResponse } from "next/server";
import { requireUser } from "@/infrastructure/auth/guards";
import { jsonError } from "@/lib/api";
import { prisma } from "@/infrastructure/db/prisma";
import { userRepository } from "@/infrastructure/repositories/user-repository";
import { settingsSchema } from "@/types/schemas";
import { Errors } from "@/domain/errors";

export async function GET() {
  try {
    const session = await requireUser();
    const user = await userRepository.findById(session.id);
    if (!user) throw Errors.unauthorized();
    const { passwordHash: _, ...safe } = user;
    return NextResponse.json(safe);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireUser();
    const data = settingsSchema.parse(await req.json());
    const user = await userRepository.update(session.id, data);
    const { passwordHash: _, ...safe } = user;
    return NextResponse.json(safe);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE() {
  try {
    const session = await requireUser();
    await prisma.user.delete({ where: { id: session.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
