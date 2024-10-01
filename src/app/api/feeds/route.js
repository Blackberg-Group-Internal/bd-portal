import axios from 'axios';
import xml2js from 'xml2js';

export async function GET(req) {
  try {
    // Get 'count' query parameter
    const { searchParams } = new URL(req.url);
    const countParam = searchParams.get('count');
    const count = countParam ? parseInt(countParam, 10) : null;

    // Fetch the RSS feed
    const rssFeedUrl = 'https://www.rfpmart.com/web-design-and-development-rfp-bids.xml';
    const { data: rssData } = await axios.get(rssFeedUrl);

    // Parse the RSS feed
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(rssData);

    // Extract items from the RSS feed
    let items = result.rss.channel[0].item;

    // Limit items if 'count' is provided
    if (count && !isNaN(count)) {
      items = items.slice(0, count);
    }

    // Return the items as a response
    return new Response(JSON.stringify(items), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing RSS feed:', error);
    return new Response('Error processing RSS feed', { status: 500 });
  }
}