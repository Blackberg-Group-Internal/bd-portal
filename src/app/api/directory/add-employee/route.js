import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      firstName,
      lastName,
      position,
      experience,
      skills,
      certifications,
      education,
      image,
    } = body;

    if (!firstName || !lastName) {
      return new Response(
        JSON.stringify({ error: 'First name and last name are required.' }),
        { status: 400 }
      );
    }

    const slug = `${firstName.toLowerCase()}-${lastName.toLowerCase()}`;

    const employee = await prisma.employee.upsert({
      where: { slug },
      update: {
        position,
        experience,
        skills: Array.isArray(skills) ? skills.join(',') : skills || null,
        certifications: Array.isArray(certifications)
          ? certifications.join(',')
          : certifications || null, 
        education: education ? JSON.stringify(education) : null,
        image,
      },
      create: {
        firstName,
        lastName,
        slug,
        position,
        experience,
        skills: Array.isArray(skills) ? skills.join(',') : skills || null,
        certifications: Array.isArray(certifications)
          ? certifications.join(',')
          : certifications || null,
        education: education ? JSON.stringify(education) : null,
        image,
      },
    });

    return new Response(JSON.stringify(employee), { status: 200 });
  } catch (error) {
    console.error('Error adding/updating employee:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred while adding the employee.' }),
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const {
      slug, 
      firstName,
      lastName,
      position,
      experience, 
      skills,
      certifications,
      education,
      image,
    } = body;

    if (!slug) {
      return new Response(
        JSON.stringify({ error: 'Slug is required to update the employee.' }),
        { status: 400 }
      );
    }

    const parsedExperience = experience ? parseInt(experience, 10) : null;
    if (experience && isNaN(parsedExperience)) {
      return new Response(
        JSON.stringify({ error: 'Experience must be a valid integer.' }),
        { status: 400 }
      );
    }

    const employee = await prisma.employee.update({
      where: { slug },
      data: {
        firstName,
        lastName,
        position,
        experience: parsedExperience, 
        skills: Array.isArray(skills) ? skills.join(',') : skills || null,
        certifications: Array.isArray(certifications)
          ? certifications.join(',')
          : certifications || null,
        education: education || null,
        image,
      },
    });

    return new Response(JSON.stringify(employee), { status: 200 });
  } catch (error) {
    console.error('Error updating employee:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred while updating the employee.' }),
      { status: 500 }
    );
  }
}