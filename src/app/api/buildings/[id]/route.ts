import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { buildingSchema } from '@/lib/formValidationSchemas';

// Get single building and respective categories
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const building = await prisma.building.findUnique({
      where: { id },
      include: {
        dataCategories: {
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!building) {
      return NextResponse.json({ message: 'Building not found' }, { status: 404 });
    }

    return NextResponse.json(building);
  } catch (error) {
    console.error('Error fetching building:', error);
    return NextResponse.json({ message: 'Error fetching building' }, { status: 500 });
  }
}

// Update building
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const validated = buildingSchema.partial().safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ message: 'Invalid data', errors: validated.error.flatten() }, { status: 400 });
    }

    const { name, isActive } = validated.data;
    const dataToUpdate: any = {};
    
    if (name) dataToUpdate.name = name;
    if (isActive !== undefined) {
        dataToUpdate.isActive = isActive === 'yes';
    }

    const updatedBuilding = await prisma.building.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedBuilding);
  } catch (error: any) {
    if (error.code === 'P2025') {
       return NextResponse.json({ message: 'Building not found' }, { status: 404 });
    }
    console.error('Error updating building:', error);
    return NextResponse.json({ message: 'Error updating building' }, { status: 500 });
  }
}

// Delete building
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.building.delete({ where: { id } });
    
    return NextResponse.json({ message: 'Building deleted successfully' }, { status: 200 });
  } catch (error: any) {
    if (error.code === 'P2025') {
       return NextResponse.json({ message: 'Building not found' }, { status: 404 });
    }
    console.error('Delete Error:', error);
    return NextResponse.json({ message: 'Error deleting building' }, { status: 500 });
  }
}