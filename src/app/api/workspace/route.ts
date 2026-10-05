import { NextResponse } from "next/server";
import { requireUser } from "@/infrastructure/auth/guards";
import { jsonError } from "@/lib/api";
import { prisma } from "@/infrastructure/db/prisma";
import { z } from "zod";

const schema = z.object({ name: z.string().min(2).max(60), email: z.string().email() });

export async function GET() {
  try {
    const user = await requireUser();
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId: user.id },
      include: { workspace: { include: { members: { include: { user: { select: { email: true, name: true } } } } } } },
    });
    return NextResponse.json(memberships);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const { name, email } = schema.parse(await req.json());
    const workspace = await prisma.workspace.create({
      data: {
        name,
        members: {
          create: [{ userId: user.id, role: "owner" }],
        },
      },
    });
    const invitee = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (invitee) {
      await prisma.workspaceMember.create({
        data: { workspaceId: workspace.id, userId: invitee.id, role: "member" },
      });
    }
    return NextResponse.json(workspace);
  } catch (error) {
    return jsonError(error);
  }
}
