import { NextResponse } from "next/server";
import { requireUser } from "@/infrastructure/auth/guards";
import { jsonError } from "@/lib/api";
import { captionRepository } from "@/infrastructure/repositories/caption-repository";

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    const url = new URL(req.url);
    const q = url.searchParams.get("q") ?? undefined;
    const type = url.searchParams.get("type") ?? undefined;
    const favorite = url.searchParams.get("favorite") === "true";
    const deleted = url.searchParams.get("deleted") === "true";
    const sort = url.searchParams.get("sort") === "oldest" ? "oldest" : "newest";
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const take = Math.min(50, Math.max(10, Number(url.searchParams.get("take") ?? 12)));
    const skip = (page - 1) * take;
    const [items, total] = await Promise.all([
      captionRepository.list({ userId: user.id, q, type, favorite, deleted, skip, take, sort }),
      captionRepository.count(user.id, { isDeleted: deleted, ...(favorite ? { isFavorite: true } : {}) }),
    ]);
    return NextResponse.json({ items, total, page, take });
  } catch (error) {
    return jsonError(error);
  }
}
