"use client";

import { ITEM_PER_PAGE } from "@/lib/settings";
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";

const Pagination = ({ page, count }: { page: number; count: number }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hasPrev = ITEM_PER_PAGE * (page - 1) > 0;
  const hasNext = ITEM_PER_PAGE * (page - 1) + ITEM_PER_PAGE < count;

  const createPageURL = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    return `${pathname}?${params.toString()}`;
  };

  return (
    <div className="p-4 flex items-center justify-between text-gray-500">
      <Link
        href={createPageURL(page - 1)}
        className={`py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold ${
          !hasPrev ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        Prev
      </Link>

      <div className="flex items-center gap-2 text-sm">
        {Array.from({ length: Math.ceil(count / ITEM_PER_PAGE) }, (_, i) => {
          const pageIndex = i + 1;
          return (
            <Link
              key={pageIndex}
              href={createPageURL(pageIndex)}
              className={`px-2 rounded-sm ${
                page === pageIndex ? "bg-lamaSky" : ""
              }`}
            >
              {pageIndex}
            </Link>
          );
        })}
      </div>

      <Link
        href={createPageURL(page + 1)}
        className={`py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold ${
          !hasNext ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        Next
      </Link>
    </div>
  );
};

export default Pagination;
