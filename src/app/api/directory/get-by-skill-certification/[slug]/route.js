import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper function to convert a skill/certification name into a slug format
const toSlug = (text) => text
  .toLowerCase()
  .replace(/\s+/g, "-") // Replace spaces with hyphens
  .replace(/[^\w-]+/g, ""); // Remove special characters

export async function GET(req, { params }) {
  const { slug } = params;

  try {
    // Fetch all employees (to process skills/certifications dynamically)
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        position: true,
        image: true,
        skills: true,
        certifications: true,
      },
    });

    // Filter employees based on slug-matched skills or certifications
    const matchingEmployees = employees.filter((employee) => {
      const skillsArray = employee.skills ? employee.skills.split(",") : [];
      const certificationsArray = employee.certifications ? employee.certifications.split(",") : [];

      const formattedSkills = skillsArray.map((skill) => toSlug(skill.trim()));
      const formattedCertifications = certificationsArray.map((cert) => toSlug(cert.trim()));

      return formattedSkills.includes(slug) || formattedCertifications.includes(slug);
    });

    if (!matchingEmployees.length) {
      return new Response(JSON.stringify({ error: "No team members found" }), { status: 404 });
    }

    return new Response(JSON.stringify(matchingEmployees), { status: 200 });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch data" }), { status: 500 });
  }
}
