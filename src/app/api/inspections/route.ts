import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createInspectionSchema } from "@/lib/formValidationSchemas";

// Fetch all inspections
export async function GET(request: Request) {
  try {
    const inspections = await prisma.inspection.findMany({
      include: {
        technician: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        building: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
    return NextResponse.json(inspections);
  } catch (error) {
    console.error('Error fetching inspections:', error);
    return NextResponse.json({ message: 'Error fetching inspections', error: (error as Error).message }, { status: 500 });
  }
}

// Creating new inspections + post
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const headerData = {
        date: body.date, 
        technicianId: body.technicianId,
        buildingId: body.buildingId,
        notes: body.notes,
    };

    const validated = createInspectionSchema.safeParse(headerData);
    if (!validated.success) {
      console.error("Validation failed:", validated.error.flatten());
      return NextResponse.json({ message: 'Invalid data', errors: validated.error.flatten() }, { status: 400 });
    }
    
    const { date, technicianId, buildingId, notes } = validated.data;
    const readingsToCreate = body.readings || [];

    const localDate = new Date(date + 'T00:00:00');

    const newInspection = await prisma.inspection.create({
      data: {
        date: localDate,
        technicianId,
        buildingId,
        notes,
        readings: {
          create: readingsToCreate.map((r: any) => ({
            categoryId: r.categoryId,
            numericalValue: typeof r.numericalValue === 'number' ? r.numericalValue : null,
            booleanValue: typeof r.booleanValue === 'boolean' ? r.booleanValue : null,
          })),
        },
      },
    });

    return NextResponse.json({
      message: "Inspection created successfully",
      id: newInspection.id,
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error creating inspection:", error);
    if (error.code === 'P2003') { 
      return NextResponse.json({ message: 'Invalid technician or building selected' }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}