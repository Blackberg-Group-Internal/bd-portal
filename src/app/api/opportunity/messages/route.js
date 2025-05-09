import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { opportunityId, employeeId, message } = await req.json();

    if (!opportunityId || !employeeId || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const newMessage = await prisma.opportunityMessage.create({
      data: { opportunityId, employeeId, message },
    });

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const opportunityId = Number(searchParams.get('opportunityId'));

  if (!opportunityId) {
    return NextResponse.json({ error: 'Missing opportunityId' }, { status: 400 });
  }

  try {
    const messages = await prisma.opportunityMessage.findMany({
      where: { opportunityId },
      orderBy: { createdAt: 'desc' },
      include: {
        employee: true,
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}