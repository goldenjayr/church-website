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
  },
  // Default transformation function
  transform: async (config, path) => {
    if (path.endsWith('.png')) {
      return null
    }
    return {
      loc: path, // => this will be exported as http(s)://<config.siteUrl>/<path>
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? [],
    }
  },
}
