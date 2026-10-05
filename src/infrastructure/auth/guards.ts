import { auth } from "@/auth";
import { Errors } from "@/domain/errors";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw Errors.unauthorized();
  return session.user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw Errors.forbidden();
  return user;
}
