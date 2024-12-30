import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const naicsCodes = await prisma.nAICSCode.findMany();
    return new Response(JSON.stringify(naicsCodes), { status: 200 });
  } catch (error) {
    console.error('Error fetching NAICS codes:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch NAICS codes' }),
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

    const naicsCode = await prisma.nAICSCode.create({
      data: { code, title },
    });
    return new Response(JSON.stringify(naicsCode), { status: 201 });
  } catch (error) {
    console.error('Error adding NAICS code:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to add NAICS code' }),
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

    const updatedNAICSCode = await prisma.nAICSCode.update({
      where: { id },
      data: { code, title },
    });
    return new Response(JSON.stringify(updatedNAICSCode), { status: 200 });
  } catch (error) {
    console.error('Error updating NAICS code:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update NAICS code' }),
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

    await prisma.nAICSCode.delete({
      where: { id },
    });
    return new Response(JSON.stringify({ message: 'NAICS code deleted' }), {
      status: 200,
    });
  } catch (error) {
    console.error('Error deleting NAICS code:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete NAICS code' }),
      { status: 500 }
    );
  }
}
