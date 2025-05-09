import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { opportunityId, lead, support, reviewer } = await req.json();

    if (!opportunityId) {
      return NextResponse.json({ error: 'Missing opportunityId' }, { status: 400 });
    }

    const updatedOpportunity = await prisma.opportunity.update({
      where: { id: opportunityId },
      data: {
        lead: lead || [],
        support: support || [],
        reviewer: reviewer || [],
      },
    });

    return NextResponse.json({ success: true, opportunity: updatedOpportunity });
  } catch (error) {
    console.error('Error updating team fields:', error);
    return NextResponse.json({ error: 'Failed to update team fields' }, { status: 500 });
  }
}
