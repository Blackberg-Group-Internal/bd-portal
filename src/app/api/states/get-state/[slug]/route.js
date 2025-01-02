import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req, { params }) {
  const { slug } = params;

  console.log('Slug: ' + slug);

  try {
    const state = await prisma.state.findFirst({
      where: { name: slug },
    });

    if (!state) {
      return new Response(
        JSON.stringify({ error: "State not found." }),
        { status: 404 }
      );
    }

    return new Response(JSON.stringify(state), { status: 200 });
  } catch (error) {
    console.error("Error fetching state:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch state." }),
      { status: 500 }
    );
  }
}
