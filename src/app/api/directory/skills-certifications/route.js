import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        image: true,
        skills: true,
        certifications: true,
      },
    });

    const skillMap = new Map();
    const certificationMap = new Map();

    employees.forEach((employee) => {
      const { id, firstName, lastName, image, skills, certifications } = employee;
      const fullName = `${firstName} ${lastName}`;
      const profile = { id, fullName, image };

      // Process Skills
      if (skills) {
        skills.split(",").map((skill) => {
          const trimmedSkill = skill.trim();
          if (!skillMap.has(trimmedSkill)) {
            skillMap.set(trimmedSkill, { title: trimmedSkill, type: "Skillset", members: [] });
          }
          skillMap.get(trimmedSkill).members.push(profile);
        });
      }

      // Process Certifications
      if (certifications) {
        certifications.split(",").map((cert) => {
          const trimmedCert = cert.trim();
          if (!certificationMap.has(trimmedCert)) {
            certificationMap.set(trimmedCert, { title: trimmedCert, type: "Certification", members: [] });
          }
          certificationMap.get(trimmedCert).members.push(profile);
        });
      }
    });

    // Combine results into an array
    const result = [...skillMap.values(), ...certificationMap.values()];

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    console.error("Error fetching skills and certifications:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch data" }), { status: 500 });
  }
}
