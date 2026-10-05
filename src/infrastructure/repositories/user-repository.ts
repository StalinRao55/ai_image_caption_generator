import { MONTHLY_CREDITS } from "@/constants/app";
import { prisma } from "@/infrastructure/db/prisma";
import { Plan } from "@prisma/client";

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  },
  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },
  create(data: { email: string; name: string; passwordHash: string }) {
    return prisma.user.create({
      data: { ...data, email: data.email.toLowerCase() },
    });
  },
  update(id: string, data: Parameters<typeof prisma.user.update>[0]["data"]) {
    return prisma.user.update({ where: { id }, data });
  },
  async consumeCredit(userId: string) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) return null;
      const now = new Date();
      const resetDue =
        now.getUTCFullYear() > user.creditsResetAt.getUTCFullYear() ||
        now.getUTCMonth() > user.creditsResetAt.getUTCMonth();
      let credits = user.credits;
      if (resetDue) {
        credits = MONTHLY_CREDITS[user.plan] ?? MONTHLY_CREDITS.FREE;
        await tx.user.update({
          where: { id: userId },
          data: { credits, creditsResetAt: now },
        });
      }
      if (credits < 1) return null;
      return tx.user.update({
        where: { id: userId },
        data: { credits: { decrement: 1 } },
      });
    });
  },
  refundCredit(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: 1 } },
    });
  },
  setPlan(userId: string, plan: Plan) {
    return prisma.user.update({
      where: { id: userId },
      data: { plan, credits: MONTHLY_CREDITS[plan] },
    });
  },
  list(skip: number, take: number) {
    return prisma.user.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        credits: true,
        role: true,
        createdAt: true,
      },
    });
  },
  count() {
    return prisma.user.count();
  },
};
