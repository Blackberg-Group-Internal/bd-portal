import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Missing query' }),
        { status: 400 }
      );
    }

    const tags = await prisma.tag.findMany({
      where: {
        tag: {
          contains: query,
          mode: 'insensitive'
        }
      }
    });

    return new Response(JSON.stringify(tags), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error searching tags:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}
