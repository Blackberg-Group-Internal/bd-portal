import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const pscCodes = await prisma.pSCCode.findMany(); // Adjusted to target PSC table
    return new Response(JSON.stringify(pscCodes), { status: 200 });
  } catch (error) {
    console.error('Error fetching PSC codes:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch PSC codes' }),
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { code, title } = await req.json();
    if (!code || !title) {
      return new Response(
        JSON.stringify({ error: 'Code and title are required' }),
        { status: 400 }
      );
    }

    const pscCode = await prisma.pSCCode.create({
      data: { code, title }, // Adjusted to target PSC table
    });
    return new Response(JSON.stringify(pscCode), { status: 201 });
  } catch (error) {
    console.error('Error adding PSC code:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to add PSC code' }),
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const { id, code, title } = await req.json();
    if (!id || !code || !title) {
      return new Response(
        JSON.stringify({ error: 'ID, code, and title are required' }),
        { status: 400 }
      );
    }

    const updatedPSCCode = await prisma.pSCCode.update({
      where: { id }, // Adjusted to target PSC table
      data: { code, title },
    });
    return new Response(JSON.stringify(updatedPSCCode), { status: 200 });
  } catch (error) {
    console.error('Error updating PSC code:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update PSC code' }),
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();
    if (!id) {
      return new Response(
        JSON.stringify({ error: 'ID is required to delete a code' }),
        { status: 400 }
      );
    }

    await prisma.pSCCode.delete({
      where: { id }, // Adjusted to target PSC table
    });
    return new Response(JSON.stringify({ message: 'PSC code deleted' }), {
      status: 200,
    });
  } catch (error) {
    console.error('Error deleting PSC code:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete PSC code' }),
      { status: 500 }
    );
  }
}