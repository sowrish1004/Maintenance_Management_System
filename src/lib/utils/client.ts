import { Clerk } from "@clerk/clerk-js";

let clerkClient: Clerk | null = null;

// Initialize Clerk client once (only on client)
if (typeof window !== "undefined") {
  clerkClient = new Clerk(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!);
  clerkClient.load();
}

// ✅ Safely get userId
export const getClientUserId = (): string | null => {
  if (!clerkClient) return null;

  const user = clerkClient.user;
  return user?.id || null;
};

// ✅ Safely get user role (if you store it in publicMetadata)
export const getClientRole = (): string | null => {
  if (!clerkClient) return null;

  const role = clerkClient.user?.publicMetadata?.role;
  return typeof role === "string" ? role : null;
};
