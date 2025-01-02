import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req, { params }) {
  const { slug } = params;

  try {
    const employee = await prisma.employee.findUnique({
      where: { slug },
    });

    if (!employee) {
      return new Response(JSON.stringify({ error: "Employee not found" }), { status: 404 });
    }

    return new Response(JSON.stringify(employee), { status: 200 });
  } catch (error) {
    console.error("Error fetching employee:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch employee" }), { status: 500 });
  }
}
