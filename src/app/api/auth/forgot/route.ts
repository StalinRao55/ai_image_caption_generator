import crypto from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/infrastructure/db/prisma";
import { sendEmail } from "@/infrastructure/email";
import { jsonError } from "@/lib/api";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  try {
    const { email } = schema.parse(await req.json());
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      await prisma.verificationToken.create({
        data: {
          identifier: `reset:${user.email}`,
          token,
          expires: new Date(Date.now() + 1000 * 60 * 30),
        },
      });
      const url = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;
      await sendEmail(user.email, "Reset your CaptionAI password", `<p><a href="${url}">Reset password</a> (30 minutes)</p>`);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
