import { readFileSync, readdirSync } from "fs"
import path from "path"
import matter from "gray-matter"
import { pickupPosts } from "~/lib/constants"

const POSTS_PATH = path.join(process.cwd(), "src/contents/posts")

export function GetAllPostSlugs() {
  const postFilePaths = readdirSync(POSTS_PATH).filter(path =>
    /\.mdx?$/.test(path),
  )
  return postFilePaths.map(path => {
    const slug = path.replace(/\.mdx?$/, "")
    return slug
  })
}

export function GetPostBySlug(slug: string) {
  const markdown = readFileSync(`src/contents/posts/${slug}.mdx`, "utf8")

  const { content, data } = matter(markdown)
  return {
    content,
    data,
  }
}

export function GetPostsByCategory(category: string) {
  const slugs = GetAllPostSlugs()
  const posts = slugs.map(slug => {
    const markdown = readFileSync(`src/contents/posts/${slug}.mdx`, "utf8")

    const { content, data } = matter(markdown)
    return {
      slug,
      content,
      data,
    }
  })
  const sortedPosts = posts
    .filter(post => post.data.category == category)
    .sort((a, b) => {
      const dateA = new Date(a.data.publish)
      const dateB = new Date(b.data.publish)
      return dateB.getTime() - dateA.getTime()
    })
  return sortedPosts
}

export function GetRelatedPosts(category: string, mySlug: string) {
  const relatedPosts = GetPostsByCategory(category)
  const randomPosts = relatedPosts
    .filter(post => post.slug != mySlug)
    .sort(() => Math.random() - 0.5)
    .slice(0, 4)
  return randomPosts
}

export function GetAllPosts() {
  const slugs = GetAllPostSlugs()
  const posts = slugs.map(slug => {
    const markdown = readFileSync(`src/contents/posts/${slug}.mdx`, "utf8")

    const { content, data } = matter(markdown)
    return {
      slug,
      content,
      data,
    }
  })
  const sortedPosts = posts.sort((a, b) => {
    const dateA = new Date(a.data.publish)
    const dateB = new Date(b.data.publish)
    return dateB.getTime() - dateA.getTime()
  })
  return sortedPosts
}

export function GetPickUpPosts() {
  const slugs = pickupPosts
  return slugs.map(slug => {
    const markdown = readFileSync(`contents/posts/${slug}.mdx`, "utf8")

    const { content, data } = matter(markdown)
    return {
      slug,
      content,
      data,
    }
  })
}
