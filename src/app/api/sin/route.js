import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const sinCodes = await prisma.sINCode.findMany();
    return new Response(JSON.stringify(sinCodes), { status: 200 });
  } catch (error) {
    console.error('Error fetching SIN codes:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch SIN codes' }),
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

    const sinCode = await prisma.sINCode.create({
      data: { code, title },
    });
    return new Response(JSON.stringify(sinCode), { status: 201 });
  } catch (error) {
    console.error('Error adding SIN code:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to add SIN code' }),
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

    const updatedSINCode = await prisma.sINCode.update({
      where: { id },
      data: { code, title },
    });
    return new Response(JSON.stringify(updatedSINCode), { status: 200 });
  } catch (error) {
    console.error('Error updating SIN code:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update SIN code' }),
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

    await prisma.sINCode.delete({
      where: { id },
    });
    return new Response(JSON.stringify({ message: 'SIN code deleted' }), {
      status: 200,
    });
  } catch (error) {
    console.error('Error deleting SIN code:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete SIN code' }),
      { status: 500 }
    );
  }
}
