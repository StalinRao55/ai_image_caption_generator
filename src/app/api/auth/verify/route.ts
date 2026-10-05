import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/infrastructure/db/prisma";
import { jsonError } from "@/lib/api";

const schema = z.object({ email: z.string().email(), token: z.string() });

export async function POST(req: Request) {
  try {
    const { email, token } = schema.parse(await req.json());
    const record = await prisma.verificationToken.findFirst({
      where: { identifier: email.toLowerCase(), token },
    });
    if (!record || record.expires < new Date()) {
      return NextResponse.json({ error: "Verification link is invalid or expired." }, { status: 400 });
    }
    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { emailVerified: new Date() },
    });
    await prisma.verificationToken.deleteMany({ where: { token } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
