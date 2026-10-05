import { prisma } from "@/infrastructure/db/prisma";
import { CaptionLength, Prisma } from "@prisma/client";

export const captionRepository = {
  create(data: {
    userId: string;
    imageUrl: string;
    caption: string;
    captionType: string;
    tone: string;
    language: string;
    length: CaptionLength;
    hashtags: string[];
    emojis: string[];
    cta?: string;
    keywords?: string;
    audience?: string;
    variants?: Prisma.InputJsonValue;
    analysis?: Prisma.InputJsonValue;
    wordCount: number;
    readingTime: number;
    confidence?: number;
    provider?: string;
    responseMs?: number;
  }) {
    return prisma.captionHistory.create({ data });
  },
  findOwned(id: string, userId: string) {
    return prisma.captionHistory.findFirst({ where: { id, userId } });
  },
  list(params: {
    userId: string;
    q?: string;
    type?: string;
    favorite?: boolean;
    deleted?: boolean;
    skip: number;
    take: number;
    sort: "newest" | "oldest";
  }) {
    const where: Prisma.CaptionHistoryWhereInput = {
      userId: params.userId,
      isDeleted: params.deleted ?? false,
      ...(params.favorite ? { isFavorite: true } : {}),
      ...(params.type ? { captionType: params.type } : {}),
      ...(params.q
        ? {
            OR: [
              { caption: { contains: params.q, mode: "insensitive" } },
              { keywords: { contains: params.q, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    return prisma.captionHistory.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy: { createdAt: params.sort === "oldest" ? "asc" : "desc" },
    });
  },
  count(userId: string, extra: Prisma.CaptionHistoryWhereInput = {}) {
    return prisma.captionHistory.count({ where: { userId, ...extra } });
  },
  update(id: string, data: Prisma.CaptionHistoryUpdateInput) {
    return prisma.captionHistory.update({ where: { id }, data });
  },
};
