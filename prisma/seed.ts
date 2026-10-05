import { PrismaClient, Plan, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@captionai.app";
  const password = process.env.ADMIN_PASSWORD ?? "ChangeMe_Admin1!";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { role: Role.ADMIN, plan: Plan.BUSINESS, credits: 5000 },
    create: {
      email,
      name: "CaptionAI Admin",
      passwordHash,
      role: Role.ADMIN,
      plan: Plan.BUSINESS,
      credits: 5000,
      emailVerified: new Date(),
    },
  });

  console.log(`Seeded admin ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
