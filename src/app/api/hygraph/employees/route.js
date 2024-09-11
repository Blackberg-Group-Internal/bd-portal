import { gql } from 'graphql-request';
import { request } from 'graphql-request';

const HYGRAPH_API_URL = process.env.NEXT_PUBLIC_HYGRAPH_ENDPOINT;
const HYGRAPH_TOKEN = process.env.HYGRAPH_TOKEN;

export async function POST(req) {
  const { firstName, lastName, searchString } = await req.json();

  let query;
  let variables;

  if (firstName && lastName) {

    query = gql`
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
    variables = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    };
  } else if (searchString) {

    query = gql`
      query SearchEmployees($searchString: String!) {
        employees(
          where: {
            OR: [
              { firstName_contains: $searchString },
              { lastName_contains: $searchString }
            ]
          }
        ) {
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
    variables = {
      searchString: searchString.searchString,
    };
  } else {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
    });
  }

  try {
    const data = await request(HYGRAPH_API_URL, query, variables, {
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
