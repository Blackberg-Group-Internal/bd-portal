import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { opportunityId, approved } = await req.json();

    if (!opportunityId || approved === undefined) {
      return NextResponse.json({ error: 'Missing opportunityId or approved' }, { status: 400 });
    }

    const updatedOpportunity = await prisma.opportunity.update({
      where: { id: opportunityId },
      data: { approved: approved },
    });

    return NextResponse.json({ success: true, opportunity: updatedOpportunity });
  } catch (error) {
    console.error('Error updating review status:', error);
    return NextResponse.json({ error: 'Failed to update approved status' }, { status: 500 });
  }
}
