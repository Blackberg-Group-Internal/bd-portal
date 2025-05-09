import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  const data = await req.json();

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
    tags,
    lead,
    support,
    reviewer,
    priority,
    questionsDue,
    stage,
    status,
    note,
    sourceLink,
    branch,
    notary,
    awardDate,
    department,
  } = data;

  if (!title) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const opportunity = await prisma.opportunity.create({
      data: {
        userId,
        title,
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
        tags,
        lead,
        support,
        reviewer,
        priority,
        questionsDue: questionsDue ? new Date(questionsDue) : undefined,
        stage,
        status,
        note,
        sourceLink,
        branch,
        notary,
        awardDate: awardDate ? new Date(awardDate) : undefined,
        department,
      },
    });

    return new Response(JSON.stringify(opportunity), {
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

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  try {
    if (slug) {
      const opportunity = await prisma.opportunity.findUnique({
        where: { slug },
      });

      if (!opportunity) {
        return new Response(JSON.stringify({ error: 'Opportunity not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(opportunity), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      const opportunities = await prisma.opportunity.findMany({
        where: {
          deadline: {
            gte: new Date(), 
          },
          reviewStatus: 'PENDING',
        },
        orderBy: {
          deadline: 'asc',
        },
        include: {
          opportunityTeam: {
            include: {
              employee: true,
            },
          },
        },
      });

      return new Response(JSON.stringify(opportunities), {
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

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get('id') || '', 10);

  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing opportunity id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    await prisma.opportunity.delete({
      where: { id },
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

export async function PATCH(req) {
  const { id, ...updateData } = await req.json();

  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const updatedOpportunity = await prisma.opportunity.update({
      where: { id },
      data: updateData,
    });

    return new Response(JSON.stringify(updatedOpportunity), {
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
