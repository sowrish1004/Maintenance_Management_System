import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { buildingSchema } from '@/lib/formValidationSchemas';

// Fetch all buildings for forms 'dropdown'
export async function GET() {
  try {
    const buildings = await prisma.building.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(buildings, { status: 200 });
  } catch (error) {
    console.error('Error fetching buildings:', error);
    return NextResponse.json({ message: 'Error fetching buildings' }, { status: 500 });
  }
}

// Create a new building
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = buildingSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { message: 'Invalid data', errors: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { name, isActive } = validated.data;

    // Check if building already exists
    const existing = await prisma.building.findUnique({
      where: { name },
    });

    if (existing) {
      return NextResponse.json(
        { message: 'A building with this name already exists' },
        { status: 409 }
      );
    }

    const newBuilding = await prisma.building.create({
      data: {
        name,
        isActive: isActive === undefined ? true : isActive === 'yes',
      },
    });

    return NextResponse.json(newBuilding, { status: 201 });
  } catch (error) {
    console.error('Error creating building:', error);
    return NextResponse.json({ message: 'Error creating building' }, { status: 500 });
  }
}