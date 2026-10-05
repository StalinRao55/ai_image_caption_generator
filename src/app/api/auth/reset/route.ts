import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/infrastructure/db/prisma";
import { jsonError } from "@/lib/api";

const schema = z.object({
  email: z.string().email(),
  token: z.string().min(10),
  password: z.string().min(8).max(72),
});

export async function POST(req: Request) {
  try {
    const { email, token, password } = schema.parse(await req.json());
    const record = await prisma.verificationToken.findFirst({
      where: { identifier: `reset:${email.toLowerCase()}`, token },
    });
    if (!record || record.expires < new Date()) {
      return NextResponse.json({ error: "Reset link is invalid or expired." }, { status: 400 });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { passwordHash },
    });
    await prisma.verificationToken.deleteMany({ where: { token } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
