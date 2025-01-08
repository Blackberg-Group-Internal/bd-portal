import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  const {
    userId,
    title,
    filename,
    threadId,
    assistantId,
    summary,
    deadline,
    naics,
    matchScore,
    documentLink,
    likes,
    dislikes,
    slug,
    issuingOrganization,
    state,
    contactName,
    contactEmail,
    contactPhone,
    requirements,
  } = await request.json();

  if (!userId || !title || !threadId || !assistantId) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const rfpSummary = await prisma.rfpSummarizerRecord.create({
      data: {
        userId,
        title,
        createdAt: new Date(),
        filename,
        threadId,
        assistantId,
        summary,
        deadline: deadline ? new Date(deadline) : undefined,
        naics,
        matchScore,
        documentLink,
        likes,
        dislikes,
        slug,
        issuingOrganization,
        state,
        contactName,
        contactEmail,
        contactPhone,
        requirements,
      },
    });

    return new Response(JSON.stringify(rfpSummary), {
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
  const slug = searchParams.get('slug');

  try {
    if (slug) {
      // If a slug is provided, find the specific record
      const rfpSummary = await prisma.rfpSummarizerRecord.findUnique({
        where: { slug },
        select: {
          id: true,
          title: true,
          createdAt: true,
          filename: true,
          threadId: true,
          assistantId: true,
          summary: true,
          deadline: true,
          naics: true,
          matchScore: true,
          documentLink: true,
          likes: true,
          dislikes: true,
          slug: true,
          userId: true,
          issuingOrganization: true,
          state: true,
          contactName: true,
          contactEmail: true,
          contactPhone: true,
          requirements: true,
          updatedAt: true,
        },
      });

      if (!rfpSummary) {
        return new Response(JSON.stringify({ error: 'RFP Summary not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(rfpSummary), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      // If no slug is provided, return all records
      const rfpSummaries = await prisma.rfpSummarizerRecord.findMany({
        select: {
          id: true,
          title: true,
          createdAt: true,
          filename: true,
          threadId: true,
          assistantId: true,
          summary: true,
          deadline: true,
          naics: true,
          matchScore: true,
          documentLink: true,
          likes: true,
          dislikes: true,
          slug: true,
          userId: true,
          issuingOrganization: true,
          state: true,
          contactName: true,
          contactEmail: true,
          contactPhone: true,
          requirements: true,
          updatedAt: true,
        },
        orderBy: {
          deadline: 'desc', 
        },
      });

      return new Response(JSON.stringify(rfpSummaries), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}


export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const rfpSummaryId = parseInt(searchParams.get('rfpSummaryId'), 10);

  if (!rfpSummaryId) {
    return new Response(JSON.stringify({ error: 'Missing rfpSummaryId' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    await prisma.rfpSummarizerRecord.delete({
      where: { id: rfpSummaryId },
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

export async function PATCH(request) {
  const { id, ...updateData } = await request.json();

  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const updatedRfpSummary = await prisma.rfpSummarizerRecord.update({
      where: { id },
      data: updateData,
    });

    return new Response(JSON.stringify(updatedRfpSummary), {
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
