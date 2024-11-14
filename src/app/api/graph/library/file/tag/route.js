import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { fileId, tags } = body;

    if (!fileId || !tags || !Array.isArray(tags)) {
      return new Response(
        JSON.stringify({ error: 'Missing fileId or tags array' }),
        { status: 400 }
      );
    }

    const tagData = tags.map(tag => ({
      fileId,
      tag,
    }));

    const newTags = await prisma.tag.createMany({
      data: tagData,
      skipDuplicates: true,
    });

    return new Response(JSON.stringify(newTags), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating tags:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return new Response(
        JSON.stringify({ error: 'Missing fileId' }),
        { status: 400 }
      );
    }

    const tags = await prisma.tag.findMany({
      where: { fileId },
    });

    return new Response(JSON.stringify(tags), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tagId = searchParams.get('tagId');

    if (!tagId) {
      return new Response(
        JSON.stringify({ error: 'Missing tagId' }),
        { status: 400 }
      );
    }

    await prisma.tag.delete({
      where: { id: tagId },
    });

    return new Response(
      JSON.stringify({ message: 'Tag deleted successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error deleting tag:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}
