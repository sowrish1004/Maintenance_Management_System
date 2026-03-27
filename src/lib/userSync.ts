import prisma from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { Role } from "@prisma/client";

export async function ensureUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (existing) return existing;

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);

  const role =
    (clerkUser.publicMetadata?.role as string)?.toUpperCase() === "ADMINISTRATOR"
      ? Role.ADMINISTRATOR
      : Role.TECHNICIAN;

  const user = await prisma.user.upsert({
    where: { id: userId },
    update: {
      firstName: clerkUser.firstName || "",
      lastName: clerkUser.lastName || "",
      email: clerkUser.emailAddresses[0]?.emailAddress || "",
      role,
    },
    create: {
      id: userId,
      firstName: clerkUser.firstName || "",
      lastName: clerkUser.lastName || "",
      email: clerkUser.emailAddresses[0]?.emailAddress || "",
      password: "clerk-managed",
      role,
    },
  });

  return user;
}
