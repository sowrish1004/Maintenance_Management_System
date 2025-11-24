import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, technicianId, buildingId, notes, readings } = body;

    if (!buildingId || !technicianId || !Array.isArray(readings)) {
      return NextResponse.json(
        { message: "Missing or invalid data." },
        { status: 400 }
      );
    }

    const inspection = await prisma.$transaction(async (tx) => {
      const newInspection = await tx.inspection.create({
        data: {
          date: new Date(date),
          technicianId,
          buildingId,
          notes: notes || "",
        },
      });

      await tx.reading.createMany({
        data: readings.map((r) => ({
          inspectionId: newInspection.id,
          categoryId: r.categoryId,
          numericalValue: r.numericalValue ?? null,
          booleanValue: r.booleanValue ?? null,
        })),
      });

      return newInspection;
    });

    return NextResponse.json(inspection, { status: 201 });
  } catch (error) {
    console.error("Error creating inspection:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
