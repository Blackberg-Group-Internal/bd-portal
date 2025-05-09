import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
              stage: "SUBMITTED",
            //   deadline: {
            //     gte: new Date(),
            //   },
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
