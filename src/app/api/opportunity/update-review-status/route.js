import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { opportunityId, reviewStatus } = await req.json();

    if (!opportunityId || !reviewStatus) {
      return NextResponse.json({ error: 'Missing opportunityId or reviewStatus' }, { status: 400 });
    }

    const updatedOpportunity = await prisma.opportunity.update({
      where: { id: opportunityId },
      data: { reviewStatus: reviewStatus },
    });

    return NextResponse.json({ success: true, opportunity: updatedOpportunity });
  } catch (error) {
    console.error('Error updating review status:', error);
    return NextResponse.json({ error: 'Failed to update review status' }, { status: 500 });
  }
}
