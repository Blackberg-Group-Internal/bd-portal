import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");

    if (slug) {
      // Fetch specific state by slug
      const state = await prisma.state.findUnique({
        where: { code: slug.toUpperCase() },
      });

      if (!state) {
        return new Response(
          JSON.stringify({ error: "State not found." }),
          { status: 404 }
        );
      }

      return new Response(JSON.stringify(state), { status: 200 });
    }

    // Fetch all states if no slug is provided
    const states = await prisma.state.findMany();
    return new Response(JSON.stringify(states), { status: 200 });
  } catch (error) {
    console.error("Error fetching states:", error);
    return new Response(
      JSON.stringify({ error: "Error fetching states." }),
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { code, name, businessLicense, bidWebsite } = body;

    if (!code || !name) {
      return new Response(
        JSON.stringify({ error: "State code and name are required." }),
        { status: 400 }
      );
    }

    const state = await prisma.state.create({
      data: {
        code,
        name,
        businessLicense,
        bidWebsite,
      },
    });

    return new Response(JSON.stringify(state), { status: 201 });
  } catch (error) {
    console.error("Error creating state:", error);
    return new Response(
      JSON.stringify({ error: "Error creating state." }),
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, code, name, businessLicense, bidWebsite, flagUrl } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ error: "State ID is required for updating." }),
        { status: 400 }
      );
    }

    const state = await prisma.state.update({
      where: { id },
      data: {
        code,
        name,
        businessLicense,
        bidWebsite,
        flagUrl,
      },
    });

    return new Response(JSON.stringify(state), { status: 200 });
  } catch (error) {
    console.error("Error updating state:", error);
    return new Response(
      JSON.stringify({ error: "Error updating state." }),
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new Response(
        JSON.stringify({ error: "State ID is required for deletion." }),
        { status: 400 }
      );
    }

    await prisma.state.delete({
      where: { id: parseInt(id, 10) },
    });

    return new Response(
      JSON.stringify({ message: "State deleted successfully." }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting state:", error);
    return new Response(
      JSON.stringify({ error: "Error deleting state." }),
      { status: 500 }
    );
  }
}