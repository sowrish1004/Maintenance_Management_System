import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  try {
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role?.toUpperCase();

    const body = await request.json();
    const { inspectionId, categoryId, numericalValue, booleanValue } = body;

    if (!inspectionId || !categoryId) {
      return NextResponse.json({ message: 'Missing inspectionId or categoryId' }, { status: 400 });
    }
    
    const category = await prisma.dataCategory.findUnique({
      where: { id: categoryId },
      select: { type: true }
    });
    
    if (!category) {
       return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    const existingReading = await prisma.reading.findUnique({
        where: {
            inspectionId_categoryId: {
                inspectionId,
                categoryId
            }
        }
    });

    if (existingReading && role !== 'ADMINISTRATOR') {
        return NextResponse.json(
            { message: 'Permission denied: Only administrators can update existing readings.' },
            { status: 403 }
        );
    }

    let dataToSave = {
      numericalValue: null as number | null,
      booleanValue: null as boolean | null,
    };
    
    if (category.type === 'NUMBER') {
      dataToSave.numericalValue = (numericalValue !== null && numericalValue !== '') ? Number(numericalValue) : null;
    } else if (category.type === 'ON_OFF') {
      dataToSave.booleanValue = booleanValue ?? false;
    }

    const savedReading = await prisma.reading.upsert({
      where: {
        inspectionId_categoryId: {
          inspectionId: inspectionId,
          categoryId: categoryId,
        },
      },
      update: {
        numericalValue: dataToSave.numericalValue,
        booleanValue: dataToSave.booleanValue,
      },
      create: {
        inspectionId: inspectionId,
        categoryId: categoryId,
        numericalValue: dataToSave.numericalValue,
        booleanValue: dataToSave.booleanValue,
      },
    });

    return NextResponse.json(savedReading, { status: 200 });

  } catch (error) {
    console.error('Error saving reading:', error);
    return NextResponse.json({ message: 'Error saving reading' }, { status: 500 });
  }
}