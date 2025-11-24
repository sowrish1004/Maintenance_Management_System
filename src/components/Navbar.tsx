import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import prisma from "@/lib/prisma";

const Navbar = async () => {
  const { userId } = await auth();
  let user = null;

  if (userId) {
    try {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          firstName: true,
          lastName: true,
          role: true,
        },
      });
    } catch (err) {
      console.warn("Navbar failed to fetch user from DB:", err);
    }
  }

  return (
    <div className='flex items-center justify-end p-4'>
      <div className="flex items-center gap-6">
        <div className='flex flex-col items-end'>
          {user && (
             <span className="text-sm font-medium leading-tight">
                {user.firstName} {user.lastName}
             </span>
          )}
          <span className="text-[12px] text-gray-500 capitalize">
            {user?.role?.toLowerCase() || "Guest"}
          </span>
        </div>
        <UserButton />
      </div>
    </div>
  )
}

export default Navbar;