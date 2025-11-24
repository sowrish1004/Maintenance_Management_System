import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createInspectionSchema } from '@/lib/formValidationSchemas';

//Single inspection results fetch
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const inspection = await prisma.inspection.findUnique({
      where: { id },
      include: {
        technician: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        building: {
          include: {
            dataCategories: {
              orderBy: { name: 'asc' }
            }
          }
        },
        readings: {
          include: {
            category: true,
          },
          orderBy: {
            category: { name: 'asc' }
          }
        },
      },
    });

    if (!inspection) {
      return NextResponse.json({ message: 'Inspection not found' }, { status: 404 });
    }

    return NextResponse.json(inspection);
  } catch (error) {
    console.error('Error fetching inspection:', error);
    return NextResponse.json({ message: 'Error fetching inspection', error: (error as Error).message }, { status: 500 });
  }
}

// //Update an inspection
// export async function PATCH(
//   request: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params;
//     const body = await request.json();
    
//     // Allow partial updates
//     const validated = createInspectionSchema.partial().safeParse({
//         ...body,
//         date: body.date ? new Date(body.date) : undefined,
//     });
    
//     if (!validated.success) {
//       return NextResponse.json({ message: 'Invalid data', errors: validated.error.flatten() }, { status: 400 });
//     }
    
//     const { date, technicianId, buildingId, notes } = validated.data;

//     const updatedInspection = await prisma.inspection.update({
//       where: { id },
//       data: {
//         date,
//         technicianId,
//         buildingId,
//         notes,
//       },
//     });

//     return NextResponse.json(updatedInspection);
//   } catch (error) {
//     console.error('Error updating inspection:', error);
//     if ((error as any).code === 'P2025') {
//       return NextResponse.json({ message: 'Inspection not found' }, { status: 404 });
//     }
//     return NextResponse.json({ message: 'Error updating inspection', error: (error as Error).message }, { status: 500 });
//   }
// }

// Delete an inspection
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.inspection.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Inspection deleted successfully' });
  } catch (error) {
    console.error('Error deleting inspection:', error);
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ message: 'Inspection not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Error deleting inspection', error: (error as Error).message }, { status: 500 });
  }
}