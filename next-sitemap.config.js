/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: "https://high-low.kkweb.io/",
  generateRobotsTxt: true,
  exclude: [
    // Authenticated pages
    "/*/settings",
    "/*/stats",
    // Auth flow pages that shouldn't be indexed
    "/*/auth/update-password",
    "/*/auth/error",
    "/*/auth/callback",
    // Utility pages
    "/*/offline",
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/*/settings",
          "/*/stats",
          "/*/auth/update-password",
          "/*/auth/error",
          "/*/auth/callback",
          "/*/offline",
        ],
      },
    ],
  },
};

module.exports = config;
