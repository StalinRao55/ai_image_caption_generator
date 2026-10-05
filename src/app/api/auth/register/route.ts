import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { registerSchema } from "@/types/schemas";
import { userRepository } from "@/infrastructure/repositories/user-repository";
import { prisma } from "@/infrastructure/db/prisma";
import { sendEmail } from "@/infrastructure/email";
import { jsonError } from "@/lib/api";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
    }
    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await userRepository.create({
      email: data.email,
      name: data.name,
      passwordHash,
    });
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });
    const url = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify?token=${token}&email=${encodeURIComponent(user.email)}`;
    await sendEmail(
      user.email,
      "Verify your CaptionAI email",
      `<p>Welcome to CaptionAI.</p><p><a href="${url}">Verify email</a></p>`,
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
