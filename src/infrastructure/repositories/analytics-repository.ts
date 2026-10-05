import { prisma } from "@/infrastructure/db/prisma";

function startOfDay(d = new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export const analyticsRepository = {
  async recordGeneration(userId: string, creditsUsed: number, responseMs: number) {
    const date = startOfDay();
    const existing = await prisma.usageDaily.findUnique({
      where: { userId_date: { userId, date } },
    });
    if (!existing) {
      await prisma.usageDaily.create({
        data: {
          userId,
          date,
          captionsGenerated: 1,
          creditsUsed,
          avgResponseMs: responseMs,
        },
      });
      return;
    }
    const n = existing.captionsGenerated + 1;
    const avg = Math.round((existing.avgResponseMs * existing.captionsGenerated + responseMs) / n);
    await prisma.usageDaily.update({
      where: { id: existing.id },
      data: {
        captionsGenerated: { increment: 1 },
        creditsUsed: { increment: creditsUsed },
        avgResponseMs: avg,
      },
    });
  },
  range(userId: string, from: Date) {
    return prisma.usageDaily.findMany({
      where: { userId, date: { gte: from } },
      orderBy: { date: "asc" },
    });
  },
  typeBreakdown(userId: string) {
    return prisma.captionHistory.groupBy({
      by: ["captionType"],
      where: { userId, isDeleted: false },
      _count: { _all: true },
    });
  },
  toneBreakdown(userId: string) {
    return prisma.captionHistory.groupBy({
      by: ["tone"],
      where: { userId, isDeleted: false },
      _count: { _all: true },
    });
  },
  globalStats() {
    return Promise.all([
      prisma.user.count(),
      prisma.captionHistory.count(),
      prisma.usageDaily.aggregate({ _sum: { creditsUsed: true, captionsGenerated: true } }),
    ]);
  },
};
