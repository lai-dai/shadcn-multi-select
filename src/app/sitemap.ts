import { type MetadataRoute } from "next"
import { siteConfig } from "~/config/site"
import { GetAllPosts } from "~/lib/posts"

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date().toISOString().split("T")[0]

  const staticPaths = [
    "",
    "/guest-book",
    "/articles",
    "/coding-activity",
    "/coding-activity/activity",
    "/coding-activity/editor",
    "/coding-activity/operating-systems",
  ].map(route => ({
    url: `${siteConfig.url}${route}`,
    lastModified,
  }))

  const posts = GetAllPosts()
  const postPaths = posts.map(post => ({
    url: `${siteConfig.url}/posts/${post.slug}`,
    lastModified: new Date(post.data.lastUpdate).toISOString().split("T")[0],
  }))

  return [...staticPaths, ...postPaths]
}
