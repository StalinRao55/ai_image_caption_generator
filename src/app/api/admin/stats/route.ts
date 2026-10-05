import { NextResponse } from "next/server";
import { requireAdmin } from "@/infrastructure/auth/guards";
import { jsonError } from "@/lib/api";
import { analyticsRepository } from "@/infrastructure/repositories/analytics-repository";
import { userRepository } from "@/infrastructure/repositories/user-repository";
import { prisma } from "@/infrastructure/db/prisma";

export async function GET() {
  try {
    await requireAdmin();
    const [userCount, captionCount, usage] = await analyticsRepository.globalStats();
    const users = await userRepository.list(0, 25);
    const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 40 });
    const plans = await prisma.user.groupBy({ by: ["plan"], _count: { _all: true } });
    return NextResponse.json({
      userCount,
      captionCount,
      creditsUsed: usage._sum.creditsUsed ?? 0,
      captionsGenerated: usage._sum.captionsGenerated ?? 0,
      users,
      logs,
      plans,
    });
  } catch (error) {
    return jsonError(error);
  }
}
