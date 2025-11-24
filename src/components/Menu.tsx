import Link from "next/link";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

const menuItems = [
  {
    title: "MENU",
    items: [
      {
        icon: "/home.png",
        label: "Home",
        href: "/",
        visible: ["administrator", "technician"],
      },
      {
        icon: "/technician.png",
        label: "Users",
        href: "/list/users",
        visible: ["administrator"],
      },
      {
        icon: "/building.png",
        label: "Buildings",
        href: "/list/buildings",
        visible: ["administrator"],
      },
      {
        icon: "/record.png",
        label: "Inspections",
        href: "/list/inspections",
        visible: ["administrator","technician"],
      },
            {
        icon: "/report.png",
        label: "Reports",
        href: "/list/reports",
        visible: ["administrator"],
      },
    ],
  },
  {
    title: "OTHER",
    items: [
      {
        icon: "/profile.png",
        label: "Profile",
        href: "/profile",
        visible: ["administrator", "technician"],
      },
      {
        icon: "/setting.png",
        label: "Settings",
        href: "/settings",
        visible: ["administrator", "technician"],
      },
      {
        icon: "/logout.png",
        label: "Logout",
        href: "/logout",
        visible: ["administrator", "technician"],
      },
    ],
  },
];

const Menu = async () => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (!role) return null;

  return (
    <div className='mt-4 text-sm'>
        {menuItems.map(i=>(
            <div className="flex flex-col gap-2" key={i.title}>
                <span className="hidden lg:block text-gray-400 font-light my-4">
                  {i.title}
                </span>
                {i.items.map((item)=>{
                  if(item.visible.includes(role.toLowerCase())) {
                    return(
                      <Link href={item.href} key={item.label} className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-1 md:px-2 rounded-md hover:bg-msSkylight">
                        <Image src={item.icon} alt="" width={20} height={20} />
                        <span className="hidden lg:block" >{item.label}</span>
                      </Link>
                    )
                  }
                })}
            </div>
        ))}
    </div>
  )
}

export default Menu