/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.divinejesus.org',
  generateRobotsTxt: true, // (optional)
  exclude: ['/admin/*', '/admin'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        disallow: ['/admin'],
      },
    ],
  }
}
