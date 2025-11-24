import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import ExcelJS from 'exceljs';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const buildingIdParam = searchParams.get('buildingId');
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');

    const buildingId = buildingIdParam && buildingIdParam.trim() !== '' ? buildingIdParam : null;

    // Setup Date Filters
    const dateFilter: any = {};
    if (startDateStr) dateFilter.gte = startOfDay(new Date(startDateStr));
    if (endDateStr) dateFilter.lte = endOfDay(new Date(endDateStr));
    const hasDateFilter = startDateStr || endDateStr;

    // Create Separate Workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'MaintXperts System';
    workbook.created = new Date();

    // Fetch Buildings (The core of your request)
    const buildings = await prisma.building.findMany({
      where: buildingId ? { id: buildingId } : {},
      include: {
        dataCategories: { orderBy: { name: 'asc' } }
      },
      orderBy: { name: 'asc' }
    });

    if (buildings.length === 0) {
         const sheet = workbook.addWorksheet('No Data');
         sheet.addRow(['No buildings found matching the criteria.']);
    }

    // Loop through each building and create its own sheet
    for (const building of buildings) {
      const sheetName = building.name.replace(/[*?:\/[\]]/g, ' ').substring(0, 31);
      const sheet = workbook.addWorksheet(sheetName);

      // Define Columns
      const columns = [
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Technician', key: 'technician', width: 20 },
      ];

      // Dynamic columns for this specific building's categories
      building.dataCategories.forEach(cat => {
        columns.push({ header: cat.name, key: cat.id, width: 25 });
      });

      columns.push({ header: 'Notes', key: 'notes', width: 40 });
      sheet.columns = columns;

      sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4B5563' } // Gray header
      };

      // Fetch inspections just for one building
      const inspections = await prisma.inspection.findMany({
        where: {
          buildingId: building.id,
          ...(hasDateFilter ? { date: dateFilter } : {}),
        },
        include: {
          technician: true,
          readings: true,
        },
        orderBy: { date: 'desc' }
      });

      // Populate rows
      for (const inspection of inspections) {
        const rowData: any = {
          date: new Date(inspection.date).toLocaleDateString(),
          technician: `${inspection.technician.firstName} ${inspection.technician.lastName}`,
          notes: inspection.notes || '',
        };

        for (const cat of building.dataCategories) {
          const reading = inspection.readings.find(r => r.categoryId === cat.id);
          if (reading) {
            if (cat.type === 'NUMBER' && reading.numericalValue !== null) {
              rowData[cat.id] = reading.numericalValue;
            } else if (cat.type === 'ON_OFF' && reading.booleanValue !== null) {
              rowData[cat.id] = reading.booleanValue ? 'ON' : 'OFF';
            } else {
              rowData[cat.id] = '-';
            }
          } else {
             rowData[cat.id] = '';
          }
        }
        sheet.addRow(rowData);
      }
    }

    // Return the file
    const buffer = await workbook.xlsx.writeBuffer();
    const headers = new Headers();
    headers.append('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    headers.append('Content-Disposition', 'attachment; filename="Inspection_Report.xlsx"');

    return new NextResponse(buffer, { status: 200, headers });

  } catch (error) {
    console.error('Export Error:', error);
    return NextResponse.json({ message: 'Failed to generate report' }, { status: 500 });
  }
}