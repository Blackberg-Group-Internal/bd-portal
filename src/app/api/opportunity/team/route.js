import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { opportunityId, employeeIds } = await req.json();

    console.log('Opportunit ID ' + opportunityId);
    console.log('Employees ' + employeeIds);

    if (!opportunityId || !Array.isArray(employeeIds)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Delete existing members to prevent duplication
    await prisma.opportunityTeam.deleteMany({ where: { opportunityId } });

    // Add new team members
    const created = await Promise.all(
      employeeIds.map(employeeId =>
        prisma.opportunityTeam.create({
          data: {
            opportunityId,
            employeeId,
          },
        })
      )
    );

    return NextResponse.json({ success: true, team: created });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to update team' }, { status: 500 });
  }
}