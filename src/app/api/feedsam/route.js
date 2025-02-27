import axios from 'axios';

export const dynamic = 'force-dynamic';

export async function GET(req) {

  try {
    const apiKey = process.env.SAM_GOV_API_KEY;

    const samApiUrl = `https://api.sam.gov/opportunities/v2/search?api_key=${apiKey}&ncode=541613&active=true&postedFrom=01/01/2025&postedTo=02/25/2025&limit=250`

    const { data } = await axios.get(samApiUrl);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching SAM.gov feed:', error);
    return new Response('Error fetching SAM.gov feed', { status: 500 });
  }
}
