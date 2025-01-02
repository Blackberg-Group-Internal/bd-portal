import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug'); // Optional slug parameter

  try {
    if (slug) {
      // Fetch a specific employee by slug
      const employee = await prisma.employee.findUnique({
        where: { slug },
      });

      if (!employee) {
        return new Response(JSON.stringify({ error: 'Employee not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Parse and format the data as needed (e.g., skills, education, certifications as arrays)
      const formattedEmployee = {
        ...employee,
        skills: employee.skills ? employee.skills.split(',') : [], // Assuming skills are stored as a comma-separated string
        certifications: employee.certifications
          ? employee.certifications.split(',')
          : [], // Assuming certifications are stored as a comma-separated string
        education: employee.education
          ? JSON.parse(employee.education)
          : [], // Assuming education is stored as JSON in a single column
      };

      return new Response(JSON.stringify(formattedEmployee), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } 
  } catch (error) {
    console.error('Error fetching employee data:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch employee data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
