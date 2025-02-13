import { gql } from 'graphql-request';
import { request } from 'graphql-request';

const HYGRAPH_API_URL = process.env.NEXT_PUBLIC_HYGRAPH_ENDPOINT;
const HYGRAPH_TOKEN = process.env.HYGRAPH_TOKEN;

export async function GET() {
  const query = gql`
    query GetAllEmployees {
      employees(orderBy: order_ASC) {
              id
              firstName
              lastName
              position
              image {
                  url
                  altText
              }
          }
      }
  `;

  try {
    const data = await request(HYGRAPH_API_URL, query, {}, {
      Authorization: `Bearer ${HYGRAPH_TOKEN}`,
    });

    return new Response(JSON.stringify(data.employees), {
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
