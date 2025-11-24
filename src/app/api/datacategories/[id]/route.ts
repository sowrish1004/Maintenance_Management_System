import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> } 
) {
  try {
    const { id } = await context.params; 

    if (!id) {
      return NextResponse.json({ message: "Missing category ID" }, { status: 400 });
    }

    // Delete the category
    await prisma.dataCategory.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { message: "Error deleting category", error: (error as Error).message },
      { status: 500 }
    );
  }
}
