import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { dataCategorySchema } from '@/lib/formValidationSchemas';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = dataCategorySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ message: 'Invalid data', errors: validated.error.flatten() }, { status: 400 });
    }

    const { name, type, buildingId } = validated.data;

    // Check if this category is already linked to this building
    const existing = await prisma.dataCategory.findFirst({
      where: {
        name: name,
        buildingId: buildingId,
      },
    });

    if (existing) {
      return NextResponse.json({ message: 'This category is already added to this building' }, { status: 409 });
    }

    const newDataCategory = await prisma.dataCategory.create({
      data: {
        name,
        type,
        buildingId,
      },
    });

    return NextResponse.json(newDataCategory, { status: 201 });

  } catch (error) {
    console.error('Error creating data category:', error);
    return NextResponse.json({ message: 'Error creating data category' }, { status: 500 });
  }
}