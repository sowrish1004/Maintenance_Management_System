import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const buildingId = searchParams.get('buildingId');
  const categoryId = searchParams.get('categoryId');

  if (!buildingId || !categoryId) {
    return NextResponse.json(
      { message: 'Missing buildingId or categoryId' },
      { status: 400 }
    );
  }

  try {
    const readings = await prisma.reading.findMany({
      where: {
        categoryId: categoryId,
        inspection: {
          buildingId: buildingId,
        },
        numericalValue: {
          not: null,
        },
      },
      include: {
        inspection: {
          select: { date: true },
        },
      },
      orderBy: {
        inspection: {
          date: 'asc', 
        },
      },
    });

    return NextResponse.json(readings);
  } catch (error) {
    console.error('Error fetching graph data:', error);
    return NextResponse.json(
      { message: 'Error fetching graph data' },
      { status: 500 }
    );
  }
}