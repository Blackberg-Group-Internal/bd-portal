import axios from 'axios';
import xml2js from 'xml2js';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const countParam = searchParams.get('count');
    const count = countParam ? parseInt(countParam, 10) : null;

    const rssFeedUrls = [
      'https://www.rfpmart.com/web-design-and-development-rfp-bids.xml',
      'https://www.rfpmart.com/social-media-internet-marketing-and-seo-rfp-bids.xml',
      'https://www.rfpmart.com/marketing-and-branding-rfp-bids.xml',
      'https://www.rfpmart.com/software-system-and-application-rfp-bids.xml',
    ];

    // const rssFeedUrls = [
    //   'https://www.rfpmart.com/marketing-and-branding-rfp-bids.xml',
    // ];

    const parser = new xml2js.Parser();
    let allItems = [];

    for (const url of rssFeedUrls) {
      try {
        const { data: rssData } = await axios.get(url);

        const sanitizedData = rssData.replace(/&(?!(?:amp|lt|gt|quot|apos);)/g, '&amp;');
        const result = await parser.parseStringPromise(sanitizedData);
        const items = result.rss.channel[0].item;

        allItems = [...allItems, ...items];
      } catch (err) {
        console.error(`Error processing feed from ${url}:`, err.message);
      }
    }

    if (count && !isNaN(count)) {
      allItems = allItems.slice(0, count);
    }

    return new Response(JSON.stringify(allItems), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing RSS feeds:', error);
    return new Response('Error processing RSS feeds', { status: 500 });
  }
}
