import { NextResponse } from "next/server";
import { requireUser } from "@/infrastructure/auth/guards";
import { jsonError } from "@/lib/api";
import { analyticsRepository } from "@/infrastructure/repositories/analytics-repository";

export async function GET() {
  try {
    const user = await requireUser();
    const fromWeek = new Date();
    fromWeek.setUTCDate(fromWeek.getUTCDate() - 7);
    const fromMonth = new Date();
    fromMonth.setUTCDate(fromMonth.getUTCDate() - 30);
    const [daily, weekly, monthly, types, tones] = await Promise.all([
      analyticsRepository.range(user.id, new Date(Date.now() - 86400000)),
      analyticsRepository.range(user.id, fromWeek),
      analyticsRepository.range(user.id, fromMonth),
      analyticsRepository.typeBreakdown(user.id),
      analyticsRepository.toneBreakdown(user.id),
    ]);
    const sum = (rows: { captionsGenerated: number; creditsUsed: number; avgResponseMs: number }[]) => ({
      captionsGenerated: rows.reduce((a, r) => a + r.captionsGenerated, 0),
      creditsUsed: rows.reduce((a, r) => a + r.creditsUsed, 0),
      avgResponseMs: rows.length
        ? Math.round(rows.reduce((a, r) => a + r.avgResponseMs, 0) / rows.length)
        : 0,
    });
    return NextResponse.json({
      daily: sum(daily),
      weekly: sum(weekly),
      monthly: sum(monthly),
      series: monthly,
      types,
      tones,
    });
  } catch (error) {
    return jsonError(error);
  }
}
