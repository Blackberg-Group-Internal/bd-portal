import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { firstName, lastName } = await req.json();

    if (!firstName || !lastName) {
      return NextResponse.json({ error: 'Missing first or last name' }, { status: 400 });
    }

    const employee = await prisma.employee.findFirst({
      where: {
        firstName,
        lastName,
      },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json({ employee });
  } catch (error) {
    console.error('Error finding employee by name:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}