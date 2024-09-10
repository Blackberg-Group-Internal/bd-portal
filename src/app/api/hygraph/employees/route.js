import { gql } from 'graphql-request';
import { request } from 'graphql-request';

const HYGRAPH_API_URL = process.env.NEXT_PUBLIC_HYGRAPH_ENDPOINT;
const HYGRAPH_TOKEN = process.env.HYGRAPH_TOKEN;

export async function POST(req) {
  const { firstName, lastName } = await req.json();
  const trimmedFirstName = firstName.trim();
  const trimmedLastName = lastName.trim();

  const FIND_EMPLOYEE_QUERY = gql`
    query FindEmployee($firstName: String!, $lastName: String!) {
      employees(where: { firstName_contains: $firstName, lastName_contains: $lastName }) {
        id
        firstName
        lastName
        image {
          url
          altText
        }
      }
    }
  `;

  try {

    const data = await request(HYGRAPH_API_URL, FIND_EMPLOYEE_QUERY, { firstName: trimmedFirstName, lastName: trimmedLastName }, {
      Authorization: `Bearer ${HYGRAPH_TOKEN}`,
    });

    return new Response(JSON.stringify(data.employees[0]), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching from Hygraph:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch data from Hygraph' }), {
      status: 500,
    });
  }
}
