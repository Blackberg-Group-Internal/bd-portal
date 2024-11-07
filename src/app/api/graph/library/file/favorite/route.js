import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  const { userId, fileId } = await request.json();

  if (!userId || !fileId) {
    return new Response(JSON.stringify({ error: 'Missing userId or fileId' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const favorite = await prisma.favorite.create({
      data: {
        userId,
        fileId,
      },
    });

    return new Response(JSON.stringify(favorite), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
  
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing userId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  
    try {
      const favorites = await prisma.favorite.findMany({
        where: { userId },
      });
  
      return new Response(JSON.stringify(favorites), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
  
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const favoriteId = searchParams.get('favoriteId');

  if (!favoriteId) {
    return new Response(JSON.stringify({ error: 'Missing favoriteId' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    await prisma.favorite.delete({
      where: { id: favoriteId },
    });

    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
