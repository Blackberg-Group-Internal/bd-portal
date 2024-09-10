export default function handler(req, res) {
    const environment = process.env.VERCEL_ENV;

    let robotsTxt = '';

    if (environment === 'production') {
        robotsTxt = `User-agent: *
Disallow: /

Sitemap: https://bd.blackberggroup.com/sitemap.xml
        `;
    } else {
        robotsTxt = `User-agent: *
Disallow: /
        `;
    }

    res.setHeader('Content-Type', 'text/plain');
    res.write(robotsTxt);
    res.end();
}
