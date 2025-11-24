import prisma from "@/lib/prisma"
import Image from "next/image"

const UserCard = async ({type}:{type: "user" | "building" | "inspection"}) => {

  const modelMap : Record<typeof type, any> = {
    user: prisma.user,
    building: prisma.building,
    inspection: prisma.inspection,
  }

  const data = await modelMap[type].count();

  return (
    <div className='rounded-2xl odd:bg-msPurple even:bg-msYellow p-4 flex-1 min-w-[135~px]'>
        <div className="flex justify-between items-center">
            <span className="text-[10px] bg-white px-2 py-1 rounded-full text-green-600">2025/2026</span>
            <Image src="/more.png" alt="" width={20} height={20}/>
        </div>
        <h1 className="text-2xl font-semibold my-4">{data}</h1>
        <h2 className="capitalize text-sm font-medium text-gray-500">{type}s</h2>
    </div>
  )
}

export default UserCard